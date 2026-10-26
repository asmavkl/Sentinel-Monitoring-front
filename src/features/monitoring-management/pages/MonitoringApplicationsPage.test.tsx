import { Route, Routes } from 'react-router-dom';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { monitoringManagementApi } from '@/api/monitoringManagementApi';
import { portalApi } from '@/api/portalApi';
import { browserStorageTokenProvider } from '@/auth';
import { MonitoringApplicationsPage } from './MonitoringApplicationsPage';
import { createTestJwt, renderWithProviders } from '@/test/testUtils';

vi.mock('@/api/monitoringManagementApi', () => ({
  monitoringManagementApi: {
    getMonitoringApplications: vi.fn(),
    getMonitoringApplication: vi.fn(),
    createMonitoringApplication: vi.fn(),
    updateMonitoringApplication: vi.fn(),
    deleteMonitoringApplication: vi.fn(),
    getApplicationComponents: vi.fn(),
    createApplicationComponent: vi.fn(),
    updateApplicationComponent: vi.fn(),
    deleteApplicationComponent: vi.fn(),
    getApplicationChecks: vi.fn(),
  },
}));

vi.mock('@/api/dashboardTemplatesApi', () => ({
  dashboardTemplatesApi: {
    getTemplates: vi.fn().mockResolvedValue([
      { id: 1, name: 'Empty Dashboard', code: 'empty' },
      { id: 2, name: 'Standard Monitoring Dashboard', code: 'standard' },
      { id: 3, name: 'NOC Dashboard', code: 'noc' },
    ]),
  },
}));

vi.mock('@/api/portalApi', () => ({
  portalApi: {
    getCurrentUser: vi.fn(),
  },
}));

function mockUser(role: 'Admin' | 'Viewer' | 'Operator') {
  vi.mocked(portalApi.getCurrentUser).mockResolvedValue({
    id: role === 'Admin' ? 1 : 2,
    userName: role.toLowerCase(),
    fullName: `${role} User`,
    email: null,
    mobile: null,
    avatar: null,
    roles: [role],
    role: role,
  });
}

function mockApplications() {
  vi.mocked(monitoringManagementApi.getMonitoringApplications).mockResolvedValue({
    items: [
      {
        id: 1,
        name: 'سمیح',
        code: 'SAMIH',
        description: 'سامانه سمیح',
        baseUrl: 'https://samih.example',
        isActive: true,
        priority: 2,
        createdDate: '2026-01-01T10:00:00Z',
      },
    ],
    totalCount: 1,
    pageNumber: 1,
    pageSize: 100,
    totalPages: 1,
  });
  vi.mocked(monitoringManagementApi.getApplicationComponents).mockResolvedValue([
    { id: 11, applicationId: 1, name: 'API', code: 'API', isActive: true },
    { id: 12, applicationId: 1, name: 'DB', code: 'DB', isActive: true },
    { id: 13, applicationId: 1, name: 'Cache', code: 'CACHE', isActive: true },
  ]);
  vi.mocked(monitoringManagementApi.getApplicationChecks).mockResolvedValue([{ id: 21 }, { id: 22 }]);
}

function renderPage() {
  return renderWithProviders(
    <Routes>
      <Route path="/monitoring/applications" element={<MonitoringApplicationsPage />} />
      <Route path="/monitoring/applications/:id" element={<div>Application details</div>} />
    </Routes>,
    { route: '/monitoring/applications' },
  );
}

