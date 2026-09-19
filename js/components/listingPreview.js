import { formatTimeLeft } from '../utils/dates.js';
import { getHighestBid } from '../utils/filters.js';

function createElement(tag, className = '', text = '') {
  const element = document.createElement(tag);
  element.className = className;

  if (text) {
    element.textContent = text;
  }

  return element;
}

function getTagValue(tags = [], prefix) {
  const tag = tags.find((item) => item.toLowerCase().startsWith(`${prefix}:`));

  if (!tag) {
    return '';
  }

  return tag.slice(prefix.length + 1);
}

function formatTag(value = '') {
  return value
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function renderTags(container, listing) {
  container.replaceChildren();

  const values = [
    getTagValue(listing.tags, 'size'),
    getTagValue(listing.tags, 'color'),
    getTagValue(listing.tags, 'condition'),
    getTagValue(listing.tags, 'material'),
    getTagValue(listing.tags, 'category'),
  ].filter(Boolean);

  container.hidden = values.length === 0;

  values.forEach((value) => {
    const tag = createElement(
      'span',
      'rounded-md bg-soft px-2.5 py-1 text-xs',
      formatTag(value),
    );

    container.append(tag);
  });
}

function renderAuctionDetails(container, listing) {
  const parent = container.parentElement;

  let details = parent.querySelector('[data-preview-auction-details]');

  if (!details) {
    details = createElement(
      'div',
      'mt-7 flex items-center justify-between border-t border-divider pt-5',
    );

    details.dataset.previewAuctionDetails = '';

    const bidSection = createElement('div');
    bidSection.append(createElement('p', 'text-xs text-muted', 'Highest bid'));

    const highestBid = createElement('p', 'mt-1 text-sm font-medium');

    highestBid.dataset.previewHighestBid = '';
    bidSection.append(highestBid);

    const timeSection = createElement('div', 'text-right');
    timeSection.append(createElement('p', 'text-xs text-muted', 'Ends in'));

    const timeRow = createElement(
      'div',
      'mt-1 flex items-center justify-end gap-1',
    );

    const icon = createElement(
      'span',
      'material-symbols-outlined text-[15px]',
      'schedule',
    );

    icon.setAttribute('aria-hidden', 'true');

    const time = createElement('p', 'text-sm font-medium');
    time.dataset.previewEndsAt = '';
    timeRow.append(icon, time);
    timeSection.append(timeRow);
    details.append(bidSection, timeSection);
    container.after(details);
  }

  const highestBid = details.querySelector('[data-preview-highest-bid]');
  const endsAt = details.querySelector('[data-preview-ends-at]');

  highestBid.textContent = `${getHighestBid(listing.bids ?? [])} cr`;

  endsAt.textContent = listing.endsAt
    ? formatTimeLeft(listing.endsAt)
    : 'Not set';
}

/**
 * Render a reusable listing-page style preview.
 *
 * @param {object} listing
 * @param {object} elements
 * @param {HTMLImageElement} elements.image
 * @param {HTMLElement} elements.brand
 * @param {HTMLElement} elements.title
 * @param {HTMLElement} elements.description
 * @param {HTMLElement} elements.tags
 */
export function renderListingPreview(
  listing,
  { image, brand, title, description, tags },
) {
  const media = (listing.media ?? []).filter((item) => item?.url?.trim());

  const firstImage = media[0];

  if (firstImage) {
    image.src = firstImage.url;

    image.alt = firstImage.alt || `${listing.title || 'Listing'} preview`;

    image.hidden = false;

    image.onerror = () => {
      image.hidden = true;
    };
  } else {
    image.removeAttribute('src');
    image.alt = '';
    image.hidden = true;
  }

  brand.textContent = formatTag(getTagValue(listing.tags, 'brand'));
  title.textContent = listing.title || 'Untitled listing';
  description.textContent = listing.description || 'No description added.';

  renderTags(tags, listing);
  renderAuctionDetails(tags, listing);
}
