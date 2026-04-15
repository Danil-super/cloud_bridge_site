import express from 'express';
import multer from 'multer';
import path from 'node:path';
import fs from 'node:fs';
import https from 'node:https';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = Number(process.env.PORT || 4173);
const maxUploadBytes = Number(process.env.MAX_UPLOAD_MB || 20) * 1024 * 1024;
const maxVideoUploadBytes = Number(process.env.MAX_VIDEO_UPLOAD_MB || 200) * 1024 * 1024;
const uploadDir = path.join(__dirname, 'uploads');
const mediaDir = path.join(__dirname, 'assets', 'media');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
if (!fs.existsSync(mediaDir)) {
  fs.mkdirSync(mediaDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const safeOriginal = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    cb(null, `${Date.now()}-${safeOriginal}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: maxUploadBytes },
  fileFilter: (_req, file, cb) => {
    const allowed =
      file.mimetype.startsWith('image/') ||
      file.mimetype.startsWith('video/') ||
      file.mimetype === 'application/pdf';

    if (!allowed) {
      cb(new Error('Разрешены только фото, видео или PDF.'));
      return;
    }

    cb(null, true);
  },
});

const mediaStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, mediaDir),
  filename: (_req, file, cb) => {
    const safeOriginal = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    cb(null, `${Date.now()}-${safeOriginal}`);
  },
});

const mediaUpload = multer({
  storage: mediaStorage,
  limits: { fileSize: maxVideoUploadBytes },
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname || '').toLowerCase();
    const allowedExt = ['.mp4', '.mov', '.webm', '.m4v', '.avi', '.mkv'];
    const mimeOk = file.mimetype.startsWith('video/');
    const extOk = allowedExt.includes(ext);

    if (!mimeOk && !extOk) {
      cb(new Error('Разрешены только видеофайлы.'));
      return;
    }
    cb(null, true);
  },
});

app.use(express.json());
app.use('/uploads', express.static(uploadDir));
app.use(express.static(__dirname));

function normalizePhone(input) {
  let digits = String(input || '').replace(/\D/g, '');
  if (digits.startsWith('8')) digits = `7${digits.slice(1)}`;
  if (!digits.startsWith('7')) digits = `7${digits}`;
  if (!/^7\d{10}$/.test(digits)) return '';
  return `+${digits}`;
}

function isValidName(value) {
  return /^[A-Za-zА-Яа-яЁё\s-]{2,60}$/.test(String(value || ''));
}

function isValidComment(value) {
  return /^[0-9A-Za-zА-Яа-яЁё\s.,!?():\-"]{1,500}$/.test(String(value || ''));
}

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function postJsonHttps(hostname, endpointPath, payload) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(payload);
    const req = https.request(
      {
        hostname,
        path: endpointPath,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(data),
        },
      },
      (res) => {
        let raw = '';
        res.on('data', (chunk) => {
          raw += chunk;
        });
        res.on('end', () => {
          const status = Number(res.statusCode || 0);
          if (status < 200 || status >= 300) {
            reject(new Error(`HTTP ${status}: ${raw}`));
            return;
          }
          resolve(raw);
        });
      }
    );

    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function sendTelegramNotification({ name, phone, comment, service, fileUrl, fileName }) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    return { sent: false, reason: 'telegram_not_configured' };
  }

  const lines = [
    '<b>Новая заявка с сайта</b>',
    '',
    `Имя: ${escapeHtml(name)}`,
    `Телефон: <a href="tel:${escapeHtml(phone)}">${escapeHtml(phone)}</a>`,
    `Комментарий: ${escapeHtml(comment)}`,
    service ? `Услуга: ${escapeHtml(service)}` : null,
    fileName ? `Файл: ${escapeHtml(fileName)}` : null,
    fileUrl ? `Ссылка на файл: <a href="${escapeHtml(fileUrl)}">Открыть файл</a>` : null,
  ].filter(Boolean);

  let lastError = null;
  for (let attempt = 1; attempt <= 4; attempt += 1) {
    try {
      const raw = await postJsonHttps('api.telegram.org', `/bot${token}/sendMessage`, {
        chat_id: chatId,
        text: lines.join('\n'),
        parse_mode: 'HTML',
        disable_web_page_preview: true,
      });
      const parsed = JSON.parse(raw || '{}');
      if (!parsed.ok) {
        throw new Error(`Telegram API error: ${raw}`);
      }
      return { sent: true };
    } catch (error) {
      lastError = error;
      if (attempt < 4) {
        await new Promise((resolve) => setTimeout(resolve, 700 * attempt));
      }
    }
  }

  throw lastError || new Error('Telegram send failed');
}

async function createAmoLead({ name, phone, comment, service }) {
  const baseUrl = process.env.AMOCRM_BASE_URL;
  const accessToken = process.env.AMOCRM_ACCESS_TOKEN;
  const pipelineId = Number(process.env.AMOCRM_PIPELINE_ID || 0);
  const statusId = Number(process.env.AMOCRM_STATUS_ID || 0);

  if (!baseUrl || !accessToken) {
    return { created: false, reason: 'amocrm_not_configured' };
  }

  const leadPayload = {
    name: `Заявка с сайта: ${name}`,
    custom_fields_values: [
      {
        field_name: 'Комментарий',
        values: [{ value: comment }],
      },
      {
        field_name: 'Услуга',
        values: [{ value: service || 'Не выбрана' }],
      },
    ],
  };

  if (pipelineId) {
    leadPayload.pipeline_id = pipelineId;
  }

  if (statusId) {
    leadPayload.status_id = statusId;
  }

  const leadRes = await fetch(`${baseUrl}/api/v4/leads`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify([leadPayload]),
  });

  if (!leadRes.ok) {
    const body = await leadRes.text();
    throw new Error(`amoCRM lead error: ${leadRes.status} ${body}`);
  }

  const leadData = await leadRes.json();
  const leadId = leadData?._embedded?.leads?.[0]?.id;

  const contactPayload = {
    name,
    custom_fields_values: [
      {
        field_code: 'PHONE',
        values: [{ value: phone, enum_code: 'WORK' }],
      },
    ],
  };

  const contactRes = await fetch(`${baseUrl}/api/v4/contacts`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify([contactPayload]),
  });

  if (!contactRes.ok) {
    const body = await contactRes.text();
    throw new Error(`amoCRM contact error: ${contactRes.status} ${body}`);
  }

  const contactData = await contactRes.json();
  const contactId = contactData?._embedded?.contacts?.[0]?.id;

  if (leadId && contactId) {
    const linkRes = await fetch(`${baseUrl}/api/v4/leads/${leadId}/link`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify([{ to_entity_id: contactId, to_entity_type: 'contacts' }]),
    });

    if (!linkRes.ok) {
      const body = await linkRes.text();
      throw new Error(`amoCRM lead-contact link error: ${linkRes.status} ${body}`);
    }
  }

  return { created: true, leadId, contactId };
}

app.post('/api/leads', upload.single('file'), async (req, res) => {
  try {
    const name = String(req.body.name || '').trim().replace(/\s{2,}/g, ' ');
    const rawPhone = String(req.body.phone || '').trim();
    const phone = normalizePhone(rawPhone);
    const comment = String(req.body.comment || '').trim().replace(/\s{2,}/g, ' ');
    const service = String(req.body.service || '').trim().slice(0, 120);

    if (!name || !rawPhone || !comment || !req.file) {
      return res.status(400).json({
        ok: false,
        message: 'Обязательные поля: имя, телефон, комментарий и файл.',
      });
    }

    if (!isValidName(name)) {
      return res.status(400).json({
        ok: false,
        message: 'Имя должно содержать только буквы, пробел и дефис (2-60 символов).',
      });
    }

    if (!phone) {
      return res.status(400).json({
        ok: false,
        message: 'Телефон должен быть в формате +7XXXXXXXXXX.',
      });
    }

    if (!isValidComment(comment)) {
      return res.status(400).json({
        ok: false,
        message: 'Комментарий: до 500 символов и без спецсимволов.',
      });
    }

    const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;

    const [telegramResult, amocrmResult] = await Promise.all([
      sendTelegramNotification({
        name,
        phone,
        comment,
        service,
        fileUrl,
        fileName: req.file.originalname,
      }).catch((error) => ({ sent: false, reason: error.message })),
      createAmoLead({ name, phone, comment, service }).catch((error) => ({ created: false, reason: error.message })),
    ]);

    return res.json({
      ok: true,
      message: 'Заявка принята.',
      delivery: {
        telegram: telegramResult,
        amocrm: amocrmResult,
      },
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      message: error.message || 'Внутренняя ошибка сервера.',
    });
  }
});

app.post('/api/admin/upload-video', mediaUpload.single('video'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ ok: false, message: 'Видео не загружено.' });
  }

  const relativePath = `assets/media/${req.file.filename}`;
  return res.json({
    ok: true,
    message: 'Видео загружено.',
    path: relativePath,
  });
});

app.use((err, _req, res, _next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ ok: false, message: `Ошибка файла: ${err.message}` });
  }

  return res.status(400).json({ ok: false, message: err.message || 'Ошибка запроса.' });
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
