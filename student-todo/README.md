# 📚 Student Todo Application

A comprehensive, production-ready full-stack todo application designed for students to manage their academic tasks with features tailored to educational workflows. Built with modern best practices, comprehensive testing, and Kiro development environment integration.

---

## 🎯 Features

### Core Functionality
- **User Authentication**: Secure registration and login with JWT tokens
- **Task Management**: Complete CRUD operations for academic tasks
- **Task Properties**: Title, description, due date, priority, subject, completion status
- **Task Organization**: Filter by completion, priority, subject, and date ranges
- **Search**: Text search across task titles and descriptions
- **Academic Focus**: Subject categorization and priority-based organization
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Accessibility**: ARIA labels and semantic HTML for screen readers

### Security Features
- ✅ Password hashing with bcryptjs (10+ salt rounds)
- ✅ JWT token-based authentication with expiration
- ✅ Input validation and sanitization on all endpoints
- ✅ SQL injection prevention with parameterized queries
- ✅ XSS protection through proper data handling
- ✅ CORS configuration for secure cross-origin requests
- ✅ Rate limiting on authentication endpoints
- ✅ Security headers (Content-Security-Policy, X-Frame-Options, etc.)

---

## 🛠️ Technology Stack

### Backend
| Component | Technology | Version | Purpose |
|-----------|-----------|---------|---------|
| **Runtime** | Node.js | v18+ | Server environment |
| **Framework** | Express.js | 4.19+ | Web application framework |
| **Database** | SQLite | 3+ | Lightweight relational database |
| **Driver** | better-sqlite3 | 13+ | SQLite driver with sync API |
| **Authentication** | JWT | 9+ | Token-based authentication |
| **Password Hash** | bcryptjs | 2.4+ | Secure password hashing |
| **CORS** | cors | 2.8+ | Cross-origin resource sharing |
| **Testing** | Jest | 29+ | Testing framework |
| **API Testing** | Supertest | 7+ | HTTP assertion library |
| **Property Testing** | fast-check | - | Property-based testing (optional) |

### Frontend
| Component | Technology | Purpose |
|-----------|-----------|---------|
| **Markup** | HTML5 | Semantic structure |
| **Styling** | CSS3 | Responsive design |
| **Logic** | Vanilla JavaScript (ES6+) | No framework dependency |
| **Features** | Accessibility (ARIA) | Screen reader support |
| **Patterns** | Modular components | Code organization |

---

## 📂 Comprehensive Project Architecture

### Directory Structure Overview
```
kiro_project/
├── .kiro/                          # Kiro development environment
│   ├── agents/todo-expert.md       # Custom AI specialist agent
│   ├── hooks/                      # Automated development hooks (3 custom)
│   ├── specs/                      # Feature specifications
│   ├── steering/                   # Development guidelines (3 documents)
│   └── MCP-SETUP.md               # Model Context Protocol guide
│
├── student-todo/                   # Main application
│   ├── backend/                    # Express.js API server
│   │   ├── server.js              # Main entry point
│   │   ├── db.js                  # Database & schema
│   │   ├── routes/                # API route handlers
│   │   ├── middleware/            # Custom middleware
│   │   ├── tests/                 # Test suite
│   │   ├── .env                   # Configuration
│   │   ├── package.json           # Dependencies
│   │   └── node_modules/          # Installed packages
│   │
│   ├── frontend/                   # Client application
│   │   ├── index.html             # Auth page
│   │   ├── app.html              # Main UI
│   │   ├── js/                    # JavaScript modules
│   │   └── css/                   # Stylesheets
│   │
│   ├── data/                       # Database files
│   │   └── tasks.db              # SQLite database
│   │
│   └── README.md                   # This file
```

