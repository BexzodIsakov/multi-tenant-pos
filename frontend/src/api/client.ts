import { API_BASE_URL } from './config';
import { getAccessToken, setAccessToken } from './tokenStore';

export class ApiError extends Error {
  status: number;
  code: string;
  details?: unknown;

  constructor(status: number, code: string, details?: unknown) {
    super(code);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

interface ApiFetchOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  body?: unknown;
}

async function refreshAccessToken(): Promise<string | null> {
  const response = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
    method: 'POST',
    credentials: 'include'
  });

  if (!response.ok) return null;

  const data = await response.json();
  setAccessToken(data.accessToken);
  return data.accessToken as string;
}

function doFetch(path: string, options: ApiFetchOptions): Promise<Response> {
  const token = getAccessToken();

  return fetch(`${API_BASE_URL}${path}`, {
    method: options.method ?? 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined
  });
}

export async function apiFetch<T>(path: string, options: ApiFetchOptions = {}): Promise<T> {
  let response = await doFetch(path, options);

  // A 401 here means the access token expired mid-session, not that the
  // credentials were ever wrong (that only happens at login). Try exactly
  // once to get a fresh access token via the refresh cookie, then retry the
  // original request. If the refresh itself fails, fall through and let the
  // original 401 surface to the caller.
  if (response.status === 401 && path !== '/api/auth/refresh') {
    const newToken = await refreshAccessToken();
    if (newToken) {
      response = await doFetch(path, options);
    }
  }

  if (!response.ok) {
    const body = await response.json().catch(() => ({ error: 'unknown_error' }));
    throw new ApiError(response.status, body.error ?? 'unknown_error', body.details);
  }

  return response.json();
}
