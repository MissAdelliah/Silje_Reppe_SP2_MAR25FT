import { apiRequest } from './request.js';

/**
 * Get an auction profile.
 * @param {string} name
 * @returns {Promise<object>}
 */
export async function getProfile(name) {
  return apiRequest(
    `/auction/profiles/${encodeURIComponent(name)}?_listings=true&_wins=true`,
    {
      auth: true,
    },
  );
}

/**
 * Update the logged-in user's auction profile.
 * @param {string} name
 * @param {object} profile
 * @returns {Promise<object>}
 */
export async function updateProfile(name, profile) {
  return apiRequest(`/auction/profiles/${encodeURIComponent(name)}`, {
    method: 'PUT',
    auth: true,
    body: profile,
  });
}
