import { apiRequest } from './request.js';

// Profiles

/**
 * Get one auction profile.
 * @param {string} name
 * @returns {Promise<object>}
 */
export async function getProfile(name) {
  return apiRequest(`/auction/profiles/${encodeURIComponent(name)}`, {
    requiresAuth: true,
  });
}
