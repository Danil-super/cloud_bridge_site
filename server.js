import express from 'express';
import multer from 'multer';
import path from 'node:path';
import fs from 'node:fs';
import https from 'node:https';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = Number(process.env.PORT || 4173);
const maxUploadBytes = Number(process.env.MAX_UPLOAD_MB || 20) * 1024 * 1024;
const maxVideoUploadBytes = Number(process.env.MAX_VIDEO_UPLOAD_MB || 200) * 1024 * 1024;
const adminPassword = String(process.env.ADMIN_PASSWORD || '').trim();
const powerAutomateWebhookUrl = String(process.env.POWER_AUTOMATE_WEBHOOK_URL || '').trim();
const powerAutomateSecret = String(process.env.POWER_AUTOMATE_SECRET || '').trim();
const adminSessionCookieName = 'admin_session';
const adminSessionCookieValue = 'ok';
const uploadDir = path.join(__dirname, 'uploads');
const mediaDir = path.join(__dirname, 'assets', 'media');
const dataDir = path.join(__dirname, 'data');
const leadsCsvPath = path.join(dataDir, 'leads-excel.csv');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
if (!fs.existsSync(mediaDir)) {
  fs.mkdirSync(mediaDir, { recursive: true });
}
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
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
app.use(express.urlencoded({ extended: false }));
app.use('/uploads', express.static(uploadDir));

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

function getLanIPv4() {
  const interfaces = os.networkInterfaces();
  for (const values of Object.values(interfaces)) {
    for (const info of values || []) {
      if (info && info.family === 'IPv4' && !info.internal) {
        return info.address;
      }
    }
  }
  return null;
}

function buildPublicBaseUrl(req) {
  const configured = String(process.env.PUBLIC_BASE_URL || '').trim();
  if (configured) {
    return configured.replace(/\/+$/, '');
  }

  const host = String(req.get('host') || '');
  const protocol = req.protocol || 'http';
  const localHosts = ['localhost', '127.0.0.1', '::1'];
  const hostName = host.split(':')[0];

  if (localHosts.includes(hostName)) {
    const lanIp = getLanIPv4();
    if (lanIp) {
      const port = host.includes(':') ? host.split(':')[1] : '';
      return `${protocol}://${lanIp}${port ? `:${port}` : ''}`;
    }
  }

  return `${protocol}://${host}`;
}

function csvCell(value) {
  const normalized = String(value ?? '').replace(/\r?\n/g, ' ').trim();
  return `"${normalized.replace(/"/g, '""')}"`;
}

function ensureLeadsCsvFile() {
  if (fs.existsSync(leadsCsvPath)) {
    return;
  }

  const header = [
    'Дата',
    'Имя',
    'Телефон',
    'Услуга',
    'Комментарий',
    'Количество файлов',
    'Имена файлов',
    'Ссылки на файлы',
  ];

  const contents = `\uFEFF${header.map(csvCell).join(';')}\n`;
  fs.writeFileSync(leadsCsvPath, contents, 'utf8');
}

