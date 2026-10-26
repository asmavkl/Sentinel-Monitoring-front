import type { AuthTokenReader } from './types';
import { browserStorageTokenProvider } from './browserStorageTokenProvider';

export class JwtTokenReader implements AuthTokenReader {
  constructor(private readonly tokenProvider = browserStorageTokenProvider) {}

  readToken(): string | null {
    return this.tokenProvider.getToken();
  }
}

export const jwtTokenReader = new JwtTokenReader();
