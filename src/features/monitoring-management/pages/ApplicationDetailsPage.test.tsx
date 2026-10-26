import { Route, Routes } from 'react-router-dom';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { monitoringManagementApi } from '@/api/monitoringManagementApi';
import { portalApi } from '@/api/portalApi';
import { browserStorageTokenProvider } from '@/auth';
import { ApplicationDetailsPage } from './ApplicationDetailsPage';
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

vi.mock('@/api/portalApi', () => ({
  portalApi: {
    getCurrentUser: vi.fn(),
  },
}));

function mockAdminUser() {
  vi.mocked(portalApi.getCurrentUser).mockResolvedValue({
    id: 1,
    userName: 'admin',
    fullName: 'Admin User',
    email: null,
    mobile: null,
    avatar: null,
    roles: ['Admin'],
    role: 'Admin',
  });
}

function renderDetailsPage() {
  return renderWithProviders(
    <Routes>
      <Route path="/monitoring/applications/:id" element={<ApplicationDetailsPage />} />
    </Routes>,
    { route: '/monitoring/applications/1' },
  );
}

describe('ApplicationDetailsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    browserStorageTokenProvider.setToken(createTestJwt({ role: 'Admin' }));
    mockAdminUser();
    vi.mocked(monitoringManagementApi.getMonitoringApplication).mockResolvedValue({
      id: 1,
      name: 'سمیح',
      code: 'SAMIH',
      description: 'سامانه سمیح',
      baseUrl: 'https://samih.example',
      isActive: true,
      priority: 2,
    });
    vi.mocked(monitoringManagementApi.getApplicationComponents).mockResolvedValue([
      {
        id: 11,
        applicationId: 1,
        name: 'API',
        code: 'API',
        isActive: true,
      },
      {
        id: 12,
        applicationId: 1,
        name: 'Database',
        code: 'DB',
        isActive: true,
      },
    ]);
  });

  it('renders application information and the component list', async () => {
    renderDetailsPage();

    await waitFor(() => {
      expect(screen.getAllByText('API').length).toBeGreaterThan(0);
    });

    expect(screen.getByTestId('application-info-card')).toBeInTheDocument();
    expect(screen.getAllByText('سمیح').length).toBeGreaterThan(0);
    expect(screen.getByText('SAMIH')).toBeInTheDocument();
    expect(screen.getByText('سامانه سمیح')).toBeInTheDocument();
    expect(screen.getByText('https://samih.example')).toBeInTheDocument();
    expect(screen.getByText('Database')).toBeInTheDocument();
    expect(screen.getByTestId('component-list')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'افزودن مولفه' })).toBeInTheDocument();
  });

  it('shows a specific empty state when the application has no components', async () => {
    vi.mocked(monitoringManagementApi.getApplicationComponents).mockResolvedValue([]);
    renderDetailsPage();

    await waitFor(() => {
      expect(screen.getByText('برای این سامانه هنوز مولفه‌ای تعریف نشده است')).toBeInTheDocument();
    });
  });

  it('creates a component', async () => {
    vi.mocked(monitoringManagementApi.createApplicationComponent).mockResolvedValue({
      id: 13,
      applicationId: 1,
      name: 'Authentication',
      code: 'AUTHENTICATION',
      isActive: true,
    });
    const user = userEvent.setup();
    renderDetailsPage();

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'افزودن مولفه' })).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: 'افزودن مولفه' }));
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

  it('rejects a duplicate component name inside the application', async () => {
    const user = userEvent.setup();
    renderDetailsPage();

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'افزودن مولفه' })).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: 'افزودن مولفه' }));
    const dialog = await screen.findByRole('dialog');
    await user.type(within(dialog).getByLabelText('نام مولفه'), 'API');
    await user.click(within(dialog).getByRole('button', { name: 'ذخیره' }));

    expect(within(dialog).getByText('نام مولفه در این سامانه باید یکتا باشد')).toBeInTheDocument();
    expect(monitoringManagementApi.createApplicationComponent).not.toHaveBeenCalled();
  });

  it('updates a component without sending code', async () => {
    vi.mocked(monitoringManagementApi.updateApplicationComponent).mockResolvedValue({
      id: 11,
      applicationId: 1,
      name: 'Public API',
      code: 'API',
      isActive: true,
    });
    const user = userEvent.setup();
    renderDetailsPage();

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'ویرایش API' })).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: 'ویرایش API' }));
    const dialog = await screen.findByRole('dialog');
    const nameInput = within(dialog).getByLabelText('نام مولفه');
    await user.clear(nameInput);
    await user.type(nameInput, 'Public API');
    await user.click(within(dialog).getByRole('button', { name: 'ذخیره' }));

    await waitFor(() => {
      expect(monitoringManagementApi.updateApplicationComponent).toHaveBeenCalledWith(11, {
        name: 'Public API',
        description: null,
        isActive: true,
      });
    });
  });

  it('deletes a component', async () => {
    vi.mocked(monitoringManagementApi.deleteApplicationComponent).mockResolvedValue(true);
    const user = userEvent.setup();
    renderDetailsPage();

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'حذف API' })).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: 'حذف API' }));
    await user.click(screen.getByRole('button', { name: 'حذف' }));

    await waitFor(() => {
      expect(monitoringManagementApi.deleteApplicationComponent).toHaveBeenCalledWith(11);
    });
  });

  it('hides write actions for Viewer', async () => {
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
    renderDetailsPage();

    await waitFor(() => {
      expect(screen.getByText('Database')).toBeInTheDocument();
    });

    expect(screen.queryByRole('button', { name: 'افزودن مولفه' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'ویرایش API' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'حذف API' })).not.toBeInTheDocument();
  });
});
