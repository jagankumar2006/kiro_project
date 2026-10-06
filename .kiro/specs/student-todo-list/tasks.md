# Implementation Plan: Student To-Do List

## Overview

Implement a student to-do list application with a Node.js/Express backend (better-sqlite3, bcryptjs, jsonwebtoken) and a vanilla HTML/CSS/JS frontend. Work proceeds from project scaffolding through the database layer, auth and task API routes, JWT middleware, and finally the two frontend pages.

---

## Tasks

- [x] 1. Scaffold project structure and install dependencies
  - Create `student-todo/backend/` and `student-todo/frontend/` directory trees matching the design layout
  - Create `backend/package.json` with dependencies: `express`, `better-sqlite3`, `bcryptjs`, `jsonwebtoken`, `cors`, `dotenv`; devDependencies: `jest`, `supertest`
  - Add `.gitignore` excluding `node_modules/`, `data/`, `.env`
  - Create a `.env` file with `JWT_SECRET` and `PORT` placeholders
  - _Requirements: 8.1_

- [x] 2. Implement the database layer
  - [x] 2.1 Create `backend/db.js` — open/create `data/tasks.db` and initialise schema
    - Write `CREATE TABLE IF NOT EXISTS` statements for `users`, `sessions`, and `tasks` exactly as specified in the design schema
    - Export the prepared `db` singleton for use by routes and middleware
    - _Requirements: 8.1, 8.2_

  - [ ]* 2.2 Write unit tests for database initialisation
    - Test that all three tables are created when the module is first imported
    - Test that re-importing the module does not throw or duplicate tables
    - _Requirements: 8.2_

- [x] 3. Implement JWT authentication middleware
  - [x] 3.1 Create `backend/middleware/auth.js`
    - Verify the `Authorization: Bearer <token>` header using `jsonwebtoken`
    - Look up the token in the `sessions` table and reject if absent (covers logout invalidation)
    - Reject sessions inactive for more than 24 hours and delete the stale row
    - On success, update `sessions.last_active` and attach `req.userId` for downstream handlers
    - _Requirements: 7.4, 7.5, 7.6, 7.7_

  - [ ]* 3.2 Write unit tests for auth middleware
    - Test: missing `Authorization` header → 401
    - Test: invalid/tampered JWT → 401
    - Test: valid JWT but token not in sessions table → 401
    - Test: valid JWT with session inactive > 24 h → 401 and row deleted
    - Test: valid active token → calls `next()` and sets `req.userId`
    - _Requirements: 7.5, 7.6, 7.7_

- [x] 4. Implement auth routes
  - [x] 4.1 Create `backend/routes/auth.js` — `POST /api/auth/register`
    - Validate username (3–50 chars) and password (8–128 chars); return 400 on failure
    - Hash password with `bcryptjs`; insert into `users`; return 409 if username taken
    - _Requirements: 7.1, 7.3_

  - [x] 4.2 Create `POST /api/auth/login` in `backend/routes/auth.js`
    - Validate credentials; compare hash with `bcryptjs`; return 401 (no field hint) on failure
    - Sign a JWT with `jsonwebtoken`; insert a row into `sessions`; return `{ token, username }`
    - _Requirements: 7.1, 7.2_

  - [x] 4.3 Create `POST /api/auth/logout` in `backend/routes/auth.js` (requires auth middleware)
    - Delete the matching session row from `sessions`
    - Return 204 No Content
    - _Requirements: 7.6_

  - [ ]* 4.4 Write unit tests for auth routes
    - Test register: happy path, duplicate username, short password, short username
    - Test login: valid credentials, wrong password, unknown username
    - Test logout: valid token removes session; subsequent request with same token → 401
    - _Requirements: 7.1, 7.2, 7.3, 7.6_

