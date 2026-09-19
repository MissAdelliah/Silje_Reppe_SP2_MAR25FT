import { getListing, placeBid } from '../api/listings.js';
import { getProfile } from '../api/profiles.js';
import { initHeader, updateHeaderProfile } from '../components/header.js';
import { initFooter } from '../components/footer.js';
import { getUser, saveUser } from '../utils/storage.js';
import { formatTimeLeft } from '../utils/dates.js';
import { getHighestBid } from '../utils/filters.js';

let listing = null;
let currentUser = getUser();
let pendingBidAmount = null;

const loadingView = document.querySelector('#listing-loading');
const errorView = document.querySelector('#listing-error');
const errorMessage = document.querySelector('#listing-error-message');
const listingView = document.querySelector('#listing-view');

const pageTitle = document.querySelector('#listing-page-title');
const mainImage = document.querySelector('#listing-main-image');
const imagePlaceholder = document.querySelector('#listing-image-placeholder');

const thumbnails = document.querySelector('#listing-thumbnails');
const imageDots = document.querySelector('#listing-image-dots');

const brand = document.querySelector('#listing-brand');
const title = document.querySelector('#listing-title');
const description = document.querySelector('#listing-description');
const tags = document.querySelector('#listing-tags');

const highestBid = document.querySelector('#highest-bid');
const countdown = document.querySelector('#listing-countdown');
const sellerLink = document.querySelector('#seller-link');

const sellerAvatar = document.querySelector('#seller-avatar');
const sellerInitial = document.querySelector('#seller-initial');
const sellerName = document.querySelector('#seller-name');
const sellerBio = document.querySelector('#seller-bio');

const bidHistory = document.querySelector('#bid-history');
const bidHistoryEmpty = document.querySelector('#bid-history-empty');
const guestAction = document.querySelector('#guest-action');
const bidAction = document.querySelector('#bid-action');
const ownerAction = document.querySelector('#owner-action');
const endedMessage = document.querySelector('#ended-message');
const editListingLink = document.querySelector('#edit-listing-link');
const openBidFormButton = document.querySelector('#open-bid-form');
const bidForm = document.querySelector('#bid-form');
const bidAmountInput = document.querySelector('#bid-amount');
const bidHelp = document.querySelector('#bid-help');
const bidError = document.querySelector('#bid-error');
const cancelBidButton = document.querySelector('#cancel-bid');

const reviewDialog = document.querySelector('#bid-review-dialog');
const reviewBidAmount = document.querySelector('#review-bid-amount');
const reviewCurrentBid = document.querySelector('#review-current-bid');
const reviewCreditBalance = document.querySelector('#review-credit-balance');
const reviewCreditAfter = document.querySelector('#review-credit-after');
const reviewError = document.querySelector('#bid-review-error');
const backToBidButton = document.querySelector('#back-to-bid');
const confirmBidButton = document.querySelector('#confirm-bid');
const liveStatus = document.querySelector('#listing-live-status');

function getListingId() {
  return new URLSearchParams(window.location.search).get('id')?.trim() || '';
}

function isLoggedIn() {
  return Boolean(currentUser?.accessToken);
}

function isOwner() {
  return Boolean(
    currentUser?.name &&
    listing?.seller?.name &&
    currentUser.name.toLowerCase() === listing.seller.name.toLowerCase(),
  );
}

function isActive() {
  if (!listing?.endsAt) return false;

  return new Date(listing.endsAt).getTime() > Date.now();
}

function getInitial(name = '') {
  return name.trim().charAt(0).toUpperCase() || '?';
}

function getTagValue(prefix) {
  const tag = listing?.tags?.find((item) =>
    item.toLowerCase().startsWith(`${prefix}:`),
  );

  if (!tag) return '';

  return tag.slice(prefix.length + 1);
}

