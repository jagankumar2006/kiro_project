---
name: "Testing Guidelines"
description: "Comprehensive testing strategies and best practices for the student todo application"
inclusion: auto
---

# Testing Guidelines

## Test Strategy Overview

Our testing approach follows a pyramid structure with different types of tests serving different purposes:

1. **Unit Tests** (70%): Fast, isolated tests of individual functions and components
2. **Integration Tests** (20%): Test API endpoints and database interactions
3. **Property-based Tests** (10%): Test invariants with generated data
4. **End-to-End Tests**: Manual testing for critical user workflows

## Unit Testing Standards

### What to Test
- Pure functions and utility methods
- Validation functions
- Business logic components
- Error handling paths
- Edge cases and boundary conditions

### Test Structure
```javascript
describe('Component/Module Name', () => {
  describe('method name', () => {
    test('should do X when Y condition', () => {
      // Arrange
      const input = 'test data';
      
      // Act  
      const result = methodUnderTest(input);
      
      // Assert
      expect(result).toBe('expected output');
    });
  });
});
```

### Mocking Guidelines
- Mock external dependencies (database, APIs, file system)
- Use Jest mocks for modules: `jest.mock('./module')`
- Create test doubles for complex objects
- Avoid mocking what you're testing

## Integration Testing Standards

### API Testing
- Test full request-response cycles
- Include authentication flows
- Test error scenarios (400, 401, 404, 500)
- Validate response structures
- Test middleware behavior

### Database Testing
- Use test database or in-memory database
- Test CRUD operations
- Verify foreign key constraints
- Test transaction rollbacks
- Clean up test data after tests

## Property-based Testing

### When to Use
- Complex validation logic
- Data transformation functions
- Security-critical functions
- Mathematical operations
- Parsing and serialization

### Example Properties
```javascript
// Property: Password hashing should be deterministic for verification
fc.assert(fc.property(
  fc.string({ minLength: 8 }),
  async (password) => {
    const hash = await hashPassword(password);
    const isValid = await verifyPassword(password, hash);
    expect(isValid).toBe(true);
  }
));
```

## Test Data Management

### Test Users
```javascript
const testUsers = {
  validUser: { username: 'testuser', password: 'password123' },
  adminUser: { username: 'admin', password: 'adminpass123' },
  invalidUser: { username: 'ab', password: '123' }
};
```

### Test Tasks
```javascript
const testTasks = {
  validTask: {
    title: 'Complete assignment',
    description: 'Math homework chapter 5',
    priority: 'high',
    dueDate: '2026-12-01T23:59:59.000Z'
  },
  minimalTask: { title: 'Minimal task' },
  invalidTask: { title: 'ab' } // Too short
};
```

## Performance Testing

### Load Testing
- Test API endpoints under load
- Verify database query performance
- Test concurrent user scenarios
- Monitor memory usage and response times

### Database Performance
- Test with large datasets (1000+ tasks)
- Verify index effectiveness
- Test complex queries with filters
- Monitor query execution plans

## Security Testing

### Authentication Tests
- Test JWT token validation
- Test expired token handling
- Test malformed token handling
- Test missing authorization headers

### Input Validation Tests
- Test SQL injection attempts
- Test XSS payload injection
- Test oversized inputs
- Test malformed JSON
- Test Unicode and special characters

### Example Security Tests
```javascript
test('should prevent SQL injection in task search', async () => {
  const maliciousSearch = "'; DROP TABLE tasks; --";
  
  const response = await request(app)
    .get(`/api/tasks?search=${maliciousSearch}`)
    .set('Authorization', `Bearer ${token}`)
    .expect(200);
    
  // Should return empty results, not cause database errors
  expect(response.body.data).toEqual([]);
});
```

## Test Environment Setup

### Test Database
- Use separate test database
- Reset database state between tests
- Seed with minimal required data
- Use transactions for isolation

### Environment Variables
```env
NODE_ENV=test
DB_PATH=:memory:  # In-memory SQLite for speed
JWT_SECRET=test-secret-key
PORT=0  # Let system assign available port
```

### Test Configuration
```javascript
// jest.config.js
module.exports = {
  testEnvironment: 'node',
  setupFilesAfterEnv: ['./tests/setup.js'],
  collectCoverageFrom: [
    'routes/**/*.js',
    'middleware/**/*.js',
    '!**/*.test.js'
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  }
};
```

## Continuous Integration

### Pre-commit Hooks
- Run linting (ESLint)
- Run unit tests
- Check code coverage
- Format code (Prettier)

### CI Pipeline
1. Install dependencies
2. Run linter
3. Run all tests
4. Generate coverage report
5. Run security audit
6. Build application

## Test Maintenance

### Regular Tasks
- Update test data when schema changes
- Refactor tests when code changes
- Remove obsolete tests
- Add tests for bug fixes
- Review and update mocks

### Test Documentation
- Document complex test scenarios
- Explain non-obvious assertions
- Document test data relationships
- Maintain test environment setup guides