- [x] 5. Checkpoint — ensure auth layer tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 6. Implement task routes
  - [x] 6.1 Create `backend/routes/tasks.js` — `GET /api/tasks`
    - Apply auth middleware
    - Accept optional query params: `category`, `status` (`complete`/`incomplete`), `q` (1–200 non-whitespace chars)
    - Build a parameterised SQL query combining filters with AND logic; treat blank/whitespace `q` as no filter
    - Return tasks ordered: due date ASC (nulls last), incomplete before complete, then creation date ASC
    - _Requirements: 2.1, 6.1, 6.2, 6.3, 6.4, 6.7_

  - [x] 6.2 Create `POST /api/tasks` in `backend/routes/tasks.js`
    - Validate title (1–200 chars required), description (max 2000 chars), due_date (ISO 8601 or absent), category (max 100 chars)
    - Insert task with `completed = 0` and both timestamps set to now; return 201 with created task
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 8.1_

  - [x] 6.3 Create `PATCH /api/tasks/:id` in `backend/routes/tasks.js`
    - Validate only the supplied fields using the same rules as creation
    - Return 404 if task not found, 403 if owned by another user; return full updated task
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6_

  - [x] 6.4 Create `DELETE /api/tasks/:id` in `backend/routes/tasks.js`
    - Return 404 if not found, 403 if not owner, 204 on success
    - _Requirements: 4.1, 4.2, 4.3_

  - [x] 6.5 Create `PATCH /api/tasks/:id/toggle` in `backend/routes/tasks.js`
    - Flip `completed` between 0 and 1; return 404/403 appropriately; return updated task
    - _Requirements: 5.1, 5.2, 5.3, 5.4_

  - [ ]* 6.6 Write unit tests for task routes
    - Test `GET /api/tasks`: no filters, category filter, status filter, search query, blank query treated as no filter, empty result set
    - Test `POST /api/tasks`: happy path, missing title, title too long, description too long, bad due_date format
    - Test `PATCH /api/tasks/:id`: partial update, 404, 403, empty title, bad due_date
    - Test `DELETE /api/tasks/:id`: happy path, 404, 403
    - Test `PATCH /api/tasks/:id/toggle`: incomplete→complete, complete→incomplete, 404, 403
    - _Requirements: 1.1–1.8, 2.1, 3.1–3.6, 4.1–4.3, 5.1–5.4, 6.1–6.7_

- [x] 7. Wire backend together in `backend/server.js`
  - Import `db.js` to trigger schema initialisation on startup
  - Mount `routes/auth.js` at `/api/auth` and `routes/tasks.js` at `/api/tasks`
  - Add `express.json()`, `cors`, and a global error handler that returns `{ "error": "message" }`
  - Start the server on the port from `.env`
  - _Requirements: 8.1, 8.3_

- [x] 8. Checkpoint — ensure full backend test suite passes
  - Ensure all tests pass, ask the user if questions arise.

- [x] 9. Build the frontend shared utilities
  - [x] 9.1 Create `frontend/css/styles.css`
    - Base styles: reset, typography, colour variables
    - Task card styles: title truncation at 100 chars with ellipsis, category badge, due date, completion checkbox
    - Strikethrough style for completed tasks
    - Loading indicator and error banner styles
    - Form/modal styles for add and edit task
    - _Requirements: 2.7, 5.5_

  - [x] 9.2 Create `frontend/js/api.js`
    - Export `getToken()` / `setToken()` / `clearToken()` helpers backed by `localStorage`
    - Export an `apiFetch(path, options)` wrapper that attaches `Authorization: Bearer <token>`, parses JSON responses, and throws on non-2xx with the error body message
    - On 401 response, clear token and redirect to `index.html`
    - _Requirements: 7.4, 7.5_