### Detailed Backend Architecture
```
backend/
├── server.js                       # Express server setup
│   ├── Middleware: CORS, JSON parser
│   ├── Routes: /api/auth, /api/tasks
│   ├── Error handler
│   └── Listener on PORT 3000
│
├── db.js                           # Database layer
│   ├── SQLite initialization
│   ├── WAL mode (concurrent reads)
│   ├── Foreign key enforcement
│   └── Auto schema creation
│
├── routes/
│   ├── auth.js                     # Authentication
│   │   ├── POST /api/auth/register (201, 400, 409)
│   │   └── POST /api/auth/login (200, 401)
│   │
│   └── tasks.js                    # Task management
│       ├── GET /api/tasks (200, 401)
│       ├── POST /api/tasks (201, 400, 401)
│       ├── GET /api/tasks/:id (200, 403, 404, 401)
│       ├── PUT /api/tasks/:id (200, 400, 403, 404, 401)
│       ├── DELETE /api/tasks/:id (204, 403, 404, 401)
│       └── PATCH /api/tasks/:id/complete (200, 403, 404, 401)
│
├── middleware/
│   └── auth.js                     # JWT verification
│       ├── Extract token from header
│       ├── Verify signature
│       ├── Check expiration
│       └── Attach user to request
│
├── tests/
│   ├── integration.test.js         # API integration tests
│   │   ├── Authentication flows
│   │   ├── Task CRUD operations
│   │   ├── Error handling (400, 401, 404, 409, 500)
│   │   └── Security tests (XSS, SQL injection)
│   │
│   └── property-tests.js           # Property-based tests
│       ├── Validation properties
│       ├── Database consistency
│       └── Security properties
│
├── package.json                    # Dependencies
├── .env                            # Environment config
└── node_modules/                   # Installed packages
```

### Detailed Frontend Architecture
```
frontend/
├── index.html                      # Login/Register page
│   ├── Responsive layout
│   ├── Tab interface
│   ├── Form validation (HTML5)
│   ├── ARIA accessibility
│   └── Loads auth.js
│
├── app.html                        # Main application
│   ├── Task list container
│   ├── Add task form
│   ├── Filter/sort controls
│   ├── Task detail modal
│   └── Loads app.js
│
├── js/
│   ├── api.js                      # HTTP client
│   │   ├── register(username, password)
│   │   ├── login(username, password)
│   │   ├── getTasks(filters)
│   │   ├── createTask(data)
│   │   ├── updateTask(id, data)
│   │   ├── deleteTask(id)
│   │   └── toggleComplete(id)
│   │
│   ├── auth.js                     # Auth UI logic
│   │   ├── Tab switching
│   │   ├── Form handlers
│   │   ├── Token management
│   │   └── Error display
│   │
│   └── app.js                      # App UI logic
│       ├── Task rendering
│       ├── CRUD operations
│       ├── Filtering/searching
│       ├── Event handlers
│       └── State management
│
└── css/
    └── styles.css                  # All styling
        ├── CSS variables
        ├── Responsive breakpoints
        ├── Accessibility features
        └── Component styles
```

### Database Schema
```sql
-- Users (authentication)
users
├── id (PK)
├── username (UNIQUE)
├── password (bcrypt hash)
└── created_at

-- Sessions (optional token tracking)
sessions
├── id (PK)
├── user_id (FK→users)
├── token (UNIQUE)
├── last_active
└── created_at

-- Tasks (core data)
tasks
├── id (PK)
├── user_id (FK→users) *indexed
├── title (3-100 chars)
├── description (≤500 chars)
├── due_date (ISO format)
├── category (subject)
├── completed (boolean)
├── created_at
├── updated_at
└── indexes: (user_id), (due_date), (username)
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm (comes with Node.js)

### Quick Start

#### 1. Backend Setup
```bash
cd student-todo/backend
npm install
npm run dev
```
The API server will start on `http://localhost:3000`

#### 2. Frontend Setup (Choose One)

**Option A: Direct File**
```
file:///path/to/student-todo/frontend/index.html
```

**Option B: Python Server**
```bash
cd student-todo/frontend
python -m http.server 8080
# Visit http://localhost:8080
```

**Option C: Node HTTP Server**
```bash
npm install -g http-server
cd student-todo/frontend
http-server -p 8080
# Visit http://localhost:8080
```

### 3. Test the Application
- Register a new account
- Login with your credentials
- Create, update, and delete tasks
- Try filtering and searching

---

## 🧪 Testing

### Running Tests
```bash
cd student-todo/backend

# All tests
npm run test

# Specific test suites
npm run test:integration     # API tests
npm run test:property        # Property-based tests
npm run test:unit            # Unit tests
npm run test:watch           # Watch mode
npm run test:coverage        # Coverage report
```

### Test Coverage
- Integration tests: Authentication, Task CRUD, Error handling, Security
- Property-based tests: Validation, Database consistency, Security properties
- Security tests: XSS prevention, SQL injection prevention, authentication

---

