import { API_BASE_URL } from './config.js';
import { saveUser, clearUser } from '../utils/storage.js';

async function parseResponse(response) {
  let result;

  try {
    result = await response.json();
  } catch {
    throw new Error('Could not read the server response.');
  }

  if (!response.ok) {
    const message =
      result?.errors?.[0]?.message ||
      result?.message ||
      'Something went wrong. Please try again.';

    throw new Error(message);
  }

  return result.data;
}

export async function registerUser(user) {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(user),
  });

  return parseResponse(response);
}

export async function loginUser(credentials) {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  });

  const user = await parseResponse(response);

  saveUser(user);

  return user;
}

export function logoutUser() {
  clearUser();
}
