import { apiRequest } from './apiClient.js';
import { clearUser, saveUser } from '../utils/storage.js';

/**
 * Register a new student account.
 *
 * @param {object} user
 * @returns {Promise<object>}
 */
export function registerUser(user) {
  return apiRequest('/auth/register', {
    method: 'POST',
    body: user,
  });
}

/**
 * Log in and save the authenticated user.
 *
 * @param {object} credentials
 * @returns {Promise<object>}
 */
export async function loginUser(credentials) {
  const user = await apiRequest('/auth/login', {
    method: 'POST',
    body: credentials,
  });

  saveUser(user);

  return user;
}

/**
 * Log out and clear the saved user.
 */
export function logoutUser() {
  clearUser();
}
