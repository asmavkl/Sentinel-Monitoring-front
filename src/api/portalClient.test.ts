import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { browserStorageTokenProvider } from '@/auth';
import { resetLoginRedirectState } from '@/auth/loginRedirect';
import { createPortalHttpClient } from './portalClient';

vi.mock('@/auth/loginRedirect', async () => {
  const actual = await vi.importActual<typeof import('@/auth/loginRedirect')>('@/auth/loginRedirect');
  return {
    ...actual,
    redirectToLogin: vi.fn(),
  };
});

import { redirectToLogin } from '@/auth/loginRedirect';

describe('portalHttpClient', () => {
  beforeEach(() => {
    localStorage.clear();
    resetLoginRedirectState();
    vi.mocked(redirectToLogin).mockClear();
  });

  afterEach(() => {
    localStorage.clear();
    resetLoginRedirectState();
  });

  it('sends GetCurrentUser with cookies and without an Authorization header', async () => {
    browserStorageTokenProvider.setToken('portal-jwt-token');

    const adapter = vi.fn(async (config) => ({
      data: {},
      status: 200,
      statusText: 'OK',
      headers: {},
      config,
    }));

    const client = createPortalHttpClient();
    client.defaults.adapter = adapter;

    await client.get('https://gio24.ir/back/dargah-api/api/v1/User/GetCurrentUser');

    const requestConfig = adapter.mock.calls[0][0];
    expect(requestConfig.withCredentials).toBe(true);
    expect(requestConfig.headers.get('Authorization')).toBeUndefined();
  });

  it('redirects to the portal on 401 responses', async () => {
    const client = createPortalHttpClient();
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

    await expect(client.get('/user')).rejects.toBeTruthy();
    expect(redirectToLogin).toHaveBeenCalledOnce();
  });
});
