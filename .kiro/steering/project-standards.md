---
name: "Project Standards"
description: "Development standards and conventions for the student todo application"
inclusion: auto
---

# Student Todo Project Standards

## Code Style & Conventions

### JavaScript/Node.js Backend
- Use strict mode (`'use strict';`)
- Follow ES6+ syntax where supported
- Use meaningful variable and function names
- Implement proper error handling with try-catch blocks
- Return JSON responses with consistent structure: `{ data, error, message }`
- Use HTTP status codes appropriately (200, 201, 400, 401, 404, 500)

### Frontend Standards
- Use semantic HTML with proper accessibility attributes (ARIA)
- Follow mobile-first responsive design
- Implement proper form validation (client + server side)
- Use modern JavaScript (ES6+ modules, async/await)
- Handle loading states and errors gracefully

### Database
- Use parameterized queries to prevent SQL injection
- Implement proper foreign key relationships
- Create indexes for frequently queried columns
- Use transactions for multi-table operations

## Security Requirements
- Hash passwords using bcryptjs with salt rounds ≥ 10
- Validate and sanitize all user inputs
- Use JWT tokens for authentication with reasonable expiration
- Implement rate limiting for authentication endpoints
- Use HTTPS in production
- Set appropriate CORS policies

## Testing Standards
- Write unit tests for all business logic
- Test both success and error scenarios
- Use property-based testing for complex validation logic
- Achieve minimum 80% code coverage
- Mock external dependencies in tests

## API Design
- Follow RESTful conventions
- Use consistent URL patterns (`/api/resource`)
- Version APIs when making breaking changes
- Document all endpoints with examples
- Return meaningful error messages

## File Organization
```
backend/
├── routes/          # Express route handlers
├── middleware/      # Custom middleware
├── models/          # Data models/validation
├── utils/           # Helper functions
├── tests/           # Test files
├── db.js           # Database setup
└── server.js       # Main server file

frontend/
├── js/             # JavaScript modules
├── css/            # Stylesheets
├── assets/         # Images, fonts
└── index.html      # Main HTML file
```

## Development Workflow
- Create feature branches from main
- Write tests before implementation (TDD)
- Run linting and tests before commits
- Use descriptive commit messages
- Create pull requests for code review