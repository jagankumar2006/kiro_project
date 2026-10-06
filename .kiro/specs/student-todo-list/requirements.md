# Requirements Document

## Introduction

A student-focused to-do list web application with a simple frontend and backend. Students can manage their tasks — creating, viewing, updating, and deleting items — organized by subject or category. The system consists of a browser-based UI and a REST API backed by persistent storage.

## Glossary

- **System**: The student to-do list web application as a whole
- **API**: The backend REST API that handles data persistence and business logic
- **UI**: The browser-based frontend interface
- **Task**: A to-do item with a title, optional description, due date, category, and completion status
- **Category**: A label used to group tasks (e.g., subject name like "Math" or "History")
- **Student**: The authenticated user of the application
- **Session**: An authenticated login session for a Student

## Requirements

### Requirement 1: Task Creation

**User Story:** As a student, I want to create a new task with a title, description, due date, and category, so that I can track my assignments and responsibilities.

#### Acceptance Criteria

1. WHEN a Student submits a new task with a title, THE API SHALL create the task and return the created task with a unique identifier.
2. WHEN a Student submits a new task without a title, THE API SHALL return a 400 error with a descriptive message indicating the title is required.
3. WHEN a Student submits a new task with a title exceeding 200 characters or a description exceeding 2000 characters, THE API SHALL return a 400 error with a message indicating the field length limit.
4. WHEN a Student creates a task, THE System SHALL set the task's completion status to incomplete by default.
5. WHERE a due date is provided, THE API SHALL store the due date in ISO 8601 format.
6. WHERE a due date is provided in an invalid format, THE API SHALL return a 400 error with a message indicating the expected date format.
7. WHERE a category is provided, THE API SHALL associate the task with that category.
8. WHERE a category is provided that does not exist for the Student, THE API SHALL create the category and associate it with the task.
9. WHEN a task is successfully created, THE UI SHALL display the new task in the task list without requiring a full page reload.

---

### Requirement 2: Task Listing and Viewing

**User Story:** As a student, I want to view all my tasks in a list, so that I can see what I need to do at a glance.

#### Acceptance Criteria

1. WHEN a Student requests their task list, THE API SHALL return all tasks belonging to that Student ordered by due date ascending (tasks without a due date last), with incomplete tasks before complete tasks within each group, and tasks with the same due date and completion status ordered by creation date ascending.
2. WHEN a Student opens the application, THE UI SHALL fetch the task list from the API.
3. WHEN the task list is successfully fetched, THE UI SHALL display the tasks.
4. WHILE a task list is loading, THE UI SHALL display a loading indicator.
5. IF the task list request fails or does not complete within 30 seconds, THEN THE UI SHALL display an error message describing the failure.
6. IF a Student has no tasks, THEN THE UI SHALL display a message indicating there are no tasks to show.
7. THE UI SHALL display each task's title (truncated at 100 characters with an ellipsis if longer), category, due date, and completion status in the task list.

---

### Requirement 3: Task Editing

**User Story:** As a student, I want to edit an existing task's details, so that I can correct mistakes or update information as my schedule changes.

#### Acceptance Criteria

1. WHEN a Student submits an update for an existing task, THE API SHALL update only the fields provided in the request (unspecified fields retain their current values) and return the full updated task.
2. IF a Student attempts to update a task that does not exist, THEN THE API SHALL return a 404 error with a message indicating the task was not found.
3. IF a Student attempts to update a task that belongs to another Student, THEN THE API SHALL return a 403 error with a message indicating the operation is not permitted.
4. WHEN a Student submits a task update with an empty title, THE API SHALL return a 400 error with a message indicating the title must not be empty.
5. WHEN a Student submits a task update with a title exceeding 200 characters or a description exceeding 2000 characters, THE API SHALL return a 400 error with a message indicating the field length limit.
6. WHERE a due date update is provided in an invalid format, THE API SHALL return a 400 error with a message indicating the expected date format.
7. WHEN a task is successfully updated, THE UI SHALL reflect the updated task details in the task list without requiring a full page reload.

---

### Requirement 4: Task Deletion

**User Story:** As a student, I want to delete a task, so that I can remove items that are no longer relevant.

#### Acceptance Criteria

