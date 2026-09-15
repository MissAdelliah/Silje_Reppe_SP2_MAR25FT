// Storage

const USER_KEY = 'secondStoryUser';

/**
 * Save logged in user.
 * @param {object} user
 */
export function saveUser(user) {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

/**
 * Get logged in user.
 * @returns {object|null}
 */
export function getUser() {
  const storedUser = localStorage.getItem(USER_KEY);

  if (!storedUser) {
    return null;
  }

  try {
    return JSON.parse(storedUser);
  } catch {
    clearUser();

    return null;
  }
}

/**
 * Remove logged in user.
 */
export function clearUser() {
  localStorage.removeItem(USER_KEY);
}

/**
 * Check if a user is logged in.
 * @returns {boolean}
 */
export function isLoggedIn() {
  return Boolean(getUser()?.accessToken);
}
