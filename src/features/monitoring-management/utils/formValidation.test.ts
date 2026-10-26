import { describe, expect, it } from 'vitest';
import { buildComponentCode, isValidHttpUrl } from './formValidation';

describe('formValidation', () => {
  it('accepts http and https URLs', () => {
    expect(isValidHttpUrl('https://samih.example')).toBe(true);
    expect(isValidHttpUrl('http://localhost:5000')).toBe(true);
    expect(isValidHttpUrl('not-a-url')).toBe(false);
    expect(isValidHttpUrl('ftp://files.example')).toBe(false);
  });

  it('builds a unique component code from the name', () => {
    expect(buildComponentCode('Authentication')).toBe('AUTHENTICATION');
    expect(buildComponentCode('API', ['API'])).toBe('API_2');
    expect(buildComponentCode('احراز هویت')).toBe('COMP');
  });
});
