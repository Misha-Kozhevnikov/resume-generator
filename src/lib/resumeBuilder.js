export function parseSkills(skillsText = '') {
  return skillsText
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

export function buildResumeData(state) {
  return {
    ...state,
    skillsList: parseSkills(state.skills)
  };
}

export function resumePreviewHTML(data, template) {
  const experienceHTML = (data.experience || [])
    .map(
      (item) => `
        <article class="resume-item">
          <h4>${escapeHtml(item.company || 'Компания')}</h4>
          <p class="resume-muted">
            ${escapeHtml(item.position || 'Должность')} · ${escapeHtml(item.period || 'Период')}
          </p>
          <p>${escapeHtml(item.responsibilities || 'Обязанности и достижения')}</p>
        </article>
      `
    )
    .join('');

  const educationHTML = (data.education || [])
    .map(
      (item) => `
        <article class="resume-item">
          <h4>${escapeHtml(item.school || 'Учебное заведение')}</h4>
          <p class="resume-muted">
            ${escapeHtml(item.specialty || 'Специальность')} · ${escapeHtml(item.years || 'Годы обучения')}
          </p>
        </article>
      `
    )
    .join('');

  const skillsHTML = (data.skillsList || [])
    .map((skill) => `<span class="skill-chip">${escapeHtml(skill)}</span>`)
    .join('');

  return `
    <div class="resume-card" style="--accent:${template?.color || '#2563eb'}">
      <header class="resume-header">
        <div class="resume-photo">
          <img src="${data.photo || '/avatar-placeholder.png'}" alt="Фото" />
        </div>
        <div>
          <h2>${escapeHtml(data.fullName || 'Ваше имя')}</h2>
          <p class="resume-headline">${escapeHtml(data.headline || 'Желаемая должность')}</p>
          <p class="resume-muted">
            ${escapeHtml(data.city || 'Город')} · ${escapeHtml(data.email || 'email')} · ${escapeHtml(data.phone || 'телефон')}
          </p>
        </div>
      </header>

      <section>
        <h3>О себе</h3>
        <p>${escapeHtml(data.summary || 'Краткое описание опыта, целей и сильных сторон.')}</p>
      </section>

      <section>
        <h3>Опыт работы</h3>
        ${experienceHTML || '<p class="resume-muted">Нет данных об опыте.</p>'}
      </section>

      <section>
        <h3>Образование</h3>
        ${educationHTML || '<p class="resume-muted">Нет данных об образовании.</p>'}
      </section>

      <section>
        <h3>Навыки</h3>
        <div class="skills-row">${skillsHTML || '<span class="resume-muted">Навыки не указаны.</span>'}</div>
      </section>

      <section>
        <h3>Дополнительно</h3>
        <p><strong>Курсы и сертификаты:</strong> ${escapeHtml(data.courses || '—')}</p>
        <p><strong>Языки:</strong> ${escapeHtml(data.languages || '—')}</p>
      </section>
    </div>
  `;
}

export function escapeHtml(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}