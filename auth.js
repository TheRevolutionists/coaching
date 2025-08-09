import jwt from 'jsonwebtoken';

export function signUser(user, secret) {
  return jwt.sign({ id: user.id, username: user.username, role: user.role }, secret, { expiresIn: '7d' });
}

export function authRequired(req, res, next) {
  const token = req.cookies?.token;
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload;
    next();
  } catch (e) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

export function adminOnly(req, res, next) {
  if (req.user?.role === 'admin') return next();
  return res.status(403).json({ error: 'Forbidden' });
}
