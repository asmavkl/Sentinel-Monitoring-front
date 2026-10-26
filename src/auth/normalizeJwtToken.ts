const BEARER_PREFIX = /^bearer\s+/i;

export function normalizeJwtToken(token: string | null | undefined): string | null {
  if (!token) {
    return null;
  }

  let value = token.trim();
  if (!value) {
    return null;
  }

  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    value = value.slice(1, -1).trim();
  }

  value = value.replace(BEARER_PREFIX, '').replace(/\s+/g, '');

  return value || null;
}
