import { getListings } from '../api/listings.js';
import { setupDrawer } from '../components/drawer.js';
import { initFooter } from '../components/footer.js';
import { initHeader } from '../components/header.js';
import { createListingCard } from '../components/listingCard.js';
import { formatTimeLeft, getAuctionStatusDetails } from '../utils/dates.js';
import {
  createEmptyFilters,
  formatFilterLabel,
  getAvailableFilters,
  getHighestBid,
  getSavedFilters,
  matchesFilters,
  primaryFilterGroups,
  saveFilters,
  secondaryFilterGroups,
} from '../utils/filters.js';

// DOM
const mobileSearchForm = document.querySelector('#search-form-mobile');
const mobileSearchInput = document.querySelector('#search-input-mobile');
const desktopSearchForm = document.querySelector('#search-form-desktop');
const desktopSearchInput = document.querySelector('#search-input-desktop');
const sortControls = document.querySelectorAll('[data-sort-control]');
const listingGrid = document.querySelector('#listing-grid');
const resultCount = document.querySelector('#result-count');
const loadingState = document.querySelector('#loading-state');
const errorState = document.querySelector('#error-state');
const emptyState = document.querySelector('#empty-state');
const filterButton = document.querySelector('#filter-button');
const activeFiltersMobile = document.querySelector('#active-filters-mobile');
const activeFiltersDesktop = document.querySelector('#active-filters-desktop');

// Mobile filter
const mobileFilterSheet = document.querySelector('#mobile-filter-sheet');
const mobileFilterBackdrop = document.querySelector('#mobile-filter-backdrop');
const mobileFilterForm = document.querySelector('#mobile-filter-form');
const mobileFilterOptions = document.querySelector('#mobile-filter-options');
const mobileFilterClose = document.querySelector('[data-mobile-filter-close]');

// Desktop filter
const desktopFilterPanel = document.querySelector('#desktop-filter-drawer');
const desktopFilterForm = document.querySelector('#desktop-filter-form');
const desktopFilterOptions = document.querySelector('#desktop-filter-options');
const desktopFilterClose = document.querySelector(
  '[data-desktop-filter-close]',
);

// State
const state = {
  listings: [],
  search: '',
  sort: 'default',
  filters: getSavedFilters(),
};

let requestController = null;
let searchTimer = null;

let mobileFilterController = null;
let desktopFilterController = null;

// Sort

const sortOptions = {
  default: {
    label: 'All',
    sort: 'created',
    sortOrder: 'desc',
    clientSort: null,
  },

  endingSoon: {
    label: 'Ending soon',
    sort: 'endsAt',
    sortOrder: 'asc',
    clientSort: null,
  },

  priceLow: {
    label: 'Price: low to high',
    sort: 'created',
    sortOrder: 'desc',
    clientSort: 'priceLow',
  },

  priceHigh: {
    label: 'Price: high to low',
    sort: 'created',
    sortOrder: 'desc',
    clientSort: 'priceHigh',
  },
};

// Filter UI

const filterDetails = {
  size: {
    label: 'Size',
    icon: 'straighten',
  },

  brand: {
    label: 'Brands',
    icon: 'sell',
  },

  color: {
    label: 'Color',
    icon: 'palette',
  },

  material: {
    label: 'Material',
    icon: 'texture',
  },

  gender: {
    label: 'Gender',
    icon: 'person',
  },

  condition: {
    label: 'State',
    icon: 'check_box',
  },
};

// Listings
function hasWorkingImage(listing) {
  return new Promise((resolve) => {
    const imageUrl = listing.media?.[0]?.url?.trim();

    if (!imageUrl) {
      resolve(false);
      return;
    }

    try {
      new URL(imageUrl);
    } catch {
      resolve(false);
      return;
    }

    const image = new Image();
    image.onload = () => resolve(true);
    image.onerror = () => resolve(false);
    image.src = imageUrl;
  });
}