1. WHEN a Student deletes an existing task, THE API SHALL remove the task and return a 204 No Content response.
2. WHEN a Student attempts to delete a task that does not exist, THE API SHALL return a 404 error response with an error message indicating the task was not found.
3. IF a Student attempts to delete a task that belongs to another Student, THEN THE API SHALL return a 403 error response with an error message indicating the operation is not permitted.
4. WHEN the API returns a 204 No Content response for a delete request, THE UI SHALL remove the corresponding task from the task list without requiring a full page reload.
5. WHEN a Student initiates a task deletion, THE UI SHALL display a confirmation prompt before sending the delete request; IF the Student cancels the confirmation, THEN THE UI SHALL dismiss the prompt and the delete request SHALL NOT be sent.

---

### Requirement 5: Task Completion Toggle

**User Story:** As a student, I want to mark a task as complete or incomplete, so that I can track my progress.

#### Acceptance Criteria

1. WHEN a Student marks an incomplete task as complete, THE API SHALL update the task's completion status to complete and return the updated task.
2. WHEN a Student marks a complete task as incomplete, THE API SHALL update the task's completion status to incomplete and return the updated task.
3. IF a Student attempts to toggle the completion status of a task that does not exist, THEN THE API SHALL return a 404 error with a message indicating the task was not found.
4. IF a Student attempts to toggle the completion status of a task that belongs to another Student, THEN THE API SHALL return a 403 error with a message indicating the operation is not permitted.
5. WHEN a task's completion status is updated, THE UI SHALL visually distinguish completed tasks (e.g., strikethrough text) from incomplete tasks in the task list without requiring a full page reload.

---

### Requirement 6: Task Filtering and Search

**User Story:** As a student, I want to filter and search my tasks, so that I can quickly find relevant items.

#### Acceptance Criteria

1. WHEN a Student filters by one or more criteria (category, completion status), THE API SHALL return only tasks matching all specified criteria combined with AND logic.
2. WHEN a Student filters by completion status, THE API SHALL accept values of "complete" or "incomplete" and return only tasks matching that status.
3. WHEN a Student submits a search query of 1–200 non-whitespace characters, THE API SHALL return tasks whose title or description contains the query string using case-insensitive matching.
4. WHEN a Student submits a blank or whitespace-only search query, THE API SHALL treat it as no search query and return results unfiltered by search.
5. WHEN filters or a search query are applied, THE UI SHALL update the task list to show only matching tasks without requiring a full page reload.
6. IF no tasks match the applied filter or search query, THEN THE UI SHALL display a message indicating no tasks were found.
7. IF a Student filters by a category value that does not exist for that Student, THEN THE API SHALL return an empty list.

---

### Requirement 7: User Authentication

**User Story:** As a student, I want to log in with a username and password, so that my tasks are private and associated with my account.

#### Acceptance Criteria

1. WHEN a Student submits a valid username (3–50 characters) and password (8–128 characters), THE API SHALL create a Session and return a session token.
2. IF a Student submits invalid credentials, THEN THE API SHALL return a 401 error without indicating which field (username or password) was incorrect.
3. IF a Student registers with a username that already exists, THEN THE API SHALL return a 409 error with a message indicating the username is unavailable.
4. WHILE a Student has a valid Session, THE API SHALL restrict task operations to tasks owned by that Student.
5. IF a Student's session token is absent or invalid on a protected request, THEN THE API SHALL return a 401 error.
6. WHEN a Student logs out, THE API SHALL invalidate the Session token such that subsequent requests using that token return a 401 error.
7. WHEN a Session has been inactive for 24 hours, THE System SHALL expire the Session token such that subsequent requests using that token return a 401 error.

---

### Requirement 8: Data Persistence

**User Story:** As a student, I want my tasks to be saved between sessions, so that I don't lose my work when I close the browser.

#### Acceptance Criteria

1. WHEN a Student creates, updates, or deletes a task, THE API SHALL persist the change to the storage backend before returning a success response.
2. WHEN the API service restarts, THE System SHALL retain all previously persisted tasks with all their fields (title, description, due date, category, completion status) intact.
3. IF a storage write operation fails, THEN THE API SHALL return an error response indicating the operation could not be completed and SHALL NOT return a success response to the Student.
4. IF a storage write operation fails, THEN THE System SHALL NOT corrupt or alter any previously persisted task data.
