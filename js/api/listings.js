import { apiRequest } from './apiClient.js';

/**
 * Get active listings, with optional search and sorting.
 *
 * @param {object} options
 * @returns {Promise<Array>}
 */
export async function getListings({
  search = '',
  sort = 'created',
  sortOrder = 'desc',
  signal,
} = {}) {
  const endpoint = search ? '/auction/listings/search' : '/auction/listings';

  const params = new URLSearchParams({
    _active: 'true',
    _bids: 'true',
    sort,
    sortOrder,
    limit: '100',
  });

  if (search) {
    params.set('q', search);
  }

  return apiRequest(`${endpoint}?${params.toString()}`, {
    signal,
  });
}

/**
 * Get one listing with seller and bid information.
 *
 * @param {string} id
 * @returns {Promise<object>}
 */
export function getListing(id) {
  return apiRequest(
    `/auction/listings/${encodeURIComponent(id)}?_seller=true&_bids=true`,
  );
}

/**
 * Create a new listing.
 *
 * @param {object} listing
 * @returns {Promise<object>}
 */
export function createListing(listing) {
  return apiRequest('/auction/listings', {
    method: 'POST',
    body: listing,
    auth: true,
  });
}

/**
 * Update an existing listing.
 *
 * @param {string} id
 * @param {object} listing
 * @returns {Promise<object>}
 */
export function updateListing(id, listing) {
  return apiRequest(`/auction/listings/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body: listing,
    auth: true,
  });
}

/**
 * Delete a listing.
 *
 * @param {string} id
 * @returns {Promise<null>}
 */
export function deleteListing(id) {
  return apiRequest(`/auction/listings/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    auth: true,
  });
}

/**
 * Place a bid on a listing.
 *
 * @param {string} id
 * @param {number} amount
 * @returns {Promise<object>}
 */
export function placeBid(id, amount) {
  return apiRequest(`/auction/listings/${encodeURIComponent(id)}/bids`, {
    method: 'POST',
    body: { amount },
    auth: true,
  });
}