## 📋 API Reference

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "student123",
  "password": "securepassword123"
}
```
**Response**: 201 Created
```json
{
  "data": {
    "id": 1,
    "username": "student123"
  }
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "student123",
  "password": "securepassword123"
}
```
**Response**: 200 OK
```json
{
  "data": {
    "token": "eyJhbGc...",
    "user": {
      "id": 1,
      "username": "student123"
    }
  }
}
```

### Task Endpoints (Require JWT Token)

#### List Tasks
```http
GET /api/tasks?completed=false&priority=high&subject=Math
Authorization: Bearer <JWT_TOKEN>
```
**Response**: 200 OK
```json
{
  "data": [
    {
      "id": 1,
      "title": "Complete Chapter 5",
      "description": "Solve problems 1-20",
      "priority": "high",
      "subject": "Math",
      "completed": false,
      "due_date": "2026-12-15T23:59:59.000Z"
    }
  ]
}
```

#### Create Task
```http
POST /api/tasks
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

{
  "title": "Study for Exam",
  "description": "Review chapters 1-5",
  "priority": "high",
  "subject": "Physics",
  "due_date": "2026-12-20T23:59:59.000Z"
}
```
**Response**: 201 Created

#### Update Task
```http
PUT /api/tasks/1
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

{
  "title": "Updated Title",
  "priority": "medium"
}
```
**Response**: 200 OK

#### Delete Task
```http
DELETE /api/tasks/1
Authorization: Bearer <JWT_TOKEN>
```
**Response**: 204 No Content

#### Toggle Completion
```http
PATCH /api/tasks/1/complete
Authorization: Bearer <JWT_TOKEN>
```
**Response**: 200 OK

---

## 🔒 Environment Configuration

### Backend .env File
```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Security
JWT_SECRET=change_this_to_random_secret_key_256_bits

# Database
DB_PATH=../data/tasks.db
```

### Production Settings
For production deployment, use:
```env
NODE_ENV=production
JWT_SECRET=<generate-strong-random-256-bit-key>
PORT=3000
```

---

## 🏗️ Kiro Development Environment

This project includes complete Kiro integration:

### Steering Documents
- **project-standards.md**: Coding conventions, security, API design
- **testing-guidelines.md**: Testing strategies, property-based testing
- **deployment-guide.md**: Production deployment, Docker, monitoring

### Automated Hooks
- **Code Standards Review**: Validates code before writing files
- **Lint and Test on Save**: Auto-runs tests when files change
- **Development Welcome**: Provides setup info on session start

### Custom Agents
- **Todo Expert Agent**: Specialized guidance for todo applications

### Specifications
- **task-management-features.md**: Complete feature specification with API design, database schema, and implementation phases

### MCP Configuration
- **MCP-SETUP.md**: Model Context Protocol setup for database and filesystem access

---

## 📊 Development Workflow

### 1. Feature Development
1. Create feature branch: `git checkout -b feature/feature-name`
2. Follow project standards from `.kiro/steering/project-standards.md`
3. Write tests first (TDD approach)
4. Implement feature
5. Run full test suite: `npm run test`
6. Commit with meaningful message

### 2. Code Quality
- Hooks auto-review code against standards
- Tests auto-run on file save
- All changes validated before commit
- Coverage maintained above 80%

### 3. Testing
- Unit tests for business logic
- Integration tests for API flows
- Property-based tests for validation
- Security tests for vulnerabilities

---

## 🐛 Troubleshooting

### Port 3000 Already in Use
```bash
# Find and kill process
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### Database Locked
```bash
# Delete database and restart
rm student-todo/data/tasks.db
npm run dev  # Will auto-recreate
```

### Dependencies Issues
```bash
cd student-todo/backend
rm -rf node_modules package-lock.json
npm install
```

### CORS Errors
- Use a proper web server (not direct file:// access)
- Check CORS_ORIGIN in .env

---

## 📝 Contributing

### Before Submitting PR
1. ✅ Follow `.kiro/steering/project-standards.md`
2. ✅ Write/update tests
3. ✅ Run `npm run test:coverage`
4. ✅ Verify all tests pass
5. ✅ Use meaningful commit messages
6. ✅ Create feature branch
7. ✅ Request code review

### Code Review Checklist
- [ ] Follows project standards
- [ ] Tests added/updated
- [ ] No security issues
- [ ] Proper error handling
- [ ] Input validation present
- [ ] Documentation updated
- [ ] Tests passing (80%+ coverage)

---

## 📚 Resources

- **Express.js**: https://expressjs.com
- **SQLite**: https://www.sqlite.org
- **JWT**: https://jwt.io
- **bcryptjs**: https://www.npmjs.com/package/bcryptjs
- **Jest**: https://jestjs.io
- **Kiro**: https://kiro.dev

---

## 📄 License

[Add your license information here]

---

## 📞 Support

For issues or questions:
1. Check troubleshooting section
2. Review `.kiro/steering/` documents
3. Check `.kiro/specs/task-management-features.md`
4. Run tests to diagnose issues
5. Check error logs and console output