import { API_BASE_URL } from './config.js';

import { saveUser, clearUser } from '../utils/storage.js';

// Helpers

async function parseResponse(response) {
  let result;

  try {
    result = await response.json();
  } catch {
    throw new Error('Could not read the server response.');
  }

  if (!response.ok) {
    const message =
      result?.errors?.[0]?.message ||
      result?.message ||
      'Something went wrong. Please try again.';

    throw new Error(message);
  }

  return result.data;
}

// API

/**
 * Register a new user.
 * @param {{name: string, email: string, password: string}} user
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

  return parseResponse(response);
}

/**
 * Log in a user and save the session.
 * @param {{email: string, password: string}} credentials
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

  const user = await parseResponse(response);

  saveUser(user);

  return user;
}

/**
 * Log out the current user.
 */
export function logoutUser() {
  clearUser();
}
