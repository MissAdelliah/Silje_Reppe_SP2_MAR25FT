import {
  getProfile,
  getProfileBids,
  getProfileListings,
  updateProfile,
} from '../api/profiles.js';

import { getListing } from '../api/listings.js';
import { initFooter } from '../components/footer.js';
import { initHeader, updateHeaderProfile } from '../components/header.js';
import { createListingCard } from '../components/listingCard.js';
import { getUser, saveUser } from '../utils/storage.js';

let currentUser = getUser();
let loadedProfile = null;
let bidsLoaded = false;

const guestView = document.querySelector('#profile-guest');
const loadingView = document.querySelector('#profile-loading');
const errorView = document.querySelector('#profile-error');
const errorMessage = document.querySelector('#profile-error-message');

const profileView = document.querySelector('#profile-view');
const profileName = document.querySelector('#profile-name');
const profileBio = document.querySelector('#profile-bio');

const profileBanner = document.querySelector('#profile-banner');
const profileBannerPlaceholder = document.querySelector(
  '#profile-banner-placeholder',
);

const profileAvatar = document.querySelector('#profile-avatar');
const profileAvatarPlaceholder = document.querySelector(
  '#profile-avatar-placeholder',
);

const editProfileButton = document.querySelector('#edit-profile-button');

const activeTab = document.querySelector('#active-tab');
const bidsTab = document.querySelector('#bids-tab');

const activePanel = document.querySelector('#active-panel');
const bidsPanel = document.querySelector('#bids-panel');

const activeLoading = document.querySelector('#active-loading');
const activeEmpty = document.querySelector('#active-empty');
const activeError = document.querySelector('#active-error');
const activeErrorMessage = document.querySelector('#active-error-message');
const activeListings = document.querySelector('#active-listings');

const bidsLoading = document.querySelector('#bids-loading');
const bidsEmpty = document.querySelector('#bids-empty');
const bidsEmptyMessage = document.querySelector('#bids-empty-message');
const bidsError = document.querySelector('#bids-error');
const bidsErrorMessage = document.querySelector('#bids-error-message');
const bidListings = document.querySelector('#bid-listings');

const editProfileView = document.querySelector('#edit-profile-view');
const editProfileTitle = document.querySelector('#edit-profile-title');
const editProfileForm = document.querySelector('#edit-profile-form');

const backToProfile = document.querySelector('#back-to-profile');
const cancelEditProfile = document.querySelector('#cancel-edit-profile');

const avatarUrlInput = document.querySelector('#avatar-url');
const bannerUrlInput = document.querySelector('#banner-url');
const bioInput = document.querySelector('#profile-bio-input');

const applyAvatarButton = document.querySelector('#apply-avatar');
const applyBannerButton = document.querySelector('#apply-banner');

const editAvatarPreview = document.querySelector('#edit-avatar-preview');
const editAvatarPlaceholder = document.querySelector(
  '#edit-avatar-placeholder',
);

const editBannerPreview = document.querySelector('#edit-banner-preview');
const editBannerPlaceholder = document.querySelector(
  '#edit-banner-placeholder',
);

const avatarError = document.querySelector('#avatar-error');
const bannerError = document.querySelector('#banner-error');

const bioCharacterCount = document.querySelector('#bio-character-count');
const editProfileError = document.querySelector('#edit-profile-error');
const saveProfileButton = document.querySelector('#save-profile-button');

/**
 * Get the profile name from the URL.
 * Defaults to the logged-in user's profile.
 *
 * @returns {string}
 */
function getProfileName() {
  const params = new URLSearchParams(window.location.search);

  return params.get('name')?.trim() || currentUser?.name || '';
}

/**
 * Check if the displayed profile belongs to the logged-in user.
 *
 * @param {string} name
 * @returns {boolean}
 */
function isOwnProfile(name) {
  return currentUser?.name?.toLowerCase() === name?.toLowerCase();
}

/**
 * Show controls that only belong on the user's own profile.
 *
 * @param {boolean} show
 */
function showOwnProfileControls(show) {
  document.querySelectorAll('[data-own-profile-only]').forEach((element) => {
    element.hidden = !show;
  });
}

/**
 * Show an image or its placeholder.
 *
 * @param {HTMLImageElement} image
 * @param {HTMLElement} placeholder
 * @param {object|null} media
 * @param {string} fallbackAlt
 */
function renderImage(image, placeholder, media, fallbackAlt) {
  const url = media?.url?.trim();

  if (!url) {
    image.hidden = true;
    placeholder.hidden = false;
    return;
  }

  image.src = url;
  image.alt = media.alt?.trim() || fallbackAlt;
  image.hidden = false;
  placeholder.hidden = true;

  image.onerror = () => {
    image.hidden = true;
    placeholder.hidden = false;
  };
}

