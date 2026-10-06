'use strict';

// Load environment variables before anything else
require('dotenv').config();

const express = require('express');
const cors = require('cors');

// Import db to trigger schema initialisation on startup (Req 8.1)
require('./db');

const authRouter = require('./routes/auth');

const app = express();

// ---------------------------------------------------------------------------
// Global middleware
// ---------------------------------------------------------------------------
app.use(cors());
app.use(express.json());

// ---------------------------------------------------------------------------
// Routes
// ---------------------------------------------------------------------------
app.use('/api/auth', authRouter);

// tasks router is mounted only when the file exists (it will be added soon)
try {
  const tasksRouter = require('./routes/tasks');
  app.use('/api/tasks', tasksRouter);
} catch (err) {
  if (err.code !== 'MODULE_NOT_FOUND') throw err;
  // tasks.js doesn't exist yet — that's fine during incremental development
}

// ---------------------------------------------------------------------------
// Global error handler (Req 8.3)
// Returns { "error": "message" } for any unhandled errors
// ---------------------------------------------------------------------------
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err);
  const status = err.status || err.statusCode || 500;
  const message = err.message || 'Internal server error';
  return res.status(status).json({ error: message });
});

// ---------------------------------------------------------------------------
// Start server
// ---------------------------------------------------------------------------
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

module.exports = app; // exported for testing
