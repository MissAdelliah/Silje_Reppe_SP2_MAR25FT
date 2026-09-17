const studentEmailPattern = /^[^\s@]+@stud\.noroff\.no$/i;
const usernamePattern = /^[A-Za-z0-9_]+$/;

/**
 * Validate a Noroff student email.
 * @param {string} email
 * @returns {string}
 */
export function validateStudentEmail(email) {
  const value = email.trim();

  if (!value) {
    return 'Please enter your student email.';
  }

  if (!studentEmailPattern.test(value)) {
    return 'Use your @stud.noroff.no email address.';
  }

  return '';
}

/**
 * Validate a Noroff username.
 * @param {string} username
 * @returns {string}
 */
export function validateUsername(username) {
  const value = username.trim();

  if (!value) {
    return 'Please enter a username.';
  }

  if (!usernamePattern.test(value)) {
    return 'Username can only contain letters, numbers and underscores.';
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
    return 'Please enter your password.';
  }

  if (password.length < 8) {
    return 'Password must be at least 8 characters.';
  }

  return '';
}