function isCompleteListing(listing) {
  const hasTitle = Boolean(listing.title?.trim());
  const hasDescription = Boolean(listing.description?.trim());
  const hasImageUrl = Boolean(listing.media?.[0]?.url?.trim());
  const endDate = new Date(listing.endsAt);
  const hasValidEndTime = !Number.isNaN(endDate.getTime());

  return hasTitle && hasDescription && hasImageUrl && hasValidEndTime;
}

function getVisibleListings() {
  const listings = state.listings.filter((listing) => {
    return matchesFilters(listing, state.filters);
  });

  const clientSort = sortOptions[state.sort]?.clientSort;

  if (clientSort === 'priceLow') {
    return listings.sort((a, b) => {
      return getHighestBid(a.bids ?? []) - getHighestBid(b.bids ?? []);
    });
  }

  if (clientSort === 'priceHigh') {
    return listings.sort((a, b) => {
      return getHighestBid(b.bids ?? []) - getHighestBid(a.bids ?? []);
    });
  }

  return listings;
}

function renderListings() {
  if (!listingGrid || !resultCount || !emptyState) {
    return;
  }

  const listings = getVisibleListings();

  listingGrid.innerHTML = '';
  resultCount.textContent = `${listings.length} ${
    listings.length === 1 ? 'item' : 'items'
  }`;

  emptyState.hidden = listings.length > 0;
  listings.forEach((listing) => {
    listingGrid.append(createListingCard(listing));
  });

  updateTimeDisplays();
}

// Search

function syncSearchInputs(value) {
  [mobileSearchInput, desktopSearchInput].filter(Boolean).forEach((input) => {
    input.value = value;
  });
}

function handleSearch(value) {
  state.search = value.trim();

  syncSearchInputs(state.search);

  loadListings();
}

function setupSearch() {
  mobileSearchForm?.addEventListener('submit', (event) => {
    event.preventDefault();

    handleSearch(mobileSearchInput.value);
  });

  desktopSearchForm?.addEventListener('submit', (event) => {
    event.preventDefault();

    handleSearch(desktopSearchInput.value);
  });

  [mobileSearchInput, desktopSearchInput].filter(Boolean).forEach((input) => {
    input.addEventListener('input', () => {
      clearTimeout(searchTimer);

      searchTimer = window.setTimeout(() => {
        handleSearch(input.value);
      }, 400);
    });
  });
}

// Sort

function updateSortControls() {
  const currentSort = sortOptions[state.sort];

  if (!currentSort) return;

  sortControls.forEach((control) => {
    const label = control.querySelector('[data-sort-label]');
    const options = control.querySelectorAll('[data-sort]');

    if (label) {
      label.textContent = currentSort.label;
    }

    options.forEach((option) => {
      const selected = option.dataset.sort === state.sort;
      option.classList.toggle('font-semibold', selected);
      option.setAttribute('aria-pressed', String(selected));
    });
  });
}

function closeSortMenu(control) {
  const button = control.querySelector('[data-sort-toggle]');
  const menu = control.querySelector('[data-sort-menu]');
  const icon = control.querySelector('[data-sort-icon]');

  if (!button || !menu) return;

  button.setAttribute('aria-expanded', 'false');

  menu.classList.remove(
    'pointer-events-auto',
    'visible',
    'translate-y-0',
    'scale-100',
    'opacity-100',
  );

  menu.classList.add(
    'pointer-events-none',
    'invisible',
    'translate-y-1',
    'scale-[0.98]',
    'opacity-0',
  );

  icon?.classList.remove('rotate-180');
}

function closeSortMenus(exceptControl = null) {
  sortControls.forEach((control) => {
    if (control !== exceptControl) {
      closeSortMenu(control);
    }
  });
}

function openSortMenu(control) {
  const button = control.querySelector('[data-sort-toggle]');
  const menu = control.querySelector('[data-sort-menu]');
  const icon = control.querySelector('[data-sort-icon]');

  if (!button || !menu) return;

  closeSortMenus(control);

  button.setAttribute('aria-expanded', 'true');

  menu.classList.remove(
    'pointer-events-none',
    'invisible',
    'translate-y-1',
    'scale-[0.98]',
    'opacity-0',
  );

  menu.classList.add(
    'pointer-events-auto',
    'visible',
    'translate-y-0',
    'scale-100',
    'opacity-100',
  );

  icon?.classList.add('rotate-180');
}

