'use strict';

const express = require('express');
const db = require('../db');
const auth = require('../middleware/auth');

const router = express.Router();

// All task routes require authentication
router.use(auth);

// ---------------------------------------------------------------------------
// Validation helpers
// ---------------------------------------------------------------------------

function validateTitle(title) {
  if (title === undefined) return null; // optional on PATCH
  if (typeof title !== 'string' || title.trim().length === 0) {
    return 'Title must not be empty';
  }
  if (title.length > 200) {
    return 'Title must not exceed 200 characters';
  }
  return null;
}

function validateDescription(description) {
  if (description === undefined || description === null) return null;
  if (typeof description !== 'string') return 'Description must be a string';
  if (description.length > 2000) return 'Description must not exceed 2000 characters';
  return null;
}

function validateDueDate(due_date) {
  if (due_date === undefined || due_date === null || due_date === '') return null;
  // Accept ISO 8601 date: YYYY-MM-DD
  if (!/^\d{4}-\d{2}-\d{2}$/.test(due_date)) {
    return 'due_date must be in ISO 8601 format (YYYY-MM-DD)';
  }
  const d = new Date(due_date);
  if (isNaN(d.getTime())) return 'due_date is not a valid date';
  return null;
}

function validateCategory(category) {
  if (category === undefined || category === null) return null;
  if (typeof category !== 'string') return 'Category must be a string';
  if (category.length > 100) return 'Category must not exceed 100 characters';
  return null;
}

