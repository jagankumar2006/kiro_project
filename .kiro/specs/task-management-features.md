# Task Management Features Spec

## Overview
This spec defines the task management functionality for the Student Todo application, including CRUD operations, filtering, and persistence.

## Requirements

### Core Task Operations
1. **Create Task** - Users can add new tasks with title, description, due date, priority, and subject
2. **Read Tasks** - Users can view their tasks in various formats (list, calendar view)
3. **Update Task** - Users can modify task details and mark tasks as complete/incomplete
4. **Delete Task** - Users can permanently remove tasks

### Task Properties
- `id`: Unique identifier (auto-generated)
- `title`: Required string (3-100 characters)
- `description`: Optional string (max 500 characters)
- `dueDate`: Optional ISO date string
- `priority`: Enum (low, medium, high)
- `subject`: String (e.g., "Math", "History", "Science")
- `isComplete`: Boolean (default: false)
- `createdAt`: ISO timestamp (auto-generated)
- `updatedAt`: ISO timestamp (auto-updated)
- `userId`: Foreign key to user table

### Advanced Features
- **Filtering**: By completion status, priority, subject, date range
- **Sorting**: By due date, priority, creation date, alphabetical
- **Search**: Text search across title and description
- **Bulk Operations**: Mark multiple tasks as complete, bulk delete
- **Categories/Tags**: Ability to categorize tasks

### API Endpoints
- `GET /api/tasks` - List user's tasks with optional filtering
- `POST /api/tasks` - Create new task
- `GET /api/tasks/:id` - Get specific task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task
- `PATCH /api/tasks/:id/complete` - Toggle completion status

### Database Schema
```sql
CREATE TABLE tasks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL CHECK(length(title) >= 3 AND length(title) <= 100),
  description TEXT CHECK(length(description) <= 500),
  due_date TEXT, -- ISO date string
  priority TEXT CHECK(priority IN ('low', 'medium', 'high')) DEFAULT 'medium',
  subject TEXT,
  is_complete INTEGER DEFAULT 0,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  user_id INTEGER NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);
```

### Frontend Components
- Task list component with filtering/sorting controls
- Task form for create/edit operations
- Task detail modal/page
- Bulk action toolbar
- Calendar view component

### Validation Rules
- Title: Required, 3-100 characters, no HTML
- Description: Optional, max 500 characters, sanitize HTML
- Due date: Valid ISO date, cannot be in the past for new tasks
- Priority: Must be one of: low, medium, high
- Subject: Optional, max 50 characters

### Error Handling
- 400: Invalid input data (with specific field errors)
- 401: User not authenticated
- 403: User cannot access task (not owner)
- 404: Task not found
- 422: Validation errors

## Implementation Tasks

### Phase 1: Basic CRUD
- [ ] Create task database schema
- [ ] Implement task routes (CRUD endpoints)
- [ ] Add task model with validation
- [ ] Create basic task list UI
- [ ] Implement task creation form

### Phase 2: Enhanced Features
- [ ] Add filtering and sorting
- [ ] Implement search functionality
- [ ] Add task editing capabilities
- [ ] Create task detail view

### Phase 3: Advanced Features
- [ ] Bulk operations
- [ ] Calendar view
- [ ] Categories/tags system
- [ ] Task statistics dashboard

### Testing Requirements
- Unit tests for all task operations
- Integration tests for API endpoints  
- Frontend component tests
- End-to-end user workflow tests
- Property-based testing for validation logic

### Performance Considerations
- Index database columns for efficient querying
- Implement pagination for large task lists
- Use lazy loading for task details
- Optimize database queries to avoid N+1 problems