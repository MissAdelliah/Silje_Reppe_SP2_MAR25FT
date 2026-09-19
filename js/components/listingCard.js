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

/**
 * Creates the image area for a listing card.
 * Sswipe on touch devices and arrows/hover preview on desktop.
 *
 * @param {object} listing
 * @returns {HTMLElement}
 */
function createListingImage(listing) {
  const wrapper = createElement(
    'div',
    'relative aspect-[9/10] w-full touch-pan-y overflow-hidden rounded-[14px] bg-soft md:h-[200px] md:w-[180px] md:aspect-auto lg:h-[275px] lg:w-[220px] lg:rounded-none',
  );

  const media = (listing.media ?? []).filter((item) => item?.url?.trim());
  const listingUrl = `./listing.html?id=${encodeURIComponent(listing.id)}`;
  const imageLink = createElement('a', 'absolute inset-0 block');
  imageLink.href = listingUrl;
  imageLink.setAttribute('aria-label', `View ${listing.title || 'listing'}`);

  const image = document.createElement('img');
  image.loading = 'lazy';
  image.draggable = false;

  image.className =
    'h-full w-full object-cover opacity-100 transition-[opacity,transform] duration-300 group-hover:scale-[1.02]';

  const placeholder = createElement(
    'div',
    'absolute inset-0 flex items-center justify-center bg-soft text-muted',
  );

  placeholder.hidden = true;
  const placeholderIcon = createElement(
    'span',
    'material-symbols-outlined text-[30px]',
    'image',
  );

  placeholderIcon.setAttribute('aria-hidden', 'true');
  placeholder.append(placeholderIcon);

  imageLink.append(image, placeholder);
  wrapper.append(imageLink);

  let currentIndex = 0;
  let transitionTimer = null;
  let transitionId = 0;

  let previewDelay = null;
  let previewInterval = null;

  let touchStartX = 0;
  let touchStartY = 0;
  let didSwipe = false;
  let indicators = null;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  const desktopPointer = window.matchMedia(
    '(hover: hover) and (pointer: fine)',
  );

  function normaliseIndex(index) {
    if (!media.length) {
      return 0;
    }

    if (index < 0) {
      return media.length - 1;
    }

    if (index >= media.length) {
      return 0;
    }

    return index;
  }

  function updateIndicators() {
    if (!indicators) {
      return;
    }

    indicators
      .querySelectorAll('[data-image-indicator]')
      .forEach((indicator, index) => {
        const isActive = index === currentIndex;

        indicator.classList.toggle('w-6', isActive);
        indicator.classList.toggle('w-2', !isActive);
        indicator.classList.toggle('bg-white', isActive);
        indicator.classList.toggle('bg-white/70', !isActive);
      });
  }

  function applyImage(index) {
    const item = media[index];

    image.src = item.url;

    image.alt =
      item.alt || `${listing.title || 'Auction listing'} image ${index + 1}`;

    image.hidden = false;
    placeholder.hidden = true;
  }

  function showImage(index, { instant = false } = {}) {
    if (!media.length) {
      image.hidden = true;
      placeholder.hidden = false;

      return;
    }

    const nextIndex = normaliseIndex(index);

    if (nextIndex === currentIndex && !instant) {
      return;
    }

    clearTimeout(transitionTimer);

    const requestId = ++transitionId;

    if (instant || reducedMotion.matches) {
      currentIndex = nextIndex;

      applyImage(nextIndex);
      updateIndicators();

      image.classList.remove('opacity-0');

      return;
    }

    const preloader = new Image();

    preloader.onload = () => {
      if (requestId !== transitionId) {
        return;
      }

      image.classList.add('opacity-0');

      transitionTimer = window.setTimeout(() => {
        if (requestId !== transitionId) {
          return;
        }

        currentIndex = nextIndex;

        applyImage(nextIndex);
        updateIndicators();
        requestAnimationFrame(() => {
          image.classList.remove('opacity-0');
        });
      }, 150);
    };

    preloader.onerror = () => {
      image.classList.remove('opacity-0');
    };

    preloader.src = media[nextIndex].url;
  }

  function stopPreview() {
    clearTimeout(previewDelay);
    clearInterval(previewInterval);

    previewDelay = null;
    previewInterval = null;
  }

  function startPreview() {
    if (media.length < 2 || reducedMotion.matches || !desktopPointer.matches) {
      return;
    }

    stopPreview();

    previewDelay = window.setTimeout(() => {
      showImage(currentIndex + 1);

      previewInterval = window.setInterval(() => {
        showImage(currentIndex + 1);
      }, 1300);
    }, 700);
  }

  image.addEventListener('error', () => {
    image.hidden = true;
    placeholder.hidden = false;
  });

  if (media.length > 1) {
    // Image position indicators.
    indicators = createElement(
      'div',
      'pointer-events-none absolute bottom-3 left-1/2 z-20 flex -translate-x-1/2 items-center gap-1.5',
    );

    indicators.setAttribute('aria-hidden', 'true');

    media.forEach(() => {
      const indicator = createElement(
        'span',
        'h-2 w-2 rounded-full bg-white/70 shadow-sm transition-all duration-300',
      );

      indicator.dataset.imageIndicator = '';

      indicators.append(indicator);
    });

    wrapper.append(indicators);

    // Desktop previous arrow.
    const previousButton = createElement(
      'button',
      'absolute left-0 top-1/2 z-30 hidden size-11 -translate-y-1/2 items-center justify-center text-white opacity-0 drop-shadow-md transition-opacity duration-200 group-hover:opacity-100 group-focus-within:opacity-100 lg:flex',
    );

    previousButton.type = 'button';
    previousButton.setAttribute('aria-label', 'Previous image');

    const previousIcon = createElement(
      'span',
      'material-symbols-outlined text-[28px]',
      'chevron_left',
    );

    previousIcon.setAttribute('aria-hidden', 'true');
    previousButton.append(previousIcon);

    // Desktop next arrow.
    const nextButton = createElement(
      'button',
      'absolute right-0 top-1/2 z-30 hidden size-11 -translate-y-1/2 items-center justify-center text-white opacity-0 drop-shadow-md transition-opacity duration-200 group-hover:opacity-100 group-focus-within:opacity-100 lg:flex',
    );

    nextButton.type = 'button';
    nextButton.setAttribute('aria-label', 'Next image');

    const nextIcon = createElement(
      'span',
      'material-symbols-outlined text-[28px]',
      'chevron_right',
    );

    nextIcon.setAttribute('aria-hidden', 'true');

    nextButton.append(nextIcon);

    previousButton.addEventListener('click', () => {
      stopPreview();

      showImage(currentIndex - 1);
    });

    nextButton.addEventListener('click', () => {
      stopPreview();
      showImage(currentIndex + 1);
    });

    wrapper.append(previousButton, nextButton);

    // Mobile swipe.
    wrapper.addEventListener(
      'touchstart',
      (event) => {
        stopPreview();

        touchStartX = event.touches[0].clientX;
        touchStartY = event.touches[0].clientY;

        didSwipe = false;
      },
      {
        passive: true,
      },
    );

    wrapper.addEventListener(
      'touchend',
      (event) => {
        const touchEndX = event.changedTouches[0].clientX;
        const touchEndY = event.changedTouches[0].clientY;

        const distanceX = touchEndX - touchStartX;
        const distanceY = touchEndY - touchStartY;

        const isHorizontalSwipe =
          Math.abs(distanceX) > 40 && Math.abs(distanceX) > Math.abs(distanceY);

        if (!isHorizontalSwipe) {
          return;
        }

        didSwipe = true;

        if (distanceX < 0) {
          showImage(currentIndex + 1);
        } else {
          showImage(currentIndex - 1);
        }

        window.setTimeout(() => {
          didSwipe = false;
        }, 500);
      },
      {
        passive: true,
      },
    );

    // Prevent a completed swipe from also opening the listing.
    imageLink.addEventListener('click', (event) => {
      if (!didSwipe) {
        return;
      }

      event.preventDefault();

      didSwipe = false;
    });

    // Desktop hover preview.
    wrapper.addEventListener('pointerenter', () => {
      startPreview();
    });

    wrapper.addEventListener('pointerleave', () => {
      stopPreview();

      showImage(0);
    });
  }

  const status = getAuctionStatusDetails(listing.endsAt);
  const statusBadge = createElement(
    'div',
    'pointer-events-none absolute right-2 top-2 z-20 flex items-center gap-1.5 rounded-full bg-page/90 px-2 py-1 text-sm',
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

  showImage(0, {
    instant: true,
  });

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
 *
 * @param {object} listing
 * @returns {HTMLElement}
 */
export function createListingCard(listing) {
  const article = createElement(
    'article',
    'group flex h-full w-full min-w-0 flex-col',
  );

  article.append(createListingImage(listing));

  const contentLink = createElement('a', 'flex flex-1 flex-col pt-2.5');

  contentLink.href = `./listing.html?id=${encodeURIComponent(listing.id)}`;

  const heading = createElement(
    'h3',
    'w-full truncate font-sans text-base font-normal text-ink lg:text-xl',
    listing.title || 'Untitled listing',
  );

  contentLink.append(heading);

  const description = createElement(
    'p',
    'mt-1 hidden min-h-10 text-sm leading-5 text-muted lg:line-clamp-2',
    listing.description || '',
  );

  contentLink.append(description);
  contentLink.append(
    createMobileDetails(listing),
    createDesktopDetails(listing),
  );

  article.append(contentLink);

  return article;
}
