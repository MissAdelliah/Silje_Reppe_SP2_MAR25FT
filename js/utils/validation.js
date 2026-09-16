// Validation

const STUDENT_EMAIL_PATTERN = /^[^\s@]+@stud\.noroff\.no$/i;

const USERNAME_PATTERN = /^[A-Za-z0-9_]+$/;

/**
 * Validate a Noroff username.
 * @param {string} value
 * @returns {string}
 */
export function validateName(value) {
  const name = value.trim();

  if (!name) {
    return 'Name is required.';
  }

  if (!USERNAME_PATTERN.test(name)) {
    return 'Use letters, numbers and underscores only.';
  }

  return '';
}

/**
 * Validate a Noroff student email.
 * @param {string} value
 * @returns {string}
 */
export function validateEmail(value) {
  const email = value.trim();

  if (!email) {
    return 'Email is required.';
  }

  if (!STUDENT_EMAIL_PATTERN.test(email)) {
    return 'Use your @stud.noroff.no email.';
  }

  return '';
}

/**
 * Validate a Noroff password.
 * @param {string} value
 * @returns {string}
 */
export function validatePassword(value) {
  if (!value) {
    return 'Password is required.';
  }

  if (value.length < 8) {
    return 'Password must be at least 8 characters.';
  }

  return '';
}
