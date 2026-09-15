import { API_BASE_URL, API_KEY } from './config.js';
import { getUser } from '../utils/storage.js';

// API

export class ApiError extends Error {
  constructor(message, status) {
    super(message);

    this.name = 'ApiError';
    this.status = status;
  }
}

/**
 * Make a request to the Noroff API.
 * @param {string} endpoint
 * @param {object} options
 * @returns {Promise<any>}
 */
export async function apiRequest(
  endpoint,
  { method = 'GET', body = null, requiresAuth = false, signal } = {},
) {
  const headers = new Headers({
    Accept: 'application/json',
  });

  if (body) {
    headers.set('Content-Type', 'application/json');
  }

  if (requiresAuth) {
    const user = getUser();

    if (!user?.accessToken) {
      throw new ApiError('You must be logged in.', 401);
    }

    if (!API_KEY || API_KEY === 'PASTE_YOUR_API_KEY_HERE') {
      throw new Error('Add your API key in js/api/config.js.');
    }

    headers.set('Authorization', `Bearer ${user.accessToken}`);

    headers.set('X-Noroff-API-Key', API_KEY);
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
    signal,
  });

  if (response.status === 204) {
    return null;
  }

  const result = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      result?.errors?.[0]?.message ||
      result?.message ||
      'Something went wrong.';

    throw new ApiError(message, response.status);
  }

  return result?.data ?? result;
}
