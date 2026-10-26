import { QueryClientProvider } from '@tanstack/react-query';
import { renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { dashboardApi } from '@/api/dashboardApi';
import { useApplicationOverview } from './useApplicationOverview';
import { dashboardQueryKeys } from './queryKeys';
import { createTestQueryClient } from '@/test/testUtils';
import { DEFAULT_DASHBOARD_REFRESH_INTERVAL, useDashboardStore } from '@/store/dashboardStore';
import { ApplicationHealthStatus } from '@/types/enums';

vi.mock('@/api/dashboardApi', () => ({
  dashboardApi: {
    getApplicationOverview: vi.fn(),
  },
}));

describe('dashboard query auto refresh', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useDashboardStore.getState().reset();
    vi.mocked(dashboardApi.getApplicationOverview).mockResolvedValue({
      applicationId: 1,
      name: 'Samih',
      code: 'SAMIH',
      isActive: true,
      calculatedHealthStatus: ApplicationHealthStatus.Up,
      availabilityStatus: ApplicationHealthStatus.Up,
      statusCalculatedAt: '2026-01-01T10:00:00Z',
      totalComponents: 0,
      activeComponents: 0,
      totalChecks: 0,
      activeChecks: 0,
      healthyChecks: 0,
      unhealthyChecks: 0,
      hasDashboard: true,
    });
  });

  it('configures refetchInterval when auto refresh is enabled', () => {
    const queryClient = createTestQueryClient();
    const wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    renderHook(() => useApplicationOverview(1), { wrapper });

    const query = queryClient.getQueryCache().find({ queryKey: dashboardQueryKeys.overview(1) });
    const refetchInterval = (
      query?.observers[0]?.options as { refetchInterval?: number | false } | undefined
    )?.refetchInterval;
    expect(refetchInterval).toBe(DEFAULT_DASHBOARD_REFRESH_INTERVAL);
  });

  it('removes refetchInterval when auto refresh is disabled', () => {
    useDashboardStore.getState().setAutoRefreshEnabled(false);
    const queryClient = createTestQueryClient();
    const wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    renderHook(() => useApplicationOverview(1), { wrapper });

    const query = queryClient.getQueryCache().find({ queryKey: dashboardQueryKeys.overview(1) });
    const refetchInterval = (
      query?.observers[0]?.options as { refetchInterval?: number | false } | undefined
    )?.refetchInterval;
    expect(refetchInterval).toBe(false);
  });
});
