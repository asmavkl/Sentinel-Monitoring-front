import { describe, expect, it } from 'vitest';
import { normalizeJwtToken } from './normalizeJwtToken';

describe('normalizeJwtToken', () => {
  it('returns a compact JWT without wrapping or a Bearer prefix', () => {
    const token = normalizeJwtToken(`
      Bearer
      eyJhbGciOiJIUzI1NiJ9.
      eyJzdWIiOiIxIn0.
      signature
    `);

    expect(token).toBe('eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxIn0.signature');
  });

  it('strips quotes around a pasted cookie value', () => {
    expect(normalizeJwtToken('"abc.def.ghi"')).toBe('abc.def.ghi');
  });

  it('returns null for empty values', () => {
    expect(normalizeJwtToken('   ')).toBeNull();
    expect(normalizeJwtToken(null)).toBeNull();
  });
});
