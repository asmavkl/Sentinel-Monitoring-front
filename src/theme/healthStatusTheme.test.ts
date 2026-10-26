import { describe, expect, it } from 'vitest';
import { getHealthStatusTheme, healthStatusTheme } from './healthStatusTheme';

describe('healthStatusTheme', () => {
  it('maps operational statuses to monitoring colors', () => {
    expect(healthStatusTheme.UP.background).toBe('#43A047');
    expect(healthStatusTheme.WARNING.background).toBe('#FBC02D');
    expect(healthStatusTheme.DOWN.background).toBe('#E53935');
    expect(healthStatusTheme.UNKNOWN.background).toBe('#90A4AE');
  });

  it('returns unknown tokens as a safe fallback', () => {
    expect(getHealthStatusTheme('UP').label).toBe('سالم');
    expect(getHealthStatusTheme('WARNING').label).toBe('هشدار');
    expect(getHealthStatusTheme('DOWN').label).toBe('قطع');
  });
});