/**
 * Render the main profile information.
 *
 * @param {object} profile
 */
function renderProfile(profile) {
  profileName.textContent = profile.name;

  profileBio.textContent =
    profile.bio?.trim() || 'This user has not added a bio yet.';

  renderImage(
    profileAvatar,
    profileAvatarPlaceholder,
    profile.avatar,
    `${profile.name} profile image`,
  );

  renderImage(
    profileBanner,
    profileBannerPlaceholder,
    profile.banner,
    `${profile.name} profile banner`,
  );

  document.title = `${profile.name} | Second Story`;
}

/**
 * Render listings with the same card component used on Home.
 *
 * @param {Array} listings
 * @param {HTMLElement} container
 */
function renderListings(listings, container) {
  container.replaceChildren();

  listings.forEach((listing) => {
    container.append(createListingCard(listing));
  });
}

/**
 * Load active listings created by a profile.
 *
 * @param {string} name
 */
async function loadActiveListings(name) {
  activeLoading.hidden = false;
  activeEmpty.hidden = true;
  activeError.hidden = true;
  activeListings.replaceChildren();

  try {
    const listings = await getProfileListings(name);

    activeLoading.hidden = true;

    if (!listings.length) {
      activeEmpty.hidden = false;
      return;
    }

    renderListings(listings, activeListings);
  } catch (error) {
    activeLoading.hidden = true;
    activeError.hidden = false;

    activeErrorMessage.textContent =
      error instanceof Error ? error.message : 'Something went wrong.';
  }
}

/**
 * Load listings the logged-in user has bid on.
 *
 * On the user's own profile, all bid listings are shown.
 * On another profile, only listings owned by that seller are shown.
 *
 * @param {string} profileName
 */
async function loadBidListings(profileName) {
  if (bidsLoaded) return;

  bidsLoading.hidden = false;
  bidsEmpty.hidden = true;
  bidsError.hidden = true;
  bidListings.replaceChildren();

  try {
    const bids = await getProfileBids(currentUser.name);

    const listingIds = [
      ...new Set(
        bids.map((bid) => bid.listing?.id || bid.listingId).filter(Boolean),
      ),
    ];

    if (!listingIds.length) {
      bidsLoading.hidden = true;
      bidsEmpty.hidden = false;
      bidsLoaded = true;
      return;
    }

    const listings = await Promise.all(listingIds.map((id) => getListing(id)));

    const ownProfile = isOwnProfile(profileName);

    const visibleListings = ownProfile
      ? listings
      : listings.filter(
          (listing) =>
            listing.seller?.name?.toLowerCase() === profileName.toLowerCase(),
        );

    bidsLoading.hidden = true;
    bidsLoaded = true;

    if (!visibleListings.length) {
      bidsEmpty.hidden = false;
      return;
    }

    renderListings(visibleListings, bidListings);
  } catch (error) {
    bidsLoading.hidden = true;
    bidsError.hidden = false;

    bidsErrorMessage.textContent =
      error instanceof Error ? error.message : 'Something went wrong.';
  }
}

/**
 * Switch between the Active and Bids tabs.
 *
 * @param {'active'|'bids'} tab
 */
function showTab(tab) {
  const showActive = tab === 'active';

  activePanel.hidden = !showActive;
  bidsPanel.hidden = showActive;

  activeTab.setAttribute('aria-selected', String(showActive));
  bidsTab.setAttribute('aria-selected', String(!showActive));

  activeTab.classList.toggle('border-ink', showActive);
  activeTab.classList.toggle('border-transparent', !showActive);

  bidsTab.classList.toggle('border-ink', !showActive);
  bidsTab.classList.toggle('border-transparent', showActive);

  if (!showActive && loadedProfile) {
    loadBidListings(loadedProfile.name);
  }
}

/**
 * Preview an image URL before saving.
 *
 * @param {HTMLInputElement} input
 * @param {HTMLImageElement} image
 * @param {HTMLElement} placeholder
 * @param {HTMLElement} errorElement
 * @param {string} alt
 */
function previewImage(input, image, placeholder, errorElement, alt) {
  const url = input.value.trim();

  errorElement.hidden = true;

  if (!url) {
    image.hidden = true;
    placeholder.hidden = false;
    return;
  }

  try {
    new URL(url);
  } catch {
    errorElement.textContent = 'Enter a valid image URL.';
    errorElement.hidden = false;
    return;
  }

  image.src = url;
  image.alt = alt;
  image.hidden = false;
  placeholder.hidden = true;

  image.onerror = () => {
    image.hidden = true;
    placeholder.hidden = false;

    errorElement.textContent = 'Could not load this image.';
    errorElement.hidden = false;
  };
}

