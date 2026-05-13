import { templates } from './data/templates.js';
import { storage } from './lib/storage.js';
import { getSuggestions } from './lib/suggestions.js';
import { buildResumeData, resumePreviewHTML } from './lib/resumeBuilder.js';
import { exportResumePdf } from './lib/pdfExport.js';

export function App() {
  return `
    <header class="site-header">
      <div class="container header-inner">
        <div>
          <h1>Генератор резюме</h1>
          <p>Пошаговое создание резюме, шаблоны под профессии, советы и PDF-экспорт.</p>
        </div>
        <button class="btn btn-ghost" id="clearDraftBtn" type="button">Сбросить черновик</button>
      </div>
    </header>

    <main class="container layout" id="appRoot">
      <section class="panel card">
        <div class="wizard-top">
          <div class="progress">
            <div class="progress-bar" id="progressBar"></div>
          </div>
          <div class="step-label" id="stepLabel">Шаг 1 из 5</div>
        </div>

        <form id="resumeForm" class="form">
          ${renderStep1()}
          ${renderStep2()}
          ${renderStep3()}
          ${renderStep4()}
          ${renderStep5()}

          <div class="actions">
            <button type="button" class="btn btn-secondary" id="prevBtn">Назад</button>
            <button type="button" class="btn btn-primary" id="nextBtn">Далее</button>
            <button type="submit" class="btn btn-success">Сохранить</button>
          </div>
        </form>
      </section>

      <aside class="sidebar">
        <section class="card">
          <h2>Шаблон</h2>
          <select id="templateSelect" class="input-select">
            ${templates.map((t) => `<option value="${t.id}">${t.name}</option>`).join('')}
          </select>
          <p id="templateDescription" class="muted"></p>
        </section>

        <section class="card">
          <h2>Советы</h2>
          <ul id="suggestionsList" class="list"></ul>
        </section>

        <section class="card">
          <h2>История</h2>
          <div id="historyList" class="history"></div>
        </section>

        <section class="card">
          <button id="exportPdfBtn" class="btn btn-primary btn-block" type="button">
            Экспорт в PDF
          </button>
          <button id="refreshPreviewBtn" class="btn btn-secondary btn-block" type="button">
            Обновить превью
          </button>
        </section>
      </aside>

      <section class="preview card">
        <div class="preview-head">
          <h2>Превью резюме</h2>
          <span id="completionLabel" class="badge">0%</span>
        </div>
        <div id="resumePreview"></div>
      </section>
    </main>

    <div id="modal" class="modal hidden" aria-hidden="true">
      <div class="modal-content card">
        <button id="closeModalBtn" class="modal-close" type="button">×</button>
        <div id="modalBody"></div>
      </div>
    </div>
  `;
}

function renderStep1() {
  return `
    <section class="step" data-step="1">
      <h2>1. Личные данные</h2>
      <div class="grid">
        ${field('fullName', 'ФИО', 'Иванов Иван Иванович', 'text', true)}
        ${field('headline', 'Должность', 'Frontend-разработчик')}
        ${field('email', 'Email', 'name@example.com', 'email', true)}
        ${field('phone', 'Телефон', '+7 ...', 'tel', true)}
        ${field('city', 'Город', 'Санкт-Петербург')}
        ${field('photo', 'Фото URL', 'https://...')}
      </div>
    </section>
  `;
}

function renderStep2() {
  return `
    <section class="step hidden" data-step="2">
      <h2>2. Опыт работы</h2>
      <div id="experienceList" class="stack"></div>
      <button type="button" class="btn btn-secondary" id="addExperienceBtn">+ Добавить место работы</button>
    </section>
  `;
}

function renderStep3() {
  return `
    <section class="step hidden" data-step="3">
      <h2>3. Образование</h2>
      <div id="educationList" class="stack"></div>
      <button type="button" class="btn btn-secondary" id="addEducationBtn">+ Добавить образование</button>
    </section>
  `;
}

function renderStep4() {
  return `
    <section class="step hidden" data-step="4">
      <h2>4. Навыки</h2>
      ${textarea('skills', 'Ключевые навыки (через запятую)', 'JavaScript, React, HTML, CSS, Git', 5)}
      <div class="grid">
        <label>
          Уровень
          <select name="skillLevel" class="input">
            <option value="junior">Junior</option>
            <option value="middle" selected>Middle</option>
            <option value="senior">Senior</option>
          </select>
        </label>
      </div>
    </section>
  `;
}

function renderStep5() {
  return `
    <section class="step hidden" data-step="5">
      <h2>5. Дополнительная информация</h2>
      ${textarea('courses', 'Курсы и сертификаты', 'Курс по React, сертификат Google Analytics', 4)}
      ${textarea('languages', 'Языки', 'Русский — родной, Английский — B2', 3)}
      ${textarea('summary', 'О себе', 'Краткое описание опыта, сильных сторон и целей', 5)}
    </section>
  `;
}

function field(name, label, placeholder, type = 'text', required = false) {
  return `
    <label>
      ${label}
      <input name="${name}" class="input" type="${type}" placeholder="${placeholder}" ${required ? 'required' : ''} />
    </label>
  `;
}

