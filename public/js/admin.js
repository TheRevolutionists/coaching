import { api } from './api.js';

const usersEl = document.getElementById('users');
const sessionForm = document.getElementById('sessionForm');
const sessionMsg = document.getElementById('sessionMsg');

async function loadUsers() {
  try {
    const users = await api.adminUsers();
    usersEl.innerHTML = `
      <table class="w-full text-left text-xs">
        <thead class="text-zinc-400">
          <tr><th class="py-1">ID</th><th>Username</th><th>Name</th><th>Role</th><th>Created</th></tr>
        </thead>
        <tbody>
          ${users.map(u => `<tr class="border-t border-zinc-800"><td class="py-1">${u.id}</td><td>${u.username}</td><td>${u.display_name}</td><td>${u.role}</td><td>${new Date(u.created_at).toLocaleString()}</td></tr>`).join('')}
        </tbody>
      </table>
    `;
  } catch {
    usersEl.textContent = 'Admin only. (Create an admin user in seed.js if needed)';
  }
}

sessionForm?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const payload = Object.fromEntries(new FormData(sessionForm).entries());
  payload.duration_min = Number(payload.duration_min);
  try {
    await api.adminCreateSession(payload);
    sessionMsg.textContent = 'Session created.';
    sessionForm.reset();
  } catch (err) {
    sessionMsg.textContent = err.message;
  }
});

loadUsers();
