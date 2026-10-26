import { QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { applicationDashboardApi } from '@/api/applicationDashboardApi';
import { useDeleteWidget } from './useDeleteWidget';
import { createTestQueryClient } from '@/test/testUtils';

vi.mock('@/api/applicationDashboardApi', () => ({
  applicationDashboardApi: {
    getDashboard: vi.fn(),
    getLayout: vi.fn(),
    createWidget: vi.fn(),
    updateWidget: vi.fn(),
    deleteWidget: vi.fn(),
  },
}));

describe('useDeleteWidget', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deletes a widget from the application dashboard', async () => {
    vi.mocked(applicationDashboardApi.deleteWidget).mockResolvedValue(undefined);

    const queryClient = createTestQueryClient();
    const wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    const { result } = renderHook(() => useDeleteWidget(4), { wrapper });
    await result.current.mutateAsync(501);

    expect(applicationDashboardApi.deleteWidget).toHaveBeenCalledWith(4, 501);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
  });
});
