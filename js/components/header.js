import { logoutUser } from '../api/auth.js';

import { getProfile } from '../api/profiles.js';

import { getUser } from '../utils/storage.js';

// DOM

const menuButton = document.querySelector('#menu-button');

const mobileMenu = document.querySelector('#mobile-menu');

const menuBackdrop = document.querySelector('#menu-backdrop');

const menuCloseButton = document.querySelector('[data-menu-close]');

// State

let previousFocus = null;

// Auth

function setAuthVisibility(isLoggedIn) {
  document.querySelectorAll('[data-auth-only]').forEach((element) => {
    element.hidden = !isLoggedIn;
  });

  document.querySelectorAll('[data-guest-only]').forEach((element) => {
    element.hidden = isLoggedIn;
  });

  document.body.classList.toggle('pb-20', isLoggedIn);
}

function updateCredits(credits) {
  const formatted = Number(credits ?? 0).toLocaleString('nb-NO');

  document.querySelectorAll('[data-credit]').forEach((element) => {
    element.textContent = `${formatted} cr`;
  });
}

function updateProfile(profile) {
  const initial = profile?.name?.charAt(0)?.toUpperCase() || 'S';

  document.querySelectorAll('[data-profile-name]').forEach((element) => {
    element.textContent = profile.name;
  });

  document.querySelectorAll('[data-profile-initial]').forEach((element) => {
    element.textContent = initial;
  });

  if (!profile.avatar?.url) {
    return;
  }

  document.querySelectorAll('[data-profile-avatar]').forEach((image) => {
    image.src = profile.avatar.url;

    image.alt = profile.avatar.alt || `${profile.name}'s profile image`;

    image.hidden = false;

    const fallback = image.parentElement.querySelector(
      '[data-profile-initial]',
    );

    if (fallback) {
      fallback.hidden = true;
    }
  });
}

// Menu

function openMenu() {
  previousFocus = document.activeElement;

  mobileMenu.inert = false;

  mobileMenu.setAttribute('aria-hidden', 'false');

  menuButton.setAttribute('aria-expanded', 'true');

  menuBackdrop.hidden = false;

  requestAnimationFrame(() => {
    mobileMenu.classList.remove('translate-x-full');

    mobileMenu.classList.add('translate-x-0');

    menuBackdrop.classList.remove('opacity-0');

    menuBackdrop.classList.add('opacity-100');
  });

  document.body.classList.add('overflow-hidden');

  menuCloseButton.focus();
}

function closeMenu() {
  if (mobileMenu.getAttribute('aria-hidden') === 'true') {
    return;
  }

  previousFocus?.focus();

  mobileMenu.classList.remove('translate-x-0');

  mobileMenu.classList.add('translate-x-full');

  menuBackdrop.classList.remove('opacity-100');

  menuBackdrop.classList.add('opacity-0');

  menuButton.setAttribute('aria-expanded', 'false');

  mobileMenu.inert = true;

  mobileMenu.setAttribute('aria-hidden', 'true');

  document.body.classList.remove('overflow-hidden');

  window.setTimeout(() => {
    menuBackdrop.hidden = true;
  }, 300);
}

function setupMenu() {
  menuButton.addEventListener('click', openMenu);

  menuCloseButton.addEventListener('click', closeMenu);

  menuBackdrop.addEventListener('click', closeMenu);

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeMenu();
    }
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth >= 1024) {
      closeMenu();
    }
  });
}

// Logout

function setupLogout() {
  document.querySelectorAll('[data-logout]').forEach((button) => {
    button.addEventListener('click', () => {
      logoutUser();

      window.location.href = './index.html';
    });
  });
}

/**
 * Initialise shared header.
 */
export async function initHeader() {
  const user = getUser();

  const isLoggedIn = Boolean(user?.accessToken);

  setAuthVisibility(isLoggedIn);

  setupMenu();
  setupLogout();

  if (!isLoggedIn) {
    return;
  }

  updateProfile(user);

  try {
    const profile = await getProfile(user.name);

    updateProfile(profile);

    updateCredits(profile.credits);
  } catch (error) {
    console.error('Could not load profile:', error);
  }
}
