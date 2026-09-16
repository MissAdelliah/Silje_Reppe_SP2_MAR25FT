import { formatTimeLeft, getAuctionStatus } from '../utils/dates.js';

import { getHighestBid } from '../utils/filters.js';

// Helpers

function createElement(tag, className = '', text = '') {
  const element = document.createElement(tag);

  if (className) {
    element.className = className;
  }

  if (text) {
    element.textContent = text;
  }

  return element;
}

function getStatusDetails(endsAt) {
  const status = getAuctionStatus(endsAt);

  if (status === 'ending') {
    return {
      label: 'Ending soon',
      color: 'bg-ending',
    };
  }

  if (status === 'ended') {
    return {
      label: 'Ended',
      color: 'bg-muted',
    };
  }

  return {
    label: 'Open',
    color: 'bg-open',
  };
}

/**
 * Create an auction listing card.
 * @param {object} listing
 * @returns {HTMLElement}
 */
export function createListingCard(listing) {
  const article = createElement(
    'article',
    'group w-full min-w-0 max-w-[180px] lg:max-w-[220px]',
  );

  const listingUrl = `./listing.html?id=${encodeURIComponent(listing.id)}`;

  // Image

  const imageLink = createElement(
    'a',
    'relative block aspect-[9/10] w-full overflow-hidden rounded-[14px] bg-soft lg:aspect-auto lg:h-[275px]',
  );

  imageLink.href = listingUrl;

  const media = listing.media ?? [];

  if (media[0]?.url) {
    const image = createElement(
      'img',
      'h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]',
    );

    image.src = media[0].url;

    image.alt = media[0].alt || listing.title || 'Auction listing';

    image.loading = 'lazy';

    imageLink.append(image);
  } else {
    const placeholder = createElement(
      'div',
      'flex h-full items-center justify-center text-sm text-muted',
      'No image',
    );

    imageLink.append(placeholder);
  }

  // Desktop status

  const status = getStatusDetails(listing.endsAt);

  const statusBadge = createElement(
    'div',
    'absolute top-3 right-3 hidden items-center gap-2 rounded-full bg-page/95 px-3 py-1.5 text-xs lg:flex',
  );

  statusBadge.dataset.statusEndsAt = listing.endsAt;

  const statusDot = createElement(
    'span',
    `size-2 rounded-full ${status.color}`,
  );

  statusDot.dataset.statusDot = '';

  const statusText = createElement('span', '', status.label);

  statusText.dataset.statusText = '';

  statusBadge.append(statusDot, statusText);

  imageLink.append(statusBadge);

  // Gallery dots

  if (media.length > 1) {
    const dots = createElement(
      'div',
      'absolute bottom-2 left-1/2 flex -translate-x-1/2 items-center gap-1',
    );

    media.slice(0, 3).forEach((_, index) => {
      const dot = createElement(
        'span',
        index === 0
          ? 'h-[7px] w-[20px] rounded-full bg-page'
          : 'size-[7px] rounded-full bg-page/60',
      );

      dots.append(dot);
    });

    imageLink.append(dots);
  }

  // Content

  const content = createElement('div', 'pt-[8px]');

  const title = createElement(
    'a',
    'block truncate text-[16px] font-normal leading-[1.35] hover:underline lg:text-base',
    listing.title || 'Untitled listing',
  );

  title.href = listingUrl;

  const highestBid = getHighestBid(listing.bids ?? []);

  const details = createElement(
    'div',
    'mt-[5px] space-y-[4px] lg:grid lg:grid-cols-2 lg:gap-3 lg:space-y-0',
  );

  // Bid

  const bid = createElement('div');

  const bidLabel = createElement(
    'p',
    'hidden text-xs text-muted lg:block',
    'Highest bid',
  );

  const bidValue = createElement(
    'p',
    'flex items-center gap-[4px] text-[14px]',
  );

  const bidIcon = createElement(
    'span',
    'material-symbols-outlined text-[16px] leading-none',
    'show_chart',
  );

  bidIcon.setAttribute('aria-hidden', 'true');

  const bidText = createElement(
    'span',
    '',
    highestBid === 0 ? 'No bids' : `${highestBid.toLocaleString('nb-NO')} cr`,
  );

  bidValue.append(bidIcon, bidText);

  bid.append(bidLabel, bidValue);

  // Countdown

  const time = createElement('div');

  const timeLabel = createElement(
    'p',
    'hidden text-xs text-muted lg:block',
    'Ends in',
  );

  const timeValue = createElement(
    'p',
    'flex items-center gap-[4px] text-[14px] font-semibold',
  );

  const timeIcon = createElement(
    'span',
    'material-symbols-outlined text-[16px] leading-none',
    'schedule',
  );

  timeIcon.setAttribute('aria-hidden', 'true');

  const countdown = createElement('span', '', formatTimeLeft(listing.endsAt));
  countdown.dataset.countdown = listing.endsAt;
  timeValue.append(timeIcon, countdown);
  time.append(timeLabel, timeValue);
  details.append(bid, time);
  content.append(title, details);
  article.append(imageLink, content);
  return article;
}
