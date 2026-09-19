import { apiRequest } from './apiClient.js';

/**
 * Get one profile.
 *
 * @param {string} name
 * @returns {Promise<object>}
 */
export function getProfile(name) {
  return apiRequest(`/auction/profiles/${encodeURIComponent(name)}`, {
    auth: true,
  });
}

/**
 * Get active listings created by a profile.
 *
 * @param {string} name
 * @returns {Promise<Array>}
 */
export function getProfileListings(name) {
  return apiRequest(
    `/auction/profiles/${encodeURIComponent(
      name,
    )}/listings?_active=true&_bids=true&sort=created&sortOrder=desc`,
    {
      auth: true,
    },
  );
}

/**
 * Get bids made by a profile.
 *
 * @param {string} name
 * @returns {Promise<Array>}
 */
export function getProfileBids(name) {
  return apiRequest(
    `/auction/profiles/${encodeURIComponent(
      name,
    )}/bids?_listings=true&sort=created&sortOrder=desc`,
    {
      auth: true,
    },
  );
}

/**
 * Update profile information.
 *
 * @param {string} name
 * @param {object} profile
 * @returns {Promise<object>}
 */
export function updateProfile(name, profile) {
  return apiRequest(`/auction/profiles/${encodeURIComponent(name)}`, {
    method: 'PUT',
    body: profile,
    auth: true,
  });
}
