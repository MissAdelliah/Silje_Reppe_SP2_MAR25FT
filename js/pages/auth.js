import { loginUser, registerUser } from '../api/auth.js';

import {
  validateEmail,
  validateName,
  validatePassword,
} from '../utils/validation.js';

// DOM

const form = document.querySelector('#auth-form');
const loginTab = document.querySelector('#login-tab');
const registerTab = document.querySelector('#register-tab');
const nameGroup = document.querySelector('#name-group');
const nameInput = document.querySelector('#name');
const emailGroup = document.querySelector('#email-group');
const emailInput = document.querySelector('#email');
const passwordInput = document.querySelector('#password');
const passwordToggle = document.querySelector('#password-toggle');
const passwordIcon = document.querySelector('#password-icon');
const passwordStatus = document.querySelector('#password-status');
const description = document.querySelector('#auth-description');
const formError = document.querySelector('#form-error');
const submitButton = document.querySelector('#submit-button');
const submitText = document.querySelector('#submit-text');
const submitSpinner = document.querySelector('#submit-spinner');

// Mobile navigation

const menuButton = document.querySelector('#auth-menu-button');
const menu = document.querySelector('#auth-mobile-menu');
const menuClose = document.querySelector('#auth-menu-close');
const menuBackdrop = document.querySelector('#auth-menu-backdrop');

// State

let authMode = 'login';
let isSubmitting = false;

// Helpers

function getInitialMode() {
  const params = new URLSearchParams(window.location.search);

  return params.get('mode') === 'register' ? 'register' : 'login';
}

function getFieldError(input) {
  if (!input) {
    return null;
  }

  return document.querySelector(`#${input.id}-error`);
}

function clearFieldError(input) {
  if (!input) {
    return;
  }

  const error = getFieldError(input);
  input.classList.remove('border-brand');
  input.classList.add('border-border');
  input.removeAttribute('aria-invalid');

  if (error) {
    error.textContent = '';
    error.hidden = true;
  }
}

function showFieldError(input, message) {
  if (!input) {
    return;
  }

  const error = getFieldError(input);
  input.classList.remove('border-border');
  input.classList.add('border-brand');
  input.setAttribute('aria-invalid', 'true');

  if (error) {
    error.textContent = message;
    error.hidden = false;
  }
}

function clearFormError() {
  formError.textContent = '';
  formError.hidden = true;
}

function showFormError(message) {
  formError.textContent = message;
  formError.hidden = false;
}

function clearErrors() {
  clearFieldError(nameInput);
  clearFieldError(emailInput);
  clearFieldError(passwordInput);
  clearFormError();
}

// Auth mode

function setTabState(tab, isActive) {
  tab.setAttribute('aria-selected', String(isActive));
  tab.classList.toggle('text-brand', isActive);
  tab.classList.toggle('text-muted', !isActive);
  tab.classList.toggle('border-ink', isActive);
  tab.classList.toggle('border-transparent', !isActive);
}

function setAuthMode(mode) {
  authMode = mode === 'register' ? 'register' : 'login';

  const isRegister = authMode === 'register';

  clearErrors();

  // Register has an additional name field.
  nameGroup.hidden = !isRegister;
  nameInput.required = isRegister;

  emailGroup.classList.toggle('mt-[17px]', isRegister);
  emailGroup.classList.toggle('sm:mt-[24px]', isRegister);
  emailGroup.classList.toggle('lg:mt-[30px]', isRegister);
  passwordInput.autocomplete = isRegister ? 'new-password' : 'current-password';
  description.textContent = isRegister
    ? 'Register to bid and create listings.'
    : 'Sign in to bid and create listings.';

  submitText.textContent = isRegister ? 'Register' : 'Log in';

  setTabState(loginTab, !isRegister);
  setTabState(registerTab, isRegister);
}

// Validation

function validateField(input) {
  let message = '';

  if (input === nameInput) {
    message = validateName(input.value);
  }

  if (input === emailInput) {
    message = validateEmail(input.value);
  }

  if (input === passwordInput) {
    message = validatePassword(input.value);
  }

  if (message) {
    showFieldError(input, message);

    return false;
  }

  clearFieldError(input);

  return true;
}

function validateForm() {
  clearFormError();

  let valid = true;

  if (authMode === 'register' && !validateField(nameInput)) {
    valid = false;
  }

  if (!validateField(emailInput)) {
    valid = false;
  }

  if (!validateField(passwordInput)) {
    valid = false;
  }

  return valid;
}

