import { QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { applicationDashboardApi } from '@/api/applicationDashboardApi';
import { useCreateWidget } from './useCreateWidget';
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

describe('useCreateWidget', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('posts a widget to the application dashboard', async () => {
    const created = createStatusCardWidget({ id: 99, title: 'API Health' });
    vi.mocked(applicationDashboardApi.createWidget).mockResolvedValue(created);

    const queryClient = createTestQueryClient();
    const wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    const { result } = renderHook(() => useCreateWidget(1), { wrapper });
    const payload = {
      title: 'API Health',
      widgetType: 'StatusCard' as const,
      displayOrder: 0,
      configuration: { showDuration: true },
      dataSources: [{ checkId: 101, displayOrder: 0 }],
      layout: { x: 0, y: 0, width: 4, height: 2 },
    };

    await result.current.mutateAsync(payload);

    expect(applicationDashboardApi.createWidget).toHaveBeenCalledWith(1, payload);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
  });
});
