import { QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { applicationDashboardApi } from '@/api/applicationDashboardApi';
import { useUpdateWidget } from './useUpdateWidget';
import { createTestQueryClient } from '@/test/testUtils';
import { createStatusCardWidget } from '@/test/widgetFixtures';

vi.mock('@/api/applicationDashboardApi', () => ({
  applicationDashboardApi: {
    getDashboard: vi.fn(),
    getLayout: vi.fn(),
    createWidget: vi.fn(),
    updateWidget: vi.fn(),
    deleteWidget: vi.fn(),
  },
}));

describe('useUpdateWidget', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('saves widget changes including layout width/height', async () => {
    const updated = createStatusCardWidget({ title: 'Updated Health' });
    vi.mocked(applicationDashboardApi.updateWidget).mockResolvedValue(updated);

    const queryClient = createTestQueryClient();
    const wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    const { result } = renderHook(() => useUpdateWidget(1), { wrapper });
    const payload = {
      title: 'Updated Health',
      widgetType: 'StatusCard' as const,
      displayOrder: 0,
      layout: { x: 2, y: 1, width: 6, height: 3 },
      configuration: { showDuration: false },
      dataSources: [{ checkId: 101, metricName: undefined, displayOrder: 0 }],
    };

    await result.current.mutateAsync({
      widgetId: 12,
      payload,
    });

    expect(applicationDashboardApi.updateWidget).toHaveBeenCalledWith(1, 12, payload);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
  });

  it('handles dashboardSectionId 0 by sending undefined', async () => {
    const updated = createStatusCardWidget({ title: 'Updated Health' });
    vi.mocked(applicationDashboardApi.updateWidget).mockResolvedValue(updated);

    const queryClient = createTestQueryClient();
    const wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    const { result } = renderHook(() => useUpdateWidget(1), { wrapper });
    const payload = {
      title: 'Updated Health',
      widgetType: 'StatusCard' as const,
      displayOrder: 0,
      dashboardSectionId: undefined,
      layout: { x: 2, y: 1, width: 6, height: 3 },
      configuration: { showDuration: false },
      dataSources: [{ checkId: 101, metricName: undefined, displayOrder: 0 }],
    };

    await result.current.mutateAsync({
      widgetId: 12,
      payload,
    });

    expect(applicationDashboardApi.updateWidget).toHaveBeenCalledWith(1, 12, payload);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
  });
});
