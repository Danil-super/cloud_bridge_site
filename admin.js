const defaultConfig = {
  "metaTitle": "Облачный Мост - Замена счетчиков, сантехника и умный дом",
  "metaDescription": "Замена и установка счетчиков воды и тепла, сантехнические работы, подключение систем умного дома и облачный контроль SAURES. Москва и Московская область.",
  "slogan": "Соединяя миры через технологии",
  "region": "Москва и Московская область",
  "phoneDisplay": "+7 (495) 123-45-67",
  "phoneRaw": "74951234567",
  "email": "info@oblachny-most.ru",
  "workSchedule": "Прием заявок - 24/7",
  "inn": "744820342691",
  "ogrnip": "325774600156430",
  "heroTitle": "Замена счетчиков, сантехнические работы и умный дом под ключ",
  "heroText": "Работаем честно: приходим вовремя, фиксируем цену до начала работ, выдаем документы и не навязываем лишние услуги.",
  "heroPrimaryCta": "Оставить заявку",
  "heroBadges": [
    "Бесплатный вызов мастера",
    "Круглосуточный прием заявок",
    "Гарантия на выполненные работы"
  ],
  "sauresTitle": "Партнерские решения SAURES",
  "sauresText": "Подключаем облачную систему контроля счетчиков и датчиков. Подбираем оборудование для квартиры, частного дома и коммерческих объектов.",
  "sauresLink": "https://www.saures.ru/",
  "videoEyebrow": "Как Это Работает",
  "videoTitle": "Водосчетчики Wi-Fi, подключение и настройка",
  "videoSrc": "assets/media/setup-video.mp4",
  "aboutText": "Приходим с нужным оборудованием и сменной обувью, работаем в комфортном для вас режиме и соблюдаем договоренности по времени. Наша задача - решить проблему с первого выезда.",
  "advantages": [
    "Фиксированная цена от консультации до завершения работ",
    "Оперативный выезд и вежливые мастера",
    "Не предлагаем замену исправных счетчиков",
    "Индивидуальные скидки и льготы",
    "Бесплатная консультация и вызов мастера"
  ],
  "services": [
    {
      "title": "Замена и установка счетчиков ГВС/ХВС",
      "text": "Аккуратный демонтаж и монтаж, проверка герметичности, ввод в эксплуатацию, документы."
    },
    {
      "title": "Замена и установка счетчиков тепла",
      "text": "Подберем решение под объект, выполним монтаж и передадим полный комплект документов."
    },
    {
      "title": "Сантехнические работы",
      "text": "От мелкого ремонта до комплексной замены узлов, с гарантией и прозрачной сметой."
    },
    {
      "title": "Домашняя и промышленная автоматизация",
      "text": "Интеграция датчиков и систем контроля, удаленный мониторинг, уведомления и аналитика."
    }
  ],
  "prices": [
    {
      "service": "Замена счетчика воды (1 шт.)",
      "price": "от 2 500 ₽",
      "details": "Работа + документы",
      "image": "assets/prices/price-1.jpg"
    },
    {
      "service": "Установка счетчика тепла",
      "price": "от 6 500 ₽",
      "details": "Подбор, монтаж, настройка",
      "image": "assets/prices/price-2.jpg"
    },
    {
      "service": "Сантехнический выезд",
      "price": "от 2 000 ₽",
      "details": "Диагностика и устранение неисправности",
      "image": "assets/prices/price-3.jpg"
    },
    {
      "service": "Подключение SAURES / умный дом",
      "price": "от 5 000 ₽",
      "details": "Интеграция и запуск",
      "image": "assets/prices/price-4.jpg"
    }
  ],
  "steps": [
    {
      "title": "Заявка",
      "text": "Вы оставляете заявку на сайте или по телефону, уточняем задачу и удобное время."
    },
    {
      "title": "Консультация и расчет",
      "text": "Согласовываем объем работ и фиксируем цену до выезда."
    },
    {
      "title": "Выезд мастера",
      "text": "Выполняем монтаж и проверку системы аккуратно и в оговоренный срок."
    },
    {
      "title": "Сдача работ",
      "text": "Передаем документы, гарантию и рекомендации по дальнейшей эксплуатации."
    }
  ],
  "reviews": [
    {
      "quote": "Приехали в день обращения, все сделали аккуратно, по цене как договаривались. Документы выдали на месте.",
      "author": "Марина, Москва"
    },
    {
      "quote": "Подключили систему контроля SAURES, теперь видно расход в приложении. Все объяснили простыми словами.",
      "author": "Игорь, Химки"
    },
    {
      "quote": "Быстро устранили проблему с сантехникой и не пытались навязать лишние работы. Отличный сервис.",
      "author": "Наталья, Мытищи"
    }
  ]
};

