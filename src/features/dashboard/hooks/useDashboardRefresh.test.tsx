import { QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useDashboardRefresh } from './useDashboardRefresh';
import { dashboardQueryKeys } from './queryKeys';
import { createTestQueryClient } from '@/test/testUtils';

describe('useDashboardRefresh', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('invalidates dashboard queries on refresh', async () => {
    const queryClient = createTestQueryClient();
    const invalidateQueries = vi.spyOn(queryClient, 'invalidateQueries');

    const wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    const { result } = renderHook(() => useDashboardRefresh(1), { wrapper });
    await result.current.refreshDashboard();

    await waitFor(() => {
      expect(invalidateQueries).toHaveBeenCalled();
    });

    const invalidatedKeys = invalidateQueries.mock.calls.map((call) => call[0]?.queryKey);
    expect(invalidatedKeys).toEqual(
      expect.arrayContaining([
        ['application-overview'],
        ['application-components'],
        ['application-dashboard'],
        ['dashboard-layout'],
        ['check-status'],
        ['check-metrics'],
      ]),
    );
    expect(dashboardQueryKeys.overview(1)[0]).toBe('application-overview');
  });

  it('keeps previous data and reports an error when refresh fails', async () => {
    const queryClient = createTestQueryClient();
    queryClient.setQueryData(dashboardQueryKeys.overview(1), { name: 'Samih' });
    vi.spyOn(queryClient, 'invalidateQueries').mockRejectedValue(new Error('network'));

    const wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    const { result } = renderHook(() => useDashboardRefresh(1), { wrapper });
    await result.current.refreshDashboard();

    await waitFor(() => {
      expect(result.current.refreshError).toBe('بروزرسانی داشبورد ممکن نیست');
    });

    expect(queryClient.getQueryData(dashboardQueryKeys.overview(1))).toEqual({ name: 'Samih' });
  });
});