function toggleSortMenu(control) {
  const button = control.querySelector('[data-sort-toggle]');

  if (!button) return;

  const isOpen = button.getAttribute('aria-expanded') === 'true';

  if (isOpen) {
    closeSortMenu(control);
  } else {
    openSortMenu(control);
  }
}

function setupSort() {
  sortControls.forEach((control) => {
    const button = control.querySelector('[data-sort-toggle]');

    const menu = control.querySelector('[data-sort-menu]');

    button?.addEventListener('click', (event) => {
      event.stopPropagation();

      toggleSortMenu(control);
    });

    menu?.addEventListener('click', (event) => {
      const option = event.target.closest('[data-sort]');

      if (!option || !sortOptions[option.dataset.sort]) {
        return;
      }

      state.sort = option.dataset.sort;

      updateSortControls();
      closeSortMenu(control);
      loadListings();
    });
  });

  document.addEventListener('click', (event) => {
    if (!event.target.closest('[data-sort-control]')) {
      closeSortMenus();
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeSortMenus();
    }
  });
}

// Filter chips

function createFilterChip(group, value) {
  const button = document.createElement('button');

  button.type = 'button';
  button.dataset.removeFilter = value;
  button.dataset.filterGroup = group;

  button.className =
    group === 'category'
      ? 'inline-flex min-h-8 shrink-0 items-center gap-1.5 rounded-full bg-ink px-3 text-sm text-white'
      : 'inline-flex min-h-8 shrink-0 items-center gap-1.5 rounded-full border border-ink bg-page px-3 text-sm text-ink';

  button.setAttribute(
    'aria-label',
    `Remove ${formatFilterLabel(value)} filter`,
  );

  const text = document.createElement('span');
  text.textContent = formatFilterLabel(value);

  const close = document.createElement('span');
  close.className = 'material-symbols-outlined text-[18px] leading-none';
  close.textContent = 'close';
  close.setAttribute('aria-hidden', 'true');
  button.append(text, close);

  return button;
}

function createClearButton(section) {
  const button = document.createElement('button');

  button.type = 'button';
  button.dataset.clearFilterSection = section;
  button.className =
    'inline-flex min-h-8 shrink-0 items-center rounded-full border border-divider bg-page px-4 text-sm text-muted transition-colors duration-150 hover:border-ink hover:text-ink';
  button.textContent = 'Clear all';

  return button;
}

function createFilterRow(groups, section) {
  const row = document.createElement('div');

  row.className = 'scrollbar-hidden flex items-center gap-2 overflow-x-auto';

  let hasFilters = false;

  groups.forEach((group) => {
    state.filters[group].forEach((value) => {
      hasFilters = true;

      row.append(createFilterChip(group, value));
    });
  });

  if (!hasFilters) {
    return null;
  }

  row.append(createClearButton(section));

  return row;
}

function renderFilterChips(container) {
  if (!container) return;

  container.innerHTML = '';

  const primary = createFilterRow(primaryFilterGroups, 'primary');
  const secondary = createFilterRow(secondaryFilterGroups, 'secondary');

  if (!primary && !secondary) {
    container.hidden = true;
    return;
  }

  container.hidden = false;

  if (primary) {
    container.append(primary);
  }

  if (secondary) {
    container.append(secondary);
  }
}

function renderActiveFilters() {
  renderFilterChips(activeFiltersMobile);

  renderFilterChips(activeFiltersDesktop);
}

// Filter options

