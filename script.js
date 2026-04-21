const defaultConfig = {
  "metaTitle": "Облачный Мост - Замена счетчиков, сантехника и умный дом",
  "metaDescription": "Замена и установка счетчиков воды и тепла, сантехнические работы, подключение систем умного дома и облачный контроль SAURES. Москва и Московская область.",
  "companyName": "Облачный Мост",
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

let config = { ...defaultConfig };

async function loadConfig() {
  try {
    const response = await fetch('/api/site-config');
    const payload = await response.json();

    if (!response.ok || !payload.ok) {
      throw new Error(payload.message || 'Не удалось загрузить конфигурацию сайта.');
    }

    config = {
      ...defaultConfig,
      ...(payload.config || {}),
    };
  } catch (error) {
    console.error('Ошибка загрузки конфигурации:', error);
    config = { ...defaultConfig };
  }
}

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

function setupScrollToTopLinks() {
  const links = document.querySelectorAll('a[href="#top"]');
  links.forEach((link) => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
      if (window.location.hash !== '#top') {
        window.history.replaceState(null, '', '#top');
      }
    });
  });
}

async function submitLead(formData, onProgress) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', '/api/leads');
    xhr.responseType = 'json';

    xhr.upload.onprogress = (event) => {
      if (!onProgress || !event.lengthComputable) return;
      const percent = Math.max(1, Math.round((event.loaded / event.total) * 100));
      onProgress(percent);
    };

    xhr.onload = () => {
      const payload = xhr.response || {};
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(payload);
        return;
      }
      reject(new Error(payload.message || 'Не удалось отправить заявку.'));
    };

    xhr.onerror = () => reject(new Error('Ошибка сети при отправке заявки.'));
    xhr.send(formData);
  });
}

function sanitizeNameInput(value) {
  return String(value || '').replace(/[^A-Za-zА-Яа-яЁё\s-]/g, '');
}

function isValidName(value) {
  return /^[A-Za-zА-Яа-яЁё\s-]{2,60}$/.test(value);
}

function formatPhoneInput(value) {
  let digits = String(value || '').replace(/\D/g, '');
  if (digits.startsWith('8')) digits = `7${digits.slice(1)}`;
  if (!digits.startsWith('7')) digits = `7${digits}`;
  digits = digits.slice(0, 11);

  const p = digits.slice(1);
  let out = '+7';
  if (p.length > 0) out += ` (${p.slice(0, 3)}`;
  if (p.length >= 3) out += ')';
  if (p.length > 3) out += ` ${p.slice(3, 6)}`;
  if (p.length > 6) out += `-${p.slice(6, 8)}`;
  if (p.length > 8) out += `-${p.slice(8, 10)}`;
  return out;
}

function normalizePhoneForSubmit(value) {
  let digits = String(value || '').replace(/\D/g, '');
  if (digits.startsWith('8')) digits = `7${digits.slice(1)}`;
  if (!digits.startsWith('7')) digits = `7${digits}`;
  if (!/^7\d{10}$/.test(digits)) return null;
  return `+${digits}`;
}