const form = document.getElementById('admin-form');
const saveStatus = document.getElementById('save-status');
const resetBtn = document.getElementById('reset-btn');

const heroBadgesEditor = document.getElementById('hero-badges-editor');
const advantagesEditor = document.getElementById('advantages-editor');
const servicesEditor = document.getElementById('services-editor');
const stepsEditor = document.getElementById('steps-editor');
const pricesEditor = document.getElementById('prices-editor');
const reviewsEditor = document.getElementById('reviews-editor');

const addHeroBadgeBtn = document.getElementById('add-hero-badge-btn');
const addAdvantageBtn = document.getElementById('add-advantage-btn');
const addServiceBtn = document.getElementById('add-service-btn');
const addStepBtn = document.getElementById('add-step-btn');
const addPriceBtn = document.getElementById('add-price-btn');
const addReviewBtn = document.getElementById('add-review-btn');
const tabButtons = document.querySelectorAll('[data-tab-target]');
const tabPanes = document.querySelectorAll('[data-tab-content]');
const videoFileInput = document.getElementById('video-file-input');
const uploadVideoBtn = document.getElementById('upload-video-btn');
const videoUploadStatus = document.getElementById('video-upload-status');
const videoPreview = document.getElementById('video-preview');

async function loadConfig() {
  try {
    const response = await fetch('/api/admin/config', {
      credentials: 'same-origin',
    });
    const payload = await response.json();
    if (!response.ok || !payload.ok) {
      throw new Error(payload.message || 'Не удалось загрузить настройки сайта.');
    }
    return { ...defaultConfig, ...(payload.config || {}) };
  } catch (error) {
    console.error(error);
    if (saveStatus) saveStatus.textContent = 'Не удалось загрузить настройки с сервера. Показан шаблон.';
    return defaultConfig;
  }
}

function createSimpleCard({ label = 'Текст', value = '' } = {}) {
  const card = document.createElement('div');
  card.className = 'editor-item';
  card.innerHTML = `
    <label class="editor-row">${label}<input type="text" data-field="value" value="${value}" /></label>
    <button type="button" class="btn btn-outline danger" data-action="remove">Удалить</button>
  `;

  card.querySelector('[data-action="remove"]').addEventListener('click', () => card.remove());
  return card;
}

function createTitleTextCard({ title = '', text = '' } = {}) {
  const card = document.createElement('div');
  card.className = 'editor-item';
  card.innerHTML = `
    <label class="editor-row">Заголовок <input type="text" data-field="title" value="${title}" /></label>
    <label class="editor-row">Описание <textarea rows="2" data-field="text">${text}</textarea></label>
    <button type="button" class="btn btn-outline danger" data-action="remove">Удалить</button>
  `;

  card.querySelector('[data-action="remove"]').addEventListener('click', () => card.remove());
  return card;
}