function formatTag(value = '') {
  return value
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function renderGallery() {
  thumbnails.replaceChildren();
  imageDots.replaceChildren();

  const media = listing.media ?? [];

  if (!media.length) {
    mainImage.hidden = true;
    imagePlaceholder.hidden = false;
    return;
  }

  function selectImage(index) {
    const item = media[index];

    mainImage.src = item.url;
    mainImage.alt = item.alt || listing.title || 'Auction listing';

    mainImage.hidden = false;
    imagePlaceholder.hidden = true;

    imageDots.querySelectorAll('[data-dot]').forEach((dot, dotIndex) => {
      dot.classList.toggle('bg-white', dotIndex === index);

      dot.classList.toggle('bg-white/50', dotIndex !== index);
    });
  }

  media.forEach((item, index) => {
    const thumbButton = document.createElement('button');

    thumbButton.type = 'button';
    thumbButton.className = 'size-[84px] shrink-0 overflow-hidden bg-soft';
    thumbButton.setAttribute('aria-label', `View image ${index + 1}`);

    const thumbImage = document.createElement('img');
    thumbImage.src = item.url;
    thumbImage.alt = item.alt || `${listing.title} image ${index + 1}`;
    thumbImage.className = 'h-full w-full object-cover';
    thumbButton.append(thumbImage);
    thumbButton.addEventListener('click', () => {
      selectImage(index);
    });

    thumbnails.append(thumbButton);

    const dot = document.createElement('span');

    dot.dataset.dot = '';
    dot.className = 'size-2 rounded-full bg-white/50';

    imageDots.append(dot);
  });

  selectImage(0);
}

function renderTags() {
  tags.replaceChildren();

  const values = [
    getTagValue('size'),
    getTagValue('color'),
    getTagValue('condition'),
    getTagValue('material'),
    getTagValue('category'),
  ].filter(Boolean);

  values.forEach((value) => {
    const tag = document.createElement('span');

    tag.className = 'rounded-md bg-soft px-2.5 py-1 text-xs';

    tag.textContent = formatTag(value);

    tags.append(tag);
  });
}

function renderSeller() {
  const seller = listing.seller;

  if (!seller) return;

  sellerName.textContent = seller.name;
  sellerBio.textContent = seller.bio?.trim() || 'View seller profile';
  sellerInitial.textContent = getInitial(seller.name);

  const avatarUrl = seller.avatar?.url?.trim();

  if (avatarUrl) {
    sellerAvatar.src = avatarUrl;

    sellerAvatar.alt = seller.avatar?.alt || `${seller.name} profile image`;

    sellerAvatar.hidden = false;
    sellerInitial.hidden = true;

    sellerAvatar.onerror = () => {
      sellerAvatar.hidden = true;
      sellerInitial.hidden = false;
    };
  } else {
    sellerAvatar.hidden = true;
    sellerInitial.hidden = false;
  }

  if (isLoggedIn()) {
    sellerLink.href = `./profile.html?name=${encodeURIComponent(seller.name)}`;
  } else {
    sellerLink.removeAttribute('href');
  }
}

function renderBidHistory() {
  bidHistory.replaceChildren();

  const bids = [...(listing.bids ?? [])].sort((a, b) => b.amount - a.amount);
  bidHistoryEmpty.hidden = bids.length > 0;
  bids.forEach((bid, index) => {
    const isHighest = index === 0;

    const item = document.createElement('li');
    item.className = 'flex items-center gap-3 py-3';

    const avatar = document.createElement('div');
    avatar.className =
      'flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-soft text-xs font-medium';

    const avatarUrl = bid.bidder?.avatar?.url?.trim();

    if (avatarUrl) {
      const image = document.createElement('img');

      image.src = avatarUrl;
      image.alt =
        bid.bidder?.avatar?.alt ||
        `${bid.bidder?.name ?? 'Bidder'} profile image`;

      image.className = 'h-full w-full object-cover';

      avatar.append(image);
    } else {
      avatar.textContent = getInitial(bid.bidder?.name);
    }

    const info = document.createElement('div');
    info.className = 'min-w-0 flex-1';

    const name = document.createElement('p');
    name.className = isHighest
      ? 'truncate text-sm font-medium text-brand'
      : 'truncate text-sm font-medium text-ink';

    name.textContent = bid.bidder?.name || 'Unknown bidder';

    const time = document.createElement('p');

    time.className = 'mt-0.5 text-xs text-muted';
    time.textContent = new Date(bid.created).toLocaleString();
    info.append(name, time);

    const amountWrapper = document.createElement('div');
    amountWrapper.className = 'flex shrink-0 items-center gap-1';

    if (isHighest) {
      const icon = document.createElement('span');

      icon.className = 'material-symbols-outlined text-[17px] text-brand';
      icon.textContent = 'show_chart';
      icon.setAttribute('aria-hidden', 'true');
      amountWrapper.append(icon);
    }

    const amount = document.createElement('p');

    amount.className = isHighest
      ? 'text-sm font-medium text-brand'
      : 'text-sm text-muted';

    amount.textContent = `${bid.amount} cr`;
    amountWrapper.append(amount);

    item.append(avatar, info, amountWrapper);
    bidHistory.append(item);
  });
}

function renderActionState() {
  guestAction.hidden = true;
  bidAction.hidden = true;
  ownerAction.hidden = true;
  endedMessage.hidden = true;

  if (!isActive()) {
    endedMessage.hidden = false;
    return;
  }

  if (!isLoggedIn()) {
    guestAction.hidden = false;
    return;
  }

  if (isOwner()) {
    ownerAction.hidden = false;

    editListingLink.href = `./edit.html?id=${encodeURIComponent(listing.id)}`;

    return;
  }

  bidAction.hidden = false;
  const currentHighest = getHighestBid(listing.bids ?? []);
  bidAmountInput.min = String(currentHighest + 1);
  bidHelp.textContent =
    `Current highest bid: ${currentHighest} cr · ` +
    `Wallet: ${currentUser?.credits ?? 0} cr`;
}

function renderListing() {
  pageTitle.textContent = listing.title || 'Listing';
  title.textContent = listing.title || 'Untitled listing';
  description.textContent = listing.description || 'No description added.';
  brand.textContent = formatTag(getTagValue('brand'));
  highestBid.textContent = `${getHighestBid(listing.bids ?? [])} cr`;
  countdown.textContent = formatTimeLeft(listing.endsAt);
  countdown.dataset.countdown = listing.endsAt;

  renderGallery();
  renderTags();
  renderSeller();
  renderBidHistory();
  renderActionState();

  document.title = `${listing.title || 'Listing'} | Second Story`;
}

function showError(message) {
  loadingView.hidden = true;
  listingView.hidden = true;

  errorMessage.textContent = message;
  errorView.hidden = false;
}

function validateBid(amount) {
  const currentHighest = getHighestBid(listing.bids ?? []);

  if (!Number.isInteger(amount) || amount <= 0) {
    return 'Enter a whole number greater than 0.';
  }

  if (amount <= currentHighest) {
    return `Your bid must be higher than ${currentHighest} cr.`;
  }

  if (!isActive()) {
    return 'This auction has ended.';
  }

  if (isOwner()) {
    return 'You cannot bid on your own listing.';
  }

  if (Number.isFinite(currentUser?.credits) && amount > currentUser.credits) {
    return 'You do not have enough credits for this bid.';
  }

  return '';
}

async function refreshCurrentUser() {
  if (!currentUser?.name) return;

  const profile = await getProfile(currentUser.name);

  currentUser = {
    ...currentUser,
    ...profile,
    accessToken: currentUser.accessToken,
  };

  saveUser(currentUser);
  updateHeaderProfile(profile);
}

async function loadListing() {
  const id = getListingId();

  if (!id) {
    showError('No listing ID was provided.');
    return;
  }

  try {
    listing = await getListing(id);

    renderListing();

    loadingView.hidden = true;
    errorView.hidden = true;
    listingView.hidden = false;
  } catch (error) {
    console.error(error);

    showError(
      error instanceof Error ? error.message : 'Could not load listing.',
    );
  }
}

openBidFormButton?.addEventListener('click', () => {
  bidForm.hidden = false;
  openBidFormButton.hidden = true;

  bidAmountInput.focus();
});

cancelBidButton?.addEventListener('click', () => {
  bidForm.hidden = true;
  openBidFormButton.hidden = false;
  bidError.hidden = true;
});

bidForm?.addEventListener('submit', (event) => {
  event.preventDefault();

  bidError.hidden = true;
  reviewError.hidden = true;

  const amount = Number(bidAmountInput.value);
  const error = validateBid(amount);

  if (error) {
    bidError.textContent = error;
    bidError.hidden = false;
    return;
  }

  pendingBidAmount = amount;

  const currentHighest = getHighestBid(listing.bids ?? []);
  const credits = currentUser?.credits ?? 0;

  reviewBidAmount.textContent = `${amount} cr`;
  reviewCurrentBid.textContent = `${currentHighest} cr`;
  reviewCreditBalance.textContent = `${credits} cr`;
  reviewCreditAfter.textContent = `${credits - amount} cr`;
  reviewDialog.showModal();
});

backToBidButton?.addEventListener('click', () => {
  reviewDialog.close();

  bidAmountInput.focus();
});

confirmBidButton?.addEventListener('click', async () => {
  if (!pendingBidAmount) return;

  reviewError.hidden = true;
  confirmBidButton.disabled = true;

  try {
    await placeBid(listing.id, pendingBidAmount);

    await refreshCurrentUser();

    await loadListing();

    reviewDialog.close();

    bidForm.hidden = true;
    openBidFormButton.hidden = false;

    bidAmountInput.value = '';
    pendingBidAmount = null;

    liveStatus.textContent =
      'Bid placed successfully. Wallet and bid history updated.';
  } catch (error) {
    reviewError.textContent =
      error instanceof Error ? error.message : 'Could not place bid.';

    reviewError.hidden = false;
  } finally {
    confirmBidButton.disabled = false;
  }
});

async function init() {
  initFooter();

  await initHeader();

  await loadListing();
}

init();
