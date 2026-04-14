const STORAGE_KEY = 'cloudBridgeSiteConfig';

const defaultConfig = {
  metaTitle: 'Облачный Мост - Замена счетчиков, сантехника и умный дом',
  metaDescription:
    'Замена и установка счетчиков воды и тепла, сантехнические работы, подключение систем умного дома и облачный контроль SAURES. Москва и Московская область.',
  companyName: 'Облачный Мост',
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
      image: '',
    },
    {
      service: 'Установка счетчика тепла',
      price: 'от 6 500 ₽',
      details: 'Подбор, монтаж, настройка',
      image: '',
    },
    {
      service: 'Сантехнический выезд',
      price: 'от 2 000 ₽',
      details: 'Диагностика и устранение неисправности',
      image: '',
    },
    {
      service: 'Подключение SAURES / умный дом',
      price: 'от 5 000 ₽',
      details: 'Интеграция и запуск',
      image: '',
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

function loadConfig() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultConfig;
    const parsed = JSON.parse(raw);
    return {
      ...defaultConfig,
      ...parsed,
    };
  } catch (error) {
    console.error('Ошибка загрузки конфигурации:', error);
    return defaultConfig;
  }
}

const config = loadConfig();

function setText(id, value) {
  const el = document.getElementById(id);
  if (el && typeof value === 'string') {
    el.textContent = value;
  }
}

function setHref(id, value) {
  const el = document.getElementById(id);
  if (el && typeof value === 'string') {
    el.href = value;
  }
}

function renderList(containerId, items) {
  const container = document.getElementById(containerId);
  if (!container || !Array.isArray(items)) return;
  container.innerHTML = '';
  items.forEach((item) => {
    const li = document.createElement('li');
    li.textContent = item;
    container.appendChild(li);
  });
}

function renderServices() {
  const container = document.getElementById('services-grid');
  if (!container) return;
  container.innerHTML = '';
  (config.services || []).forEach((service) => {
    const card = document.createElement('article');
    card.className = 'card';
    card.innerHTML = `<h3>${service.title}</h3><p>${service.text}</p>`;
    container.appendChild(card);
  });
}

function renderPrices() {
  const container = document.getElementById('prices-grid');
  if (!container) return;

  container.innerHTML = '';
  (config.prices || []).forEach((item) => {
    const card = document.createElement('article');
    card.className = 'card price-card';
    const imagePart = item.image
      ? `<img class="price-image" src="${item.image}" alt="${item.service}" loading="lazy" />`
      : '<div class="price-image-placeholder">Фото товара</div>';
    card.innerHTML = `
      ${imagePart}
      <h3>${item.service}</h3>
      <p class="price-value">${item.price}</p>
      <p>${item.details}</p>
    `;
    container.appendChild(card);
  });
}

function renderSteps() {
  const container = document.getElementById('steps-list');
  if (!container) return;
  container.innerHTML = '';
  (config.steps || []).forEach((step, idx) => {
    const li = document.createElement('li');
    li.innerHTML = `<span>${idx + 1}</span><div><h3>${step.title}</h3><p>${step.text}</p></div>`;
    container.appendChild(li);
  });
}

function renderReviews() {
  const container = document.getElementById('reviews-grid');
  if (!container) return;
  container.innerHTML = '';
  (config.reviews || []).forEach((review) => {
    const block = document.createElement('blockquote');
    block.className = 'card';
    block.innerHTML = `<p>"${review.quote}"</p><cite>- ${review.author}</cite>`;
    container.appendChild(block);
  });
}

function renderServiceOptions() {
  const select = document.getElementById('service-select');
  if (!select) return;

  select.innerHTML = '<option value="">Выберите услугу (необязательно)</option>';

  (config.services || []).forEach((service) => {
    const option = document.createElement('option');
    option.textContent = service.title;
    option.value = service.title;
    select.appendChild(option);
  });
}

function applyConfig() {
  document.title = config.metaTitle;
  const metaDescription = document.getElementById('meta-description');
  if (metaDescription) {
    metaDescription.setAttribute('content', config.metaDescription);
  }

  setText('region-text', config.region);
  setText('hero-title', config.heroTitle);
  setText('hero-text', config.heroText);
  setText('hero-cta-primary', config.heroPrimaryCta);
  setText('saures-title', config.sauresTitle);
  setText('saures-text', config.sauresText);
  setText('video-eyebrow', config.videoEyebrow);
  setText('video-title', config.videoTitle);
  setText('about-text', config.aboutText);
  setText('footer-slogan', config.slogan);
  setText('footer-region', config.region);
  setText('work-schedule', config.workSchedule);
  setText('inn-text', config.inn);
  setText('ogrnip-text', config.ogrnip);

  setHref('saures-link', config.sauresLink);

  const videoSource = document.getElementById('video-source');
  if (videoSource && typeof config.videoSrc === 'string' && config.videoSrc.trim()) {
    videoSource.src = config.videoSrc.trim();
    const videoElement = videoSource.parentElement;
    if (videoElement && videoElement.tagName === 'VIDEO') {
      videoElement.load();
    }
  }

  const phoneHref = `tel:+${config.phoneRaw}`;
  setHref('phone-link-header', phoneHref);
  setHref('phone-link-footer', phoneHref);
  setText('phone-link-footer', config.phoneDisplay);

  setHref('email-link', `mailto:${config.email}`);
  setText('email-link', config.email);

  renderList('hero-badges', config.heroBadges || []);
  renderList('advantages-list', config.advantages || []);
  renderServices();
  renderPrices();
  renderSteps();
  renderReviews();
  renderServiceOptions();
}

function setupRevealAnimations() {
  const revealElements = document.querySelectorAll('.reveal');

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.12,
    }
  );

  revealElements.forEach((element) => revealObserver.observe(element));
}

async function submitLead(formData) {
  const response = await fetch('/api/leads', {
    method: 'POST',
    body: formData,
  });

  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload.message || 'Не удалось отправить заявку.');
  }

  return payload;
}

function setupLeadForm() {
  const form = document.getElementById('lead-form');
  const note = document.getElementById('form-note');

  if (!form || !note) return;

  const isGithubPages =
    typeof window !== 'undefined' && window.location.hostname.endsWith('github.io');

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const formData = new FormData(form);
    const name = String(formData.get('name') || '').trim();
    const phone = String(formData.get('phone') || '').trim();
    const comment = String(formData.get('comment') || '').trim();
    const file = formData.get('file');

    if (!name || !phone || !comment || !(file instanceof File) || file.size === 0) {
      note.textContent = 'Пожалуйста, заполните имя, телефон, комментарий и прикрепите файл.';
      note.style.color = '#b32c2c';
      return;
    }

    const submitButton = form.querySelector('button[type="submit"]');
    if (submitButton) submitButton.disabled = true;

    note.textContent = 'Отправляем заявку...';
    note.style.color = '#264f72';

    if (isGithubPages) {
      note.textContent =
        'Демо-версия на GitHub Pages: отправка заявок отключена. Для реальной отправки используем серверную версию.';
      note.style.color = '#264f72';
      if (submitButton) submitButton.disabled = false;
      return;
    }

    try {
      await submitLead(formData);
      note.textContent = 'Спасибо. Заявка успешно отправлена.';
      note.style.color = '#1c6e2d';
      form.reset();
    } catch (error) {
      note.textContent = error.message;
      note.style.color = '#b32c2c';
    } finally {
      if (submitButton) submitButton.disabled = false;
    }
  });
}

applyConfig();
setupRevealAnimations();
setupLeadForm();
