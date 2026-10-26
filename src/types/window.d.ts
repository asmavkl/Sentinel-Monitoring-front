export interface AppConfig {
  API_BASE_URL: string;
  PORTAL_URL: string;
  LOGIN_URL: string;
  PORTAL_CURRENT_USER_URL: string;
  AUTH_TOKEN_KEY: string;
  AUTH_COOKIE_NAME: string;
}

declare global {
  interface Window {
    APP_CONFIG?: AppConfig;
  }
}
