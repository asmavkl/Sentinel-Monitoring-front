import { Route, Routes } from 'react-router-dom';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { applicationsApi } from '@/api/applicationsApi';
import { monitoredServersApi } from '@/api/monitoredServersApi';
import { ApplicationsOverviewPage } from '@/features/applications/pages/ApplicationsOverviewPage';
import { renderWithProviders } from '@/test/testUtils';
import { ApplicationHealthStatus } from '@/types/enums';

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
}));

function mockApplications() {
  vi.mocked(applicationsApi.getApplications).mockResolvedValue({
    items: [
      {
        id: 1,
        name: 'Samih',
        code: 'SAMIH',
        isActive: true,
        priority: 1,
        createdDate: '2026-01-01T00:00:00Z',
      },
      {
        id: 2,
        name: 'ERP',
        code: 'ERP-MAIN',
        isActive: true,
        priority: 2,
        createdDate: '2026-01-01T00:00:00Z',
      },
      {
        id: 3,
        name: 'Reports',
        code: 'RPT',
        isActive: true,
        priority: 3,
        createdDate: '2026-01-01T00:00:00Z',
      },
    ],
    totalCount: 3,
    pageNumber: 1,
    pageSize: 100,
    totalPages: 1,
  });

  vi.mocked(applicationsApi.getApplicationStatus)
    .mockResolvedValueOnce({
      applicationId: 1,
      calculatedHealthStatus: ApplicationHealthStatus.Up,
      availabilityStatus: ApplicationHealthStatus.Up,
      calculatedAt: '2026-01-01T10:00:00Z',
    })
    .mockResolvedValueOnce({
      applicationId: 2,
      calculatedHealthStatus: ApplicationHealthStatus.Down,
      availabilityStatus: ApplicationHealthStatus.Down,
      calculatedAt: '2026-01-01T10:00:00Z',
    })
    .mockRejectedValueOnce(new Error('status unavailable'));
}

function renderOverviewPage() {
  return renderWithProviders(
    <Routes>
      <Route path="/applications" element={<ApplicationsOverviewPage />} />
      <Route path="/monitoring/applications" element={<div>Monitoring applications workspace</div>} />
      <Route path="/applications/:applicationId/dashboard" element={<div>Opened dashboard</div>} />
      <Route path="/monitoring/servers/:id" element={<div>Opened server</div>} />
    </Routes>,
    { route: '/applications' },
  );
}

