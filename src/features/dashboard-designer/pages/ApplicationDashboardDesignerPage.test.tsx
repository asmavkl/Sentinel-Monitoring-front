import { Route, Routes } from 'react-router-dom';
import { screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { dashboardApi } from '@/api/dashboardApi';
import { applicationDashboardApi } from '@/api/applicationDashboardApi';
import { ApplicationDashboardDesignerPage } from './ApplicationDashboardDesignerPage';
import { renderWithProviders } from '@/test/testUtils';
import { createStatusCardWidget } from '@/test/widgetFixtures';
import { ApplicationHealthStatus } from '@/types/enums';
import { useDashboardStore } from '@/store/dashboardStore';
import { normalizeDashboardLayout } from '@/utils/dashboardLayout';

vi.mock('@/api/dashboardApi', () => ({
  dashboardApi: {
    getApplicationOverview: vi.fn(),
    getApplicationComponents: vi.fn(),
  },
}));

vi.mock('@/api/applicationDashboardApi', () => ({
  applicationDashboardApi: {
    getDashboard: vi.fn(),
    getLayout: vi.fn(),
    createWidget: vi.fn(),
    updateWidget: vi.fn(),
    deleteWidget: vi.fn(),
  },
}));

vi.mock('@/components/widgets/MetricChartWidget', () => ({
  MetricChartWidget: ({ title }: { title: string }) => <div>{title} Chart</div>,
}));

vi.mock('react-grid-layout', () => {
  const GridLayout = ({ children }: { children: React.ReactNode }) => (
    <div data-testid="grid-layout">{children}</div>
  );

  return {
    __esModule: true,
    default: GridLayout,
    verticalCompactor: { type: 'vertical', compact: (items: any[]) => items },
    noCompactor: { type: null, allowOverlap: false, compact: (items: any[]) => items },
    useContainerWidth: () => ({
      width: 1200,
      mounted: true,
      containerRef: { current: null },
      measureWidth: () => undefined,
    }),
  };
});

vi.mock('react-grid-layout/css/styles.css', () => ({}));
vi.mock('react-resizable/css/styles.css', () => ({}));

describe('ApplicationDashboardDesignerPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useDashboardStore.getState().reset();
    vi.mocked(dashboardApi.getApplicationOverview).mockResolvedValue({
      applicationId: 1,
      name: 'سمیح',
      code: 'SAMIH',
      isActive: true,
      calculatedHealthStatus: ApplicationHealthStatus.Up,
      availabilityStatus: ApplicationHealthStatus.Up,
      statusCalculatedAt: '2026-01-01T10:00:00Z',
      totalComponents: 1,
      activeComponents: 1,
      totalChecks: 1,
      activeChecks: 1,
      healthyChecks: 1,
      unhealthyChecks: 0,
      hasDashboard: true,
    });
    vi.mocked(dashboardApi.getApplicationComponents).mockResolvedValue([]);
    vi.mocked(applicationDashboardApi.getDashboard).mockResolvedValue(
      normalizeDashboardLayout({
        dashboardId: 9,
        applicationId: 1,
        name: 'Operations',
        widgets: [createStatusCardWidget({ title: 'API Health' })],
      }),
    );
  });

  it('loads the designer from the application dashboard API', async () => {
    renderWithProviders(
      <Routes>
        <Route
          path="/applications/:applicationId/dashboard/designer"
          element={<ApplicationDashboardDesignerPage />}
        />
      </Routes>,
      { route: '/applications/1/dashboard/designer' },
    );

    await waitFor(() => {
      expect(screen.getByText('طراحی داشبورد')).toBeInTheDocument();
      expect(screen.getAllByText('API Health').length).toBeGreaterThan(0);
      expect(screen.getByRole('button', { name: 'کتابخانه ویجت' })).toBeInTheDocument();
    });

    expect(applicationDashboardApi.getDashboard).toHaveBeenCalledWith(1);
    expect(useDashboardStore.getState().isEditMode).toBe(true);
  });
});