function createPriceCard(price = { service: '', price: '', details: '', image: '' }) {
  const card = document.createElement('div');
  card.className = 'editor-item';
  card.innerHTML = `
    <label class="editor-row">Название товара <input type="text" data-field="service" value="${price.service || ''}" /></label>
    <label class="editor-row">Цена <input type="text" data-field="price" value="${price.price || ''}" /></label>
    <label class="editor-row">Описание <textarea rows="2" data-field="details">${price.details || ''}</textarea></label>
    <label class="editor-row">Загрузка картинки <input type="file" data-field="imageFile" accept="image/*" /></label>
    <label class="editor-row">Или URL картинки <input type="text" data-field="imageUrl" value="${price.image || ''}" /></label>
    <img class="thumb" data-field="preview" style="display:${price.image ? 'block' : 'none'}" src="${price.image || ''}" alt="preview" />
    <button type="button" class="btn btn-outline danger" data-action="remove">Удалить товар</button>
  `;

  const removeBtn = card.querySelector('[data-action="remove"]');
  const imageFileInput = card.querySelector('[data-field="imageFile"]');
  const imageUrlInput = card.querySelector('[data-field="imageUrl"]');
  const preview = card.querySelector('[data-field="preview"]');

  removeBtn.addEventListener('click', () => card.remove());

  imageUrlInput.addEventListener('input', () => {
    const url = imageUrlInput.value.trim();
    if (!url) {
      preview.style.display = 'none';
      preview.src = '';
      return;
    }
    preview.style.display = 'block';
    preview.src = url;
  });

  imageFileInput.addEventListener('change', () => {
    const file = imageFileInput.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = String(reader.result || '');
      imageUrlInput.value = dataUrl;
      preview.src = dataUrl;
      preview.style.display = 'block';
    };
    reader.readAsDataURL(file);
  });

  return card;
}

async function uploadPriceImageFile(file) {
  const body = new FormData();
  body.append('image', file);

  const response = await fetch('/api/admin/upload-image', {
    method: 'POST',
    body,
    credentials: 'same-origin',
  });
  const payload = await response.json();

  if (!response.ok || !payload.ok) {
    throw new Error(payload.message || 'Ошибка загрузки изображения.');
  }

  return payload.path;
}

function createReviewCard(review = { quote: '', author: '' }) {
  const card = document.createElement('div');
  card.className = 'editor-item';
  card.innerHTML = `
    <label class="editor-row">Текст отзыва <textarea rows="3" data-field="quote">${review.quote || ''}</textarea></label>
    <label class="editor-row">Автор <input type="text" data-field="author" value="${review.author || ''}" /></label>
    <button type="button" class="btn btn-outline danger" data-action="remove">Удалить отзыв</button>
  `;

  card.querySelector('[data-action="remove"]').addEventListener('click', () => card.remove());
  return card;
}

function renderSimpleEditor(container, list, label) {
  container.innerHTML = '';
  (list || []).forEach((item) => container.appendChild(createSimpleCard({ label, value: item })));
}

function renderPairEditor(container, list) {
  container.innerHTML = '';
  (list || []).forEach((item) => container.appendChild(createTitleTextCard(item)));
}

function renderPricesEditor(prices = []) {
  pricesEditor.innerHTML = '';
  prices.forEach((item) => pricesEditor.appendChild(createPriceCard(item)));
}

function renderReviewsEditor(reviews = []) {
  reviewsEditor.innerHTML = '';
  reviews.forEach((item) => reviewsEditor.appendChild(createReviewCard(item)));
}

function readSimpleEditor(container) {
  return Array.from(container.querySelectorAll('.editor-item'))
    .map((card) => card.querySelector('[data-field="value"]').value.trim())
    .filter(Boolean);
}

function readPairEditor(container) {
  return Array.from(container.querySelectorAll('.editor-item'))
    .map((card) => {
      const title = card.querySelector('[data-field="title"]').value.trim();
      const text = card.querySelector('[data-field="text"]').value.trim();
      return { title, text };
    })
    .filter((item) => item.title && item.text);
}

function readPricesFromEditor() {
  return Array.from(pricesEditor.querySelectorAll('.editor-item'))
    .map((card) => {
      const service = card.querySelector('[data-field="service"]').value.trim();
      const price = card.querySelector('[data-field="price"]').value.trim();
      const details = card.querySelector('[data-field="details"]').value.trim();
      const image = card.querySelector('[data-field="imageUrl"]').value.trim();
      return { service, price, details, image };
    })
    .filter((item) => item.service && item.price && item.details);
}

