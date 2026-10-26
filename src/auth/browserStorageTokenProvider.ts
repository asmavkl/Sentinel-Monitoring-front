import { env } from '@/utils/env';
import { normalizeJwtToken } from './normalizeJwtToken';
import type { AuthTokenProvider } from './types';

const STORAGE_KEY = env.authTokenKey;

export class BrowserStorageTokenProvider implements AuthTokenProvider {
  getToken(): string | null {
    return normalizeJwtToken(localStorage.getItem(STORAGE_KEY));
  }

  setToken(token: string): void {
    const value = normalizeJwtToken(token);
    if (!value) {
      this.clearToken();
      return;
    }

    localStorage.setItem(STORAGE_KEY, value);
  }

  clearToken(): void {
    localStorage.removeItem(STORAGE_KEY);
  }

  hasToken(): boolean {
    return Boolean(this.getToken());
  }
}

export const browserStorageTokenProvider = new BrowserStorageTokenProvider();
