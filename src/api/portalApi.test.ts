import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { portalApi } from './portalApi';
import { env } from '@/utils/env';
import { portalHttpClient } from '@/api/portalClient';

vi.mock('@/api/portalClient', () => ({
  portalHttpClient: {
    get: vi.fn(),
  },
}));

describe('portalApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock window.APP_CONFIG for tests
    Object.defineProperty(window, 'APP_CONFIG', {
      value: {
        API_BASE_URL: 'https://gio24.ir/Back/monitoring-api',
        PORTAL_URL: 'https://gio24.ir/dargah',
        LOGIN_URL: 'https://gio24.ir/dargah/user/sign-out',
        PORTAL_CURRENT_USER_URL: 'https://gio24.ir/back/dargah-api/api/v1/User/GetCurrentUser',
        AUTH_TOKEN_KEY: 'sentinel_portal_token',
        AUTH_COOKIE_NAME: 'new_jwt_test',
      },
      writable: true,
    });
  });

  afterEach(() => {
    // Clean up window.APP_CONFIG
    delete (window as any).APP_CONFIG;
  });

  it('uses the configured GetCurrentUser URL', () => {
    expect(env.portalCurrentUserUrl).toBe(
      'https://gio24.ir/back/dargah-api/api/v1/User/GetCurrentUser',
    );
    expect(env.apiBaseUrl).toBe('https://gio24.ir/Back/monitoring-api');
  });

  it('fetches the current portal user with the cookie-based client', async () => {
    vi.mocked(portalHttpClient.get).mockResolvedValue({
      data: {
        data: {
          userName: 'mohammad',
          fullName: 'محمد حسینی',
          roles: ['Admin'],
        },
      },
    });

    const user = await portalApi.getCurrentUser();

    expect(portalHttpClient.get).toHaveBeenCalledWith(env.portalCurrentUserUrl);
    expect(user.userName).toBe('mohammad');
    expect(user.fullName).toBe('محمد حسینی');
    expect(user.roles).toEqual(['Admin']);
  });
});
