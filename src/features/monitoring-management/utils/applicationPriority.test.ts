import { describe, expect, it } from 'vitest';
import { ApplicationPriority } from '@/types/enums';
import {
  getApplicationPriorityLabel,
  normalizeApplicationPriority,
} from './applicationPriority';

describe('applicationPriority', () => {
  it('normalizes unknown values to Important', () => {
    expect(normalizeApplicationPriority(undefined)).toBe(ApplicationPriority.Important);
    expect(normalizeApplicationPriority(99)).toBe(ApplicationPriority.Important);
  });

  it('keeps known priorities', () => {
    expect(normalizeApplicationPriority(ApplicationPriority.Critical)).toBe(
      ApplicationPriority.Critical,
    );
    expect(getApplicationPriorityLabel(ApplicationPriority.Low)).toBe('کم اهمیت');
  });
});
