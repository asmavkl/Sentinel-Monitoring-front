export interface AuthTokenProvider {
  getToken(): string | null;
  setToken(token: string): void;
  clearToken(): void;
  hasToken(): boolean;
}

export interface AuthTokenReader {
  readToken(): string | null;
}

export interface AuthorizationHeaderHandler {
  getAuthorizationHeader(): Record<string, string>;
}
