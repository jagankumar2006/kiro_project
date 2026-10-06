'use strict';

import { apiFetch, setToken, setUsername, getToken } from './api.js';

// If already logged in, go straight to the app
if (getToken()) {
  window.location.href = 'app.html';
}

// ---------------------------------------------------------------------------
// Tab switching
// ---------------------------------------------------------------------------
const tabBtns = document.querySelectorAll('.tab-btn');
const tabPanels = document.querySelectorAll('.tab-panel');

tabBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    tabBtns.forEach(b => { b.classList.remove('active'); b.setAttribute('aria-selected', 'false'); });
    tabPanels.forEach(p => p.classList.remove('active'));

    btn.classList.add('active');
    btn.setAttribute('aria-selected', 'true');
    document.getElementById(btn.getAttribute('aria-controls')).classList.add('active');

    // Clear errors on tab switch
    document.getElementById('login-error').textContent = '';
    document.getElementById('register-error').textContent = '';
  });
});

// ---------------------------------------------------------------------------
// Login
// ---------------------------------------------------------------------------
document.getElementById('login-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const errorEl = document.getElementById('login-error');
  errorEl.textContent = '';

  const username = document.getElementById('login-username').value.trim();
  const password = document.getElementById('login-password').value;

  try {
    const data = await apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
    setToken(data.token);
    setUsername(data.username);
    window.location.href = 'app.html';
  } catch (err) {
    errorEl.textContent = err.message || 'Login failed. Please try again.';
  }
});

// ---------------------------------------------------------------------------
// Register
// ---------------------------------------------------------------------------
document.getElementById('register-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const errorEl = document.getElementById('register-error');
  errorEl.textContent = '';

  const username = document.getElementById('reg-username').value.trim();
  const password = document.getElementById('reg-password').value;

  try {
    await apiFetch('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
    // Auto-login after register
    const loginData = await apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
    setToken(loginData.token);
    setUsername(loginData.username);
    window.location.href = 'app.html';
  } catch (err) {
    errorEl.textContent = err.message || 'Registration failed. Please try again.';
  }
});
