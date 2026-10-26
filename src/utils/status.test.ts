import { describe, expect, it } from 'vitest';
import { ApplicationHealthStatus } from '@/types/enums';
import type { ApplicationOverviewDto } from '@/types/dashboard';
import {
  deriveStatusFromOverview,
  mapApplicationHealthStatus,
} from '@/utils/status';

describe('status utils', () => {
  it('maps application health status', () => {
    expect(mapApplicationHealthStatus(ApplicationHealthStatus.Up)).toBe('UP');
    expect(mapApplicationHealthStatus(ApplicationHealthStatus.Down)).toBe('DOWN');
    expect(mapApplicationHealthStatus(undefined)).toBe('UNKNOWN');
  });

  it('derives warning status from overview', () => {
    const overview: ApplicationOverviewDto = {
      applicationId: 1,
      name: 'ERP',
      code: 'ERP',
      isActive: true,
      calculatedHealthStatus: ApplicationHealthStatus.Up,
      availabilityStatus: ApplicationHealthStatus.Up,
      statusCalculatedAt: '2026-01-01T00:00:00Z',
      totalComponents: 2,
      activeComponents: 2,
      totalChecks: 5,
      activeChecks: 5,
      healthyChecks: 4,
      unhealthyChecks: 1,
      hasDashboard: true,
    };

    expect(deriveStatusFromOverview(overview)).toBe('WARNING');
  });
});