function readReviewsFromEditor() {
  return Array.from(reviewsEditor.querySelectorAll('.editor-item'))
    .map((card) => {
      const quote = card.querySelector('[data-field="quote"]').value.trim();
      const author = card.querySelector('[data-field="author"]').value.trim();
      return { quote, author };
    })
    .filter((item) => item.quote && item.author);
}

function fillForm(config) {
  form.metaTitle.value = config.metaTitle;
  form.metaDescription.value = config.metaDescription;
  form.region.value = config.region;
  form.phoneDisplay.value = config.phoneDisplay;
  form.phoneRaw.value = config.phoneRaw;
  form.email.value = config.email;
  form.workSchedule.value = config.workSchedule;

  form.heroTitle.value = config.heroTitle;
  form.heroText.value = config.heroText;
  form.heroPrimaryCta.value = config.heroPrimaryCta;

  form.sauresTitle.value = config.sauresTitle;
  form.sauresText.value = config.sauresText;
  form.sauresLink.value = config.sauresLink;
  form.videoEyebrow.value = config.videoEyebrow || '';
  form.videoTitle.value = config.videoTitle || '';
  form.videoSrc.value = config.videoSrc || '';
  if (videoPreview) {
    videoPreview.src = config.videoSrc || '';
  }
  form.aboutText.value = config.aboutText;

  form.slogan.value = config.slogan;
  form.inn.value = config.inn;
  form.ogrnip.value = config.ogrnip;

  renderSimpleEditor(heroBadgesEditor, config.heroBadges || [], 'Бейдж');
  renderSimpleEditor(advantagesEditor, config.advantages || [], 'Преимущество');
  renderPairEditor(servicesEditor, config.services || []);
  renderPairEditor(stepsEditor, config.steps || []);
  renderPricesEditor(config.prices || []);
  renderReviewsEditor(config.reviews || []);
}

async function saveConfig(event) {
  event.preventDefault();

  try {
    if (saveStatus) saveStatus.textContent = 'Сохраняем...';

    const priceCards = Array.from(pricesEditor.querySelectorAll('.editor-item'));
    for (const card of priceCards) {
      const imageFileInput = card.querySelector('[data-field="imageFile"]');
      const imageUrlInput = card.querySelector('[data-field="imageUrl"]');
      const file = imageFileInput?.files?.[0];

      if (file) {
        if (saveStatus) {
          saveStatus.textContent = `Загружаем изображение: ${file.name}`;
        }
        const uploadedPath = await uploadPriceImageFile(file);
        imageUrlInput.value = uploadedPath;
        if (imageFileInput) imageFileInput.value = '';
      }
    }

    const config = {
      metaTitle: form.metaTitle.value.trim(),
      metaDescription: form.metaDescription.value.trim(),
      region: form.region.value.trim(),
      phoneDisplay: form.phoneDisplay.value.trim(),
      phoneRaw: form.phoneRaw.value.replace(/\D/g, ''),
      email: form.email.value.trim(),
      workSchedule: form.workSchedule.value.trim(),

      heroTitle: form.heroTitle.value.trim(),
      heroText: form.heroText.value.trim(),
      heroPrimaryCta: form.heroPrimaryCta.value.trim(),
      heroBadges: readSimpleEditor(heroBadgesEditor),

      sauresTitle: form.sauresTitle.value.trim(),
      sauresText: form.sauresText.value.trim(),
      sauresLink: form.sauresLink.value.trim(),
      videoEyebrow: form.videoEyebrow.value.trim(),
      videoTitle: form.videoTitle.value.trim(),
      videoSrc: form.videoSrc.value.trim(),
      aboutText: form.aboutText.value.trim(),
      advantages: readSimpleEditor(advantagesEditor),

      services: readPairEditor(servicesEditor),
      prices: readPricesFromEditor(),
      steps: readPairEditor(stepsEditor),
      reviews: readReviewsFromEditor(),

      slogan: form.slogan.value.trim(),
      inn: form.inn.value.trim(),
      ogrnip: form.ogrnip.value.trim(),
    };

    const response = await fetch('/api/admin/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'same-origin',
      body: JSON.stringify(config),
    });
    const payload = await response.json();

    if (!response.ok || !payload.ok) {
      throw new Error(payload.message || 'Не удалось сохранить настройки сайта.');
    }

    saveStatus.textContent = `Сохранено на сервере: ${new Date().toLocaleTimeString('ru-RU')}`;
  } catch (error) {
    saveStatus.textContent = error.message;
  }
}

