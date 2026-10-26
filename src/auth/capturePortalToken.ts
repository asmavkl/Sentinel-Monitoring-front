import { browserStorageTokenProvider } from './browserStorageTokenProvider';
import { normalizeJwtToken } from './normalizeJwtToken';
import { env } from '@/utils/env';

const TOKEN_PARAM_KEYS = [
  'token',
  'access_token',
  'accessToken',
  'id_token',
  'idToken',
  'jwt',
] as const;

const TOKEN_PAYLOAD_KEYS = [
  ...TOKEN_PARAM_KEYS,
  'Token',
  'AccessToken',
  'IdToken',
  'Jwt',
] as const;

export function readCookie(name: string): string | null {
  if (typeof document === 'undefined' || !name) {
    return null;
  }

  const prefix = `${name}=`;

  for (const part of document.cookie.split(';')) {
    const cookie = part.trim();
    if (cookie.startsWith(prefix)) {
      const value = cookie.slice(prefix.length);
      let decoded = value;
      try {
        decoded = decodeURIComponent(value);
      } catch {
        decoded = value;
      }

      return normalizeJwtToken(decoded);
    }
  }

  return null;
}

export function extractTokenFromSearchAndHash(
  search: string,
  hash: string,
): string | null {
  const sources = [new URLSearchParams(search), parseHashParams(hash)];

  for (const params of sources) {
    for (const key of TOKEN_PARAM_KEYS) {
      const value = params.get(key)?.trim();
      if (value) {
        return value;
      }
    }
  }

  return null;
}

export function extractPortalAuthToken(payload: unknown): string | null {
  if (!payload || typeof payload !== 'object') {
    return null;
  }

  const record = payload as Record<string, unknown>;

  for (const key of TOKEN_PAYLOAD_KEYS) {
    const value = record[key];
    if (typeof value === 'string' && value.trim()) {
      return normalizeJwtToken(value);
    }
  }

  const nested = record.data ?? record.Data ?? record.result ?? record.Result;
  if (nested && nested !== payload) {
    return extractPortalAuthToken(nested);
  }

  return null;
}

export function persistPortalToken(token: string): void {
  const value = normalizeJwtToken(token);
  if (!value) {
    return;
  }

  browserStorageTokenProvider.setToken(value);
}

export function persistPortalTokenFromPayload(payload: unknown): string | null {
  const token = extractPortalAuthToken(payload);
  if (token) {
    persistPortalToken(token);
  }
  return token;
}

export function capturePortalToken(
  location: Pick<Location, 'search' | 'hash'> = window.location,
): string | null {
  const fromUrl = extractTokenFromSearchAndHash(location.search, location.hash);
  if (fromUrl) {
    persistPortalToken(fromUrl);
    stripTokenFromUrl();
    return normalizeJwtToken(fromUrl);
  }

  const fromCookie = readCookie(env.authCookieName);
  if (fromCookie) {
    persistPortalToken(fromCookie);
    return fromCookie;
  }

  return browserStorageTokenProvider.getToken();
}

function parseHashParams(hash: string): URLSearchParams {
  if (!hash) {
    return new URLSearchParams();
  }

  const withoutHash = hash.startsWith('#') ? hash.slice(1) : hash;
  const queryIndex = withoutHash.indexOf('?');
  const query = queryIndex >= 0 ? withoutHash.slice(queryIndex + 1) : withoutHash;

  return new URLSearchParams(query);
}

function stripTokenFromUrl(): void {
  if (typeof window === 'undefined') {
    return;
  }

  const url = new URL(window.location.href);
  let changed = false;

  for (const key of TOKEN_PARAM_KEYS) {
    if (url.searchParams.has(key)) {
      url.searchParams.delete(key);
      changed = true;
    }
  }

  if (url.hash) {
    const hashParams = parseHashParams(url.hash);
    let hashChanged = false;

    for (const key of TOKEN_PARAM_KEYS) {
      if (hashParams.has(key)) {
        hashParams.delete(key);
        hashChanged = true;
      }
    }

    if (hashChanged) {
      const nextHash = hashParams.toString();
      url.hash = nextHash ? `#${nextHash}` : '';
      changed = true;
    }
  }

  if (!changed) {
    return;
  }

  window.history.replaceState(null, '', `${url.pathname}${url.search}${url.hash}`);
}
