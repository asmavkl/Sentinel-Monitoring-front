import type { AuthorizationHeaderHandler } from './types';
import { jwtTokenReader } from './jwtTokenReader';
import { normalizeJwtToken } from './normalizeJwtToken';

export class BearerAuthorizationHeaderHandler implements AuthorizationHeaderHandler {
  constructor(private readonly tokenReader = jwtTokenReader) {}

  getAuthorizationHeader(): Record<string, string> {
    const token = normalizeJwtToken(this.tokenReader.readToken());

    if (!token) {
      return {};
    }

    return {
      Authorization: `Bearer ${token}`,
    };
  }
}

export const authorizationHeaderHandler = new BearerAuthorizationHeaderHandler();