function createCheckbox(group, value) {
  const label = document.createElement('label');
  label.className = 'flex cursor-pointer items-center gap-3 py-1 text-sm';

  const input = document.createElement('input');
  input.type = 'checkbox';
  input.value = value;
  input.dataset.filterGroup = group;
  input.checked = state.filters[group]?.includes(value) ?? false;
  input.className = 'size-4 accent-ink';

  const text = document.createElement('span');
  text.textContent = formatFilterLabel(value);
  label.append(input, text);

  return label;
}

function createDetailsGroup({ label, icon, groups, available }) {
  const details = document.createElement('details');
  details.className = 'group border-b border-divider';

  const summary = document.createElement('summary');
  summary.className =
    'flex min-h-[58px] cursor-pointer list-none items-center justify-between px-5 text-sm';

  const left = document.createElement('span');
  left.className = 'flex items-center gap-4';

  const iconElement = document.createElement('span');
  iconElement.className = 'material-symbols-outlined text-[18px]';
  iconElement.textContent = icon;
  iconElement.setAttribute('aria-hidden', 'true');

  const title = document.createElement('span');
  title.textContent = label;

  const arrow = document.createElement('span');
  arrow.className =
    'material-symbols-outlined text-[18px] transition-transform duration-200 group-open:rotate-180';
  arrow.textContent = 'expand_more';
  arrow.setAttribute('aria-hidden', 'true');
  left.append(iconElement, title);
  summary.append(left, arrow);
  const content = document.createElement('div');
  content.className = 'space-y-2 px-5 pb-5 pl-14';
  let optionCount = 0;

  groups.forEach((group) => {
    available[group].forEach((value) => {
      optionCount += 1;

      content.append(createCheckbox(group, value));
    });
  });

  if (!optionCount) {
    const message = document.createElement('p');
    message.className = 'text-sm text-muted';
    message.textContent = 'No options available.';
    content.append(message);
  }

  details.append(summary, content);

  return details;
}

function renderFilterOptions(container) {
  if (!container) return;

  const available = getAvailableFilters(state.listings, state.filters);

  container.innerHTML = '';

  container.append(
    createDetailsGroup({
      label: 'Categories',
      icon: 'grid_view',
      groups: ['category', 'subcategory'],
      available,
    }),
  );

  secondaryFilterGroups.forEach((group) => {
    container.append(
      createDetailsGroup({
        label: filterDetails[group].label,
        icon: filterDetails[group].icon,
        groups: [group],
        available,
      }),
    );
  });
}

function renderFilterPanels() {
  renderFilterOptions(mobileFilterOptions);
  renderFilterOptions(desktopFilterOptions);
}

function readFilterForm(form) {
  const filters = createEmptyFilters();

  form.querySelectorAll('[data-filter-group]:checked').forEach((input) => {
    const group = input.dataset.filterGroup;

    if (filters[group]) {
      filters[group].push(input.value);
    }
  });

  return filters;
}

function applyFilters(filters) {
  state.filters = filters;

  saveFilters(filters);
  renderActiveFilters();
  renderFilterPanels();
  renderListings();
}

function removeFilter(group, value) {
  applyFilters({
    ...state.filters,

    [group]: state.filters[group].filter((item) => item !== value),
  });
}

function clearGroups(groups) {
  const filters = {
    ...state.filters,
  };

  groups.forEach((group) => {
    filters[group] = [];
  });

  applyFilters(filters);
}

function clearAllFilters() {
  applyFilters(createEmptyFilters());
}

// Filter drawers

function setupFilterDrawers() {
  if (mobileFilterSheet) {
    mobileFilterController = setupDrawer({
      trigger: filterButton,
      panel: mobileFilterSheet,
      backdrop: mobileFilterBackdrop,
      closeButtons: [mobileFilterClose],
      openClasses: ['translate-y-0'],
      closedClasses: ['translate-y-full'],
      bindTrigger: false,
    });
  }

  if (desktopFilterPanel) {
    desktopFilterController = setupDrawer({
      trigger: filterButton,
      panel: desktopFilterPanel,
      closeButtons: [desktopFilterClose],
      openClasses: ['translate-x-0'],
      closedClasses: ['translate-x-full'],
      lockScroll: false,
      bindTrigger: false,
    });
  }

  filterButton?.addEventListener('click', () => {
    renderFilterPanels();

    if (window.innerWidth >= 1024) {
      mobileFilterController?.close();
      desktopFilterController?.open();
    } else {
      desktopFilterController?.close();
      mobileFilterController?.open();
    }
  });
}

