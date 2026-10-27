/**
 * Auth API — login, logout, refresh
 */
import { api, tokenStorage } from './client';

/**
 * Login for any role.
 * @param {string} identifier - Roll No / Faculty ID / Admin username
 * @param {string} password
 * @param {string} role - 'STUDENT' | 'STAFF' | 'ADMIN'
 * @returns {{ access_token, refresh_token, user }}
 */
export async function login(identifier, password, role) {
  const data = await api.post('/auth/login', {
    identifier: identifier.trim(),
    password,
    role: role.toUpperCase(),
  });

  // Persist tokens + user profile
  await tokenStorage.saveTokens({
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    user: data.user,
  });

  return data;
}

/**
 * Logout — revokes refresh token on server, clears local storage.
 */
export async function logout(refreshToken) {
  try {
    await api.post('/auth/logout', { refresh_token: refreshToken });
  } catch {
    // Still clear local tokens even if server call fails
  } finally {
    await tokenStorage.clearTokens();
  }
}
