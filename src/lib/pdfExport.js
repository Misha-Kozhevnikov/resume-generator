import { jsPDF } from 'jspdf';
import { escapeHtml } from './resumeBuilder.js';

function hexToRgb(hex) {
  const clean = hex.replace('#', '');
  return {
    r: Number.parseInt(clean.slice(0, 2), 16),
    g: Number.parseInt(clean.slice(2, 4), 16),
    b: Number.parseInt(clean.slice(4, 6), 16)
  };
}

function addWrappedText(doc, text, x, y, maxWidth) {
  const str = String(text ?? '');
  if (!str.trim()) return y;

  // splitTextToSize разбивает по ширине, но \n нужно обработать отдельно
  const paragraphs = str.split('\n');

  // Берём фактическую высоту текста для текущего шрифта/размера в текущих unit.
  // Это согласовано с тем, как jsPDF рисует строки.
  const baseHeight = doc.getTextDimensions('Ag').h;
  const lineHeight = baseHeight * 1.15;

  let currentY = y;
  for (let i = 0; i < paragraphs.length; i += 1) {
    const paragraph = paragraphs[i];

    const lines = doc.splitTextToSize(paragraph, maxWidth);
    doc.text(lines, x, currentY);

    currentY += lines.length * lineHeight;

    // Пустая строка между параграфами (если это не последний параграф)
    if (i !== paragraphs.length - 1) currentY += lineHeight * 0.8;
  }

  return currentY;
}

export function exportResumePdf(data, template) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const margin = 15;
  const pageWidth = 210;
  const pageHeight = 297;
  const contentWidth = pageWidth - margin * 2;

  const accent = template?.color || '#2563eb';
  const rgb = hexToRgb(accent);

  // Header
  doc.setFillColor(rgb.r, rgb.g, rgb.b);
  doc.rect(0, 0, pageWidth, 20, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text(data.fullName || 'Ваше имя', margin, 13);

  // Body
  doc.setTextColor(33, 37, 41);
  let y = 30;

  const ensureSpace = (neededMm) => {
    if (y + neededMm > pageHeight - 15) {
      doc.addPage();
      y = 20;
    }
  };

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');

  ensureSpace(12);
  const contactLine = `${data.headline || ''} · ${data.city || ''} · ${data.email || ''} · ${data.phone || ''}`.trim();
  y = addWrappedText(doc, contactLine, margin, y, contentWidth) + 2;

  const sections = [
    ['О себе', data.summary],
    ['Навыки', (data.skillsList || []).join(', ')],
    ['Курсы и сертификаты', data.courses],
    ['Языки', data.languages]
  ];

  for (const [title, text] of sections) {
    if (!text) continue;

    doc.setFont('helvetica', 'bold');
    ensureSpace(8);
    doc.text(title, margin, y);

    y = addWrappedText(doc, '', margin, y + 1, contentWidth); // noop по высоте
    // небольшая отступка после заголовка
    y += 2;

    doc.setFont('helvetica', 'normal');
    ensureSpace(12);
    y = addWrappedText(doc, text, margin, y, contentWidth) + 2;
  }

  if (data.experience?.length) {
    doc.setFont('helvetica', 'bold');
    ensureSpace(10);
    doc.text('Опыт работы', margin, y);
    y += 6;

    for (const item of data.experience) {
      doc.setFont('helvetica', 'bold');
      ensureSpace(10);
      y = addWrappedText(
        doc,
        `${item.company || 'Компания'} — ${item.position || 'Должность'}`,
        margin,
        y,
        contentWidth
      ) + 1;

      doc.setFont('helvetica', 'normal');
      ensureSpace(8);
      y = addWrappedText(doc, item.period || '', margin, y, contentWidth) + 1;

      ensureSpace(8);
      y = addWrappedText(doc, item.responsibilities || '', margin, y, contentWidth) + 2;
    }
  }

  if (data.education?.length) {
    doc.setFont('helvetica', 'bold');
    ensureSpace(10);
    doc.text('Образование', margin, y);
    y += 6;

    for (const item of data.education) {
      doc.setFont('helvetica', 'bold');
      ensureSpace(10);
      y = addWrappedText(doc, item.school || 'Учебное заведение', margin, y, contentWidth) + 1;

      doc.setFont('helvetica', 'normal');
      ensureSpace(10);
      y = addWrappedText(
        doc,
        `${item.specialty || 'Специальность'} · ${item.years || 'Годы обучения'}`,
        margin,
        y,
        contentWidth
      ) + 2;
    }
  }

  const filename = `${(data.fullName || 'resume').replaceAll(' ', '_')}.pdf`;
  doc.save(filename);
}