function setupFilterEvents() {
  mobileFilterForm?.addEventListener('submit', (event) => {
    event.preventDefault();
    applyFilters(readFilterForm(mobileFilterForm));
    mobileFilterController?.close();
  });

  desktopFilterForm?.addEventListener('submit', (event) => {
    event.preventDefault();

    applyFilters(readFilterForm(desktopFilterForm));

    desktopFilterController?.close();
  });

  document.querySelectorAll('[data-clear-all-filters]').forEach((button) => {
    button.addEventListener('click', clearAllFilters);
  });

  document.addEventListener('click', (event) => {
    const remove = event.target.closest('[data-remove-filter]');

    if (remove) {
      removeFilter(remove.dataset.filterGroup, remove.dataset.removeFilter);

      return;
    }

    const clear = event.target.closest('[data-clear-filter-section]');

    if (!clear) return;

    clearGroups(
      clear.dataset.clearFilterSection === 'primary'
        ? primaryFilterGroups
        : secondaryFilterGroups,
    );
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth >= 1024 && mobileFilterController?.isOpen()) {
      mobileFilterController.close();
    }

    if (window.innerWidth < 1024 && desktopFilterController?.isOpen()) {
      desktopFilterController.close();
    }

    closeSortMenus();
  });
}

// Time

function updateTimeDisplays() {
  document.querySelectorAll('[data-countdown]').forEach((element) => {
    element.textContent = formatTimeLeft(element.dataset.countdown);
  });

  document.querySelectorAll('[data-status-ends-at]').forEach((element) => {
    const dot = element.querySelector('[data-status-dot]');

    const text = element.querySelector('[data-status-text]');

    if (!dot || !text) {
      return;
    }

    const details = getAuctionStatusDetails(element.dataset.statusEndsAt);

    dot.classList.remove('bg-open', 'bg-ending', 'bg-muted');
    dot.classList.add(details.dotClass);

    text.textContent = details.label;
  });
}

// API

async function loadListings() {
  requestController?.abort();

  const controller = new AbortController();
  requestController = controller;

  loadingState.hidden = false;
  errorState.hidden = true;
  emptyState.hidden = true;

  const sort = sortOptions[state.sort] ?? sortOptions.default;

  try {
    const listings = await getListings({
      search: state.search,
      sort: sort.sort,
      sortOrder: sort.sortOrder,
      signal: controller.signal,
    });

    if (requestController !== controller) {
      return;
    }

    // remove listings missing required data
    const completeListings = Array.isArray(listings)
      ? listings.filter(isCompleteListing)
      : [];

    // check that each image loads
    const checkedListings = await Promise.all(
      completeListings.map(async (listing) => {
        const imageWorks = await hasWorkingImage(listing);

        return imageWorks ? listing : null;
      }),
    );

    if (requestController !== controller) {
      return;
    }

    // Keep only listings with working images.
    state.listings = checkedListings.filter(Boolean);

    renderListings();
    renderFilterPanels();
    renderActiveFilters();
  } catch (error) {
    if (error.name === 'AbortError') {
      return;
    }

    if (requestController !== controller) {
      return;
    }

    console.error('Could not load listings:', error);

    listingGrid.innerHTML = '';
    errorState.hidden = false;
  } finally {
    if (requestController === controller) {
      loadingState.hidden = true;
    }
  }
}

// Init

async function init() {
  initFooter();
  initHeader();
  setupSearch();
  setupSort();
  setupFilterDrawers();
  setupFilterEvents();
  updateSortControls();
  renderActiveFilters();

  await loadListings();

  window.setInterval(updateTimeDisplays, 30_000);
}

init();
