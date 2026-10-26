import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { env } from '@/utils/env';
import { browserStorageTokenProvider } from './browserStorageTokenProvider';
import {
  capturePortalToken,
  extractPortalAuthToken,
  persistPortalTokenFromPayload,
  readCookie,
} from './capturePortalToken';

function clearCookies(): void {
  for (const part of document.cookie.split(';')) {
    const name = part.split('=')[0]?.trim();
    if (name) {
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
    }
  }
}

describe('capturePortalToken', () => {
  beforeEach(() => {
    localStorage.clear();
    clearCookies();
    window.history.replaceState(null, '', '/');
  });

  afterEach(() => {
    localStorage.clear();
    clearCookies();
    window.history.replaceState(null, '', '/');
  });

  it('stores a token from the query string and strips it from the URL', () => {
    window.history.replaceState(null, '', '/applications?token=url-jwt&tab=overview');

    const token = capturePortalToken();

    expect(token).toBe('url-jwt');
    expect(browserStorageTokenProvider.getToken()).toBe('url-jwt');
    expect(window.location.search).toBe('?tab=overview');
  });

  it('stores a token from the hash', () => {
    window.history.replaceState(null, '', '/#access_token=hash-jwt');

    expect(capturePortalToken()).toBe('hash-jwt');
    expect(browserStorageTokenProvider.getToken()).toBe('hash-jwt');
    expect(window.location.hash).toBe('');
  });

  it('stores the portal cookie when the URL has no token', () => {
    document.cookie = `${env.authCookieName}=cookie-jwt; path=/`;

    expect(readCookie(env.authCookieName)).toBe('cookie-jwt');
    expect(capturePortalToken()).toBe('cookie-jwt');
    expect(browserStorageTokenProvider.getToken()).toBe('cookie-jwt');
  });

  it('uses the portal cookie over a previously stored token', () => {
    browserStorageTokenProvider.setToken('stored-jwt');
    document.cookie = `${env.authCookieName}=cookie-jwt; path=/`;

    expect(capturePortalToken()).toBe('cookie-jwt');
    expect(browserStorageTokenProvider.getToken()).toBe('cookie-jwt');
  });

  it('stores a wrapped cookie JWT as a single-line token', () => {
    document.cookie = `${env.authCookieName}=Bearer%20eyJhbGciOiJIUzI1NiJ9.%0AeyJzdWIiOiIxIn0.signature; path=/`;

    expect(capturePortalToken()).toBe('eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxIn0.signature');
    expect(browserStorageTokenProvider.getToken()).toBe(
      'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxIn0.signature',
    );
  });

  it('extracts and persists a token nested in a portal payload', () => {
    const token = persistPortalTokenFromPayload({
      isSuccess: true,
      data: { accessToken: 'payload-jwt' },
    });

    expect(token).toBe('payload-jwt');
    expect(extractPortalAuthToken({ Token: 'legacy-jwt' })).toBe('legacy-jwt');
    expect(browserStorageTokenProvider.getToken()).toBe('payload-jwt');
  });
});
