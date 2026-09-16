import { API_BASE_URL, API_KEY } from './config.js';

import { getAccessToken } from '../utils/storage.js';

/**
 * Send a request to the Noroff API.
 * @param {string} endpoint
 * @param {object} options
 * @returns {Promise<any>}
 */
export async function apiRequest(
  endpoint,
  { method = 'GET', body = null, auth = false, signal } = {},
) {
  const headers = new Headers();

  if (body !== null) {
    headers.set('Content-Type', 'application/json');
  }

  if (auth) {
    const accessToken = getAccessToken();

    if (!accessToken) {
      throw new Error('You must be logged in.');
    }

    headers.set('Authorization', `Bearer ${accessToken}`);

    headers.set('X-Noroff-API-Key', API_KEY);
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method,
    headers,
    signal,

    body: body === null ? undefined : JSON.stringify(body),
  });

  if (response.status === 204) {
    return null;
  }

  const result = await response.json();

  if (!response.ok) {
    const message =
      result?.errors?.[0]?.message || result?.message || 'API request failed.';

    throw new Error(message);
  }

  return result.data;
}
