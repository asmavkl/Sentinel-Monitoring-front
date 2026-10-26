export const APP_BASE_PATH = (import.meta.env.BASE_URL ?? '/').replace(/\/+$/, '') || '/';

// Get config from window.APP_CONFIG (runtime config) or fallback to environment variables or defaults
const getConfig = () => {
  if (typeof window !== 'undefined' && window.APP_CONFIG) {
    return window.APP_CONFIG;
  }

  // Fallback to environment variables for development
  return {
    API_BASE_URL: import.meta.env.VITE_API_BASE_URL ?? 'https://gio24.ir/Back/monitoring-api',
    PORTAL_URL: import.meta.env.VITE_PORTAL_URL ?? 'https://gio24.ir/dargah',
    LOGIN_URL: import.meta.env.VITE_LOGIN_URL ?? 'https://gio24.ir/dargah/user/sign-out',
    PORTAL_CURRENT_USER_URL: import.meta.env.VITE_PORTAL_CURRENT_USER_URL ?? 'https://gio24.ir/back/dargah-api/api/v1/User/GetCurrentUser',
    AUTH_TOKEN_KEY: import.meta.env.VITE_AUTH_TOKEN_KEY ?? 'sentinel_portal_token',
    AUTH_COOKIE_NAME: import.meta.env.VITE_AUTH_COOKIE_NAME ?? 'new_jwt_test',
  };
};

const config = getConfig();

export const env = {
  apiBaseUrl: config.API_BASE_URL,
  authTokenKey: config.AUTH_TOKEN_KEY,
  authCookieName: config.AUTH_COOKIE_NAME,
  portalUrl: config.PORTAL_URL,
  loginUrl: config.LOGIN_URL,
  portalCurrentUserUrl: config.PORTAL_CURRENT_USER_URL,
  appBasePath: APP_BASE_PATH,
} as const;

