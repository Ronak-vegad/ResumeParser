const TOKEN_KEY = 'access_token';

export const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

export function authHeaders(): HeadersInit {
  const t = getToken();
  if (!t) return {};
  return { Authorization: `Bearer ${t}` };
}
