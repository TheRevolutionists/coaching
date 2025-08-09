export const API_BASE = '';

async function req(path, opts = {}) {
  const res = await fetch(API_BASE + path, {
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    ...opts,
  });
  if (!res.ok) throw new Error((await res.json()).error || 'Request failed');
  return res.json();
}

export const api = {
  login: (username, password) => req('/api/auth/login', { method: 'POST', body: JSON.stringify({ username, password }) }),
  logout: () => req('/api/auth/logout', { method: 'POST' }),
  me: () => req('/api/me'),
  coaching: () => req('/api/coaching'),
  logProgress: (payload) => req('/api/progress', { method: 'POST', body: JSON.stringify(payload) }),
  adminUsers: () => req('/api/admin/users'),
  adminCreateSession: (payload) => req('/api/admin/session', { method: 'POST', body: JSON.stringify(payload) }),
};
