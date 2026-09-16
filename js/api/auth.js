import { API_BASE_URL } from './config.js';

import { clearUser, saveUser } from '../utils/storage.js';

// API

async function handleAuthResponse(response) {
  const result = await response.json();

  if (!response.ok) {
    const message =
      result.errors?.[0]?.message ||
      result.message ||
      'Something went wrong. Please try again.';

    throw new Error(message);
  }

  return result.data;
}

/**
 * Register a new Noroff student account.
 * @param {object} user
 * @returns {Promise<object>}
 */
export async function registerUser(user) {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',

    headers: {
      'Content-Type': 'application/json',
    },

    body: JSON.stringify(user),
  });

  return handleAuthResponse(response);
}

/**
 * Log in and store the authenticated user.
 * @param {object} credentials
 * @returns {Promise<object>}
 */
export async function loginUser(credentials) {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',

    headers: {
      'Content-Type': 'application/json',
    },

    body: JSON.stringify(credentials),
  });

  const user = await handleAuthResponse(response);

  saveUser(user);

  return user;
}

/**
 * Log out the current user.
 */
export function logoutUser() {
  clearUser();
}
