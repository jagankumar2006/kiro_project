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

## 📂 Project Architecture

### Directory Structure
```
kiro_project/
├── .kiro/                          # Kiro development environment
│   ├── agents/                     # Custom AI agents
│   ├── hooks/                      # Automated development hooks (3 custom)
│   ├── specs/                      # Feature specifications
│   ├── steering/                   # Development guidelines (3 documents)
│   └── MCP-SETUP.md               # Model Context Protocol guide
│
├── student-todo/                   # Main application
│   ├── backend/
│   │   ├── server.js              # Express server
│   │   ├── db.js                  # Database layer
│   │   ├── routes/                # API endpoints
│   │   ├── middleware/            # JWT middleware
│   │   ├── tests/                 # Test suites
│   │   ├── .env                   # Configuration
│   │   └── package.json           # Dependencies
│   │
│   ├── frontend/
│   │   ├── index.html             # Auth page
│   │   ├── app.html              # Main UI
│   │   ├── js/                    # Modules (api, auth, app)
│   │   └── css/                   # Styles
│   │
│   ├── data/                       # Database files
│   │   └── tasks.db              # SQLite database
│   │
│   └── README.md                   # Project documentation
│
└── README.md                        # This file (repository showcase)
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js (v16+)
- npm

### Backend Setup
```bash
cd student-todo/backend
npm install
npm run dev
```
Server runs on `http://localhost:3000`

### Frontend Setup (Choose One)

**Option A: Python Server**
```bash
cd student-todo/frontend
python -m http.server 8080
```

**Option B: Node HTTP Server**
```bash
npm install -g http-server
cd student-todo/frontend
http-server -p 8080
```

**Option C: Direct File**
```
file:///path/to/student-todo/frontend/index.html
```

---

## 📋 API Endpoints

### Authentication
- `POST /api/auth/register` - Create account (201, 400, 409)
- `POST /api/auth/login` - Login & get token (200, 401)

### Tasks (Require JWT)
- `GET /api/tasks` - List tasks (200, 401)
- `POST /api/tasks` - Create task (201, 400, 401)
- `GET /api/tasks/:id` - Get task (200, 401, 404)
- `PUT /api/tasks/:id` - Update task (200, 400, 401, 404)
- `DELETE /api/tasks/:id` - Delete task (204, 401, 404)
- `PATCH /api/tasks/:id/complete` - Toggle (200, 401, 404)

### Query Parameters
- `completed=true/false` - Filter by status
- `priority=low/medium/high` - Filter by priority
- `subject=<string>` - Filter by subject
- `search=<string>` - Search title/description

---

## 🧪 Testing

```bash
cd student-todo/backend

npm run test              # All tests
npm run test:integration # API tests
npm run test:property    # Property-based tests
npm run test:coverage    # Coverage report
```

---

## 🏗️ Kiro Development Integration

### Complete Kiro Setup
- ✅ **3 Steering Documents**: project-standards, testing-guidelines, deployment-guide
- ✅ **3 Hooks**: code-review-gate, lint-and-test-on-save, welcome-message
- ✅ **1 Spec**: task-management-features with full specification
- ✅ **1 Custom Agent**: todo-expert for specialized guidance
- ✅ **MCP Setup**: Model Context Protocol configuration guide
- ✅ **Integration Tests**: Comprehensive API testing
- ✅ **Property-based Tests**: Validation testing infrastructure

### Steering Documents
- **project-standards.md** - Code conventions, security, API design
- **testing-guidelines.md** - Testing strategies & best practices
- **deployment-guide.md** - Production deployment & Docker

---

## 🔒 Security

- ✅ Bcryptjs password hashing (10+ rounds)
- ✅ JWT token authentication
- ✅ Input validation & sanitization
- ✅ SQL injection prevention
- ✅ XSS protection
- ✅ Foreign key constraints
- ✅ Security headers

---

## 📊 Development Workflow

1. **Feature Branch**: `git checkout -b feature/name`
2. **Write Tests**: TDD approach required
3. **Implement**: Follow project standards
4. **Test**: `npm run test:coverage`
5. **Commit**: Meaningful message
6. **Push**: Create PR for review

---

## 🐛 Troubleshooting

### Port 3000 in Use
```bash
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### Database Issues
```bash
rm student-todo/data/tasks.db
npm run dev  # Auto-recreates
```

### Dependency Issues
```bash
cd student-todo/backend
rm -rf node_modules package-lock.json
npm install
```

---

## 📚 Resources

- [Express.js](https://expressjs.com)
- [SQLite](https://www.sqlite.org)
- [JWT](https://jwt.io)
- [Jest Testing](https://jestjs.io)
- [Kiro](https://kiro.dev)

---

## 📄 Environment Configuration

```env
# Backend (.env)
PORT=3000
NODE_ENV=development
JWT_SECRET=your-secret-key-here
DB_PATH=../data/tasks.db
```

---

## 📞 Support

1. Check `.kiro/steering/` for guidelines
2. Review `.kiro/specs/task-management-features.md`
3. Check troubleshooting section above
4. Run tests to diagnose
5. Review `.kiro/MCP-SETUP.md` for MCP configuration

---

## 📄 License

[Add your license information here]

---

## 🎯 Project Highlights

✨ **Production-Ready**: Security, testing, and best practices built-in
🧪 **Comprehensive Testing**: Integration + property-based tests
📚 **Fully Documented**: Architecture, API, and development guides
🏗️ **Kiro Integrated**: Development environment with automation
🚀 **Scalable**: Modular architecture for easy extension
🔒 **Secure**: Industry-standard security practices

---

**Last Updated**: October 2026  
**Status**: ✅ Production Ready  
**Backend**: Running ✅ | Frontend: Ready ✅
