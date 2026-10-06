'use strict';

// ---------------------------------------------------------------------------
// Token helpers (localStorage-backed)
// ---------------------------------------------------------------------------
export function getToken() {
  return localStorage.getItem('todo_token');
}

export function setToken(token) {
  localStorage.setItem('todo_token', token);
}

export function clearToken() {
  localStorage.removeItem('todo_token');
  localStorage.removeItem('todo_username');
}

export function getUsername() {
  return localStorage.getItem('todo_username');
}

export function setUsername(username) {
  localStorage.setItem('todo_username', username);
}

// ---------------------------------------------------------------------------
// Base URL — adjust if backend runs on a different port
// ---------------------------------------------------------------------------
const API_BASE = 'http://localhost:3000/api';

// ---------------------------------------------------------------------------
// apiFetch — authenticated fetch wrapper
// ---------------------------------------------------------------------------
/**
 * Wrapper around fetch() that:
 *  - Attaches Authorization: Bearer <token> when a token is stored
 *  - Parses JSON responses
 *  - Throws an Error with the server's error message on non-2xx responses
 *  - On 401, clears the token and redirects to index.html
 *
 * @param {string} path      - Path relative to API_BASE, e.g. '/tasks'
 * @param {RequestInit} [options] - Standard fetch options
 * @returns {Promise<any>}   - Parsed JSON body (or undefined for 204)
 */
export async function apiFetch(path, options = {}) {
  const token = getToken();

  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  // No content
  if (response.status === 204) {
    return undefined;
  }

  // Handle 401 — session expired or invalid
  if (response.status === 401) {
    clearToken();
    window.location.href = 'index.html';
    throw new Error('Session expired. Please log in again.');
  }

  let data;
  try {
    data = await response.json();
  } catch {
    data = {};
  }

  if (!response.ok) {
    throw new Error(data.error || `Request failed with status ${response.status}`);
  }

  return data;
}
