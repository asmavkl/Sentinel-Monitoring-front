/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  readonly VITE_AUTH_TOKEN_KEY?: string;
  readonly VITE_AUTH_COOKIE_NAME?: string;
  readonly VITE_PORTAL_URL?: string;
  readonly VITE_LOGIN_URL?: string;
  readonly VITE_PORTAL_CURRENT_USER_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
