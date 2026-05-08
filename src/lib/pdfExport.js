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

function addWrappedText(doc, text, x, y, maxWidth, lineHeight = 6) {
  const lines = doc.splitTextToSize(String(text), maxWidth);
  doc.text(lines, x, y);
  return y + lines.length * lineHeight;
}

export function exportResumePdf(data, template) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const margin = 15;
  const pageWidth = 210;
  const contentWidth = pageWidth - margin * 2;

  const accent = template?.color || '#2563eb';
  const rgb = hexToRgb(accent);

  doc.setFillColor(rgb.r, rgb.g, rgb.b);
  doc.rect(0, 0, pageWidth, 20, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text(data.fullName || 'Ваше имя', margin, 13);

  doc.setTextColor(33, 37, 41);
  let y = 30;

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  y = addWrappedText(
    doc,
    `${data.headline || ''} · ${data.city || ''} · ${data.email || ''} · ${data.phone || ''}`,
    margin,
    y,
    contentWidth
  ) + 4;

  const sections = [
    ['О себе', data.summary],
    ['Навыки', (data.skillsList || []).join(', ')],
    ['Курсы и сертификаты', data.courses],
    ['Языки', data.languages]
  ];

  sections.forEach(([title, text]) => {
    if (!text) return;
    doc.setFont('helvetica', 'bold');
    doc.text(title, margin, y);
    y += 6;
    doc.setFont('helvetica', 'normal');
    y = addWrappedText(doc, text, margin, y, contentWidth) + 4;
    if (y > 275) {
      doc.addPage();
      y = 20;
    }
  });

  if (data.experience?.length) {
    if (y > 240) {
      doc.addPage();
      y = 20;
    }
    doc.setFont('helvetica', 'bold');
    doc.text('Опыт работы', margin, y);
    y += 8;

    data.experience.forEach((item) => {
      const block = `${item.company || ''} — ${item.position || ''}\n${item.period || ''}\n${item.responsibilities || ''}`;
      doc.setFont('helvetica', 'bold');
      y = addWrappedText(doc, `${item.company || 'Компания'} — ${item.position || 'Должность'}`, margin, y, contentWidth) + 1;
      doc.setFont('helvetica', 'normal');
      y = addWrappedText(doc, `${item.period || ''}`, margin, y, contentWidth) + 1;
      y = addWrappedText(doc, `${item.responsibilities || ''}`, margin, y, contentWidth) + 3;
      if (y > 275) {
        doc.addPage();
        y = 20;
      }
    });
  }

  if (data.education?.length) {
    if (y > 240) {
      doc.addPage();
      y = 20;
    }
    doc.setFont('helvetica', 'bold');
    doc.text('Образование', margin, y);
    y += 8;

    data.education.forEach((item) => {
      doc.setFont('helvetica', 'bold');
      y = addWrappedText(doc, `${item.school || 'Учебное заведение'}`, margin, y, contentWidth) + 1;
      doc.setFont('helvetica', 'normal');
      y = addWrappedText(
        doc,
        `${item.specialty || 'Специальность'} · ${item.years || 'Годы обучения'}`,
        margin,
        y,
        contentWidth
      ) + 3;
      if (y > 275) {
        doc.addPage();
        y = 20;
      }
    });
  }

  const filename = `${(data.fullName || 'resume').replaceAll(' ', '_')}.pdf`;
  doc.save(filename);
}