// Row → JS object helper (converts completed 0/1 to boolean)
function toTask(row) {
  return {
    id: row.id,
    title: row.title,
    description: row.description || null,
    due_date: row.due_date || null,
    category: row.category || null,
    completed: row.completed === 1,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

// ---------------------------------------------------------------------------
// GET /api/tasks  (Req 2.1, 6.1–6.7)
// ---------------------------------------------------------------------------
router.get('/', (req, res, next) => {
  try {
    const { category, status, q } = req.query;

    const conditions = ['user_id = ?'];
    const params = [req.userId];

    // Filter by category
    if (category !== undefined && category !== '') {
      conditions.push('category = ?');
      params.push(category);
    }

    // Filter by completion status
    if (status === 'complete') {
      conditions.push('completed = 1');
    } else if (status === 'incomplete') {
      conditions.push('completed = 0');
    }

    // Search query — ignore blank/whitespace-only values (Req 6.4)
    const trimmedQ = typeof q === 'string' ? q.trim() : '';
    if (trimmedQ.length > 0) {
      conditions.push('(title LIKE ? OR description LIKE ?)');
      params.push(`%${trimmedQ}%`, `%${trimmedQ}%`);
    }

    const where = conditions.join(' AND ');

    // Order: due_date ASC nulls last, incomplete before complete, created_at ASC (Req 2.1)
    const sql = `
      SELECT * FROM tasks
      WHERE ${where}
      ORDER BY
        CASE WHEN due_date IS NULL OR due_date = '' THEN 1 ELSE 0 END ASC,
        due_date ASC,
        completed ASC,
        created_at ASC
    `;

    const rows = db.prepare(sql).all(...params);
    return res.json(rows.map(toTask));
  } catch (err) {
    next(err);
  }
});

// ---------------------------------------------------------------------------
// POST /api/tasks  (Req 1.1–1.8, 8.1)
// ---------------------------------------------------------------------------
router.post('/', (req, res, next) => {
  try {
    const { title, description, due_date, category } = req.body || {};

    // title is required for creation
    if (typeof title !== 'string' || title.trim().length === 0) {
      return res.status(400).json({ error: 'Title is required' });
    }
    const titleErr = validateTitle(title);
    if (titleErr) return res.status(400).json({ error: titleErr });

    const descErr = validateDescription(description);
    if (descErr) return res.status(400).json({ error: descErr });

    const dateErr = validateDueDate(due_date);
    if (dateErr) return res.status(400).json({ error: dateErr });

    const catErr = validateCategory(category);
    if (catErr) return res.status(400).json({ error: catErr });

    const now = new Date().toISOString();
    const result = db.prepare(`
      INSERT INTO tasks (user_id, title, description, due_date, category, completed, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, 0, ?, ?)
    `).run(
      req.userId,
      title.trim(),
      description || null,
      due_date || null,
      category || null,
      now,
      now
    );

    const created = db.prepare('SELECT * FROM tasks WHERE id = ?').get(result.lastInsertRowid);
    return res.status(201).json(toTask(created));
  } catch (err) {
    next(err);
  }
});

// ---------------------------------------------------------------------------
// PATCH /api/tasks/:id  (Req 3.1–3.6)
// ---------------------------------------------------------------------------
router.patch('/:id', (req, res, next) => {
  try {
    const taskId = parseInt(req.params.id, 10);
    if (isNaN(taskId)) return res.status(404).json({ error: 'Task not found' });

    const existing = db.prepare('SELECT * FROM tasks WHERE id = ?').get(taskId);
    if (!existing) return res.status(404).json({ error: 'Task not found' });
    if (existing.user_id !== req.userId) return res.status(403).json({ error: 'You do not have permission to edit this task' });

    const body = req.body || {};
    const updates = {};

    if ('title' in body) {
      const err = validateTitle(body.title);
      if (err) return res.status(400).json({ error: err });
      if (typeof body.title !== 'string' || body.title.trim().length === 0) {
        return res.status(400).json({ error: 'Title must not be empty' });
      }
      updates.title = body.title.trim();
    }

    if ('description' in body) {
      const err = validateDescription(body.description);
      if (err) return res.status(400).json({ error: err });
      updates.description = body.description || null;
    }

    if ('due_date' in body) {
      const err = validateDueDate(body.due_date);
      if (err) return res.status(400).json({ error: err });
      updates.due_date = body.due_date || null;
    }

    if ('category' in body) {
      const err = validateCategory(body.category);
      if (err) return res.status(400).json({ error: err });
      updates.category = body.category || null;
    }

    if (Object.keys(updates).length === 0) {
      return res.json(toTask(existing));
    }

    updates.updated_at = new Date().toISOString();
    const setClauses = Object.keys(updates).map(k => `${k} = ?`).join(', ');
    const values = [...Object.values(updates), taskId];
    db.prepare(`UPDATE tasks SET ${setClauses} WHERE id = ?`).run(...values);

    const updated = db.prepare('SELECT * FROM tasks WHERE id = ?').get(taskId);
    return res.json(toTask(updated));
  } catch (err) {
    next(err);
  }
});

// ---------------------------------------------------------------------------
// DELETE /api/tasks/:id  (Req 4.1–4.3)
// ---------------------------------------------------------------------------
router.delete('/:id', (req, res, next) => {
  try {
    const taskId = parseInt(req.params.id, 10);
    if (isNaN(taskId)) return res.status(404).json({ error: 'Task not found' });

    const existing = db.prepare('SELECT * FROM tasks WHERE id = ?').get(taskId);
    if (!existing) return res.status(404).json({ error: 'Task not found' });
    if (existing.user_id !== req.userId) return res.status(403).json({ error: 'You do not have permission to delete this task' });

    db.prepare('DELETE FROM tasks WHERE id = ?').run(taskId);
    return res.status(204).send();
  } catch (err) {
    next(err);
  }
});

// ---------------------------------------------------------------------------
// PATCH /api/tasks/:id/toggle  (Req 5.1–5.4)
// ---------------------------------------------------------------------------
router.patch('/:id/toggle', (req, res, next) => {
  try {
    const taskId = parseInt(req.params.id, 10);
    if (isNaN(taskId)) return res.status(404).json({ error: 'Task not found' });

    const existing = db.prepare('SELECT * FROM tasks WHERE id = ?').get(taskId);
    if (!existing) return res.status(404).json({ error: 'Task not found' });
    if (existing.user_id !== req.userId) return res.status(403).json({ error: 'You do not have permission to update this task' });

    const newCompleted = existing.completed === 1 ? 0 : 1;
    const now = new Date().toISOString();
    db.prepare('UPDATE tasks SET completed = ?, updated_at = ? WHERE id = ?').run(newCompleted, now, taskId);

    const updated = db.prepare('SELECT * FROM tasks WHERE id = ?').get(taskId);
    return res.json(toTask(updated));
  } catch (err) {
    next(err);
  }
});

module.exports = router;
