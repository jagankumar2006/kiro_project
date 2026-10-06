'use strict';

const request = require('supertest');
const app = require('../server');

/**
 * Integration tests for the Student Todo API
 * Tests the full request-response cycle including middleware, routes, and database
 */

describe('Authentication Integration Tests', () => {
  describe('POST /api/auth/register', () => {
    test('should create new user with valid data', async () => {
      const userData = {
        username: 'testuser123',
        password: 'securepassword123'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data).toHaveProperty('username', userData.username);
      expect(response.body.data).not.toHaveProperty('password');
    });

    test('should reject invalid username', async () => {
      const userData = {
        username: 'ab', // Too short
        password: 'securepassword123'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('username');
    });

    test('should reject weak password', async () => {
      const userData = {
        username: 'validuser',
        password: '123' // Too short
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('password');
    });

    test('should prevent duplicate usernames', async () => {
      const userData = {
        username: 'duplicateuser',
        password: 'securepassword123'
      };

      // First registration should succeed
      await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      // Second registration should fail
      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(409);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('already exists');
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      // Create a test user before each login test
      await request(app)
        .post('/api/auth/register')
        .send({
          username: 'loginuser',
          password: 'loginpassword123'
        });
    });

    test('should login with valid credentials', async () => {
      const loginData = {
        username: 'loginuser',
        password: 'loginpassword123'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('token');
      expect(response.body.data).toHaveProperty('user');
      expect(response.body.data.user).not.toHaveProperty('password');
    });

    test('should reject invalid credentials', async () => {
      const loginData = {
        username: 'loginuser',
        password: 'wrongpassword'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Invalid');
    });

    test('should reject non-existent user', async () => {
      const loginData = {
        username: 'nonexistentuser',
        password: 'somepassword123'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });
  });
});

describe('Task Management Integration Tests', () => {
  let authToken;
  let userId;

  beforeEach(async () => {
    // Create and login a user for task tests
    const registerResponse = await request(app)
      .post('/api/auth/register')
      .send({
        username: 'taskuser',
        password: 'taskpassword123'
      });

    userId = registerResponse.body.data.id;

    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        username: 'taskuser',
        password: 'taskpassword123'
      });

    authToken = loginResponse.body.data.token;
  });

  describe('POST /api/tasks', () => {
    test('should create task with valid data', async () => {
      const taskData = {
        title: 'Complete math homework',
        description: 'Solve problems 1-20 from chapter 5',
        priority: 'high',
        subject: 'Mathematics',
        dueDate: '2026-12-01T23:59:59.000Z'
      };

      const response = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send(taskData)
        .expect(201);

      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.title).toBe(taskData.title);
      expect(response.body.data.priority).toBe(taskData.priority);
      expect(response.body.data.isComplete).toBe(false);
    });

    test('should require authentication', async () => {
      const taskData = {
        title: 'Unauthorized task'
      };

      await request(app)
        .post('/api/tasks')
        .send(taskData)
        .expect(401);
    });

    test('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send({}) // No title
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /api/tasks', () => {
    beforeEach(async () => {
      // Create some test tasks
      const tasks = [
        { title: 'Task 1', priority: 'high' },
        { title: 'Task 2', priority: 'medium', isComplete: true },
        { title: 'Task 3', priority: 'low' }
      ];

      for (const task of tasks) {
        await request(app)
          .post('/api/tasks')
          .set('Authorization', `Bearer ${authToken}`)
          .send(task);
      }
    });

    test('should return user tasks', async () => {
      const response = await request(app)
        .get('/api/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    test('should filter by completion status', async () => {
      const response = await request(app)
        .get('/api/tasks?completed=true')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.data.every(task => task.isComplete)).toBe(true);
    });

    test('should require authentication', async () => {
      await request(app)
        .get('/api/tasks')
        .expect(401);
    });
  });
});

describe('Error Handling Integration Tests', () => {
  test('should handle 404 for unknown routes', async () => {
    const response = await request(app)
      .get('/api/unknown')
      .expect(404);

    expect(response.body).toHaveProperty('error');
  });

  test('should handle malformed JSON', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .set('Content-Type', 'application/json')
      .send('{ invalid json }')
      .expect(400);

    expect(response.body).toHaveProperty('error');
  });

  test('should handle missing Content-Type', async () => {
    await request(app)
      .post('/api/auth/register')
      .send('some data')
      .expect(400);
  });
});

describe('Security Integration Tests', () => {
  test('should include security headers', async () => {
    const response = await request(app)
      .get('/api/auth/login')
      .expect(405); // Method not allowed, but should have headers

    expect(response.headers).toHaveProperty('x-content-type-options');
  });

  test('should prevent XSS in response data', async () => {
    const xssPayload = {
      username: '<script>alert("xss")</script>',
      password: 'password123'
    };

    const response = await request(app)
      .post('/api/auth/register')
      .send(xssPayload)
      .expect(400); // Should be rejected

    // Response should not contain the raw script
    expect(JSON.stringify(response.body)).not.toContain('<script>');
  });
});

// Cleanup after tests
afterAll(async () => {
  // Close database connections, clear test data, etc.
  // This will depend on your database setup
});