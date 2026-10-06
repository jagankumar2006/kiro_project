# Technical Design Document

## Overview

A student to-do list web application with a Node.js/Express REST API backend and a vanilla HTML/CSS/JS frontend. Data is persisted in a SQLite database. Authentication uses JWT tokens stored in localStorage.

---

## Architecture

```
┌─────────────────────────────┐
│        Browser (UI)         │
│  HTML + CSS + Vanilla JS    │
│  Fetches API via fetch()    │
└────────────┬────────────────┘
             │ HTTP (REST)
             ▼
┌─────────────────────────────┐
│    Node.js / Express API    │
│  Routes → Controllers →     │
│  Services → SQLite (better- │
│  sqlite3)                   │
└─────────────────────────────┘
```

**Tech Stack**
- Backend: Node.js, Express 4, better-sqlite3
- Auth: bcryptjs (password hashing), jsonwebtoken (JWT)
- Frontend: HTML5, CSS3, vanilla JavaScript (ES6+)
- Database: SQLite (file: `data/tasks.db`)

---

## Project Structure

```
student-todo/
├── backend/
│   ├── server.js            # Express app entry point
│   ├── db.js                # SQLite connection & schema init
│   ├── middleware/
│   │   └── auth.js          # JWT verification middleware
│   ├── routes/
│   │   ├── auth.js          # POST /api/auth/register, /login, /logout
│   │   └── tasks.js         # CRUD + toggle + filter endpoints
│   └── package.json
├── frontend/
│   ├── index.html           # Login / Register page
│   ├── app.html             # Main to-do list page
│   ├── css/
│   │   └── styles.css
│   └── js/
│       ├── api.js           # Fetch wrapper, token management
│       ├── auth.js          # Login/register form logic
│       └── app.js           # Task list rendering and interactions
└── data/
    └── tasks.db             # SQLite database (auto-created)
```

---

## Database Schema

### users
| Column      | Type    | Constraints                  |
|-------------|---------|------------------------------|
| id          | INTEGER | PRIMARY KEY AUTOINCREMENT    |
| username    | TEXT    | UNIQUE NOT NULL              |
| password    | TEXT    | NOT NULL (bcrypt hash)       |
| created_at  | TEXT    | NOT NULL (ISO 8601)          |

### sessions
| Column      | Type    | Constraints                  |
|-------------|---------|------------------------------|
| id          | INTEGER | PRIMARY KEY AUTOINCREMENT    |
| user_id     | INTEGER | NOT NULL, FK → users(id)     |
| token       | TEXT    | UNIQUE NOT NULL              |
| last_active | TEXT    | NOT NULL (ISO 8601)          |
| created_at  | TEXT    | NOT NULL (ISO 8601)          |

### tasks
| Column      | Type    | Constraints                         |
|-------------|---------|-------------------------------------|
| id          | INTEGER | PRIMARY KEY AUTOINCREMENT           |
| user_id     | INTEGER | NOT NULL, FK → users(id)            |
| title       | TEXT    | NOT NULL (max 200 chars)            |
| description | TEXT    | (max 2000 chars)                    |
| due_date    | TEXT    | ISO 8601 date string, nullable      |
| category    | TEXT    | nullable                            |
| completed   | INTEGER | NOT NULL DEFAULT 0 (0=false,1=true) |
| created_at  | TEXT    | NOT NULL (ISO 8601)                 |
| updated_at  | TEXT    | NOT NULL (ISO 8601)                 |

---

## API Endpoints

### Auth

| Method | Path                  | Description              | Auth |
|--------|-----------------------|--------------------------|------|
| POST   | /api/auth/register    | Create new account       | No   |
| POST   | /api/auth/login       | Login, returns JWT token | No   |
| POST   | /api/auth/logout      | Invalidate session token | Yes  |

**Register/Login request body:**
```json
{ "username": "string", "password": "string" }
```

**Login success response (200):**
```json
{ "token": "jwt-string", "username": "string" }
```

### Tasks

All task routes require `Authorization: Bearer <token>` header.

| Method | Path                      | Description                        |
|--------|---------------------------|------------------------------------|
| GET    | /api/tasks                | List tasks (supports query params) |
| POST   | /api/tasks                | Create a task                      |
| PATCH  | /api/tasks/:id            | Partial update a task              |
| DELETE | /api/tasks/:id            | Delete a task                      |
| PATCH  | /api/tasks/:id/toggle     | Toggle completion status           |

**GET /api/tasks query params:**
- `category` — filter by category string
- `status` — `complete` | `incomplete`
- `q` — search string (1–200 chars, case-insensitive)

**Task object shape:**
```json
{
  "id": 1,
  "title": "Read chapter 3",
  "description": "Pages 45-70",
  "due_date": "2024-10-15",
  "category": "Math",
  "completed": false,
  "created_at": "2024-10-01T10:00:00Z",
  "updated_at": "2024-10-01T10:00:00Z"
}
```

---

## Authentication Flow

1. Student registers or logs in → API returns a JWT token
2. Frontend stores token in `localStorage`
3. Every API request includes `Authorization: Bearer <token>`
4. JWT middleware verifies token signature and checks sessions table (invalidation support)
5. Sessions expire after 24 hours of inactivity (checked on each request)
6. Logout deletes the session row, making the token invalid

---

## Frontend Pages

### index.html (Login/Register)
- Tab switcher between Login and Register forms
- On success: stores token + username in localStorage, redirects to `app.html`
- On error: displays inline error message

### app.html (Main App)
- Header: app title, username, logout button
- Sidebar/toolbar: search input, category filter dropdown, status filter (All/Incomplete/Complete)
- Task list: rendered dynamically from API data
- Add Task button → opens an inline form or modal
- Each task card shows: title, category badge, due date, completion checkbox
  - Completed tasks have strikethrough styling
  - Edit (pencil) and Delete (trash) icon buttons
  - Click checkbox → toggle completion
- Edit opens the same form pre-filled with task data
- Delete shows a browser `confirm()` dialog before calling the API

---

## Error Handling

- All API errors return JSON: `{ "error": "message" }`
- Frontend displays inline error messages near the relevant UI element
- Network failures show a banner error message
- 401 responses redirect to `index.html`

---

## Validation Rules

| Field       | Rule                               |
|-------------|------------------------------------|
| username    | 3–50 characters, required          |
| password    | 8–128 characters, required         |
| title       | 1–200 characters, required         |
| description | max 2000 characters, optional      |
| due_date    | ISO 8601 date (YYYY-MM-DD), optional|
| category    | max 100 characters, optional       |
| search (q)  | 1–200 non-whitespace chars         |
