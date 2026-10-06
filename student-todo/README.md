# Student Todo Application

A full-stack todo application designed for students to manage their academic tasks with features tailored to educational workflows.

## Features

### Core Functionality
- **User Authentication**: Secure registration and login with JWT tokens
- **Task Management**: Create, read, update, and delete tasks
- **Task Properties**: Title, description, due date, priority, subject, completion status
- **Task Organization**: Filter by completion, priority, subject, and date ranges
- **Search**: Text search across task titles and descriptions
- **Academic Focus**: Subject categorization and priority-based organization

### Security Features
- Password hashing with bcryptjs (10+ salt rounds)
- JWT token-based authentication
- Input validation and sanitization
- SQL injection prevention with parameterized queries
- XSS protection through proper data handling
- CORS configuration for cross-origin requests

## Technology Stack

### Backend
- **Runtime**: Node.js with Express.js
- **Database**: SQLite with better-sqlite3
- **Authentication**: JWT (jsonwebtoken) + bcryptjs
- **Security**: CORS, input validation, parameterized queries
- **Testing**: Jest + Supertest + fast-check (property-based testing)

### Frontend
- **Core**: Vanilla HTML5, CSS3, JavaScript (ES6+)
- **Features**: Responsive design, accessibility (ARIA), form validation
- **Architecture**: Modular JavaScript with proper separation of concerns

## Project Structure

```
student-todo/
├── backend/
│   ├── routes/          # Express route handlers
│   │   ├── auth.js      # Authentication endpoints
│   │   └── tasks.js     # Task management endpoints
│   ├── middleware/      # Custom middleware
│   │   └── auth.js      # JWT authentication middleware
│   ├── tests/           # Test files
│   │   ├── integration.test.js    # API integration tests
│   │   └── property-tests.js      # Property-based tests
│   ├── db.js           # Database setup and schema
│   ├── server.js       # Main server file
│   └── package.json    # Dependencies and scripts
├── frontend/
│   ├── js/             # JavaScript modules
│   │   ├── api.js      # API communication layer
│   │   ├── app.js      # Main application logic
│   │   └── auth.js     # Authentication handling
│   ├── css/            # Stylesheets
│   │   └── styles.css  # Main styles
│   ├── index.html      # Login/register page
│   └── app.html        # Main application interface
├── data/               # Database files
│   └── tasks.db        # SQLite database
└── .gitignore
```

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm (comes with Node.js)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd student-todo
   ```

2. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

### Development

#### Backend Development
```bash
cd backend
npm run dev        # Start server with auto-reload
npm run test       # Run test suite
npm run test:watch # Run tests in watch mode
```

#### Frontend Development
Open `frontend/index.html` in a web browser or use a local server:
```bash
# Using Python (if available)
cd frontend
python -m http.server 8080

# Using Node.js http-server (install globally: npm install -g http-server)
cd frontend
http-server -p 8080
```

### API Endpoints

#### Authentication
- `POST /api/auth/register` - Create new user account
- `POST /api/auth/login` - Authenticate user and get JWT token

#### Tasks (Requires Authentication)
- `GET /api/tasks` - Get user's tasks (supports filtering)
- `POST /api/tasks` - Create new task
- `GET /api/tasks/:id` - Get specific task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task
- `PATCH /api/tasks/:id/complete` - Toggle task completion

#### Query Parameters for GET /api/tasks
- `completed=true/false` - Filter by completion status
- `priority=low/medium/high` - Filter by priority level
- `subject=<string>` - Filter by subject
- `search=<string>` - Search in title and description
- `due_before=<ISO_date>` - Tasks due before date
- `due_after=<ISO_date>` - Tasks due after date

### Testing

#### Backend Testing
```bash
cd backend
npm run test                    # Run all tests
npm run test:unit              # Unit tests only
npm run test:integration       # Integration tests only
npm run test:property          # Property-based tests
npm run test:coverage          # Run with coverage report
```

#### Test Types
- **Unit Tests**: Test individual functions and modules
- **Integration Tests**: Test full API request-response cycles
- **Property-based Tests**: Test invariants with generated data
- **Security Tests**: Validate authentication and input sanitization

## Kiro Integration

This project is fully integrated with Kiro's development environment:

### Steering Documents
- **Project Standards**: Located in `.kiro/steering/project-standards.md`
- Contains coding conventions, security requirements, and architectural guidelines

### Hooks
- **Lint and Test on Save**: Automatically runs tests when backend files are saved
- **Code Standards Review**: Reviews code changes against project standards
- **Development Welcome**: Provides setup instructions on session start

### Specs
- **Task Management Features**: Comprehensive specification in `.kiro/specs/task-management-features.md`
- Defines requirements, API design, database schema, and implementation phases

### Custom Agents
- **Todo Expert Agent**: Specialized agent for todo application guidance
- Available in `.kiro/agents/todo-expert.md`

## Security Considerations

### Authentication
- Passwords are hashed with bcryptjs (10+ salt rounds)
- JWT tokens have reasonable expiration times
- Tokens are validated on protected routes

### Input Validation
- All user inputs are validated and sanitized
- SQL injection prevention through parameterized queries
- XSS protection through proper output encoding

### Database Security
- Foreign key constraints for data integrity
- Check constraints for data validation
- Proper indexing for query performance

## API Response Format

All API responses follow a consistent structure:

**Success Response:**
```json
{
  "data": {
    // Response data
  }
}
```

**Error Response:**
```json
{
  "error": "Error message description"
}
```

## Environment Variables

```env
PORT=3000                    # Server port
JWT_SECRET=your-secret-key   # JWT signing secret
DB_PATH=data/tasks.db       # Database file path
NODE_ENV=development        # Environment (development/production)
```

## Contributing

1. Follow the project standards in `.kiro/steering/project-standards.md`
2. Write tests for new features
3. Ensure all tests pass before submitting
4. Use meaningful commit messages
5. Create feature branches for new development

## License

[Add your license information here]