describe('MonitoringApplicationsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    browserStorageTokenProvider.setToken(createTestJwt({ role: 'Admin' }));
    mockUser('Admin');
  });

  it('renders the applications page', async () => {
    mockApplications();
    renderPage();

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'افزودن سامانه' })).toBeInTheDocument();
    });

    expect(screen.getByText('مدیریت پایش')).toBeInTheDocument();
    expect(screen.getByText('سامانه‌ها')).toBeInTheDocument();
  });

  it('loads the applications list', async () => {
    mockApplications();
    renderPage();

    await waitFor(() => {
      expect(screen.getByText('سمیح')).toBeInTheDocument();
    });

    expect(screen.getByTestId('application-table')).toHaveAttribute('dir', 'rtl');
    expect(screen.getByText('SAMIH')).toBeInTheDocument();
    expect(screen.getByText('https://samih.example')).toBeInTheDocument();
    expect(screen.getByText('فعال')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'نام سامانه' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Base URL' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'تعداد مولفه' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'تعداد شاخص' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'آخرین بروزرسانی' })).toBeInTheDocument();
  });

  it('shows a specific empty state when no applications exist', async () => {
    vi.mocked(monitoringManagementApi.getMonitoringApplications).mockResolvedValue({
      items: [],
      totalCount: 0,
      pageNumber: 1,
      pageSize: 100,
      totalPages: 0,
    });
    renderPage();

    await waitFor(() => {
      expect(screen.getByText('هیچ سامانه‌ای برای پایش تعریف نشده است')).toBeInTheDocument();
    });
  });

  it('opens the create dialog and creates an application', async () => {
    mockApplications();
    vi.mocked(monitoringManagementApi.createMonitoringApplication).mockResolvedValue({
      id: 2,
      name: 'پرداخت',
      code: 'PAY',
      isActive: true,
      priority: 2,
    });
    const user = userEvent.setup();
    renderPage();

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'افزودن سامانه' })).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: 'افزودن سامانه' }));
    const dialog = await screen.findByRole('dialog');
    expect(dialog).toBeInTheDocument();

    await user.type(within(dialog).getByLabelText('نام سامانه'), 'پرداخت');
    await user.type(within(dialog).getByLabelText('کد سامانه'), 'PAY');
    await user.click(within(dialog).getByRole('button', { name: 'ذخیره' }));

    await waitFor(() => {
      expect(monitoringManagementApi.createMonitoringApplication).toHaveBeenCalledWith({
        name: 'پرداخت',
        code: 'PAY',
        description: null,
        baseUrl: null,
        isActive: true,
        priority: 2,
        dashboardTemplateId: null,
      });
    });
  });

  it('shows Persian validation messages for required fields and Base URL', async () => {
    mockApplications();
    const user = userEvent.setup();
    renderPage();

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'افزودن سامانه' })).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: 'افزودن سامانه' }));
    const dialog = await screen.findByRole('dialog');
    await user.type(within(dialog).getByLabelText('Base URL'), 'not-a-url');
    await user.click(within(dialog).getByRole('button', { name: 'ذخیره' }));

    expect(within(dialog).getByText('نام سامانه الزامی است')).toBeInTheDocument();
    expect(within(dialog).getByText('کد سامانه الزامی است')).toBeInTheDocument();
    expect(within(dialog).getByText('Base URL معتبر نیست')).toBeInTheDocument();
    expect(monitoringManagementApi.createMonitoringApplication).not.toHaveBeenCalled();
  });

  it('edits an application', async () => {
    mockApplications();
    vi.mocked(monitoringManagementApi.updateMonitoringApplication).mockResolvedValue({
      id: 1,
      name: 'سمیح به روز',
      code: 'SAMIH',
      isActive: true,
      priority: 2,
    });
    const user = userEvent.setup();
    renderPage();

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'ویرایش سمیح' })).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: 'ویرایش سمیح' }));
    const dialog = await screen.findByRole('dialog');
    const nameInput = within(dialog).getByLabelText('نام سامانه');
    await user.clear(nameInput);
    await user.type(nameInput, 'سمیح به روز');
    await user.click(within(dialog).getByRole('button', { name: 'ذخیره' }));

    await waitFor(() => {
      expect(monitoringManagementApi.updateMonitoringApplication).toHaveBeenCalledWith(1, {
        name: 'سمیح به روز',
        description: 'سامانه سمیح',
        baseUrl: 'https://samih.example',
        isActive: true,
        priority: 2,
      });
    });
  });

  it('deletes an application', async () => {
    mockApplications();
    vi.mocked(monitoringManagementApi.deleteMonitoringApplication).mockResolvedValue(true);
    const user = userEvent.setup();
    renderPage();

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'حذف سمیح' })).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: 'حذف سمیح' }));
    await user.click(screen.getByRole('button', { name: 'حذف' }));

    await waitFor(() => {
      expect(monitoringManagementApi.deleteMonitoringApplication).toHaveBeenCalledWith(1);
    });
  });

  it('navigates to application details', async () => {
    mockApplications();
    const user = userEvent.setup();
    renderPage();

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'مشاهده سمیح' })).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: 'مشاهده سمیح' }));
    expect(screen.getByText('Application details')).toBeInTheDocument();
  });

  it('shows write actions for Admin', async () => {
    mockApplications();
    renderPage();

    await waitFor(() => {
      expect(screen.getByText('سمیح')).toBeInTheDocument();
    });

    expect(screen.getByRole('button', { name: 'افزودن سامانه' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'افزودن مولفه به سمیح' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'ویرایش سمیح' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'حذف سمیح' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'مشاهده سمیح' })).toBeInTheDocument();
  });

  it('creates a component from the applications table', async () => {
    mockApplications();
    vi.mocked(monitoringManagementApi.createApplicationComponent).mockResolvedValue({
      id: 14,
      applicationId: 1,
      name: 'Authentication',
      code: 'AUTHENTICATION',
      isActive: true,
    });
    const user = userEvent.setup();
    renderPage();

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'افزودن مولفه به سمیح' })).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: 'افزودن مولفه به سمیح' }));
    const dialog = await screen.findByRole('dialog');
    await user.type(within(dialog).getByLabelText('نام مولفه'), 'Authentication');
    await user.click(within(dialog).getByRole('button', { name: 'ذخیره' }));

    await waitFor(() => {
      expect(monitoringManagementApi.createApplicationComponent).toHaveBeenCalledWith({
        applicationId: 1,
        name: 'Authentication',
        code: 'AUTHENTICATION',
        description: null,
        isActive: true,
      });
    });
  });

  it('hides write actions for Viewer', async () => {
    browserStorageTokenProvider.setToken(createTestJwt({ role: 'Viewer' }));
    mockUser('Viewer');
    mockApplications();
    renderPage();

    await waitFor(() => {
      expect(screen.getByText('سمیح')).toBeInTheDocument();
    });

    expect(screen.queryByRole('button', { name: 'افزودن سامانه' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'مشاهده سمیح' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'افزودن مولفه به سمیح' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'ویرایش سمیح' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'حذف سمیح' })).not.toBeInTheDocument();
  });

  it('hides write actions for Operator', async () => {
    browserStorageTokenProvider.setToken(createTestJwt({ role: 'Operator' }));
    mockUser('Operator');
    mockApplications();
    renderPage();

    await waitFor(() => {
      expect(screen.getByText('سمیح')).toBeInTheDocument();
    });

    expect(screen.queryByRole('button', { name: 'افزودن سامانه' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'مشاهده سمیح' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'افزودن مولفه به سمیح' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'ویرایش سمیح' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'حذف سمیح' })).not.toBeInTheDocument();
  });
});
