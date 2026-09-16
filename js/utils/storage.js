// Storage

const USER_KEY = 'secondStoryUser';

/**
 * Save the authenticated user.
 * @param {object} user
 */
export function saveUser(user) {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

/**
 * Get the authenticated user.
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
    localStorage.removeItem(USER_KEY);
    return null;
  }
}

/**
 * Get the current access token.
 * @returns {string|null}
 */
export function getAccessToken() {
  return getUser()?.accessToken ?? null;
}

/**
 * Check if a user is authenticated.
 * @returns {boolean}
 */
export function isLoggedIn() {
  return Boolean(getAccessToken());
}

/**
 * Remove the authenticated user.
 */
export function clearUser() {
  localStorage.removeItem(USER_KEY);
}

// Alias for older imports.
export const removeUser = clearUser;
