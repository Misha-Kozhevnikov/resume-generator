export function getSuggestions(data, template) {
  const tips = [];

  if (!data.fullName) tips.push('Укажите ФИО — это первое, что видит рекрутер.');
  if (!data.headline) tips.push('Добавьте желаемую должность в заголовок резюме.');
  if (!data.summary || data.summary.length < 80) {
    tips.push('Сделайте блок «О себе» сильнее: опыт, результат, специализация.');
  }
  if (!data.email) tips.push('Добавьте email для обратной связи.');
  if (!data.phone) tips.push('Укажите номер телефона в понятном формате.');
  if (!data.skills || data.skills.split(',').filter(Boolean).length < 5) {
    tips.push('Добавьте минимум 5 навыков через запятую.');
  }
  if (!data.experience || data.experience.length === 0) {
    tips.push('Добавьте хотя бы одно место работы или стажировку.');
  }
  if (!data.education || data.education.length === 0) {
    tips.push('Укажите образование, даже если оно ещё не завершено.');
  }

  if (template?.keywords?.length) {
    tips.push(`ATS-ключевые слова для шаблона: ${template.keywords.join(', ')}.`);
  }

  return tips;
}