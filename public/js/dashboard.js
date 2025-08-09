import { api } from './api.js';

const displayName = document.getElementById('displayName');
const profileEl = document.getElementById('profile');
const sessionsEl = document.getElementById('sessions');
const progressEl = document.getElementById('progress');
const logoutBtn = document.getElementById('logoutBtn');
const logForm = document.getElementById('logForm');
const logMsg = document.getElementById('logMsg');

async function load() {
  try {
    const me = await api.me();
    displayName.textContent = me.display_name;

    const data = await api.coaching();
    const { profile, sessions, progress } = data;

    profileEl.innerHTML = `
      <div class="grid md:grid-cols-3 gap-3">
        <div class="bg-zinc-800/60 p-3 rounded-xl">
          <div class="text-xs text-zinc-400">Rank</div>
          <div class="text-lg font-semibold">${profile?.rank || '—'}</div>
        </div>
        <div class="bg-zinc-800/60 p-3 rounded-xl">
          <div class="text-xs text-zinc-400">Focus Areas</div>
          <div class="text-sm">${(JSON.parse(profile?.focus_areas || '[]')).join(', ') || '—'}</div>
        </div>
        <div class="bg-zinc-800/60 p-3 rounded-xl">
          <div class="text-xs text-zinc-400">Availability</div>
          <div class="text-sm">${profile?.availability || '—'}</div>
        </div>
      </div>
      <div class="mt-3 text-sm text-zinc-300">${profile?.notes || ''}</div>
    `;

    sessionsEl.innerHTML = sessions.map(s => `
      <div class="p-3 rounded-xl bg-zinc-800/60">
        <div class="text-sm font-medium">${s.topic || 'Session'}</div>
        <div class="text-xs text-zinc-400">Coach: ${s.coach} • ${new Date(s.start_utc).toLocaleString()}</div>
        <div class="text-xs text-zinc-300 mt-1">${s.summary || ''}</div>
      </div>
    `).join('');

    progressEl.innerHTML = progress.map(p => `
      <div class="p-3 rounded-xl bg-zinc-800/60">
        <div class="text-sm font-medium">${p.category} — ${p.metric}</div>
        <div class="text-xs text-zinc-400">${new Date(p.created_at).toLocaleString()}${p.value != null ? ` • ${p.value}` : ''}</div>
        <div class="text-xs text-zinc-300 mt-1">${p.note || ''}</div>
      </div>
    `).join('');

  } catch (e) {
    window.location.href = '/';
  }
}

logoutBtn?.addEventListener('click', async () => {
  await api.logout();
  window.location.href = '/';
});

logForm?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const form = new FormData(logForm);
  const payload = Object.fromEntries(form.entries());
  if (payload.value) payload.value = Number(payload.value);
  try {
    await api.logProgress(payload);
    logMsg.textContent = 'Saved! Refreshing...';
    await load();
    logForm.reset();
    logMsg.textContent = 'Saved.';
  } catch (err) {
    logMsg.textContent = err.message;
  }
});

load();
