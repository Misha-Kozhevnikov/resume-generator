# Генератор резюме

Веб-приложение на Vite и чистом JavaScript для пошагового создания резюме.

## Возможности

- Пошаговое заполнение резюме.
- Шаблоны под разные профессии.
- Live preview в реальном времени.
- Советы по улучшению текста и ATS-ключам.
- Сохранение черновика в localStorage.
- История сохранённых резюме.
- Экспорт резюме в PDF.

## Структура проекта

- `src/main.js` — точка входа.
- `src/App.js` — разметка и логика интерфейса.
- `src/data/templates.js` — шаблоны резюме.
- `src/lib/storage.js` — localStorage.
- `src/lib/suggestions.js` — советы и рекомендации.
- `src/lib/resumeBuilder.js` — сборка данных и превью.
- `src/lib/pdfExport.js` — экспорт в PDF.
- `src/styles/main.css` — стили.

## Установка

```bash
npm install
```

## Запуск в режиме разработки

```bash
npm run dev
```

## Сборка для продакшена

```bash
npm run build
```

## Предпросмотр сборки

```bash
npm run preview
```

## Используемые технологии

- JavaScript
- HTML/CSS
- Vite
- jsPDF
- localStorage

## Примечания

- Данные сохраняются только в браузере.
- Для полноценной работы экспорта PDF используется пакет `jspdf`.
- Файл `public/avatar-placeholder.png` можно заменить на любую заглушку.