'use strict';

import { apiFetch, getToken, getUsername, clearToken } from './api.js';

// ---------------------------------------------------------------------------
// Guard — redirect to login if no token
// ---------------------------------------------------------------------------
if (!getToken()) {
  window.location.href = 'index.html';
}

// ---------------------------------------------------------------------------
// DOM refs
// ---------------------------------------------------------------------------
const headerUsername   = document.getElementById('header-username');
const logoutBtn        = document.getElementById('logout-btn');
const errorBanner      = document.getElementById('error-banner');
const searchInput      = document.getElementById('search-input');
const categoryFilter   = document.getElementById('category-filter');
const filterBtns       = document.querySelectorAll('.filter-btn');
const addTaskBtn       = document.getElementById('add-task-btn');
const taskFormCard     = document.getElementById('task-form-card');
const taskFormTitle    = document.getElementById('task-form-title');
const taskForm         = document.getElementById('task-form');
const editTaskId       = document.getElementById('edit-task-id');
const taskTitleInput   = document.getElementById('task-title');
const taskDescInput    = document.getElementById('task-description');
const taskDueDateInput = document.getElementById('task-due-date');
const taskCategoryInput= document.getElementById('task-category');
const taskFormError    = document.getElementById('task-form-error');
const cancelTaskBtn    = document.getElementById('cancel-task-btn');
const loadingIndicator = document.getElementById('loading-indicator');
const emptyState       = document.getElementById('empty-state');
const emptyStateMsg    = document.getElementById('empty-state-msg');
const taskList         = document.getElementById('task-list');

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------
let activeStatus   = '';   // '' | 'complete' | 'incomplete'
let activeCategoryValue = '';
let searchQuery    = '';
let searchTimer    = null;
let knownCategories = new Set();

// ---------------------------------------------------------------------------
// Header username
// ---------------------------------------------------------------------------
headerUsername.textContent = getUsername() || '';

// ---------------------------------------------------------------------------
// Error banner helpers
// ---------------------------------------------------------------------------
function showError(msg) {
  errorBanner.textContent = msg;
  errorBanner.classList.remove('hidden');
}

function clearError() {
  errorBanner.classList.add('hidden');
  errorBanner.textContent = '';
}

// ---------------------------------------------------------------------------
// Utility: truncate title at 100 chars
// ---------------------------------------------------------------------------
function truncateTitle(title) {
  if (title.length <= 100) return title;
  return title.slice(0, 100) + '…';
}

