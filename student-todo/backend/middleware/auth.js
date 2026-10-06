'use strict';

const jwt = require('jsonwebtoken');
const db = require('../db');

const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;

/**
 * JWT authentication middleware.
 *
 * 1. Verifies the `Authorization: Bearer <token>` header (Req 7.5).
 * 2. Looks up the token in the sessions table — rejects if absent (Req 7.6).
 * 3. Rejects and deletes sessions inactive for > 24 hours (Req 7.7).
 * 4. Updates `sessions.last_active` and attaches `req.userId` (Req 7.4).
 */
function auth(req, res, next) {
  // 1. Extract the Bearer token from the Authorization header
  const authHeader = req.headers['authorization'] || '';
  const match = authHeader.match(/^Bearer\s+(.+)$/i);

  if (!match) {
    return res.status(401).json({ error: 'Missing or malformed Authorization header' });
  }

  const token = match[1];

  // 2. Verify JWT signature and expiry (jsonwebtoken will throw on failure)
  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }

  // 3. Check that the token exists in the sessions table (covers logout invalidation)
  const session = db
    .prepare('SELECT id, user_id, last_active FROM sessions WHERE token = ?')
    .get(token);

  if (!session) {
    return res.status(401).json({ error: 'Session not found' });
  }

  // 4. Reject sessions inactive for more than 24 hours and clean up the stale row
  const lastActive = new Date(session.last_active).getTime();
  const now = Date.now();

  if (now - lastActive > TWENTY_FOUR_HOURS_MS) {
    db.prepare('DELETE FROM sessions WHERE id = ?').run(session.id);
    return res.status(401).json({ error: 'Session expired due to inactivity' });
  }

  // 5. Refresh last_active so the 24-hour window slides forward on activity
  const nowIso = new Date().toISOString();
  db.prepare('UPDATE sessions SET last_active = ? WHERE id = ?').run(nowIso, session.id);

  // 6. Attach userId to the request for downstream route handlers
  req.userId = session.user_id;

  next();
}

module.exports = auth;
