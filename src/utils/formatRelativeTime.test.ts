import { describe, expect, it } from 'vitest';
import { formatRelativeTime } from '@/utils/formatRelativeTime';
import { statusFromThreshold } from '@/utils/widgetThreshold';

describe('formatRelativeTime', () => {
  it('formats recent timestamps', () => {
    expect(formatRelativeTime(Date.now() - 30_000)).toBe('همین الان');
    expect(formatRelativeTime(Date.now() - 5 * 60_000)).toContain('دقیقه پیش');
  });
});

describe('statusFromThreshold', () => {
  it('maps values against threshold', () => {
    expect(statusFromThreshold(10, 50)).toBe('UP');
    expect(statusFromThreshold(50, 50)).toBe('WARNING');
    expect(statusFromThreshold(80, 50)).toBe('DOWN');
    expect(statusFromThreshold(null, 50)).toBeNull();
  });
});