// ---------------------------------------------------------------------------
// Utility: format due date for display
// ---------------------------------------------------------------------------
function formatDueDate(due_date) {
  if (!due_date) return null;
  const d = new Date(due_date + 'T00:00:00');
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

function isOverdue(due_date) {
  if (!due_date) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return new Date(due_date + 'T00:00:00') < today;
}

// ---------------------------------------------------------------------------
// Category filter dropdown management
// ---------------------------------------------------------------------------
function refreshCategoryDropdown() {
  const current = categoryFilter.value;
  categoryFilter.innerHTML = '<option value="">All categories</option>';
  [...knownCategories].sort().forEach(cat => {
    const opt = document.createElement('option');
    opt.value = cat;
    opt.textContent = cat;
    categoryFilter.appendChild(opt);
  });
  // Restore selection if still valid
  if (current && knownCategories.has(current)) {
    categoryFilter.value = current;
  }
}

// ---------------------------------------------------------------------------
// Render a single task card  (Requirements 2.7, 5.5)
// ---------------------------------------------------------------------------
function renderTaskCard(task) {
  const li = document.createElement('li');
  li.className = 'task-card' + (task.completed ? ' completed' : '');
  li.dataset.id = task.id;

  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.className = 'task-checkbox';
  checkbox.checked = task.completed;
  checkbox.setAttribute('aria-label', `Mark "${truncateTitle(task.title)}" as ${task.completed ? 'incomplete' : 'complete'}`);
  checkbox.addEventListener('change', () => handleToggle(task.id, li, checkbox));

  const body = document.createElement('div');
  body.className = 'task-body';

  const titleEl = document.createElement('div');
  titleEl.className = 'task-title';
  titleEl.textContent = truncateTitle(task.title);
  titleEl.title = task.title; // full title on hover
  body.appendChild(titleEl);

  const meta = document.createElement('div');
  meta.className = 'task-meta';

  if (task.category) {
    const badge = document.createElement('span');
    badge.className = 'category-badge';
    badge.textContent = task.category;
    meta.appendChild(badge);
  }

  if (task.due_date) {
    const due = document.createElement('span');
    due.className = 'due-date' + (isOverdue(task.due_date) && !task.completed ? ' overdue' : '');
    due.textContent = '📅 ' + formatDueDate(task.due_date);
    meta.appendChild(due);
  }

  body.appendChild(meta);

  const actions = document.createElement('div');
  actions.className = 'task-actions';

  const editBtn = document.createElement('button');
  editBtn.className = 'icon-btn';
  editBtn.innerHTML = '✏️';
  editBtn.setAttribute('aria-label', 'Edit task');
  editBtn.addEventListener('click', () => openEditForm(task));

  const deleteBtn = document.createElement('button');
  deleteBtn.className = 'icon-btn delete';
  deleteBtn.innerHTML = '🗑️';
  deleteBtn.setAttribute('aria-label', 'Delete task');
  deleteBtn.addEventListener('click', () => handleDelete(task.id, li));

  actions.appendChild(editBtn);
  actions.appendChild(deleteBtn);

  li.appendChild(checkbox);
  li.appendChild(body);
  li.appendChild(actions);

  return li;
}

// ---------------------------------------------------------------------------
// Render task list
// ---------------------------------------------------------------------------
function renderTasks(tasks) {
  taskList.innerHTML = '';

  if (tasks.length === 0) {
    const isFiltered = activeStatus || activeCategoryValue || searchQuery;
    emptyStateMsg.textContent = isFiltered
      ? 'No tasks match your filters.'
      : 'No tasks yet. Add one above!';
    emptyState.classList.remove('hidden');
  } else {
    emptyState.classList.add('hidden');
    tasks.forEach(task => {
      if (task.category) knownCategories.add(task.category);
      taskList.appendChild(renderTaskCard(task));
    });
    refreshCategoryDropdown();
  }
}

// ---------------------------------------------------------------------------
// Fetch & display tasks  (Requirements 2.2–2.7)
// ---------------------------------------------------------------------------
async function loadTasks() {
  clearError();
  loadingIndicator.classList.remove('hidden');
  emptyState.classList.add('hidden');
  taskList.innerHTML = '';

  const params = new URLSearchParams();
  if (activeCategoryValue) params.set('category', activeCategoryValue);
  if (activeStatus)        params.set('status', activeStatus);
  if (searchQuery)         params.set('q', searchQuery);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000);

  try {
    const tasks = await apiFetch('/tasks' + (params.toString() ? '?' + params.toString() : ''), {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    renderTasks(tasks);
  } catch (err) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      showError('Request timed out. Please check your connection and try again.');
    } else {
      showError(err.message || 'Failed to load tasks.');
    }
  } finally {
    loadingIndicator.classList.add('hidden');
  }
}

// ---------------------------------------------------------------------------
// Task form: open for adding
// ---------------------------------------------------------------------------
function openAddForm() {
  taskFormTitle.textContent = 'Add Task';
  editTaskId.value = '';
  taskForm.reset();
  taskFormError.textContent = '';
  taskFormCard.classList.remove('hidden');
  taskTitleInput.focus();
}

// ---------------------------------------------------------------------------
// Task form: open for editing  (Requirement 3.7)
// ---------------------------------------------------------------------------
function openEditForm(task) {
  taskFormTitle.textContent = 'Edit Task';
  editTaskId.value = task.id;
  taskTitleInput.value = task.title;
  taskDescInput.value = task.description || '';
  taskDueDateInput.value = task.due_date || '';
  taskCategoryInput.value = task.category || '';
  taskFormError.textContent = '';
  taskFormCard.classList.remove('hidden');
  taskTitleInput.focus();
}

