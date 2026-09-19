// Storage

const USER_KEY = 'secondStoryUser';

/**
 * Save authenticated user data.
 * @param {object} user
 */
export function saveUser(user) {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

/**
 * Get authenticated user data.
 * @returns {object|null}
 */
export function getUser() {
  const value = localStorage.getItem(USER_KEY);

  if (!value) {
    return null;
  }

  try {
    return JSON.parse(value);
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
 * Check authentication state.
 * @returns {boolean}
 */
export function isLoggedIn() {
  return Boolean(getAccessToken());
}

export function clearUser() {
  localStorage.removeItem(USER_KEY);
}
export const removeUser = clearUser;