function sanitizeCommentInput(value) {
  return String(value || '')
    .slice(0, 500)
    .replace(/[^0-9A-Za-zА-Яа-яЁё\s.,!?():\-"]/g, '');
}

function isValidComment(value) {
  return /^[0-9A-Za-zА-Яа-яЁё\s.,!?():\-"]{1,500}$/.test(value);
}

function getOrCreateFieldError(form, fieldName) {
  let el = form.querySelector(`[data-error-for="${fieldName}"]`);
  if (el) return el;

  const field =
    form.querySelector(`[name="${fieldName}"]`) ||
    form.querySelector(`#${fieldName}`) ||
    null;
  if (!field) return null;

  el = document.createElement('small');
  el.className = 'field-error';
  el.dataset.errorFor = fieldName;
  field.insertAdjacentElement('afterend', el);
  return el;
}

function setFieldError(form, fieldName, message) {
  const field =
    form.querySelector(`[name="${fieldName}"]`) ||
    form.querySelector(`#${fieldName}`) ||
    null;
  const error = getOrCreateFieldError(form, fieldName);
  if (field) field.classList.add('field-invalid');
  if (error) error.textContent = message || '';
}

function clearFieldError(form, fieldName) {
  const field =
    form.querySelector(`[name="${fieldName}"]`) ||
    form.querySelector(`#${fieldName}`) ||
    null;
  const error = getOrCreateFieldError(form, fieldName);
  if (field) field.classList.remove('field-invalid');
  if (error) error.textContent = '';
}

function clearAllFieldErrors(form) {
  ['name', 'phone', 'comment', 'files'].forEach((field) => clearFieldError(form, field));
}

function renderFilePreview(previewContainer, files, onRemove) {
  if (!previewContainer) return;
  previewContainer.innerHTML = '';

  files.forEach((file, index) => {
    const item = document.createElement('div');
    item.className = 'file-preview-item';

    const isImage = String(file.type || '').startsWith('image/');
    if (isImage) {
      const img = document.createElement('img');
      img.alt = file.name;
      img.loading = 'lazy';
      img.src = URL.createObjectURL(file);
      img.addEventListener('load', () => URL.revokeObjectURL(img.src));
      item.appendChild(img);
    } else {
      const icon = document.createElement('div');
      icon.className = 'file-preview-icon';
      icon.textContent = file.type === 'application/pdf' ? 'PDF' : 'VIDEO';
      item.appendChild(icon);
    }

    const meta = document.createElement('p');
    meta.className = 'file-preview-name';
    meta.textContent = file.name;
    item.appendChild(meta);

    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.className = 'file-preview-remove';
    removeBtn.textContent = 'Удалить';
    removeBtn.addEventListener('click', () => {
      if (typeof onRemove === 'function') {
        onRemove(index);
      }
    });
    item.appendChild(removeBtn);

    previewContainer.appendChild(item);
  });
}

function setupFloatingCta(form) {
  if (!form || document.querySelector('.floating-cta')) return;
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'floating-cta';
  btn.textContent = 'Оставить заявку';
  btn.addEventListener('click', () => {
    form.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
  document.body.appendChild(btn);
}

function setupLeadForm() {
  const form = document.getElementById('lead-form');
  const note = document.getElementById('form-note');

  if (!form || !note) return;

  const isGithubPages =
    typeof window !== 'undefined' && window.location.hostname.endsWith('github.io');

  const nameInput = form.querySelector('input[name="name"]');
  const phoneInput = form.querySelector('input[name="phone"]');
  const commentInput = form.querySelector('textarea[name="comment"]');
  const fileInput = form.querySelector('input[name="files"]');

  let filePreview = null;
  let selectedFiles = [];
  const refreshSelectedFiles = () => {
    renderFilePreview(filePreview, selectedFiles, (indexToRemove) => {
      selectedFiles = selectedFiles.filter((_, index) => index !== indexToRemove);
      refreshSelectedFiles();
    });
  };
  if (fileInput) {
    filePreview = document.createElement('div');
    filePreview.className = 'file-preview-grid full-width';
    fileInput.closest('label')?.insertAdjacentElement('afterend', filePreview);
  }

  let commentCounter = null;
  if (commentInput) {
    commentCounter = document.createElement('small');
    commentCounter.className = 'field-helper';
    commentInput.insertAdjacentElement('afterend', commentCounter);
  }

  setupFloatingCta(form);

  if (nameInput) {
    nameInput.addEventListener('input', () => {
      nameInput.value = sanitizeNameInput(nameInput.value).replace(/\s{2,}/g, ' ');
      clearFieldError(form, 'name');
    });
  }

  if (phoneInput) {
    phoneInput.addEventListener('input', () => {
      phoneInput.value = formatPhoneInput(phoneInput.value);
      clearFieldError(form, 'phone');
    });
    phoneInput.value = formatPhoneInput(phoneInput.value || '');
  }

  if (commentInput) {
    const updateCounter = () => {
      const left = Math.max(0, 500 - String(commentInput.value || '').length);
      if (commentCounter) commentCounter.textContent = `Осталось символов: ${left}`;
    };
    commentInput.addEventListener('input', () => {
      commentInput.value = sanitizeCommentInput(commentInput.value);
      clearFieldError(form, 'comment');
      updateCounter();
    });
    updateCounter();
  }

  if (fileInput) {
    fileInput.addEventListener('change', () => {
      selectedFiles = Array.from(fileInput.files || []).slice(0, 5);
      refreshSelectedFiles();
      fileInput.value = '';
      clearFieldError(form, 'files');
    });
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    clearAllFieldErrors(form);

    const formData = new FormData(form);
    formData.delete('files');
    const name = sanitizeNameInput(String(formData.get('name') || '').trim()).replace(/\s{2,}/g, ' ');
    const phoneRaw = String(formData.get('phone') || '').trim();
    const phone = normalizePhoneForSubmit(phoneRaw);
    const comment = sanitizeCommentInput(String(formData.get('comment') || '').trim()).replace(/\s{2,}/g, ' ');
    const files = selectedFiles.filter((item) => item instanceof File && item.size > 0);

    if (!isValidName(name)) {
      setFieldError(form, 'name', 'Имя: только буквы, пробел и дефис (2-60 символов).');
      note.textContent = 'Проверьте поля формы.';
      note.style.color = '#b32c2c';
      return;
    }

    if (!phone) {
      setFieldError(form, 'phone', 'Телефон должен быть в формате +7XXXXXXXXXX.');
      note.textContent = 'Проверьте поля формы.';
      note.style.color = '#b32c2c';
      return;
    }

    if (!isValidComment(comment)) {
      setFieldError(form, 'comment', 'Комментарий: до 500 символов, без спецсимволов.');
      note.textContent = 'Проверьте поля формы.';
      note.style.color = '#b32c2c';
      return;
    }

    if (files.length === 0) {
      setFieldError(form, 'files', 'Пожалуйста, прикрепите хотя бы 1 файл.');
      note.textContent = 'Проверьте поля формы.';
      note.style.color = '#b32c2c';
      return;
    }

    if (files.length > 5) {
      setFieldError(form, 'files', 'Можно прикрепить не более 5 файлов.');
      note.textContent = 'Проверьте поля формы.';
      note.style.color = '#b32c2c';
      return;
    }

    const hasInvalidType = files.some((file) => {
      const type = String(file.type || '');
      return !(
        type.startsWith('image/') ||
        type.startsWith('video/') ||
        type === 'application/pdf'
      );
    });
    if (hasInvalidType) {
      setFieldError(form, 'files', 'Разрешены только фото, видео и PDF.');
      note.textContent = 'Проверьте поля формы.';
      note.style.color = '#b32c2c';
      return;
    }

    formData.set('name', name);
    formData.set('phone', phone);
    formData.set('comment', comment);
    files.forEach((file) => formData.append('files', file));

    const submitButton = form.querySelector('button[type="submit"]');
    if (submitButton) submitButton.disabled = true;

    note.textContent = 'Отправляем заявку... 0%';
    note.style.color = '#264f72';

    if (isGithubPages) {
      note.textContent =
        'Демо-версия на GitHub Pages: отправка заявок отключена. Для реальной отправки используем серверную версию.';
      note.style.color = '#264f72';
      if (submitButton) submitButton.disabled = false;
      return;
    }

    try {
      await submitLead(formData, (percent) => {
        note.textContent = `Отправляем заявку... ${percent}%`;
      });
      note.textContent = 'Спасибо. Заявка успешно отправлена. Обычно связываемся в течение 10-15 минут.';
      note.style.color = '#1c6e2d';
      form.reset();
      selectedFiles = [];
      if (filePreview) filePreview.innerHTML = '';
    } catch (error) {
      note.textContent = error.message;
      note.style.color = '#b32c2c';
    } finally {
      if (submitButton) submitButton.disabled = false;
    }
  });
}

loadConfig().finally(() => {
  applyConfig();
  setupRevealAnimations();
  setupScrollToTopLinks();
  setupLeadForm();
});
