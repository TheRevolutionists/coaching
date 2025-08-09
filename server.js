import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcrypt';
import { db, get, all, run } from './db.js';
import { signUser, authRequired, adminOnly } from './auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());
app.use(cookieParser());

// Static frontend
app.use(express.static(path.join(__dirname, 'public')));

// Auth
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Missing credentials' });
  const user = get(`SELECT * FROM users WHERE username = ?`, [username.toLowerCase()]);
  if (!user) return res.status(401).json({ error: 'Invalid username or password' });
  const ok = bcrypt.compareSync(password, user.password_hash);
  if (!ok) return res.status(401).json({ error: 'Invalid username or password' });
  const token = signUser(user, process.env.JWT_SECRET);
  res.cookie('token', token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
  res.json({ id: user.id, username: user.username, display_name: user.display_name, role: user.role });
});

app.post('/api/auth/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ ok: true });
});

app.get('/api/me', authRequired, (req, res) => {
  const me = get(`SELECT id, username, display_name, role FROM users WHERE id = ?`, [req.user.id]);
  res.json(me);
});

// Coaching data
app.get('/api/coaching', authRequired, (req, res) => {
  const profile = get(`SELECT * FROM coaching_profiles WHERE user_id = ?`, [req.user.id]);
  const sessions = all(`SELECT * FROM sessions WHERE user_id = ? ORDER BY start_utc DESC`, [req.user.id]);
  const progress = all(`SELECT * FROM progress_logs WHERE user_id = ? ORDER BY created_at DESC`, [req.user.id]);
  res.json({ profile, sessions, progress });
});

app.post('/api/progress', authRequired, (req, res) => {
  const { category, metric, value, note } = req.body;
  run(`INSERT INTO progress_logs (user_id, category, metric, value, note) VALUES (?,?,?,?,?)`,
      [req.user.id, category, metric, value, note]);
  res.json({ ok: true });
});

// Admin endpoints
app.get('/api/admin/users', authRequired, adminOnly, (req, res) => {
  const users = all(`SELECT id, username, display_name, role, created_at FROM users ORDER BY created_at DESC`);
  res.json(users);
});

app.post('/api/admin/session', authRequired, adminOnly, (req, res) => {
  const { user_id, coach, start_utc, duration_min, topic, summary } = req.body;
  run(`INSERT INTO sessions (user_id, coach, start_utc, duration_min, topic, summary) VALUES (?,?,?,?,?,?)`,
      [user_id, coach, start_utc, duration_min, topic, summary]);
  res.json({ ok: true });
});

// Fallback to SPA-like routing for protected pages
app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server listening on :${port}`));
