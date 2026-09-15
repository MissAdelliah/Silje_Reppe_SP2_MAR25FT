import { apiRequest } from './request.js';
import { clearUser, saveUser } from '../utils/storage.js';

// Auth

/**
 * Register a new user.
 * @param {object} userData
 * @returns {Promise<object>}
 */
export async function registerUser(userData) {
  return apiRequest('/auth/register', {
    method: 'POST',
    body: userData,
  });
}

/**
 * Login user and save session.
 * @param {string} email
 * @param {string} password
 * @returns {Promise<object>}
 */
export async function loginUser(email, password) {
  const user = await apiRequest('/auth/login', {
    method: 'POST',
    body: {
      email,
      password,
    },
  });

  saveUser(user);

  return user;
}

/**
 * Log out current user.
 */
export function logoutUser() {
  clearUser();
}