function updateBioCount() {
  bioCharacterCount.textContent = `${bioInput.value.length}/150`;
}

function fillEditForm() {
  if (!loadedProfile) return;

  avatarUrlInput.value = loadedProfile.avatar?.url || '';
  bannerUrlInput.value = loadedProfile.banner?.url || '';
  bioInput.value = loadedProfile.bio || '';

  updateBioCount();

  previewImage(
    avatarUrlInput,
    editAvatarPreview,
    editAvatarPlaceholder,
    avatarError,
    'Profile image preview',
  );

  previewImage(
    bannerUrlInput,
    editBannerPreview,
    editBannerPlaceholder,
    bannerError,
    'Banner image preview',
  );
}

function openEditProfile() {
  fillEditForm();

  profileView.hidden = true;
  editProfileView.hidden = false;

  editProfileTitle.focus();

  window.scrollTo({
    top: 0,
    behavior: 'smooth',
  });
}

function closeEditProfile() {
  editProfileView.hidden = true;
  profileView.hidden = false;
}

/**
 * Save profile changes to Noroff.
 *
 * @param {SubmitEvent} event
 */
async function handleProfileUpdate(event) {
  event.preventDefault();

  if (!loadedProfile || !isOwnProfile(loadedProfile.name)) {
    return;
  }

  editProfileError.hidden = true;
  saveProfileButton.disabled = true;

  const avatarUrl = avatarUrlInput.value.trim();
  const bannerUrl = bannerUrlInput.value.trim();

  const profile = {
    bio: bioInput.value.trim(),
  };

  if (avatarUrl) {
    profile.avatar = {
      url: avatarUrl,
      alt: `${loadedProfile.name} profile image`,
    };
  }

  if (bannerUrl) {
    profile.banner = {
      url: bannerUrl,
      alt: `${loadedProfile.name} profile banner`,
    };
  }

  try {
    const updatedProfile = await updateProfile(loadedProfile.name, profile);

    loadedProfile = updatedProfile;

    currentUser = {
      ...currentUser,
      ...updatedProfile,
      accessToken: currentUser.accessToken,
    };

    saveUser(currentUser);

    renderProfile(updatedProfile);
    updateHeaderProfile(updatedProfile);

    closeEditProfile();
  } catch (error) {
    editProfileError.textContent =
      error instanceof Error ? error.message : 'Could not update profile.';

    editProfileError.hidden = false;
  } finally {
    saveProfileButton.disabled = false;
  }
}

/**
 * Initialise the profile page.
 */
async function initProfile() {
  await initHeader();
  initFooter();

  if (!currentUser?.accessToken) {
    loadingView.hidden = true;
    guestView.hidden = false;
    return;
  }

  const name = getProfileName();

  try {
    const profile = await getProfile(name);

    loadedProfile = profile;

    const ownProfile = isOwnProfile(profile.name);

    renderProfile(profile);
    showOwnProfileControls(ownProfile);

    /*
     * The bid tab is available on all logged-in profiles.
     * Its meaning changes depending on whose profile is open.
     */
    bidsTab.hidden = false;

    bidsTab.textContent = ownProfile ? 'Bids' : 'My bids';

    bidsEmptyMessage.textContent = ownProfile
      ? 'Listings you have bid on will appear here.'
      : `You have not bid on ${profile.name}'s listings yet.`;

    loadingView.hidden = true;
    profileView.hidden = false;

    await loadActiveListings(profile.name);

    const requestedTab = new URLSearchParams(window.location.search).get('tab');

    if (requestedTab === 'bids') {
      showTab('bids');
    }
  } catch (error) {
    loadingView.hidden = true;
    errorView.hidden = false;

    errorMessage.textContent =
      error instanceof Error ? error.message : 'Something went wrong.';
  }
}

activeTab.addEventListener('click', () => {
  showTab('active');
});

bidsTab.addEventListener('click', () => {
  showTab('bids');
});

editProfileButton.addEventListener('click', openEditProfile);

backToProfile.addEventListener('click', closeEditProfile);
cancelEditProfile.addEventListener('click', closeEditProfile);

applyAvatarButton.addEventListener('click', () => {
  previewImage(
    avatarUrlInput,
    editAvatarPreview,
    editAvatarPlaceholder,
    avatarError,
    'Profile image preview',
  );
});

applyBannerButton.addEventListener('click', () => {
  previewImage(
    bannerUrlInput,
    editBannerPreview,
    editBannerPlaceholder,
    bannerError,
    'Banner image preview',
  );
});

bioInput.addEventListener('input', updateBioCount);
editProfileForm.addEventListener('submit', handleProfileUpdate);

initProfile();
