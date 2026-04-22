import express from 'express';
import multer from 'multer';
import path from 'node:path';
import fs from 'node:fs';
import https from 'node:https';
import os from 'node:os';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.set('trust proxy', true);
const port = Number(process.env.PORT || 4173);
const maxUploadBytes = Number(process.env.MAX_UPLOAD_MB || 20) * 1024 * 1024;
const maxVideoUploadBytes = Number(process.env.MAX_VIDEO_UPLOAD_MB || 200) * 1024 * 1024;
const adminPassword = String(process.env.ADMIN_PASSWORD || '').trim();
const googleSheetsWebhookUrl = String(process.env.GOOGLE_SHEETS_WEBHOOK_URL || '').trim();
const googleSheetsSecret = String(process.env.GOOGLE_SHEETS_SECRET || '').trim();
const powerAutomateWebhookUrl = String(process.env.POWER_AUTOMATE_WEBHOOK_URL || '').trim();
const powerAutomateSecret = String(process.env.POWER_AUTOMATE_SECRET || '').trim();
const fileLinkSecret = String(process.env.FILE_LINK_SECRET || adminPassword || 'change-me').trim();
const adminSessionCookieName = 'admin_session';
const adminSessionCookieValue = 'ok';
const uploadDir = path.join(__dirname, 'uploads');
const mediaDir = path.join(__dirname, 'assets', 'media');
const adminImagesDir = path.join(__dirname, 'assets', 'admin');
const dataDir = path.join(__dirname, 'data');
const leadsCsvPath = path.join(dataDir, 'leads-excel.csv');
const siteConfigPath = path.join(dataDir, 'site-config.json');
const loginAttempts = new Map();
const rateLimitBuckets = new Map();
const loginWindowMs = 15 * 60 * 1000;
const loginMaxAttempts = 7;
const leadWindowMs = 10 * 60 * 1000;
const leadMaxRequests = 20;
const fileLinkTtlMs = 1000 * 60 * 60 * 24 * 14;

const defaultSiteConfig = {
  metaTitle: 'Облачный Мост - Замена счетчиков, сантехника и умный дом',
  metaDescription:
    'Замена и установка счетчиков воды и тепла, сантехнические работы, подключение систем умного дома и облачный контроль SAURES. Москва и Московская область.',
  slogan: 'Соединяя миры через технологии',
  region: 'Москва и Московская область',
  phoneDisplay: '+7 (495) 123-45-67',
  phoneRaw: '74951234567',
  email: 'info@oblachny-most.ru',
  workSchedule: 'Прием заявок - 24/7',
  inn: '744820342691',
  ogrnip: '325774600156430',
  heroTitle: 'Замена счетчиков, сантехнические работы и умный дом под ключ',
  heroText:
    'Работаем честно: приходим вовремя, фиксируем цену до начала работ, выдаем документы и не навязываем лишние услуги.',
  heroPrimaryCta: 'Оставить заявку',
  heroBadges: [
    'Бесплатный вызов мастера',
    'Круглосуточный прием заявок',
    'Гарантия на выполненные работы',
  ],
  sauresTitle: 'Партнерские решения SAURES',
  sauresText:
    'Подключаем облачную систему контроля счетчиков и датчиков. Подбираем оборудование для квартиры, частного дома и коммерческих объектов.',
  sauresLink: 'https://www.saures.ru/',
  videoEyebrow: 'Как Это Работает',
  videoTitle: 'Водосчетчики Wi-Fi, подключение и настройка',
  videoSrc: 'assets/media/setup-video.mp4',
  aboutText:
    'Приходим с нужным оборудованием и сменной обувью, работаем в комфортном для вас режиме и соблюдаем договоренности по времени. Наша задача - решить проблему с первого выезда.',
  advantages: [
    'Фиксированная цена от консультации до завершения работ',
    'Оперативный выезд и вежливые мастера',
    'Не предлагаем замену исправных счетчиков',
    'Индивидуальные скидки и льготы',
    'Бесплатная консультация и вызов мастера',
  ],
  services: [
    {
      title: 'Замена и установка счетчиков ГВС/ХВС',
      text: 'Аккуратный демонтаж и монтаж, проверка герметичности, ввод в эксплуатацию, документы.',
    },
    {
      title: 'Замена и установка счетчиков тепла',
      text: 'Подберем решение под объект, выполним монтаж и передадим полный комплект документов.',
    },
    {
      title: 'Сантехнические работы',
      text: 'От мелкого ремонта до комплексной замены узлов, с гарантией и прозрачной сметой.',
    },
    {
      title: 'Домашняя и промышленная автоматизация',
      text: 'Интеграция датчиков и систем контроля, удаленный мониторинг, уведомления и аналитика.',
    },
  ],
  prices: [
    {
      service: 'Замена счетчика воды (1 шт.)',
      price: 'от 2 500 ₽',
      details: 'Работа + документы',
      image: 'assets/prices/price-1.jpg',
    },
    {
      service: 'Установка счетчика тепла',
      price: 'от 6 500 ₽',
      details: 'Подбор, монтаж, настройка',
      image: 'assets/prices/price-2.jpg',
    },
    {
      service: 'Сантехнический выезд',
      price: 'от 2 000 ₽',
      details: 'Диагностика и устранение неисправности',
      image: 'assets/prices/price-3.jpg',
    },
    {
      service: 'Подключение SAURES / умный дом',
      price: 'от 5 000 ₽',
      details: 'Интеграция и запуск',
      image: 'assets/prices/price-4.jpg',
    },
  ],
  steps: [
    {
      title: 'Заявка',
      text: 'Вы оставляете заявку на сайте или по телефону, уточняем задачу и удобное время.',
    },
    {
      title: 'Консультация и расчет',
      text: 'Согласовываем объем работ и фиксируем цену до выезда.',
    },
    {
      title: 'Выезд мастера',
      text: 'Выполняем монтаж и проверку системы аккуратно и в оговоренный срок.',
    },
    {
      title: 'Сдача работ',
      text: 'Передаем документы, гарантию и рекомендации по дальнейшей эксплуатации.',
    },
  ],
  reviews: [
    {
      quote:
        'Приехали в день обращения, все сделали аккуратно, по цене как договаривались. Документы выдали на месте.',
      author: 'Марина, Москва',
    },
    {
      quote:
        'Подключили систему контроля SAURES, теперь видно расход в приложении. Все объяснили простыми словами.',
      author: 'Игорь, Химки',
    },
    {
      quote:
        'Быстро устранили проблему с сантехникой и не пытались навязать лишние работы. Отличный сервис.',
      author: 'Наталья, Мытищи',
    },
  ],
};

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
if (!fs.existsSync(mediaDir)) {
  fs.mkdirSync(mediaDir, { recursive: true });
}
if (!fs.existsSync(adminImagesDir)) {
  fs.mkdirSync(adminImagesDir, { recursive: true });
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

const imageStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, adminImagesDir),
  filename: (_req, file, cb) => {
    const safeOriginal = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    cb(null, `${Date.now()}-${safeOriginal}`);
  },
});

