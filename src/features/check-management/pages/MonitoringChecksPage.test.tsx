import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { checkManagementApi } from '@/api/checkManagementApi';
import { databaseCredentialsApi } from '@/api/databaseCredentialsApi';
import { portalApi } from '@/api/portalApi';
import { browserStorageTokenProvider } from '@/auth';
import { credentialScopeLabel } from '@/features/database-credentials/utils/credentialLabels';
import { MonitoringChecksPage } from './MonitoringChecksPage';
import { createTestJwt, renderWithProviders } from '@/test/testUtils';
import { ExecutionStatus, ApplicationHealthStatus, HttpMethod } from '@/types/enums';
import type { CheckListItem } from '@/types/checkManagement';

vi.mock('@/api/checkManagementApi', () => ({
  checkManagementApi: {
    getMonitoringApplications: vi.fn(),
    getApplicationComponents: vi.fn(),
    getChecks: vi.fn(),
    getCheck: vi.fn(),
    createCheck: vi.fn(),
    updateCheck: vi.fn(),
    deleteCheck: vi.fn(),
    activateCheck: vi.fn(),
    deactivateCheck: vi.fn(),
  },
}));

vi.mock('@/api/databaseCredentialsApi', () => ({
  databaseCredentialsApi: {
    getDatabaseCredentials: vi.fn(),
  },
}));

vi.mock('@/api/portalApi', () => ({
  portalApi: {
    getCurrentUser: vi.fn(),
  },
}));

const httpCheck: CheckListItem = {
  id: 21,
  applicationComponentId: 11,
  applicationId: 1,
  name: 'Health API',
  checkType: 1, // HttpRequest or Http (both have value 1)
  intervalSeconds: 60,
  timeoutSeconds: 10,
  retryCount: 3,
  retryDelaySeconds: 5,
  isActive: true,
  applicationName: 'سمیح',
  componentName: 'API',
  lastStatus: ExecutionStatus.Success,
  lastHealthStatus: ApplicationHealthStatus.Normal,
};

const databaseCheck: CheckListItem = {
  id: 22,
  applicationComponentId: 12,
  applicationId: 2,
  name: 'Status Count',
  checkType: 2, // SqlQuery or DatabaseQuery (both have value 2)
  intervalSeconds: 120,
  timeoutSeconds: 20,
  retryCount: 1,
  retryDelaySeconds: 5,
  isActive: false,
  applicationName: 'پرداخت',
  componentName: 'DB',
  lastStatus: null,
};

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

function mockListData() {
  vi.mocked(checkManagementApi.getChecks).mockResolvedValue({
    items: [httpCheck, databaseCheck],
    totalCount: 2,
    pageNumber: 1,
    pageSize: 10,
    totalPages: 1,
  });
  vi.mocked(checkManagementApi.getMonitoringApplications).mockResolvedValue({
    items: [
      { id: 1, name: 'سمیح', code: 'SAMIH', isActive: true, priority: 2 },
      { id: 2, name: 'پرداخت', code: 'PAY', isActive: true, priority: 1 },
    ],
    totalCount: 2,
    pageNumber: 1,
    pageSize: 100,
    totalPages: 1,
  });
  vi.mocked(checkManagementApi.getApplicationComponents).mockResolvedValue([
    { id: 11, applicationId: 1, name: 'API', code: 'API', isActive: true },
    { id: 12, applicationId: 1, name: 'DB', code: 'DB', isActive: true },
  ]);
  vi.mocked(databaseCredentialsApi.getDatabaseCredentials).mockResolvedValue([
    {
      id: 5,
      name: 'Reporting DB',
      server: 'sql-01',
      databaseName: 'Logs',
      username: 'monitor',
      isActive: true,
    },
  ]);
  vi.mocked(checkManagementApi.getCheck).mockResolvedValue(httpCheck);
}

async function openCreateDialog(user: ReturnType<typeof userEvent.setup>) {
  await waitFor(() => {
    expect(screen.getByRole('button', { name: 'افزودن شاخص' })).toBeInTheDocument();
  });
  await user.click(screen.getByRole('button', { name: 'افزودن شاخص' }));
  return screen.findByRole('dialog');
}

