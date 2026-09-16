import { getProfile } from '../api/profiles.js';
import { clearUser, getUser } from '../utils/storage.js';

// DOM

const authElements = document.querySelectorAll('[data-auth-only]');
const guestElements = document.querySelectorAll('[data-guest-only]');
const creditElements = document.querySelectorAll('[data-credit]');
const avatarElements = document.querySelectorAll('[data-profile-avatar]');
const initialElements = document.querySelectorAll('[data-profile-initial]');
const nameElements = document.querySelectorAll('[data-profile-name]');
const logoutButtons = document.querySelectorAll('[data-logout]');

// Mobile menu

const menuButton = document.querySelector('#menu-button');
const mobileMenu = document.querySelector('#mobile-menu');
const menuBackdrop = document.querySelector('#menu-backdrop');
const menuClose = document.querySelector('[data-menu-close]');

// Authentication state

function showGuestHeader() {
  authElements.forEach((element) => {
    element.hidden = true;
  });

  guestElements.forEach((element) => {
    element.hidden = false;
  });
}

function showAuthenticatedHeader() {
  guestElements.forEach((element) => {
    element.hidden = true;
  });

  authElements.forEach((element) => {
    element.hidden = false;
  });
}

// Profile UI

function getProfileInitial(name) {
  if (!name) {
    return 'S';
  }

  return name.charAt(0).toUpperCase();
}

function updateCredits(credits) {
  creditElements.forEach((element) => {
    element.textContent = `${credits ?? 0} cr`;
  });
}

function updateNames(name) {
  nameElements.forEach((element) => {
    element.textContent = name || 'Profile';
  });

  initialElements.forEach((element) => {
    element.textContent = getProfileInitial(name);
  });
}

function updateAvatars(avatar, name) {
  const avatarUrl = avatar?.url;

  avatarElements.forEach((image) => {
    if (!avatarUrl) {
      image.hidden = true;

      return;
    }

    image.src = avatarUrl;
    image.alt = avatar?.alt || `${name}'s profile picture`;
    image.hidden = false;
  });

  initialElements.forEach((initial) => {
    initial.hidden = Boolean(avatarUrl);
  });
}

function updateProfileUI(profile) {
  if (!profile) {
    return;
  }

  updateCredits(profile.credits);
  updateNames(profile.name);
  updateAvatars(profile.avatar, profile.name);
}

// Mobile menu

function openMenu() {
  if (!mobileMenu || !menuBackdrop) {
    return;
  }

  mobileMenu.inert = false;
  mobileMenu.setAttribute('aria-hidden', 'false');
  menuButton?.setAttribute('aria-expanded', 'true');
  menuBackdrop.hidden = false;

  requestAnimationFrame(() => {
    mobileMenu.classList.remove('translate-x-full');
    mobileMenu.classList.add('translate-x-0');
    menuBackdrop.classList.remove('opacity-0');
    menuBackdrop.classList.add('opacity-100');
  });

  document.body.classList.add('overflow-hidden');

  menuClose?.focus();
}

function closeMenu() {
  if (!mobileMenu || !menuBackdrop) {
    return;
  }

  mobileMenu.classList.remove('translate-x-0');
  mobileMenu.classList.add('translate-x-full');
  menuBackdrop.classList.remove('opacity-100');
  menuBackdrop.classList.add('opacity-0');
  mobileMenu.setAttribute('aria-hidden', 'true');
  mobileMenu.inert = true;
  menuButton?.setAttribute('aria-expanded', 'false');
  document.body.classList.remove('overflow-hidden');

  window.setTimeout(() => {
    menuBackdrop.hidden = true;
  }, 300);
}

// Logout

function handleLogout() {
  clearUser();

  window.location.assign('./index.html');
}

// Events

function setupHeaderEvents() {
  menuButton?.addEventListener('click', openMenu);

  menuClose?.addEventListener('click', closeMenu);

  menuBackdrop?.addEventListener('click', closeMenu);

  logoutButtons.forEach((button) => {
    button.addEventListener('click', handleLogout);
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeMenu();
    }
  });
}

// Init

export async function initHeader() {
  setupHeaderEvents();

  const user = getUser();

  if (!user || !user.accessToken) {
    showGuestHeader();

    return;
  }

  showAuthenticatedHeader();

  // Show stored user information immediately.
  updateNames(user.name);

  try {
    const profile = await getProfile(user.name);

    updateProfileUI(profile);
  } catch (error) {
    console.error('Could not load profile:', error);
  }
}
