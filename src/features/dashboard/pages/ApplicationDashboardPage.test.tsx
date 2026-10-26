import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Route, Routes } from 'react-router-dom';
import { dashboardApi } from '@/api/dashboardApi';
import { applicationDashboardApi } from '@/api/applicationDashboardApi';
import { browserStorageTokenProvider } from '@/auth';
import { ApplicationDashboardPage } from '@/features/dashboard/pages/ApplicationDashboardPage';
import { createTestJwt, renderWithProviders } from '@/test/testUtils';
import { createStatusCardWidget } from '@/test/widgetFixtures';
import { ApplicationHealthStatus } from '@/types/enums';
import { useDashboardStore } from '@/store/dashboardStore';
import { normalizeDashboardLayout } from '@/utils/dashboardLayout';

vi.mock('@/api/dashboardApi', () => ({
  dashboardApi: {
    getApplicationOverview: vi.fn(),
    getApplicationComponents: vi.fn(),
    getCheckStatus: vi.fn(),
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

vi.mock('@/api/portalApi', () => ({
  portalApi: {
    getCurrentUser: vi.fn().mockResolvedValue({
      id: 1,
      userName: 'viewer',
      fullName: 'Portal Viewer',
      email: null,
      mobile: null,
      avatar: null,
      roles: [],
      role: null,
    }),
  },
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

function mockDashboardData() {
  vi.mocked(dashboardApi.getApplicationOverview).mockResolvedValue({
    applicationId: 1,
    name: 'Samih',
    code: 'SAMIH',
    isActive: true,
    calculatedHealthStatus: ApplicationHealthStatus.Up,
    availabilityStatus: ApplicationHealthStatus.Up,
    statusCalculatedAt: '2026-01-01T10:00:00Z',
    totalComponents: 2,
    activeComponents: 2,
    totalChecks: 10,
    activeChecks: 10,
    healthyChecks: 10,
    unhealthyChecks: 0,
    hasDashboard: true,
  });

  vi.mocked(applicationDashboardApi.getDashboard).mockResolvedValue(
    normalizeDashboardLayout({
      dashboardId: 1,
      applicationId: 1,
      name: 'Main Dashboard',
      widgets: [createStatusCardWidget({ title: 'API Health' })],
    }),
  );
}

function renderDashboard(route = '/applications/1/dashboard') {
  return renderWithProviders(
    <Routes>
      <Route path="/applications/:applicationId/dashboard" element={<ApplicationDashboardPage />} />
      <Route
        path="/applications/:applicationId/dashboard/designer"
        element={<div>Designer page</div>}
      />
    </Routes>,
    { route },
  );
}

describe('ApplicationDashboardPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    useDashboardStore.getState().reset();
  });

  it('loads thin health header and widgets without overview/component cards', async () => {
    mockDashboardData();
    renderDashboard();

    await waitFor(() => {
      expect(screen.getByTestId('thin-health-header')).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: 'Samih' })).toBeInTheDocument();
      expect(screen.getByText('API Health')).toBeInTheDocument();
    });

    expect(applicationDashboardApi.getDashboard).toHaveBeenCalledWith(1);
    expect(dashboardApi.getApplicationComponents).not.toHaveBeenCalled();
    expect(screen.queryByText('مولفه‌ها')).not.toBeInTheDocument();
    expect(screen.queryByText('API Service')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'ویرایش داشبورد' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'بروزرسانی داشبورد' })).toBeInTheDocument();
  });

  it('renders widgets from the dashboard layout payload', async () => {
    mockDashboardData();
    renderDashboard();

    await waitFor(() => {
      expect(screen.getByText('API Health')).toBeInTheDocument();
    });
  });

  it('refreshes dashboard data from the refresh button', async () => {
    mockDashboardData();
    const user = userEvent.setup();
    renderDashboard();

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'بروزرسانی داشبورد' })).toBeInTheDocument();
    });

    const overviewCalls = vi.mocked(dashboardApi.getApplicationOverview).mock.calls.length;
    await user.click(screen.getByRole('button', { name: 'بروزرسانی داشبورد' }));

    await waitFor(() => {
      expect(vi.mocked(dashboardApi.getApplicationOverview).mock.calls.length).toBeGreaterThan(
        overviewCalls,
      );
    });
  });

  it('keeps dashboard data and last updated time when refresh fails', async () => {
    mockDashboardData();
    const user = userEvent.setup();
    renderDashboard();

    await waitFor(() => {
      expect(screen.getByText('API Health')).toBeInTheDocument();
    });

    const lastUpdated = screen.getByTestId('last-updated-label').textContent;

    vi.mocked(dashboardApi.getApplicationOverview).mockRejectedValue(new Error('Refresh failed'));
    vi.mocked(applicationDashboardApi.getDashboard).mockRejectedValue(new Error('Refresh failed'));

    await user.click(screen.getByRole('button', { name: 'بروزرسانی داشبورد' }));

    await waitFor(() => {
      expect(screen.getByText('بروزرسانی داشبورد ممکن نیست')).toBeInTheDocument();
    });

    expect(screen.getByText('API Health')).toBeInTheDocument();
    expect(screen.getByTestId('last-updated-label').textContent).toBe(lastUpdated);
  });

  it('opens the designer route for authenticated users', async () => {
    mockDashboardData();
    browserStorageTokenProvider.setToken(createTestJwt({ role: 'Viewer' }));
    const user = userEvent.setup();
    renderDashboard();

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'ویرایش داشبورد' })).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: 'ویرایش داشبورد' }));
    expect(screen.getByText('Designer page')).toBeInTheDocument();
  });

  it('renders loading state', () => {
    vi.mocked(dashboardApi.getApplicationOverview).mockReturnValue(new Promise(() => undefined));
    vi.mocked(applicationDashboardApi.getDashboard).mockReturnValue(new Promise(() => undefined));

    renderDashboard();

    expect(screen.getByText('در حال بارگذاری داشبورد...')).toBeInTheDocument();
  });

  it('renders overview error state', async () => {
    vi.mocked(dashboardApi.getApplicationOverview).mockRejectedValue(new Error('Overview failed'));
    vi.mocked(applicationDashboardApi.getDashboard).mockResolvedValue(
      normalizeDashboardLayout({
        dashboardId: 1,
        applicationId: 1,
        name: 'Main Dashboard',
        widgets: [],
      }),
    );

    renderDashboard();

    await waitFor(() => {
      expect(screen.getByText('بارگذاری داشبورد ممکن نیست')).toBeInTheDocument();
      expect(screen.getByText('Overview failed')).toBeInTheDocument();
    });
  });
});
