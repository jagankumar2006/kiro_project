'use strict';

const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');
const auth = require('../middleware/auth');

const router = express.Router();

// ---------------------------------------------------------------------------
// Validation helpers
// ---------------------------------------------------------------------------

/**
 * Validate username and password fields from the request body.
 * Returns an error message string, or null if valid.
 *
 * Req 7.1 — username 3–50 chars, password 8–128 chars
 */
function validateCredentials(username, password) {
  if (typeof username !== 'string' || username.length < 3 || username.length > 50) {
    return 'Username must be between 3 and 50 characters';
  }
  if (typeof password !== 'string' || password.length < 8 || password.length > 128) {
    return 'Password must be between 8 and 128 characters';
  }
  return null;
}

// ---------------------------------------------------------------------------
// POST /api/auth/register
// Req 7.1, 7.3
// ---------------------------------------------------------------------------
router.post('/register', async (req, res, next) => {
  try {
    const { username, password } = req.body || {};

    const validationError = validateCredentials(username, password);
    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

    // Hash password with bcryptjs (cost factor 10)
    const hash = await bcrypt.hash(password, 10);
    const now = new Date().toISOString();

    let user;
    try {
      user = db
        .prepare(
          'INSERT INTO users (username, password, created_at) VALUES (?, ?, ?) RETURNING id, username, created_at'
        )
        .get(username, hash, now);
    } catch (err) {
      // SQLite UNIQUE constraint on username
      if (err.code === 'SQLITE_CONSTRAINT_UNIQUE' || (err.message && err.message.includes('UNIQUE'))) {
        return res.status(409).json({ error: 'Username is already taken' });
      }
      throw err;
    }

    return res.status(201).json({ id: user.id, username: user.username, created_at: user.created_at });
  } catch (err) {
    next(err);
  }
});

// ---------------------------------------------------------------------------
// POST /api/auth/login
// Req 7.1, 7.2
// ---------------------------------------------------------------------------
router.post('/login', async (req, res, next) => {
  try {
    const { username, password } = req.body || {};

    const validationError = validateCredentials(username, password);
    if (validationError) {
      // Return 401 without revealing which field failed (Req 7.2)
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Look up the user
    const user = db.prepare('SELECT id, username, password FROM users WHERE username = ?').get(username);

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Compare the provided password against the stored hash
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Sign a JWT (no explicit expiry — session expiry is handled via sessions table)
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET);

    const now = new Date().toISOString();
    db.prepare(
      'INSERT INTO sessions (user_id, token, last_active, created_at) VALUES (?, ?, ?, ?)'
    ).run(user.id, token, now, now);

    return res.status(200).json({ token, username: user.username });
  } catch (err) {
    next(err);
  }
});

// ---------------------------------------------------------------------------
// POST /api/auth/logout  (requires valid session)
// Req 7.6
// ---------------------------------------------------------------------------
router.post('/logout', auth, (req, res, next) => {
  try {
    // Extract the token again so we can delete the exact session row
    const authHeader = req.headers['authorization'] || '';
    const match = authHeader.match(/^Bearer\s+(.+)$/i);
    const token = match ? match[1] : null;

    if (token) {
      db.prepare('DELETE FROM sessions WHERE token = ?').run(token);
    }

    return res.status(204).send();
  } catch (err) {
    next(err);
  }
});

module.exports = router;