function textarea(name, label, placeholder, rows = 4) {
  return `
    <label>
      ${label}
      <textarea name="${name}" class="input" rows="${rows}" placeholder="${placeholder}"></textarea>
    </label>
  `;
}

export function initApp() {
  const appRoot = document.querySelector('#appRoot');
  const form = document.querySelector('#resumeForm');
  const preview = document.querySelector('#resumePreview');
  const templateSelect = document.querySelector('#templateSelect');
  const templateDescription = document.querySelector('#templateDescription');
  const suggestionsList = document.querySelector('#suggestionsList');
  const historyList = document.querySelector('#historyList');
  const stepLabel = document.querySelector('#stepLabel');
  const progressBar = document.querySelector('#progressBar');
  const completionLabel = document.querySelector('#completionLabel');
  const modal = document.querySelector('#modal');
  const modalBody = document.querySelector('#modalBody');

  let currentStep = 1;
  let state = {
    fullName: '',
    headline: '',
    email: '',
    phone: '',
    city: '',
    photo: '',
    skills: '',
    skillLevel: 'middle',
    courses: '',
    languages: '',
    summary: '',
    experience: [],
    education: []
  };

  loadDraftIntoState();
  renderRepeaters();
  syncFormFields();
  updateUI();

  // Прямые обработчики для кнопок, чтобы не зависеть от делегирования кликов
  const clearDraftBtn = document.querySelector('#clearDraftBtn');
  const refreshPreviewBtn = document.querySelector('#refreshPreviewBtn');

  clearDraftBtn?.addEventListener('click', () => clearDraft());
  refreshPreviewBtn?.addEventListener('click', () => updateUI());

  document.addEventListener('click', (event) => {
    const button = event.target?.closest?.('button');
    if (!button) return;

    if (button.id === 'nextBtn') {
      if (currentStep < 5) currentStep += 1;
      updateUI();
      return;
    }

    if (button.id === 'prevBtn') {
      if (currentStep > 1) currentStep -= 1;
      updateUI();
      return;
    }

    if (button.id === 'addExperienceBtn') {
      state.experience.push({ company: '', position: '', period: '', responsibilities: '' });
      renderRepeaters();
      updateUI();
      return;
    }

    if (button.id === 'addEducationBtn') {
      state.education.push({ school: '', specialty: '', years: '' });
      renderRepeaters();
      updateUI();
      return;
    }

    if (button.id === 'refreshPreviewBtn') {
      updateUI();
      return;
    }

    if (button.id === 'exportPdfBtn') {
      exportResumePdf(buildResumeData(state), getCurrentTemplate());
      return;
    }

    if (button.id === 'closeModalBtn') {
      closeModal();
      return;
    }

    if (button.id === 'clearDraftBtn') {
      clearDraft();
      return;
    }

    if (button.dataset.removeExp !== undefined) {
      state.experience.splice(Number(button.dataset.removeExp), 1);
      renderRepeaters();
      updateUI();
      return;
    }

    if (button.dataset.removeEdu !== undefined) {
      state.education.splice(Number(button.dataset.removeEdu), 1);
      renderRepeaters();
      updateUI();
      return;
    }
  });

  document.addEventListener('input', (event) => {
    const target = event.target;

    if (!(target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || target instanceof HTMLSelectElement)) {
      return;
    }

    if (!target.closest('#resumeForm')) return;

    const repeater = target.dataset.type;
    if (repeater) {
      const index = Number(target.dataset.index);
      const field = target.dataset.field;
      state[repeater][index][field] = target.value;
      saveDraft();
      updateUI();
      return;
    }

    const name = target.name;
    if (!name) return;

    state[name] = target.value;
    saveDraft();
    updateUI();
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    const data = buildResumeData(state);
    storage.saveHistory({
      name: data.fullName || 'Без имени',
      date: new Date().toLocaleDateString('ru-RU'),
      template: getCurrentTemplate().name
    });

    showModal(`
      <h3>Резюме сохранено</h3>
      <p>Черновик обновлён и история сохранена локально в браузере.</p>
    `);

    updateUI();
  });

  templateSelect.addEventListener('change', updateUI);

  modal.addEventListener('click', (event) => {
    if (event.target === modal) closeModal();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeModal();
  });

  function saveDraft() {
    storage.saveDraft({ state, templateId: templateSelect.value });
  }

  function loadDraftIntoState() {
    const draft = storage.loadDraft();
    if (!draft) return;

    state = { ...state, ...(draft.state || {}) };
    templateSelect.value = draft.templateId || templates[0].id;
  }

  function syncFormFields() {
    Object.entries(state).forEach(([key, value]) => {
      const field = form.elements[key];
      if (!field || Array.isArray(value)) return;
      field.value = value;
    });
  }

  function renderRepeaters() {
    const expWrap = document.querySelector('#experienceList');
    const eduWrap = document.querySelector('#educationList');

    expWrap.innerHTML = state.experience.length
      ? state.experience
          .map(
            (item, index) => `
              <div class="repeat-item card-inner">
                <div class="grid">
                  <label>
                    Компания
                    <input data-type="experience" data-index="${index}" data-field="company" value="${escapeAttr(item.company)}" />
                  </label>
                  <label>
                    Должность
                    <input data-type="experience" data-index="${index}" data-field="position" value="${escapeAttr(item.position)}" />
                  </label>
                  <label>
                    Период
                    <input data-type="experience" data-index="${index}" data-field="period" value="${escapeAttr(item.period)}" />
                  </label>
                  <label>
                    Обязанности и достижения
                    <textarea data-type="experience" data-index="${index}" data-field="responsibilities" rows="3">${escapeHtmlText(item.responsibilities)}</textarea>
                  </label>
                </div>
                <button type="button" class="btn btn-danger btn-mini" data-remove-exp="${index}">Удалить</button>
              </div>
            `
          )
          .join('')
      : `<p class="muted">Пока нет добавленных мест работы.</p>`;

    eduWrap.innerHTML = state.education.length
      ? state.education
          .map(
            (item, index) => `
              <div class="repeat-item card-inner">
                <div class="grid">
                  <label>
                    Учебное заведение
                    <input data-type="education" data-index="${index}" data-field="school" value="${escapeAttr(item.school)}" />
                  </label>
                  <label>
                    Специальность
                    <input data-type="education" data-index="${index}" data-field="specialty" value="${escapeAttr(item.specialty)}" />
                  </label>
                  <label>
                    Годы обучения
                    <input data-type="education" data-index="${index}" data-field="years" value="${escapeAttr(item.years)}" />
                  </label>
                </div>
                <button type="button" class="btn btn-danger btn-mini" data-remove-edu="${index}">Удалить</button>
              </div>
            `
          )
          .join('')
      : `<p class="muted">Пока нет добавленного образования.</p>`;

    expWrap.querySelectorAll('input, textarea').forEach((input) => {
      input.addEventListener('input', (event) => {
        const target = event.target;
        const type = target.dataset.type;
        const index = Number(target.dataset.index);
        const field = target.dataset.field;
        state[type][index][field] = target.value;
        saveDraft();
        updateUI();
      });
    });

    eduWrap.querySelectorAll('input, textarea').forEach((input) => {
      input.addEventListener('input', (event) => {
        const target = event.target;
        const type = target.dataset.type;
        const index = Number(target.dataset.index);
        const field = target.dataset.field;
        state[type][index][field] = target.value;
        saveDraft();
        updateUI();
      });
    });
  }

  function updateUI() {
    const template = getCurrentTemplate();

    document.querySelectorAll('.step').forEach((step, index) => {
      step.classList.toggle('hidden', index + 1 !== currentStep);
    });

    stepLabel.textContent = `Шаг ${currentStep} из 5`;
    progressBar.style.width = `${(currentStep / 5) * 100}%`;
    templateDescription.textContent = template.description;

    const data = buildResumeData(state);
    preview.innerHTML = resumePreviewHTML(data, template);

    const suggestions = getSuggestions(data, template);
    suggestionsList.innerHTML = suggestions.map((item) => `<li>${escapeHtmlText(item)}</li>`).join('');

    const history = storage.getHistory();
    historyList.innerHTML = history.length
      ? history
          .map(
            (item) =>
              `<div class="history-item"><strong>${escapeHtmlText(item.name)}</strong><div class="muted">${escapeHtmlText(item.date)} · ${escapeHtmlText(item.template)}</div></div>`
          )
          .join('')
      : '<p class="muted">Пока нет сохранённых резюме.</p>';

    completionLabel.textContent = `${countFilledFields(data)}%`;
    saveDraft();
  }

  function countFilledFields(data) {
    const total = 12;
    let filled = 0;

    if (data.fullName) filled++;
    if (data.headline) filled++;
    if (data.email) filled++;
    if (data.phone) filled++;
    if (data.city) filled++;
    if (data.photo) filled++;
    if (data.skillsList?.length) filled++;
    if (data.summary) filled++;
    if (data.courses) filled++;
    if (data.languages) filled++;
    if (data.experience?.length) filled++;
    if (data.education?.length) filled++;

    return Math.round((filled / total) * 100);
  }

  function getCurrentTemplate() {
    return templates.find((item) => item.id === templateSelect.value) || templates[0];
  }

  function clearDraft() {
  storage.clearDraft();
  storage.clearHistory();

  state = {
    fullName: '',
    headline: '',
    email: '',
    phone: '',
    city: '',
    photo: '',
    skills: '',
    skillLevel: 'middle',
    courses: '',
    languages: '',
    summary: '',
    experience: [],
    education: []
  };

  currentStep = 1;
  templateSelect.value = templates[0].id;
  syncFormFields();
  renderRepeaters();
  updateUI();
  }

  function showModal(html) {
    modalBody.innerHTML = html;
    modal.classList.remove('hidden');
    modal.setAttribute('aria-hidden', 'false');
  }

  function closeModal() {
    modal.classList.add('hidden');
    modal.setAttribute('aria-hidden', 'true');
  }

  function escapeHtmlText(str = '') {
    return String(str)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#39;');
  }

  function escapeAttr(str = '') {
    return escapeHtmlText(str);
  }
}
