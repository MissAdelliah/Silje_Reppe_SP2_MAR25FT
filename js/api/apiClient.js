import { API_BASE_URL, API_KEY } from './config.js';
import { getAccessToken } from '../utils/storage.js';

/**
 * Send a request to the Noroff API.
 * Adds authentication headers to protected requests.
 *
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
      throw new Error('No access token found.');
    }

    if (!API_KEY) {
      throw new Error('The Noroff API key is missing.');
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

  let result;

  try {
    result = await response.json();
  } catch {
    throw new Error('The server returned an invalid response.');
  }

  if (!response.ok) {
    const message =
      result?.errors?.[0]?.message ||
      result?.message ||
      `Request failed with status ${response.status}.`;

    throw new Error(message);
  }

  return result.data;
}
