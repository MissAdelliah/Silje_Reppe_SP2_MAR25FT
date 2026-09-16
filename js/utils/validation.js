// Validation

const STUDENT_EMAIL_PATTERN = /^[^\s@]+@stud\.noroff\.no$/i;

const NAME_PATTERN = /^[a-zA-Z0-9_]+$/;

/**
 * Validate a Noroff username.
 * @param {string} name
 * @returns {string}
 */
export function validateName(name) {
  const value = name.trim();

  if (!value) {
    return 'Name is required.';
  }

  if (value.length < 2) {
    return 'Name must be at least 2 characters.';
  }

  if (!NAME_PATTERN.test(value)) {
    return 'Use letters, numbers and underscores only.';
  }

  return '';
}

/**
 * Validate a Noroff student email.
 * @param {string} email
 * @returns {string}
 */
export function validateEmail(email) {
  const value = email.trim();

  if (!value) {
    return 'Email is required.';
  }

  if (!STUDENT_EMAIL_PATTERN.test(value)) {
    return 'Use your @stud.noroff.no email.';
  }

  return '';
}

/**
 * Validate a password.
 * @param {string} password
 * @returns {string}
 */
export function validatePassword(password) {
  if (!password) {
    return 'Password is required.';
  }

  if (password.length < 8) {
    return 'Password must be at least 8 characters.';
  }

  return '';
}