async function resetConfig() {
  fillForm(defaultConfig);
  saveStatus.textContent = 'Шаблон загружен. Сохраняем на сервер...';

  const response = await fetch('/api/admin/config', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'same-origin',
    body: JSON.stringify(defaultConfig),
  });
  const payload = await response.json();
  if (!response.ok || !payload.ok) {
    throw new Error(payload.message || 'Не удалось сбросить настройки.');
  }

  saveStatus.textContent = 'Сброшено к шаблону и сохранено на сервере.';
}

function setupTabs() {
  tabButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const target = button.dataset.tabTarget;
      if (!target) return;

      tabButtons.forEach((btn) => btn.classList.remove('is-active'));
      button.classList.add('is-active');

      tabPanes.forEach((pane) => {
        pane.classList.toggle('is-active', pane.dataset.tabContent === target);
      });
    });
  });
}

async function uploadVideoFile() {
  const file = videoFileInput?.files?.[0];
  if (!file) {
    if (videoUploadStatus) videoUploadStatus.textContent = 'Сначала выбери видеофайл.';
    return;
  }

  if (videoUploadStatus) videoUploadStatus.textContent = 'Загружаем видео...';
  if (uploadVideoBtn) uploadVideoBtn.disabled = true;

  try {
    const body = new FormData();
    body.append('video', file);

    const response = await fetch('/api/admin/upload-video', {
      method: 'POST',
      body,
    });
    const payload = await response.json();

    if (!response.ok || !payload.ok) {
      throw new Error(payload.message || 'Ошибка загрузки видео.');
    }

    form.videoSrc.value = payload.path;
    if (videoPreview) videoPreview.src = payload.path;
    if (videoUploadStatus) videoUploadStatus.textContent = `Загружено: ${payload.path}`;
  } catch (error) {
    if (videoUploadStatus) videoUploadStatus.textContent = error.message;
  } finally {
    if (uploadVideoBtn) uploadVideoBtn.disabled = false;
  }
}

if (form.videoSrc) {
  form.videoSrc.addEventListener('input', () => {
    if (videoPreview) {
      videoPreview.src = form.videoSrc.value.trim();
    }
  });
}

addHeroBadgeBtn.addEventListener('click', () => {
  heroBadgesEditor.appendChild(createSimpleCard({ label: 'Бейдж' }));
});

addAdvantageBtn.addEventListener('click', () => {
  advantagesEditor.appendChild(createSimpleCard({ label: 'Преимущество' }));
});

addServiceBtn.addEventListener('click', () => {
  servicesEditor.appendChild(createTitleTextCard());
});

addStepBtn.addEventListener('click', () => {
  stepsEditor.appendChild(createTitleTextCard());
});

addPriceBtn.addEventListener('click', () => {
  pricesEditor.appendChild(createPriceCard());
});

addReviewBtn.addEventListener('click', () => {
  reviewsEditor.appendChild(createReviewCard());
});

form.addEventListener('submit', saveConfig);
resetBtn.addEventListener('click', () => {
  resetConfig().catch((error) => {
    saveStatus.textContent = error.message;
  });
});
uploadVideoBtn?.addEventListener('click', uploadVideoFile);
setupTabs();
loadConfig().then((config) => {
  fillForm(config);
});
