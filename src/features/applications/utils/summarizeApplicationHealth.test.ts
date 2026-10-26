import { describe, expect, it } from 'vitest';
import { summarizeApplicationHealth } from './summarizeApplicationHealth';
import type { ApplicationListItem } from '@/types/applications';

const app = (
  id: number,
  status: ApplicationListItem['status'],
): ApplicationListItem => ({
  id,
  name: `App ${id}`,
  code: `A${id}`,
  isActive: true,
  priority: 2,
  status,
  lastUpdate: null,
  availabilityStatus: undefined,
});

describe('summarizeApplicationHealth', () => {
  it('counts monitoring statuses for the summary bar', () => {
    expect(
      summarizeApplicationHealth([
        app(1, 'UP'),
        app(2, 'UP'),
        app(3, 'WARNING'),
        app(4, 'DOWN'),
        app(5, 'UNKNOWN'),
        app(6, 'OUT_OF_SERVICE'),
      ]),
    ).toEqual({
      up: 2,
      warning: 1,
      down: 1,
      unknown: 1,
      outOfService: 1,
      total: 6,
    });
  });

  it('returns zeros when no applications are loaded', () => {
    expect(summarizeApplicationHealth(undefined)).toEqual({
      up: 0,
      warning: 0,
      down: 0,
      unknown: 0,
      outOfService: 0,
      total: 0,
    });
  });
});
