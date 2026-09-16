import { loginUser, registerUser } from '../api/auth.js';

import {
  validateEmail,
  validateName,
  validatePassword,
} from '../utils/validation.js';

// DOM

const backdrop = document.querySelector('#auth-sheet-backdrop');
const sheet = document.querySelector('#auth-sheet');
const openButtons = document.querySelectorAll('[data-auth-sheet-open]');
const closeButtons = document.querySelectorAll('[data-auth-sheet-close]');
const loginTab = document.querySelector('[data-auth-mode="login"]');
const registerTab = document.querySelector('[data-auth-mode="register"]');
const form = document.querySelector('#auth-form');
const nameGroup = document.querySelector('#auth-name-group');
const nameInput = document.querySelector('#auth-name');
const emailInput = document.querySelector('#auth-email');
const passwordInput = document.querySelector('#auth-password');
const passwordToggle = document.querySelector('#auth-password-toggle');
const passwordIcon = document.querySelector('#auth-password-icon');
const submitButton = document.querySelector('#auth-submit');
const subtitle = document.querySelector('#auth-subtitle');
const formError = document.querySelector('#auth-form-error');

let authMode = 'login';
let lastFocusedElement = null;

// Helpers

function getErrorElement(input) {
  return document.querySelector(`#${input.id}-error`);
}

function clearFieldError(input) {
  const error = getErrorElement(input);

  input.classList.remove('border-brand');
  input.classList.add('border-border');
  input.removeAttribute('aria-invalid');

  if (error) {
    error.textContent = '';
    error.hidden = true;
  }
}

function showFieldError(input, message) {
  const error = getErrorElement(input);

  input.classList.remove('border-border');

  input.classList.add('border-brand');

  input.setAttribute('aria-invalid', 'true');

  if (error) {
    error.textContent = message;
    error.hidden = false;
  }
}

function clearFormErrors() {
  [nameInput, emailInput, passwordInput].forEach((input) => {
    clearFieldError(input);
  });

  formError.textContent = '';
  formError.hidden = true;
}

function showFormError(message) {
  formError.textContent = message;
  formError.hidden = false;
}

function setSubmitting(isSubmitting) {
  submitButton.disabled = isSubmitting;

  submitButton.textContent = isSubmitting
    ? 'Please wait...'
    : authMode === 'login'
      ? 'Log in'
      : 'Register';
}

// Auth mode

function setAuthMode(mode) {
  authMode = mode;

  clearFormErrors();

  const isRegister = mode === 'register';

  nameGroup.hidden = !isRegister;
  nameInput.required = isRegister;
  loginTab.setAttribute('aria-selected', String(!isRegister));
  registerTab.setAttribute('aria-selected', String(isRegister));
  loginTab.classList.toggle('text-brand', !isRegister);
  loginTab.classList.toggle('border-brand', !isRegister);
  loginTab.classList.toggle('text-muted', isRegister);
  loginTab.classList.toggle('border-transparent', isRegister);
  registerTab.classList.toggle('text-brand', isRegister);
  registerTab.classList.toggle('border-brand', isRegister);
  registerTab.classList.toggle('text-muted', !isRegister);
  registerTab.classList.toggle('border-transparent', !isRegister);

  subtitle.textContent = isRegister
    ? 'Create an account to bid and sell.'
    : 'Sign in to bid and create listings.';

  submitButton.textContent = isRegister ? 'Register' : 'Log in';
}

// Sheet

function openAuthSheet(mode = 'login') {
  lastFocusedElement = document.activeElement;

  setAuthMode(mode);

  // Close hamburger menu first.
  document.querySelector('[data-menu-close]')?.click();
  backdrop.hidden = false;
  sheet.removeAttribute('inert');

  requestAnimationFrame(() => {
    backdrop.classList.remove('opacity-0');
    backdrop.classList.add('opacity-100');
    sheet.classList.remove('translate-y-full');
    sheet.classList.add('translate-y-0');
  });

  window.setTimeout(() => {
    emailInput.focus();
  }, 300);
}

function closeAuthSheet() {
  if (sheet.contains(document.activeElement)) {
    lastFocusedElement?.focus();
  }

  backdrop.classList.remove('opacity-100');
  backdrop.classList.add('opacity-0');
  sheet.classList.remove('translate-y-0');
  sheet.classList.add('translate-y-full');
  sheet.setAttribute('inert', '');

  window.setTimeout(() => {
    backdrop.hidden = true;
    form.reset();
    clearFormErrors();
    setAuthMode('login');
  }, 300);
}

// Validation

function validateForm() {
  clearFormErrors();
  let isValid = true;
  if (authMode === 'register') {
    const nameError = validateName(nameInput.value);
    if (nameError) {
      showFieldError(nameInput, nameError);

      isValid = false;
    }
  }

  const emailError = validateEmail(emailInput.value);
  if (emailError) {
    showFieldError(emailInput, emailError);

    isValid = false;
  }

  const passwordError = validatePassword(passwordInput.value);
  if (passwordError) {
    showFieldError(passwordInput, passwordError);

    isValid = false;
  }

  return isValid;
}

// Authentication

async function handleLogin() {
  await loginUser({
    email: emailInput.value.trim(),
    password: passwordInput.value,
  });

  closeAuthSheet();
  window.location.reload();
}

async function handleRegister() {
  await registerUser({
    name: nameInput.value.trim(),
    email: emailInput.value.trim(),
    password: passwordInput.value,
  });

  const registeredEmail = emailInput.value.trim();
  form.reset();
  emailInput.value = registeredEmail;
  setAuthMode('login');
  subtitle.textContent = 'Account created. Log in to continue.';
  emailInput.focus();
}

async function handleSubmit(event) {
  event.preventDefault();

  if (!validateForm()) {
    return;
  }

  setSubmitting(true);

  try {
    if (authMode === 'register') {
      await handleRegister();
    } else {
      await handleLogin();
    }
  } catch (error) {
    showFormError(error.message);
  } finally {
    setSubmitting(false);
  }
}

// Password

function togglePassword() {
  const isPassword = passwordInput.type === 'password';
  passwordInput.type = isPassword ? 'text' : 'password';
  passwordIcon.textContent = isPassword ? 'visibility_off' : 'visibility';
  passwordToggle.setAttribute(
    'aria-label',
    isPassword ? 'Hide password' : 'Show password',
  );
}

// Events

openButtons.forEach((button) => {
  button.addEventListener('click', () => {
    openAuthSheet(button.dataset.authSheetOpen || 'login');
  });
});

closeButtons.forEach((button) => {
  button.addEventListener('click', closeAuthSheet);
});

backdrop.addEventListener('click', closeAuthSheet);

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
  });
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && sheet.getAttribute('inert') === null) {
    closeAuthSheet();
  }
});
