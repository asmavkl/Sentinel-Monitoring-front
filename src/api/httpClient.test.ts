import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { BrowserStorageTokenProvider } from '@/auth/browserStorageTokenProvider';
import { resetLoginRedirectState } from '@/auth/loginRedirect';
import { createHttpClient } from './httpClient';

vi.mock('@/auth/loginRedirect', async () => {
  const actual = await vi.importActual<typeof import('@/auth/loginRedirect')>('@/auth/loginRedirect');
  return {
    ...actual,
    redirectToLogin: vi.fn(),
  };
});

import { redirectToLogin } from '@/auth/loginRedirect';

describe('httpClient', () => {
  const tokenProvider = new BrowserStorageTokenProvider();

  beforeEach(() => {
    localStorage.clear();
    resetLoginRedirectState();
    vi.mocked(redirectToLogin).mockClear();
    document.cookie = 'new_jwt_test=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
  });

  afterEach(() => {
    localStorage.clear();
    resetLoginRedirectState();
    document.cookie = 'new_jwt_test=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
  });

  it('injects Authorization header when token exists', async () => {
    tokenProvider.setToken('portal-jwt-token');

    const adapter = vi.fn(async (config) => ({
      data: {},
      status: 200,
      statusText: 'OK',
      headers: {},
      config,
    }));

    const client = createHttpClient();
    client.defaults.adapter = adapter;

    await client.get('/health');

    expect(adapter).toHaveBeenCalledOnce();
    const requestConfig = adapter.mock.calls[0][0];
    expect(requestConfig.headers.get('Authorization')).toBe('Bearer portal-jwt-token');
    expect(requestConfig.withCredentials).toBe(true);
  });

  it('sends a single-line Bearer header when the stored token is wrapped', async () => {
    tokenProvider.setToken(`Bearer\neyJhbGciOiJIUzI1NiJ9.\neyJzdWIiOiIxIn0.\nsignature`);

    const adapter = vi.fn(async (config) => ({
      data: {},
      status: 200,
      statusText: 'OK',
      headers: {},
      config,
    }));

    const client = createHttpClient();
    client.defaults.adapter = adapter;

    await client.get('/health');

    const requestConfig = adapter.mock.calls[0][0];
    expect(requestConfig.headers.get('Authorization')).toBe(
      'Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxIn0.signature',
    );
    expect(requestConfig.headers.get('Authorization')).not.toMatch(/\n/);
  });

  it('reads the portal cookie into the Authorization header', async () => {
    document.cookie = 'new_jwt_test=cookie-from-dargah; path=/';

    const adapter = vi.fn(async (config) => ({
      data: {},
      status: 200,
      statusText: 'OK',
      headers: {},
      config,
    }));

    const client = createHttpClient();
    client.defaults.adapter = adapter;

    await client.get('/health');

    const requestConfig = adapter.mock.calls[0][0];
    expect(requestConfig.headers.get('Authorization')).toBe('Bearer cookie-from-dargah');
  });

  it('does not inject Authorization header when token is missing', async () => {
    const adapter = vi.fn(async (config) => ({
      data: {},
      status: 200,
      statusText: 'OK',
      headers: {},
      config,
    }));

    const client = createHttpClient();
    client.defaults.adapter = adapter;

    await client.get('/health');

    const requestConfig = adapter.mock.calls[0][0];
    expect(requestConfig.headers.get('Authorization')).toBeUndefined();
  });

  it('clears token and redirects to the portal on 401 responses', async () => {
    tokenProvider.setToken('expired-token');

    const client = createHttpClient();
    client.defaults.adapter = vi.fn(async (config) =>
      Promise.reject({
        isAxiosError: true,
        response: { status: 401, data: {}, headers: {}, statusText: 'Unauthorized', config },
        config,
        toJSON: () => ({}),
        name: 'AxiosError',
        message: 'Unauthorized',
      } as unknown as import('axios').AxiosError),
    );

    await expect(client.get('/secure')).rejects.toBeTruthy();
    expect(tokenProvider.getToken()).toBeNull();
    expect(redirectToLogin).toHaveBeenCalledOnce();
  });
});
