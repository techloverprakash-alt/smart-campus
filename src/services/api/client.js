/**
 * CMS API Client
 * Central HTTP client with token injection, refresh, and error normalization.
 */

import AsyncStorage from '@/ui/storage';
import { getMockResponse } from './mockData';

// ─── Config ──────────────────────────────────────────────────────────────────
// Change to your machine's LAN IP when testing on a physical device
export const BASE_URL = 'http://127.0.0.1:8000/api/v1';

const STORAGE_KEYS = {
  ACCESS_TOKEN: '@cms_access_token',
  REFRESH_TOKEN: '@cms_refresh_token',
  USER: '@cms_user',
};

// ─── Token Helpers ────────────────────────────────────────────────────────────
export const tokenStorage = {
  async getTokens() {
    const [access, refresh, userJson] = await Promise.all([
      AsyncStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN),
      AsyncStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN),
      AsyncStorage.getItem(STORAGE_KEYS.USER),
    ]);
    return {
      accessToken: access,
      refreshToken: refresh,
      user: userJson ? JSON.parse(userJson) : null,
    };
  },

  async saveTokens({ access_token, refresh_token, user }) {
    await Promise.all([
      AsyncStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, access_token),
      AsyncStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refresh_token),
      AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user)),
    ]);
  },

  async clearTokens() {
    await Promise.all([
      AsyncStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN),
      AsyncStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN),
      AsyncStorage.removeItem(STORAGE_KEYS.USER),
    ]);
  },
};

// ─── Core Fetch Wrapper ───────────────────────────────────────────────────────
let isRefreshing = false;
let refreshQueue = [];

function processQueue(error, token = null) {
  refreshQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  refreshQueue = [];
}

async function refreshAccessToken() {
  const { refreshToken } = await tokenStorage.getTokens();
  if (!refreshToken) throw new Error('No refresh token available');

  const res = await fetch(`${BASE_URL}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh_token: refreshToken }),
  });

  if (!res.ok) {
    await tokenStorage.clearTokens();
    throw new Error('Session expired. Please log in again.');
  }

  const json = await res.json();
  const { access_token, refresh_token, user } = json.data;
  await tokenStorage.saveTokens({ access_token, refresh_token, user });
  return access_token;
}

/**
 * Main API request function.
 * - Automatically injects Bearer token
 * - Retries once on 401 by refreshing the access token
 * - Returns parsed `data` field from StandardResponse envelope
 */
export async function apiRequest(path, options = {}, retry = true) {
  const { accessToken } = await tokenStorage.getTokens();
  const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData;

  const headers = {
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    ...options.headers,
  };

  const url = path.startsWith('http') ? path : `${BASE_URL}${path}`;
  let res;
  try {
    res = await fetch(url, { ...options, headers });
  } catch (netErr) {
    // Network failed or backend offline — return mock fallback data
    const mock = getMockResponse(path, options);
    if (mock !== undefined) {
      console.info(`[NEXUS Mock Mode] Handled ${options.method || 'GET'} ${path}`);
      return mock;
    }
    throw netErr;
  }

  // ── 401 → try token refresh (skip for auth endpoints) ──
  const isAuthEndpoint = path.includes('/auth/login') || path.includes('/auth/refresh');
  if (res.status === 401 && retry && !isAuthEndpoint) {
    if (isRefreshing) {
      // Queue subsequent requests while refresh is in progress
      return new Promise((resolve, reject) => {
        refreshQueue.push({
          resolve: async (newToken) => {
            resolve(await apiRequest(path, options, false));
          },
          reject,
        });
      });
    }

    isRefreshing = true;
    try {
      await refreshAccessToken();
      processQueue(null);
      return apiRequest(path, options, false);
    } catch (err) {
      processQueue(err);
      throw err;
    } finally {
      isRefreshing = false;
    }
  }

  let json = null;
  try {
    json = await res.json();
  } catch {
    // Non-JSON response
  }

  if (!res.ok) {
    // Normalize FastAPI validation errors and custom StandardResponse errors
    const detail = json?.detail;
    if (Array.isArray(detail)) {
      throw new Error(detail.map((e) => e.msg || e).join(', '));
    }
    const errMsg =
      json?.error?.message ||
      (typeof detail === 'string' ? detail : null) ||
      json?.message ||
      `Error ${res.status}`;
    throw new Error(errMsg);
  }

  // Unwrap StandardResponse envelope → return .data
  return json.data !== undefined ? json.data : json;
}

// ─── Convenience Methods ──────────────────────────────────────────────────────
export const api = {
  get: (path, params) => {
    const query = params
      ? '?' + new URLSearchParams(
          Object.fromEntries(
            Object.entries(params).filter(([, v]) => v !== undefined && v !== null)
          )
        ).toString()
      : '';
    return apiRequest(`${path}${query}`, { method: 'GET' });
  },

  post: (path, body) =>
    apiRequest(path, { method: 'POST', body: JSON.stringify(body) }),

  put: (path, body) =>
    apiRequest(path, { method: 'PUT', body: JSON.stringify(body) }),

  patch: (path, body) =>
    apiRequest(path, { method: 'PATCH', body: JSON.stringify(body) }),

  delete: (path) =>
    apiRequest(path, { method: 'DELETE' }),

  upload: (path, formData) =>
    apiRequest(path, { method: 'POST', body: formData }),
};