const imageUpload = multer({
  storage: imageStorage,
  limits: { fileSize: maxUploadBytes },
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      cb(new Error('Разрешены только изображения.'));
      return;
    }
    cb(null, true);
  },
});

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

function getClientIp(req) {
  return String(req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown');
}

function cleanupMap(map, now = Date.now()) {
  for (const [key, value] of map.entries()) {
    if (value && typeof value.resetAt === 'number' && value.resetAt <= now) {
      map.delete(key);
    }
  }
}

function createRateLimit({ windowMs, maxRequests, message }) {
  return (req, res, next) => {
    const now = Date.now();
    cleanupMap(rateLimitBuckets, now);
    const ip = `${message}:${getClientIp(req)}`;
    const current = rateLimitBuckets.get(ip);

    if (!current || current.resetAt <= now) {
      rateLimitBuckets.set(ip, { count: 1, resetAt: now + windowMs });
      next();
      return;
    }

    current.count += 1;
    if (current.count > maxRequests) {
      res.status(429).json({ ok: false, message });
      return;
    }

    next();
  };
}

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

function safeFilename(value) {
  const normalized = path.basename(String(value || ''));
  if (!normalized || normalized.includes('..')) return '';
  return normalized;
}

function signFileAccess(filename, expires) {
  return crypto
    .createHmac('sha256', fileLinkSecret)
    .update(`${filename}:${expires}`)
    .digest('hex');
}

function buildSignedFileUrl(req, storedFilename) {
  const filename = safeFilename(storedFilename);
  const expires = Date.now() + fileLinkTtlMs;
  const sig = signFileAccess(filename, expires);
  return `${buildPublicBaseUrl(req)}/uploads/${encodeURIComponent(filename)}?expires=${expires}&sig=${sig}`;
}

function isAllowedPublicFileRequest(filename, expires, sig) {
  const safeName = safeFilename(filename);
  const expiresAt = Number(expires || 0);
  if (!safeName || !expiresAt || expiresAt < Date.now()) {
    return false;
  }

  const expected = signFileAccess(safeName, expiresAt);
  try {
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(String(sig || '')));
  } catch {
    return false;
  }
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

function clampString(value, maxLength = 500) {
  return String(value || '').trim().slice(0, maxLength);
}

function sanitizeSimpleList(value, maxItems = 20, maxItemLength = 160) {
  return Array.isArray(value)
    ? value.map((item) => clampString(item, maxItemLength)).filter(Boolean).slice(0, maxItems)
    : [];
}

function sanitizePairList(value, maxItems = 20) {
  return Array.isArray(value)
    ? value
        .map((item) => ({
          title: clampString(item?.title, 160),
          text: clampString(item?.text, 600),
        }))
        .filter((item) => item.title && item.text)
        .slice(0, maxItems)
    : [];
}

function sanitizePrices(value, maxItems = 20) {
  return Array.isArray(value)
    ? value
        .map((item) => ({
          service: clampString(item?.service, 160),
          price: clampString(item?.price, 80),
          details: clampString(item?.details, 600),
          image: clampString(item?.image, 300),
        }))
        .filter((item) => item.service && item.price && item.details)
        .slice(0, maxItems)
    : [];
}

function sanitizeReviews(value, maxItems = 20) {
  return Array.isArray(value)
    ? value
        .map((item) => ({
          quote: clampString(item?.quote, 600),
          author: clampString(item?.author, 160),
        }))
        .filter((item) => item.quote && item.author)
        .slice(0, maxItems)
    : [];
}

function sanitizeSiteConfig(config) {
  const source = config && typeof config === 'object' ? config : {};

  return {
    metaTitle: clampString(source.metaTitle, 200) || defaultSiteConfig.metaTitle,
    metaDescription: clampString(source.metaDescription, 400) || defaultSiteConfig.metaDescription,
    slogan: clampString(source.slogan, 160) || defaultSiteConfig.slogan,
    region: clampString(source.region, 160) || defaultSiteConfig.region,
    phoneDisplay: clampString(source.phoneDisplay, 60) || defaultSiteConfig.phoneDisplay,
    phoneRaw: String(source.phoneRaw || '').replace(/\D/g, '').slice(0, 20) || defaultSiteConfig.phoneRaw,
    email: clampString(source.email, 160) || defaultSiteConfig.email,
    workSchedule: clampString(source.workSchedule, 160) || defaultSiteConfig.workSchedule,
    inn: clampString(source.inn, 40) || defaultSiteConfig.inn,
    ogrnip: clampString(source.ogrnip, 40) || defaultSiteConfig.ogrnip,
    heroTitle: clampString(source.heroTitle, 220) || defaultSiteConfig.heroTitle,
    heroText: clampString(source.heroText, 700) || defaultSiteConfig.heroText,
    heroPrimaryCta: clampString(source.heroPrimaryCta, 80) || defaultSiteConfig.heroPrimaryCta,
    heroBadges: sanitizeSimpleList(source.heroBadges, 10, 160),
    sauresTitle: clampString(source.sauresTitle, 160) || defaultSiteConfig.sauresTitle,
    sauresText: clampString(source.sauresText, 700) || defaultSiteConfig.sauresText,
    sauresLink: clampString(source.sauresLink, 300) || defaultSiteConfig.sauresLink,
    videoEyebrow: clampString(source.videoEyebrow, 80) || defaultSiteConfig.videoEyebrow,
    videoTitle: clampString(source.videoTitle, 160) || defaultSiteConfig.videoTitle,
    videoSrc: clampString(source.videoSrc, 300) || defaultSiteConfig.videoSrc,
    aboutText: clampString(source.aboutText, 900) || defaultSiteConfig.aboutText,
    advantages: sanitizeSimpleList(source.advantages, 10, 220),
    services: sanitizePairList(source.services, 12),
    prices: sanitizePrices(source.prices, 20),
    steps: sanitizePairList(source.steps, 12),
    reviews: sanitizeReviews(source.reviews, 20),
  };
}

function loadSiteConfig() {
  try {
    if (!fs.existsSync(siteConfigPath)) {
      return defaultSiteConfig;
    }

    const raw = fs.readFileSync(siteConfigPath, 'utf8');
    const parsed = JSON.parse(raw);
    return sanitizeSiteConfig({
      ...defaultSiteConfig,
      ...parsed,
    });
  } catch (error) {
    console.error('Failed to load site config:', error);
    return defaultSiteConfig;
  }
}

function saveSiteConfig(config) {
  const merged = sanitizeSiteConfig({
    ...defaultSiteConfig,
    ...config,
  });

  fs.writeFileSync(siteConfigPath, `${JSON.stringify(merged, null, 2)}\n`, 'utf8');
  return merged;
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

async function sendLeadToGoogleSheets({ leadId, createdAtIso, name, phone, comment, service, files }) {
  if (!googleSheetsWebhookUrl) {
    return { created: false, reason: 'google_sheets_not_configured' };
  }

  const createdAtDate = new Date(createdAtIso);
  const dateText = createdAtDate.toLocaleDateString('ru-RU');
  const timeText = createdAtDate.toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
  const filesText = Array.isArray(files)
    ? files.map((file) => `${file.name}: ${file.url}`).join(' | ')
    : '';

  const response = await fetch(googleSheetsWebhookUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      secret: googleSheetsSecret,
      leadId,
      createdAt: createdAtIso,
      date: dateText,
      time: timeText,
      name,
      phone,
      service: service || 'Не выбрана',
      comment,
      filesCount: Array.isArray(files) ? files.length : 0,
      files,
      filesText,
      source: 'Сайт',
      status: 'Новая',
      manager: '',
      managerComment: '',
      updatedAt: createdAtIso,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Google Sheets webhook error: ${response.status} ${body}`);
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

const leadSubmissionRateLimit = createRateLimit({
  windowMs: leadWindowMs,
  maxRequests: leadMaxRequests,
  message: 'Слишком много заявок с одного адреса. Попробуйте немного позже.',
});

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

  const now = Date.now();
  cleanupMap(loginAttempts, now);
  const ip = getClientIp(req);
  const current = loginAttempts.get(ip);
  if (current && current.count >= loginMaxAttempts && current.resetAt > now) {
    return res.status(429).json({
      ok: false,
      message: 'Слишком много неудачных попыток входа. Попробуйте позже.',
    });
  }

  const password = String(req.body.password || '');
  if (password !== adminPassword) {
    if (!current || current.resetAt <= now) {
      loginAttempts.set(ip, { count: 1, resetAt: now + loginWindowMs });
    } else {
      current.count += 1;
    }
    return res.status(401).json({ ok: false, message: 'Неверный пароль.' });
  }

  loginAttempts.delete(ip);

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

app.get('/api/site-config', (_req, res) => {
  res.json({
    ok: true,
    config: loadSiteConfig(),
  });
});

app.get('/api/admin/config', requireAdmin, (_req, res) => {
  res.json({
    ok: true,
    config: loadSiteConfig(),
  });
});

app.post('/api/admin/config', requireAdmin, (req, res) => {
  const payload = req.body && typeof req.body === 'object' ? req.body : {};
  const savedConfig = saveSiteConfig(payload);
  return res.json({
    ok: true,
    message: 'Настройки сайта сохранены.',
    config: savedConfig,
  });
});

app.get('/api/admin/leads-export', requireAdmin, (_req, res) => {
  ensureLeadsCsvFile();
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="zayavki-excel.csv"');
  res.sendFile(leadsCsvPath);
});

app.get('/uploads/:filename', (req, res) => {
  const filename = safeFilename(req.params.filename);
  const { expires, sig } = req.query || {};

  if (!isAllowedPublicFileRequest(filename, expires, sig)) {
    return res.status(403).send('Доступ к файлу запрещен.');
  }

  const absolutePath = path.join(uploadDir, filename);
  if (!fs.existsSync(absolutePath)) {
    return res.status(404).send('Файл не найден.');
  }

  return res.sendFile(absolutePath);
});

app.use(express.static(__dirname));

app.post('/api/leads', leadSubmissionRateLimit, upload.array('files', 5), async (req, res) => {
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
      url: buildSignedFileUrl(req, file.filename),
    }));

    const [telegramResult, excelArchiveResult, googleSheetsResult, powerAutomateResult] = await Promise.all([
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
      sendLeadToGoogleSheets({
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

    if (
      !telegramResult.sent &&
      !excelArchiveResult.created &&
      !googleSheetsResult.created &&
      !powerAutomateResult.created
    ) {
      return res.status(502).json({
        ok: false,
        message: 'Не удалось доставить заявку ни в один канал.',
        delivery: {
          telegram: telegramResult,
          excelArchive: excelArchiveResult,
          googleSheets: googleSheetsResult,
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
        googleSheets: googleSheetsResult,
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

app.post('/api/admin/upload-image', requireAdmin, imageUpload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ ok: false, message: 'Изображение не загружено.' });
  }

  const relativePath = `assets/admin/${req.file.filename}`;
  return res.json({
    ok: true,
    message: 'Изображение загружено.',
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
