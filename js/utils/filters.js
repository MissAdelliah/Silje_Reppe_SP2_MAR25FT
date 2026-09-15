// Filters

const FILTER_KEY = 'secondStoryFilters';

export const filterGroups = [
  'category',
  'subcategory',
  'size',
  'brand',
  'color',
  'material',
  'gender',
  'condition',
];

export const primaryFilterGroups = ['category', 'subcategory'];

export const secondaryFilterGroups = [
  'brand',
  'color',
  'size',
  'condition',
  'material',
  'gender',
];

const groupAliases = {
  categories: 'category',
  brands: 'brand',
  colour: 'color',
  colours: 'color',
  state: 'condition',
};

const labels = {
  'womens-fashion': 'Women’s fashion',

  'mens-fashion': 'Men’s fashion',

  'art-and-design': 'Art and design',
};

/**
 * Create empty filters.
 * @returns {object}
 */
export function createEmptyFilters() {
  return {
    category: [],
    subcategory: [],
    size: [],
    brand: [],
    color: [],
    material: [],
    gender: [],
    condition: [],
  };
}

/**
 * Convert value to tag format.
 * @param {string} value
 * @returns {string}
 */
export function normaliseFilterValue(value) {
  return value
    .trim()
    .toLowerCase()
    .replaceAll('&', 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Format filter label.
 * @param {string} value
 * @returns {string}
 */
export function formatFilterLabel(value) {
  if (labels[value]) {
    return labels[value];
  }

  return value
    .split('-')
    .map((word) => {
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ');
}

/**
 * Get highest bid.
 * @param {Array} bids
 * @returns {number}
 */
export function getHighestBid(bids = []) {
  if (!bids.length) {
    return 0;
  }

  return Math.max(...bids.map((bid) => Number(bid.amount)));
}

/**
 * Parse listing tags.
 * @param {object} listing
 * @returns {object}
 */
export function getListingFilters(listing) {
  const filters = createEmptyFilters();

  (listing.tags ?? []).forEach((tag) => {
    if (!tag || typeof tag !== 'string') {
      return;
    }

    const separator = tag.indexOf(':');

    if (separator === -1) {
      return;
    }

    let group = tag.slice(0, separator).trim().toLowerCase();

    group = groupAliases[group] ?? group;

    const value = normaliseFilterValue(tag.slice(separator + 1));

    if (!filterGroups.includes(group) || !value) {
      return;
    }

    filters[group].push(value);
  });

  return filters;
}

/**
 * Check listing against filters.
 * @param {object} listing
 * @param {object} filters
 * @returns {boolean}
 */
export function matchesFilters(listing, filters) {
  const listingFilters = getListingFilters(listing);

  return filterGroups.every((group) => {
    const selected = filters[group] ?? [];

    if (selected.length === 0) {
      return true;
    }

    return selected.some((value) => {
      return listingFilters[group].includes(value);
    });
  });
}

/**
 * Get filters available in listings.
 * @param {Array} listings
 * @param {object} selectedFilters
 * @returns {object}
 */
export function getAvailableFilters(
  listings,
  selectedFilters = createEmptyFilters(),
) {
  const options = {};

  filterGroups.forEach((group) => {
    options[group] = new Set(selectedFilters[group] ?? []);
  });

  listings.forEach((listing) => {
    const listingFilters = getListingFilters(listing);

    filterGroups.forEach((group) => {
      listingFilters[group].forEach((value) => {
        options[group].add(value);
      });
    });
  });

  return Object.fromEntries(
    Object.entries(options).map(([group, values]) => {
      return [group, [...values].sort()];
    }),
  );
}

/**
 * Save filters.
 * @param {object} filters
 */
export function saveFilters(filters) {
  localStorage.setItem(FILTER_KEY, JSON.stringify(filters));
}

/**
 * Get saved filters.
 * @returns {object}
 */
export function getSavedFilters() {
  const filters = createEmptyFilters();

  const stored = localStorage.getItem(FILTER_KEY);

  if (!stored) {
    return filters;
  }

  try {
    const saved = JSON.parse(stored);

    filterGroups.forEach((group) => {
      if (Array.isArray(saved[group])) {
        filters[group] = saved[group];
      }
    });

    return filters;
  } catch {
    return filters;
  }
}