describe('ApplicationsOverviewPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(monitoredServersApi.getMonitoredServers).mockResolvedValue([]);
  });

  it('renders groups and application health cards with status colors', async () => {
    mockApplications();
    renderOverviewPage();

    expect(screen.getByText('در حال بارگذاری سامانه ها...')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Samih')).toBeInTheDocument();
      expect(screen.getByText('ERP')).toBeInTheDocument();
      expect(screen.getByText('Reports')).toBeInTheDocument();
    });

    expect(screen.getByText('سامانه های حیاتی')).toBeInTheDocument();
    expect(screen.getByText('سامانه های مهم')).toBeInTheDocument();
    expect(screen.getByText('سامانه های کم اهمیت')).toBeInTheDocument();

    const groups = screen.getAllByTestId('application-group-section');
    expect(groups).toHaveLength(3);
    expect(groups[0]).toHaveAttribute('data-group-color', 'blue');
    expect(groups[1]).toHaveAttribute('data-group-color', 'purple');
    expect(groups[2]).toHaveAttribute('data-group-color', 'gray');

    const cards = screen.getAllByTestId('application-health-card');
    expect(cards).toHaveLength(3);

    expect(
      within(screen.getByRole('link', { name: 'Samih' })).getByTestId('application-status-block'),
    ).toHaveAttribute('data-status', 'UP');
    expect(
      within(screen.getByRole('link', { name: 'ERP' })).getByTestId('application-status-block'),
    ).toHaveAttribute('data-status', 'DOWN');
    expect(
      within(screen.getByRole('link', { name: 'Reports' })).getByTestId('application-status-block'),
    ).toHaveAttribute('data-status', 'UNKNOWN');

    expect(screen.getAllByText(/سالم/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/قطع/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/نامشخص/).length).toBeGreaterThan(0);
    expect(screen.getAllByText('وضعیت سلامت')).toHaveLength(3);
    expect(screen.getByTestId('applications-wall')).toBeInTheDocument();
  });

  it('navigates to the application dashboard when a card is opened', async () => {
    mockApplications();
    const user = userEvent.setup();
    renderOverviewPage();

    await waitFor(() => {
      expect(screen.getByRole('link', { name: 'Samih' })).toBeInTheDocument();
    });

    await user.click(screen.getByRole('link', { name: 'Samih' }));

    expect(screen.getByText('Opened dashboard')).toBeInTheDocument();
  });

  it('shows loading state', () => {
    vi.mocked(applicationsApi.getApplications).mockReturnValue(new Promise(() => undefined));

    renderWithProviders(<ApplicationsOverviewPage />);

    expect(screen.getByText('در حال بارگذاری سامانه ها...')).toBeInTheDocument();
    expect(screen.getByTestId('monitoring-page-header')).toBeInTheDocument();
  });

  it('shows API error state', async () => {
    vi.mocked(applicationsApi.getApplications).mockRejectedValue(new Error('API unavailable'));

    renderWithProviders(<ApplicationsOverviewPage />);

    await waitFor(() => {
      expect(screen.getByText('امکان بارگذاری سامانه ها وجود ندارد')).toBeInTheDocument();
      expect(screen.getByText('API unavailable')).toBeInTheDocument();
    });
  });

  it('shows a monitoring empty state when there are no applications', async () => {
    vi.mocked(applicationsApi.getApplications).mockResolvedValue({
      items: [],
      totalCount: 0,
      pageNumber: 1,
      pageSize: 100,
      totalPages: 0,
    });

    renderWithProviders(<ApplicationsOverviewPage />);

    await waitFor(() => {
      expect(
        screen.getByText('در حال حاضر سامانه ای برای پایش تعریف نشده است'),
      ).toBeInTheDocument();
    });

    expect(screen.getByRole('button', { name: 'تعریف سامانه ها' })).toBeInTheDocument();
  });

  it('opens the application management page from the empty state', async () => {
    vi.mocked(applicationsApi.getApplications).mockResolvedValue({
      items: [],
      totalCount: 0,
      pageNumber: 1,
      pageSize: 100,
      totalPages: 0,
    });
    const user = userEvent.setup();
    renderOverviewPage();

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'تعریف سامانه ها' })).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: 'تعریف سامانه ها' }));
    expect(screen.getByText('Monitoring applications workspace')).toBeInTheDocument();
  });

  it('shows SNMP servers on the dashboard and opens the server page', async () => {
    mockApplications();
    vi.mocked(monitoredServersApi.getMonitoredServers).mockResolvedValue([
      {
        id: 4,
        name: 'Production DB Server',
        description: null,
        host: '10.10.1.20',
        port: 161,
        monitoringMethod: 1,
        credentialId: 7,
        isActive: true,
        intervalSeconds: 30,
        timeoutSeconds: 20,
        retryCount: 0,
        retryDelaySeconds: 5,
        lastRunTime: null,
        nextRunTime: null,
        createdDate: '2026-09-28T10:00:00Z',
        updatedDate: null,
      },
    ]);
    vi.mocked(monitoredServersApi.getServerStatus).mockResolvedValue({
      serverId: 4,
      status: 1,
      healthStatus: ApplicationHealthStatus.Normal,
      errorMessage: null,
      executionTime: '2026-09-28T10:00:00Z',
      durationMs: 20,
      metrics: [],
    });
    const user = userEvent.setup();
    renderOverviewPage();

    await waitFor(() => {
      expect(screen.getByText('سرورهای SNMP')).toBeInTheDocument();
      expect(screen.getByRole('link', { name: 'Production DB Server' })).toBeInTheDocument();
    });

    await user.click(screen.getByRole('link', { name: 'Production DB Server' }));
    expect(screen.getByText('Opened server')).toBeInTheDocument();
  });
});
