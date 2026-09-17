import { loginUser, registerUser } from '../api/auth.js';
import { initFooter } from '../components/footer.js';
import { initHeader } from '../components/header.js';
import {
  validatePassword,
  validateStudentEmail,
  validateUsername,
} from '../utils/validation.js';

function init() {
  const form = document.querySelector('#auth-form');
  const loginTab = document.querySelector('#login-tab');
  const registerTab = document.querySelector('#register-tab');
  const nameGroup = document.querySelector('#name-group');
  const nameInput = document.querySelector('#name');
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

  // Stop here if the wrong HTML is loaded.
  if (
    !form ||
    !loginTab ||
    !registerTab ||
    !nameGroup ||
    !nameInput ||
    !emailInput ||
    !passwordInput ||
    !passwordToggle ||
    !passwordIcon ||
    !passwordStatus ||
    !description ||
    !formError ||
    !submitButton ||
    !submitText ||
    !submitSpinner
  ) {
    console.error(
      'Auth page could not initialise because required HTML elements are missing.',
    );

    return;
  }

  let authMode = 'login';
  let isSubmitting = false;

  function setFieldError(input, message) {
    const error = document.querySelector(`#${input.id}-error`);

    input.setAttribute('aria-invalid', String(Boolean(message)));

    if (!error) return;

    error.textContent = message;
    error.hidden = !message;
  }

  function clearErrors() {
    [nameInput, emailInput, passwordInput].forEach((input) => {
      setFieldError(input, '');
    });

    formError.textContent = '';
    formError.hidden = true;
  }

  function showFormError(message) {
    formError.textContent = message;
    formError.hidden = false;
  }

  function updateTab(button, active) {
    button.setAttribute('aria-pressed', String(active));
    button.classList.toggle('border-ink', active);
    button.classList.toggle('border-transparent', !active);
    button.classList.toggle('text-brand', active);
    button.classList.toggle('text-muted', !active);
  }

  function setAuthMode(mode) {
    authMode = mode === 'register' ? 'register' : 'login';

    const registering = authMode === 'register';

    nameGroup.hidden = !registering;
    nameInput.required = registering;
    passwordInput.autocomplete = registering
      ? 'new-password'
      : 'current-password';

    updateTab(loginTab, !registering);

    updateTab(registerTab, registering);

    submitText.textContent = registering ? 'Create account' : 'Log in';

    description.textContent = registering
      ? 'Create an account to bid and sell with credits.'
      : 'Sign in to bid and create listings.';

    clearErrors();

    const url = new URL(window.location.href);

    url.searchParams.set('mode', authMode);
    window.history.replaceState({}, '', url);
  }

  function validateForm() {
    let valid = true;

    if (authMode === 'register') {
      const nameError = validateUsername(nameInput.value);

      setFieldError(nameInput, nameError);

      if (nameError) {
        valid = false;
      }
    }

    const emailError = validateStudentEmail(emailInput.value);
    const passwordError = validatePassword(passwordInput.value);

    setFieldError(emailInput, emailError);
    setFieldError(passwordInput, passwordError);

    if (emailError || passwordError) {
      valid = false;
    }

    return valid;
  }

  function togglePasswordVisibility() {
    const visible = passwordInput.type === 'text';
    passwordInput.type = visible ? 'password' : 'text';
    passwordToggle.setAttribute('aria-pressed', String(!visible));
    passwordToggle.setAttribute(
      'aria-label',
      visible ? 'Show password' : 'Hide password',
    );

    passwordStatus.textContent = visible ? 'Hiding' : 'Showing';
    passwordIcon.textContent = visible ? 'visibility_off' : 'visibility';
  }

  function setSubmitting(submitting) {
    isSubmitting = submitting;

    submitButton.disabled = submitting;
    submitText.hidden = submitting;
    submitSpinner.hidden = !submitting;
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (isSubmitting) return;

    clearErrors();

    if (!validateForm()) {
      return;
    }

    setSubmitting(true);

    const credentials = {
      email: emailInput.value.trim().toLowerCase(),
      password: passwordInput.value,
    };

    try {
      if (authMode === 'register') {
        await registerUser({
          name: nameInput.value.trim(),
          email: credentials.email,
          password: credentials.password,
        });
      }

      await loginUser(credentials);

      window.location.assign('./index.html');
    } catch (error) {
      showFormError(
        error instanceof Error
          ? error.message
          : 'Something went wrong. Please try again.',
      );
    } finally {
      setSubmitting(false);
    }
  }

  loginTab.addEventListener('click', () => {
    setAuthMode('login');
  });

  registerTab.addEventListener('click', () => {
    setAuthMode('register');
  });

  passwordToggle.addEventListener('click', togglePasswordVisibility);

  form.addEventListener('submit', handleSubmit);

  nameInput.addEventListener('blur', () => {
    if (authMode === 'register' && nameInput.value) {
      setFieldError(nameInput, validateUsername(nameInput.value));
    }
  });

  emailInput.addEventListener('blur', () => {
    if (emailInput.value) {
      setFieldError(emailInput, validateStudentEmail(emailInput.value));
    }
  });

  passwordInput.addEventListener('blur', () => {
    if (passwordInput.value) {
      setFieldError(passwordInput, validatePassword(passwordInput.value));
    }
  });

  const params = new URLSearchParams(window.location.search);

  setAuthMode(params.get('mode'));

  initHeader();
  initFooter();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
