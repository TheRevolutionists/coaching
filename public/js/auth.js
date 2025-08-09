import { api } from './api.js';

const form = document.getElementById('loginForm');
const errorEl = document.getElementById('error');

form?.addEventListener('submit', async (e) => {
  e.preventDefault();
  errorEl.classList.add('hidden');
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value;

  try {
    await api.login(username, password);
    window.location.href = '/dashboard';
  } catch (err) {
    errorEl.textContent = err.message;
    errorEl.classList.remove('hidden');
  }
});
