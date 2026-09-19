import { formatTimeLeft, getAuctionStatusDetails } from '../utils/dates.js';
import { getHighestBid } from '../utils/filters.js';

function createElement(tag, className = '', text = '') {
  const element = document.createElement(tag);
  element.className = className;

  if (text) {
    element.textContent = text;
  }

  return element;
}

function createListingImage(listing) {
  const wrapper = createElement(
    'div',
    'relative aspect-[9/10] w-full overflow-hidden rounded-[14px] bg-soft md:h-[200px] md:w-[180px] md:aspect-auto lg:h-[275px] lg:w-[220px] lg:rounded-none',
  );
  const media = listing.media?.[0];
  const image = document.createElement('img');

  image.src = media.url;
  image.alt = media.alt || listing.title || 'Auction listing';
  image.loading = 'lazy';
  image.className =
    'h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]';
  image.addEventListener('error', () => {
    article.remove();
  });

  wrapper.append(image);

  const status = getAuctionStatusDetails(listing.endsAt);
  const statusBadge = createElement(
    'div',
    'absolute top-2 right-2 flex items-center gap-1.5 rounded-full bg-page/90 px-2 py-1 text-sm',
  );

  statusBadge.dataset.statusEndsAt = listing.endsAt;
  const statusDot = createElement(
    'span',
    `size-2 rounded-full ${status.dotClass}`,
  );

  statusDot.dataset.statusDot = '';
  statusDot.setAttribute('aria-hidden', 'true');

  const statusText = createElement('span', '', status.label);
  statusText.dataset.statusText = '';
  statusBadge.append(statusDot, statusText);
  wrapper.append(statusBadge);
  return wrapper;
}

function createMobileDetails(listing) {
  const details = createElement('div', 'mt-auto space-y-1 pt-3 lg:hidden');
  const bidRow = createElement('div', 'flex items-center gap-1.5 text-sm');
  const bidIcon = createElement(
    'span',
    'material-symbols-outlined text-[16px]',
    'show_chart',
  );

  bidIcon.setAttribute('aria-hidden', 'true');

  const bidValue = createElement(
    'span',
    '',
    `${getHighestBid(listing.bids ?? [])} cr`,
  );

  bidRow.append(bidIcon, bidValue);

  const timeRow = createElement('div', 'flex items-center gap-1.5 text-sm');
  const timeIcon = createElement(
    'span',
    'material-symbols-outlined text-[18px]',
    'acute',
  );

  timeIcon.setAttribute('aria-hidden', 'true');

  const countdown = createElement(
    'span',
    'font-medium',
    formatTimeLeft(listing.endsAt),
  );

  countdown.dataset.countdown = listing.endsAt;
  timeRow.append(timeIcon, countdown);
  details.append(bidRow, timeRow);

  return details;
}

function createDesktopDetails(listing) {
  const details = createElement(
    'div',
    'mt-auto hidden grid-cols-2 gap-3 pt-3 lg:grid',
  );

  const bid = createElement('div');
  const bidLabel = createElement('p', 'text-sm text-muted', 'Highest bid');
  const bidRow = createElement('div', 'mt-1 flex items-center gap-1');
  const bidIcon = createElement(
    'span',
    'material-symbols-outlined text-[18px]',
    'show_chart',
  );

  bidIcon.setAttribute('aria-hidden', 'true');

  const bidValue = createElement(
    'span',
    'text-sm font-medium',
    `${getHighestBid(listing.bids ?? [])} cr`,
  );

  bidRow.append(bidIcon, bidValue);
  bid.append(bidLabel, bidRow);

  const time = createElement('div', 'text-right');
  const timeLabel = createElement('p', 'text-sm text-muted', 'Ends in');
  const timeRow = createElement(
    'div',
    'mt-1 flex items-center justify-end gap-1',
  );

  const timeIcon = createElement(
    'span',
    'material-symbols-outlined text-[16px]',
    'acute',
  );

  timeIcon.setAttribute('aria-hidden', 'true');

  const countdown = createElement(
    'span',
    'text-sm font-medium',
    formatTimeLeft(listing.endsAt),
  );

  countdown.dataset.countdown = listing.endsAt;
  timeRow.append(timeIcon, countdown);
  time.append(timeLabel, timeRow);
  details.append(bid, time);

  return details;
}

/**
 * reusable auction listing card.
 * @param {object} listing
 * @returns {HTMLElement}
 */
export function createListingCard(listing) {
  const article = createElement('article', 'group h-full w-full min-w-0');
  const link = createElement('a', 'flex h-full flex-col');

  link.href = `./listing.html?id=${encodeURIComponent(listing.id)}`;
  link.append(createListingImage(listing));

  const content = createElement('div', 'flex flex-1 flex-col pt-2.5');
  const heading = createElement(
    'h3',
    'w-full truncate font-sans text-base font-normal text-ink lg:text-xl',
    listing.title || 'Untitled listing',
  );

  content.append(heading);

  const description = createElement(
    'p',
    'mt-1 hidden min-h-10 text-sm leading-5 text-muted lg:line-clamp-2',
    listing.description || '',
  );

  content.append(description);
  content.append(createMobileDetails(listing), createDesktopDetails(listing));
  link.append(content);
  article.append(link);

  return article;
}