- [x] 10. Build the login/register page
  - [x] 10.1 Create `frontend/index.html`
    - Tab switcher with Login and Register panels
    - Login form: username + password fields, submit button
    - Register form: username + password fields, submit button
    - Inline error message element under each form
    - Redirect to `app.html` if token already present in `localStorage`
    - _Requirements: 7.1, 7.2, 7.3_

  - [x] 10.2 Create `frontend/js/auth.js`
    - Wire login form submit → `POST /api/auth/login`; on success store token + username, redirect to `app.html`
    - Wire register form submit → `POST /api/auth/register`; on success redirect to `app.html`
    - Display inline error messages on 401/409/400 responses
    - _Requirements: 7.1, 7.2, 7.3_

- [x] 11. Build the main app page
  - [x] 11.1 Create `frontend/app.html`
    - Header: app title, logged-in username, logout button
    - Toolbar: search input, category filter `<select>`, status filter buttons (All / Incomplete / Complete)
    - Task list container with a loading indicator placeholder
    - Add Task button that shows an inline form or modal
    - Task form (shared add/edit): title input, description textarea, due date input, category input, Save and Cancel buttons
    - _Requirements: 2.2, 2.3, 2.4, 2.6, 6.5_

  - [x] 11.2 Create `frontend/js/app.js` — task list rendering
    - On load: read token (redirect to `index.html` if absent), call `GET /api/tasks`, render task cards
    - Show loading indicator while fetching; display error banner on failure (including 30 s timeout via `AbortController`)
    - Show "no tasks" message when list is empty
    - Render each task card with: title (truncated at 100 chars), category badge, due date, completion checkbox, edit button, delete button; apply strikethrough class to completed tasks
    - _Requirements: 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 5.5_

  - [x] 11.3 Create task interaction handlers in `frontend/js/app.js`
    - Add Task: submit form → `POST /api/tasks` → prepend new card without reload
    - Edit Task: open form pre-filled → `PATCH /api/tasks/:id` → update card in place without reload
    - Delete Task: show `confirm()` dialog → on confirm `DELETE /api/tasks/:id` → remove card without reload; on cancel dismiss
    - Toggle completion: checkbox change → `PATCH /api/tasks/:id/toggle` → update visual state without reload
    - _Requirements: 1.9, 3.7, 4.4, 4.5, 5.5_

  - [x] 11.4 Implement filter and search interactions in `frontend/js/app.js`
    - Search input change (debounced) and filter button/dropdown changes → re-fetch `GET /api/tasks` with active params
    - Display "no tasks found" message when the filtered result is empty
    - _Requirements: 6.5, 6.6_

  - [x] 11.5 Implement logout handler in `frontend/js/app.js`
    - Logout button click → `POST /api/auth/logout` → clear localStorage token → redirect to `index.html`
    - _Requirements: 7.6_

- [x] 12. Final checkpoint — verify end-to-end wiring
  - Ensure all tests pass, ask the user if questions arise.

---

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP
- Each task references specific requirements for traceability
- Checkpoints (tasks 5, 8, 12) provide natural validation gates
- Unit tests use Jest + Supertest against an in-memory or temp-file SQLite database
- The frontend requires no build step — open `frontend/index.html` directly or serve statically from Express

---

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["2.1"] },
    { "id": 1, "tasks": ["2.2", "3.1"] },
    { "id": 2, "tasks": ["3.2", "4.1"] },
    { "id": 3, "tasks": ["4.2"] },
    { "id": 4, "tasks": ["4.3"] },
    { "id": 5, "tasks": ["4.4", "6.1"] },
    { "id": 6, "tasks": ["6.2"] },
    { "id": 7, "tasks": ["6.3"] },
    { "id": 8, "tasks": ["6.4"] },
    { "id": 9, "tasks": ["6.5"] },
    { "id": 10, "tasks": ["6.6", "9.1"] },
    { "id": 11, "tasks": ["9.2"] },
    { "id": 12, "tasks": ["10.1"] },
    { "id": 13, "tasks": ["10.2"] },
    { "id": 14, "tasks": ["11.1"] },
    { "id": 15, "tasks": ["11.2"] },
    { "id": 16, "tasks": ["11.3"] },
    { "id": 17, "tasks": ["11.4", "11.5"] }
  ]
}
```