describe('MonitoringChecksPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    browserStorageTokenProvider.setToken(createTestJwt({ role: 'Admin' }));
    mockUser('Admin');
  });

  it('renders checks', async () => {
    mockListData();
    renderWithProviders(<MonitoringChecksPage />);

    await waitFor(() => {
      expect(screen.getByText('Health API')).toBeInTheDocument();
    });

    expect(screen.getByText('مدیریت پایش')).toBeInTheDocument();
    expect(screen.getByText('شاخص‌ها')).toBeInTheDocument();
    expect(screen.getByTestId('check-table')).toHaveAttribute('dir', 'rtl');
    expect(screen.getByText('سمیح')).toBeInTheDocument();
    expect(screen.getByText('API')).toBeInTheDocument();
    expect(screen.getByText('شاخص HTTP')).toBeInTheDocument();
    expect(screen.getByText('Status Count')).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'نام شاخص' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'آخرین وضعیت' })).toBeInTheDocument();
    expect(screen.getByText('سالم')).toBeInTheDocument();
    expect(screen.getByText('نامشخص')).toBeInTheDocument();
  });

  it('filters data', async () => {
    mockListData();
    const user = userEvent.setup();
    renderWithProviders(<MonitoringChecksPage />);

    await waitFor(() => {
      expect(screen.getByText('Health API')).toBeInTheDocument();
    });

    await user.type(screen.getByLabelText('جستجوی شاخص'), 'Health');

    expect(screen.getByText('Health API')).toBeInTheDocument();
    expect(screen.queryByText('Status Count')).not.toBeInTheDocument();
  });

  it('opens the create dialog', async () => {
    mockListData();
    const user = userEvent.setup();
    renderWithProviders(<MonitoringChecksPage />);

    const dialog = await openCreateDialog(user);
    expect(within(dialog).getByText('افزودن شاخص')).toBeInTheDocument();
    expect(within(dialog).getByLabelText('سامانه')).toBeInTheDocument();
  });

  it('selects an application and loads components', async () => {
    mockListData();
    const user = userEvent.setup();
    renderWithProviders(<MonitoringChecksPage />);

    const dialog = await openCreateDialog(user);
    await user.click(within(dialog).getByLabelText('سامانه'));
    await user.click(await screen.findByRole('option', { name: 'سمیح' }));

    await waitFor(() => {
      expect(checkManagementApi.getApplicationComponents).toHaveBeenCalledWith(1);
    });

    await user.click(within(dialog).getByRole('button', { name: 'بعدی' }));
    expect(within(dialog).getByLabelText('مولفه')).toBeInTheDocument();
    await user.click(within(dialog).getByLabelText('مولفه'));
    expect(await screen.findByRole('option', { name: 'API' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'DB' })).toBeInTheDocument();
  }, 15000);

  it('selects HTTP type and shows the HTTP form', async () => {
    mockListData();
    const user = userEvent.setup();
    renderWithProviders(<MonitoringChecksPage />);

    const dialog = await openCreateDialog(user);
    await user.click(within(dialog).getByLabelText('سامانه'));
    await user.click(await screen.findByRole('option', { name: 'سمیح' }));
    await user.click(within(dialog).getByRole('button', { name: 'بعدی' }));
    await user.click(within(dialog).getByLabelText('مولفه'));
    await user.click(await screen.findByRole('option', { name: 'API' }));
    await user.click(within(dialog).getByRole('button', { name: 'بعدی' }));
    await user.click(within(dialog).getByRole('radio', { name: 'شاخص HTTP' }));
    await user.click(within(dialog).getByRole('button', { name: 'بعدی' }));

    expect(within(dialog).getByLabelText('URL')).toBeInTheDocument();
    expect(within(dialog).getByLabelText('HTTP Method')).toBeInTheDocument();
    expect(within(dialog).getByLabelText('Expected Status Code')).toBeInTheDocument();
  }, 15000);

  it('selects Database type and shows the database form', async () => {
    mockListData();
    const user = userEvent.setup();
    renderWithProviders(<MonitoringChecksPage />);

    const dialog = await openCreateDialog(user);
    await user.click(within(dialog).getByLabelText('سامانه'));
    await user.click(await screen.findByRole('option', { name: 'سمیح' }));
    await user.click(within(dialog).getByRole('button', { name: 'بعدی' }));
    await user.click(within(dialog).getByLabelText('مولفه'));
    await user.click(await screen.findByRole('option', { name: 'DB' }));
    await user.click(within(dialog).getByRole('button', { name: 'بعدی' }));
    await user.click(within(dialog).getByRole('radio', { name: 'شاخص Database' }));
    await user.click(within(dialog).getByRole('button', { name: 'بعدی' }));

    await waitFor(() => {
      expect(databaseCredentialsApi.getDatabaseCredentials).toHaveBeenCalled();
    });
    expect(within(dialog).getByLabelText('Query')).toBeInTheDocument();
    expect(within(dialog).getByLabelText(credentialScopeLabel('Database'))).toBeInTheDocument();
    expect(within(dialog).getByLabelText('Result Type')).toBeInTheDocument();
  }, 15000);

  it('shows Persian validation messages for required fields', async () => {
    mockListData();
    const user = userEvent.setup();
    renderWithProviders(<MonitoringChecksPage />);

    const dialog = await openCreateDialog(user);
    await user.click(within(dialog).getByLabelText('سامانه'));
    await user.click(await screen.findByRole('option', { name: 'سمیح' }));
    await user.click(within(dialog).getByRole('button', { name: 'بعدی' }));
    await user.click(within(dialog).getByLabelText('مولفه'));
    await user.click(await screen.findByRole('option', { name: 'API' }));
    await user.click(within(dialog).getByRole('button', { name: 'بعدی' }));
    await user.click(within(dialog).getByRole('radio', { name: 'شاخص HTTP' }));
    await user.click(within(dialog).getByRole('button', { name: 'بعدی' }));

    await user.clear(within(dialog).getByLabelText('نام شاخص'));
    await user.clear(within(dialog).getByLabelText('Interval Seconds'));
    await user.clear(within(dialog).getByLabelText('URL'));
    await user.clear(within(dialog).getByLabelText('Expected Status Code'));
    await user.click(within(dialog).getByRole('button', { name: 'ذخیره' }));

    expect(within(dialog).getByText('نام شاخص الزامی است')).toBeInTheDocument();
    expect(within(dialog).getByText('فاصله اجرا الزامی است')).toBeInTheDocument();
    expect(within(dialog).getByText('آدرس URL الزامی است')).toBeInTheDocument();
    expect(within(dialog).getByText('کد وضعیت مورد انتظار الزامی است')).toBeInTheDocument();
    expect(checkManagementApi.createCheck).not.toHaveBeenCalled();
  }, 15000);

  it('creates an HTTP check', async () => {
    mockListData();
    vi.mocked(checkManagementApi.createCheck).mockResolvedValue(httpCheck);
    const user = userEvent.setup();
    renderWithProviders(<MonitoringChecksPage />);

    const dialog = await openCreateDialog(user);
    await user.click(within(dialog).getByLabelText('سامانه'));
    await user.click(await screen.findByRole('option', { name: 'سمیح' }));
    await user.click(within(dialog).getByRole('button', { name: 'بعدی' }));
    await user.click(within(dialog).getByLabelText('مولفه'));
    await user.click(await screen.findByRole('option', { name: 'API' }));
    await user.click(within(dialog).getByRole('button', { name: 'بعدی' }));
    await user.click(within(dialog).getByRole('radio', { name: 'شاخص HTTP' }));
    await user.click(within(dialog).getByRole('button', { name: 'بعدی' }));

    const nameInput = await within(dialog).findByLabelText('نام شاخص');
    await user.type(nameInput, 'Health API');
    await user.type(within(dialog).getByLabelText('URL'), '/api/health');
    await user.click(within(dialog).getByRole('button', { name: 'ذخیره' }));

    await waitFor(() => {
      expect(checkManagementApi.createCheck).toHaveBeenCalledWith({
        applicationComponentId: 11,
        name: 'Health API',
        description: null,
        checkType: 1, // HttpRequest or Http (both have value 1)
        intervalSeconds: 60,
        timeoutSeconds: 10,
        retryCount: 3,
        retryDelaySeconds: 5,
        isActive: true,
        httpConfiguration: {
          url: '/api/health',
          httpMethod: HttpMethod.GET,
          headers: null,
          requestBody: null,
          expectedStatusCode: 200,
          useSSOToken: false,
        },
      });
    });
  }, 15000);

  it('shows write actions for Admin', async () => {
    mockListData();
    renderWithProviders(<MonitoringChecksPage />);

    await waitFor(() => {
      expect(screen.getByText('Health API')).toBeInTheDocument();
    });

    expect(screen.getByRole('button', { name: 'افزودن شاخص' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'مشاهده Health API' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'ویرایش Health API' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'حذف Health API' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'غیرفعال کردن Health API' })).toBeInTheDocument();
  });

  it('hides write actions for Viewer', async () => {
    browserStorageTokenProvider.setToken(createTestJwt({ role: 'Viewer' }));
    mockUser('Viewer');
    mockListData();
    renderWithProviders(<MonitoringChecksPage />);

    await waitFor(() => {
      expect(screen.getByText('Health API')).toBeInTheDocument();
    });

    expect(screen.queryByRole('button', { name: 'افزودن شاخص' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'مشاهده Health API' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'اعلان ایمیل Health API' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'ویرایش Health API' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'حذف Health API' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'غیرفعال کردن Health API' })).not.toBeInTheDocument();
  });
});
