import { apiRequest } from './request.js';

// Listings

/**
 * Get active auction listings.
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
