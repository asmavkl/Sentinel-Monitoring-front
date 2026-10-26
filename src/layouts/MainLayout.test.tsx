import { Route, Routes } from 'react-router-dom';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { applicationsApi } from '@/api/applicationsApi';
import { portalApi } from '@/api/portalApi';
import { monitoredServersApi } from '@/api/monitoredServersApi';
import { ApplicationHealthStatus } from '@/types/enums';
import { browserStorageTokenProvider } from '@/auth';
import { CREDENTIALS_LABEL } from '@/features/database-credentials/utils/credentialLabels';
import { MainLayout } from './MainLayout';
import { createTestJwt, renderWithProviders } from '@/test/testUtils';
import { useUiStore } from '@/store/uiStore';

vi.mock('@/features/monitoring/hooks', () => ({
  useOverallHealthSummary: () => ({
    up: 0,
    warning: 0,
    down: 0,
    unknown: 0,
    outOfService: 0,
    total: 0,
    isFetching: false,
    refetch: vi.fn(),
  }),
}));

vi.mock('@/api/portalApi', () => ({
  portalApi: {
    getCurrentUser: vi.fn(),
  },
}));

vi.mock('@/api/applicationsApi', () => ({
  applicationsApi: {
    getApplications: vi.fn(),
    getApplicationStatus: vi.fn(),
  },
}));

vi.mock('@/api/monitoredServersApi', () => ({
  monitoredServersApi: {
    getMonitoredServers: vi.fn(),
    getServerStatus: vi.fn(),
  },
  DEFAULT_METRIC_HISTORY_LIMIT: 100,
}));

function renderShell(route = '/applications') {
  return renderWithProviders(
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/applications" element={<div>Applications workspace</div>} />
        <Route path="/monitoring/applications" element={<div>Monitoring applications workspace</div>} />
        <Route path="/monitoring/checks" element={<div>Monitoring checks workspace</div>} />
        <Route path="/monitoring/servers" element={<div>Monitoring servers workspace</div>} />
        <Route path="/monitoring/credentials" element={<div>Monitoring credentials workspace</div>} />
        <Route path="/settings" element={<div>Settings workspace</div>} />
      </Route>
    </Routes>,
    { route },
  );
}

describe('MainLayout', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    useUiStore.setState({ sidebarOpen: true, colorMode: 'light' });
    browserStorageTokenProvider.setToken(createTestJwt({ role: 'Admin' }));
    vi.mocked(portalApi.getCurrentUser).mockResolvedValue({
      id: 1,
      userName: 'operator',
      fullName: 'اپراتور پایش',
      email: null,
      mobile: null,
      avatar: null,
      roles: ['Admin'],
      role: 'Admin',
    });
    vi.mocked(applicationsApi.getApplications).mockResolvedValue({
      items: [],
      totalCount: 0,
      pageNumber: 1,
      pageSize: 100,
      totalPages: 0,
    });
    vi.mocked(monitoredServersApi.getMonitoredServers).mockResolvedValue([]);
    vi.mocked(monitoredServersApi.getServerStatus).mockResolvedValue({
      serverId: 1,
      status: null,
      healthStatus: ApplicationHealthStatus.Normal,
      errorMessage: null,
      executionTime: null,
      durationMs: null,
      metrics: [],
    });
  });

  it('renders an RTL monitoring shell with header and sidebar', async () => {
    renderShell();

    expect(screen.getByTestId('monitoring-shell')).toBeInTheDocument();
    expect(screen.getByTestId('monitoring-header')).toBeInTheDocument();
    expect(screen.getByTestId('monitoring-sidebar')).toBeInTheDocument();
    expect(screen.getByText('Applications workspace')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'مرکز پایش' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'تنظیمات' })).toBeInTheDocument();
    expect(screen.getByText('مدیریت پایش')).toBeInTheDocument();
    expect(screen.getByText('سیستم')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'سامانه‌ها' })).toHaveAttribute(
      'href',
      '/monitoring/applications',
    );
    expect(screen.getByRole('link', { name: 'شاخص‌ها' })).toHaveAttribute('href', '/monitoring/checks');
    expect(screen.getByRole('link', { name: CREDENTIALS_LABEL })).toHaveAttribute(
      'href',
      '/monitoring/credentials',
    );
    expect(screen.getByRole('link', { name: 'مرکز پایش' })).toHaveAttribute('href', '/applications');
    expect(screen.getByRole('link', { name: 'تنظیمات' })).toHaveAttribute('href', '/settings');

    await waitFor(() => {
      expect(document.documentElement).toHaveAttribute('dir', 'rtl');
    });
  });

  it('places the sidebar on the right of the workspace', () => {
    renderShell();

    const row = screen.getByTestId('monitoring-workspace-row');
    const sidebar = screen.getByTestId('monitoring-sidebar');
    const main = screen.getByRole('main');

    expect(row).toHaveAttribute('data-sidebar-side', 'right');
    expect(row).toHaveAttribute('dir', 'ltr');
    expect(main).toHaveAttribute('dir', 'rtl');
    expect(sidebar).toHaveAttribute('dir', 'rtl');
    expect(sidebar).toHaveAttribute('data-sidebar-side', 'right');
    expect(row.lastElementChild).toBe(sidebar);
    expect(main.compareDocumentPosition(sidebar) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it('navigates through the compact sidebar', async () => {
    const user = userEvent.setup();
    renderShell('/applications');

    await user.click(screen.getByRole('link', { name: 'سامانه‌ها' }));
    expect(screen.getByText('Monitoring applications workspace')).toBeInTheDocument();

    await user.click(screen.getByRole('link', { name: 'شاخص‌ها' }));
    expect(screen.getByText('Monitoring checks workspace')).toBeInTheDocument();

    await user.click(screen.getByRole('link', { name: CREDENTIALS_LABEL }));
    expect(screen.getByText('Monitoring credentials workspace')).toBeInTheDocument();

    expect(screen.getByRole('link', { name: 'کوئری‌های سلامت' })).toHaveAttribute(
      'href',
      '/monitoring/health-queries',
    );

    await user.click(screen.getByRole('link', { name: 'تنظیمات' }));
    expect(screen.getByText('Settings workspace')).toBeInTheDocument();
  });

  it('shows the health query catalog to non-admins until role checks are enabled', () => {
    browserStorageTokenProvider.setToken(createTestJwt({ role: 'Viewer' }));
    vi.mocked(portalApi.getCurrentUser).mockResolvedValue({
      id: 2,
      userName: 'viewer',
      fullName: 'Viewer User',
      email: null,
      mobile: null,
      avatar: null,
      roles: ['Viewer'],
      role: 'Viewer',
    });
    renderShell();

    expect(screen.getByRole('link', { name: 'کوئری‌های سلامت' })).toHaveAttribute(
      'href',
      '/monitoring/health-queries',
    );
  });
});
