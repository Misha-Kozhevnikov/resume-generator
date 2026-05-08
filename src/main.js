import './styles/main.css';
import { App, initApp } from './App.js';

document.addEventListener('DOMContentLoaded', () => {
  const app = document.querySelector('#app');
  if (!app) {
    throw new Error('Root element #app not found');
  }

  app.innerHTML = App();
  initApp();
});