// ---------------------------------------------------------------------------
// Task form: close
// ---------------------------------------------------------------------------
function closeForm() {
  taskFormCard.classList.add('hidden');
  taskForm.reset();
  taskFormError.textContent = '';
  editTaskId.value = '';
}

// ---------------------------------------------------------------------------
// Submit task form (add or edit)  (Requirements 1.9, 3.7)
// ---------------------------------------------------------------------------
taskForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  taskFormError.textContent = '';

  const id = editTaskId.value;
  const body = {
    title: taskTitleInput.value.trim(),
    description: taskDescInput.value.trim() || null,
    due_date: taskDueDateInput.value || null,
    category: taskCategoryInput.value.trim() || null,
  };

  try {
    if (id) {
      // Edit
      const updated = await apiFetch(`/tasks/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(body),
      });
      // Update card in-place
      const li = taskList.querySelector(`[data-id="${id}"]`);
      if (li) {
        const newCard = renderTaskCard(updated);
        taskList.replaceChild(newCard, li);
      }
    } else {
      // Add
      const created = await apiFetch('/tasks', {
        method: 'POST',
        body: JSON.stringify(body),
      });
      // Prepend new card
      if (created.category) knownCategories.add(created.category);
      refreshCategoryDropdown();
      emptyState.classList.add('hidden');
      taskList.insertBefore(renderTaskCard(created), taskList.firstChild);
    }
    closeForm();
  } catch (err) {
    taskFormError.textContent = err.message || 'Could not save task.';
  }
});

// ---------------------------------------------------------------------------
// Toggle completion  (Requirement 5.5)
// ---------------------------------------------------------------------------
async function handleToggle(taskId, li, checkbox) {
  try {
    const updated = await apiFetch(`/tasks/${taskId}/toggle`, { method: 'PATCH' });
    const newCard = renderTaskCard(updated);
    taskList.replaceChild(newCard, li);
  } catch (err) {
    // Revert checkbox on failure
    checkbox.checked = !checkbox.checked;
    showError(err.message || 'Could not update task.');
  }
}

// ---------------------------------------------------------------------------
// Delete task  (Requirements 4.4, 4.5)
// ---------------------------------------------------------------------------
async function handleDelete(taskId, li) {
  if (!confirm('Delete this task? This cannot be undone.')) return;
  try {
    await apiFetch(`/tasks/${taskId}`, { method: 'DELETE' });
    li.remove();
    if (taskList.children.length === 0) {
      const isFiltered = activeStatus || activeCategoryValue || searchQuery;
      emptyStateMsg.textContent = isFiltered ? 'No tasks match your filters.' : 'No tasks yet. Add one above!';
      emptyState.classList.remove('hidden');
    }
  } catch (err) {
    showError(err.message || 'Could not delete task.');
  }
}

// ---------------------------------------------------------------------------
// Filter buttons  (Requirement 6.5)
// ---------------------------------------------------------------------------
filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    activeStatus = btn.dataset.status;
    loadTasks();
  });
});

// ---------------------------------------------------------------------------
// Category filter  (Requirement 6.5)
// ---------------------------------------------------------------------------
categoryFilter.addEventListener('change', () => {
  activeCategoryValue = categoryFilter.value;
  loadTasks();
});

// ---------------------------------------------------------------------------
// Search (debounced)  (Requirement 6.5)
// ---------------------------------------------------------------------------
searchInput.addEventListener('input', () => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => {
    searchQuery = searchInput.value.trim();
    loadTasks();
  }, 350);
});

// ---------------------------------------------------------------------------
// Add task button
// ---------------------------------------------------------------------------
addTaskBtn.addEventListener('click', openAddForm);
cancelTaskBtn.addEventListener('click', closeForm);

// ---------------------------------------------------------------------------
// Logout  (Requirement 7.6)
// ---------------------------------------------------------------------------
logoutBtn.addEventListener('click', async () => {
  try {
    await apiFetch('/auth/logout', { method: 'POST' });
  } catch {
    // Even if logout call fails, clear local token
  }
  clearToken();
  window.location.href = 'index.html';
});

// ---------------------------------------------------------------------------
// Initial load
// ---------------------------------------------------------------------------
loadTasks();