// Password visibility

function togglePassword() {
  const shouldShow = passwordInput.type === 'password';
  passwordInput.type = shouldShow ? 'text' : 'password';
  passwordIcon.textContent = shouldShow ? 'visibility_off' : 'visibility';
  passwordStatus.textContent = shouldShow ? 'Hide' : 'Show';
  passwordToggle.setAttribute(
    'aria-label',
    shouldShow ? 'Hide password' : 'Show password',
  );

  passwordToggle.setAttribute('aria-pressed', String(shouldShow));
}

// Loading

function setSubmitting(value) {
  isSubmitting = value;

  submitButton.disabled = value;
  submitText.hidden = value;
  submitSpinner.hidden = !value;

  if (value) {
    submitButton.setAttribute('aria-busy', 'true');

    return;
  }

  submitButton.removeAttribute('aria-busy');
  submitText.textContent = authMode === 'register' ? 'Register' : 'Log in';
}

// Authentication

async function handleLogin() {
  return loginUser({
    email: emailInput.value.trim().toLowerCase(),
    password: passwordInput.value,
  });
}

async function handleRegister() {
  const user = {
    name: nameInput.value.trim(),
    email: emailInput.value.trim().toLowerCase(),
    password: passwordInput.value,
  };

  await registerUser(user);

  // Registration does not provide an access token,
  // so log the new user in afterwards.
  return loginUser({
    email: user.email,
    password: user.password,
  });
}

async function handleSubmit(event) {
  event.preventDefault();

  if (isSubmitting) {
    return;
  }

  if (!validateForm()) {
    form.querySelector('[aria-invalid="true"]')?.focus();

    return;
  }

  setSubmitting(true);

  try {
    if (authMode === 'register') {
      await handleRegister();
    } else {
      await handleLogin();
    }

    window.location.assign('./index.html');
  } catch (error) {
    showFormError(error.message || 'Something went wrong. Please try again.');
  } finally {
    setSubmitting(false);
  }
}

// Mobile menu

function openMenu() {
  if (!menu || !menuBackdrop) {
    return;
  }

  menu.inert = false;
  menu.setAttribute('aria-hidden', 'false');
  menuButton.setAttribute('aria-expanded', 'true');
  menuBackdrop.hidden = false;

  requestAnimationFrame(() => {
    menu.classList.remove('translate-x-full');
    menu.classList.add('translate-x-0');
    menuBackdrop.classList.remove('opacity-0');
    menuBackdrop.classList.add('opacity-100');
  });

  document.body.classList.add('overflow-hidden');

  menuClose.focus();
}

function closeMenu() {
  if (!menu || !menuBackdrop) {
    return;
  }

  menu.classList.remove('translate-x-0');
  menu.classList.add('translate-x-full');
  menuBackdrop.classList.remove('opacity-100');
  menuBackdrop.classList.add('opacity-0');
  menuButton.setAttribute('aria-expanded', 'false');
  menu.setAttribute('aria-hidden', 'true');
  menu.inert = true;

  document.body.classList.remove('overflow-hidden');

  window.setTimeout(() => {
    menuBackdrop.hidden = true;
  }, 300);
}

// Events

function setupAuthEvents() {
  loginTab.addEventListener('click', () => {
    setAuthMode('login');
  });

  registerTab.addEventListener('click', () => {
    setAuthMode('register');
  });

  passwordToggle.addEventListener('click', togglePassword);

  form.addEventListener('submit', handleSubmit);

  [nameInput, emailInput, passwordInput].forEach((input) => {
    input.addEventListener('input', () => {
      clearFieldError(input);
      clearFormError();
    });

    input.addEventListener('blur', () => {
      if (input === nameInput && authMode !== 'register') {
        return;
      }

      // Avoid showing an error before
      // the user has entered anything.
      if (!input.value) {
        return;
      }

      validateField(input);
    });
  });
}

function setupMenuEvents() {
  menuButton?.addEventListener('click', openMenu);
  menuClose?.addEventListener('click', closeMenu);
  menuBackdrop?.addEventListener('click', closeMenu);
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeMenu();
    }
  });
}

// Init

function init() {
  setAuthMode(getInitialMode());
  setupAuthEvents();
  setupMenuEvents();
}

init();