async function saveLeadToExcelFile({ name, phone, comment, service, files }) {
  ensureLeadsCsvFile();

  const createdAt = new Date().toLocaleString('ru-RU', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  const fileNames = Array.isArray(files) ? files.map((file) => file.name).join(' | ') : '';
  const fileUrls = Array.isArray(files) ? files.map((file) => file.url).join(' | ') : '';

  const row = [
    createdAt,
    name,
    phone,
    service || 'Не выбрана',
    comment,
    Array.isArray(files) ? String(files.length) : '0',
    fileNames,
    fileUrls,
  ];

  fs.appendFileSync(leadsCsvPath, `${row.map(csvCell).join(';')}\n`, 'utf8');

  return {
    created: true,
    file: path.relative(__dirname, leadsCsvPath),
  };
}

async function sendLeadToPowerAutomate({ leadId, createdAtIso, name, phone, comment, service, files }) {
  if (!powerAutomateWebhookUrl) {
    return { created: false, reason: 'power_automate_not_configured' };
  }

  const response = await fetch(powerAutomateWebhookUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(powerAutomateSecret ? { 'X-Webhook-Secret': powerAutomateSecret } : {}),
    },
    body: JSON.stringify({
      leadId,
      createdAt: createdAtIso,
      source: 'site',
      service: service || 'Не выбрана',
      name,
      phone,
      comment,
      filesCount: Array.isArray(files) ? files.length : 0,
      files: Array.isArray(files) ? files : [],
      filesText: Array.isArray(files)
        ? files.map((file) => `${file.name}: ${file.url}`).join(' | ')
        : '',
      status: 'Новая',
      manager: '',
      nextActionAt: '',
      lastContactAt: '',
      result: '',
      isActual: 'Да',
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Power Automate error: ${response.status} ${body}`);
  }

  let payload = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  return {
    created: true,
    status: response.status,
    response: payload,
  };
}

function parseCookies(req) {
  const header = String(req.headers.cookie || '');
  const cookies = {};
  header.split(';').forEach((part) => {
    const [rawKey, ...rest] = part.trim().split('=');
    if (!rawKey) return;
    cookies[rawKey] = decodeURIComponent(rest.join('=') || '');
  });
  return cookies;
}

function isAdminAuthorized(req) {
  const cookies = parseCookies(req);
  return cookies[adminSessionCookieName] === adminSessionCookieValue;
}

function requireAdmin(req, res, next) {
  if (isAdminAuthorized(req)) {
    next();
    return;
  }

  const acceptsHtml = String(req.headers.accept || '').includes('text/html');
  if (acceptsHtml) {
    res.redirect('/admin-login.html');
    return;
  }

  res.status(401).json({ ok: false, message: 'Требуется авторизация администратора.' });
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

async function sendTelegramNotification({ name, phone, comment, service, files }) {
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
    Array.isArray(files) && files.length ? `Файлы: ${files.length} шт.` : null,
    ...(Array.isArray(files)
      ? files.map(
          (item, index) =>
            `Файл ${index + 1}: <a href="${escapeHtml(item.url)}">${escapeHtml(item.name || 'Открыть файл')}</a>`
        )
      : []),
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

app.get('/admin-login.html', (_req, res) => {
  res.sendFile(path.join(__dirname, 'admin-login.html'));
});

app.post('/api/admin/login', (req, res) => {
  if (!adminPassword) {
    return res.status(500).json({
      ok: false,
      message: 'Пароль админ-панели не задан на сервере.',
    });
  }

  const password = String(req.body.password || '');
  if (password !== adminPassword) {
    return res.status(401).json({ ok: false, message: 'Неверный пароль.' });
  }

  res.setHeader(
    'Set-Cookie',
    `${adminSessionCookieName}=${adminSessionCookieValue}; Path=/; HttpOnly; SameSite=Lax; Max-Age=86400`
  );
  return res.json({ ok: true });
});

app.post('/api/admin/logout', (_req, res) => {
  res.setHeader(
    'Set-Cookie',
    `${adminSessionCookieName}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`
  );
  return res.json({ ok: true });
});

app.get('/admin', (_req, res) => {
  res.redirect('/admin.html');
});

app.get('/admin.html', requireAdmin, (_req, res) => {
  res.sendFile(path.join(__dirname, 'admin.html'));
});

app.get('/api/admin/leads-export', requireAdmin, (_req, res) => {
  ensureLeadsCsvFile();
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="zayavki-excel.csv"');
  res.sendFile(leadsCsvPath);
});

app.use(express.static(__dirname));

app.post('/api/leads', upload.array('files', 5), async (req, res) => {
  try {
    const name = String(req.body.name || '').trim().replace(/\s{2,}/g, ' ');
    const rawPhone = String(req.body.phone || '').trim();
    const phone = normalizePhone(rawPhone);
    const comment = String(req.body.comment || '').trim().replace(/\s{2,}/g, ' ');
    const service = String(req.body.service || '').trim().slice(0, 120);

    const uploadedFiles = Array.isArray(req.files) ? req.files : [];

    if (!name || !rawPhone || !comment || uploadedFiles.length === 0) {
      return res.status(400).json({
        ok: false,
        message: 'Обязательные поля: имя, телефон, комментарий и хотя бы 1 файл.',
      });
    }

    if (uploadedFiles.length > 5) {
      return res.status(400).json({
        ok: false,
        message: 'Можно прикрепить не более 5 файлов.',
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

    const createdAt = new Date();
    const leadId = `lead-${createdAt.getTime()}`;

    const files = uploadedFiles.map((file) => ({
      name: file.originalname,
      url: `${buildPublicBaseUrl(req)}/uploads/${file.filename}`,
    }));

    const [telegramResult, excelArchiveResult, powerAutomateResult] = await Promise.all([
      sendTelegramNotification({
        name,
        phone,
        comment,
        service,
        files,
      }).catch((error) => ({ sent: false, reason: error.message })),
      saveLeadToExcelFile({ name, phone, comment, service, files }).catch((error) => ({
        created: false,
        reason: error.message,
      })),
      sendLeadToPowerAutomate({
        leadId,
        createdAtIso: createdAt.toISOString(),
        name,
        phone,
        comment,
        service,
        files,
      }).catch((error) => ({
        created: false,
        reason: error.message,
      })),
    ]);

    if (!telegramResult.sent && !excelArchiveResult.created && !powerAutomateResult.created) {
      return res.status(502).json({
        ok: false,
        message: 'Не удалось доставить заявку ни в один канал.',
        delivery: {
          telegram: telegramResult,
          excelArchive: excelArchiveResult,
          powerAutomate: powerAutomateResult,
        },
      });
    }

    return res.json({
      ok: true,
      message: 'Заявка принята.',
      delivery: {
        telegram: telegramResult,
        excelArchive: excelArchiveResult,
        powerAutomate: powerAutomateResult,
      },
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      message: error.message || 'Внутренняя ошибка сервера.',
    });
  }
});

app.post('/api/admin/upload-video', requireAdmin, mediaUpload.single('video'), (req, res) => {
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
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({ ok: false, message: 'Можно прикрепить не более 5 файлов.' });
    }
    return res.status(400).json({ ok: false, message: `Ошибка файла: ${err.message}` });
  }

  return res.status(400).json({ ok: false, message: err.message || 'Ошибка запроса.' });
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
