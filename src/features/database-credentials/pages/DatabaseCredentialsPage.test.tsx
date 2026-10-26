import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { databaseCredentialsApi } from '@/api/databaseCredentialsApi';
import { portalApi } from '@/api/portalApi';
import { browserStorageTokenProvider } from '@/auth';
import { DatabaseCredentialsPage } from './DatabaseCredentialsPage';
import {
  ADD_CREDENTIAL_LABEL,
  CREDENTIAL_NAME_LABEL,
  CREDENTIAL_NAME_REQUIRED_MESSAGE,
  CREDENTIALS_LABEL,
} from '../utils/credentialLabels';
import { createTestJwt, renderWithProviders } from '@/test/testUtils';

vi.mock('@/api/databaseCredentialsApi', () => ({
  databaseCredentialsApi: {
    getDatabaseCredentials: vi.fn(),
    getDatabaseCredential: vi.fn(),
    createDatabaseCredential: vi.fn(),
    updateDatabaseCredential: vi.fn(),
    deleteDatabaseCredential: vi.fn(),
    deactivateDatabaseCredential: vi.fn(),
    activateDatabaseCredential: vi.fn(),
    testDatabaseConnection: vi.fn(),
    testDatabaseCredential: vi.fn(),
  },
}));

vi.mock('@/api/portalApi', () => ({
  portalApi: {
    getCurrentUser: vi.fn(),
  },
}));

const sampleCredential = {
  id: 1,
  name: 'Samih Production DB',
  server: '192.168.3.10',
  databaseName: 'Samih',
  username: 'monitor_user',
  isActive: true,
  createdDate: '2026-01-01T10:00:00Z',
};

function mockUser(role: 'Admin' | 'Viewer') {
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

function mockCredentials() {
  vi.mocked(databaseCredentialsApi.getDatabaseCredentials).mockResolvedValue([sampleCredential]);
}

describe('DatabaseCredentialsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    browserStorageTokenProvider.setToken(createTestJwt({ role: 'Admin' }));
    mockUser('Admin');
  });

  it('renders the credentials list', async () => {
    mockCredentials();
    renderWithProviders(<DatabaseCredentialsPage />);

    await waitFor(() => {
      expect(screen.getByText('Samih Production DB')).toBeInTheDocument();
    });

    expect(screen.getByText('مدیریت پایش')).toBeInTheDocument();
    expect(screen.getByText(CREDENTIALS_LABEL)).toBeInTheDocument();
    expect(screen.getByTestId('credential-table')).toHaveAttribute('dir', 'rtl');
    expect(screen.getByText('192.168.3.10')).toBeInTheDocument();
    expect(screen.getByText('Samih')).toBeInTheDocument();
    expect(screen.getByText('monitor_user')).toBeInTheDocument();
    expect(screen.queryByText('secret')).not.toBeInTheDocument();
  });

  it('opens the create dialog', async () => {
    mockCredentials();
    const user = userEvent.setup();
    renderWithProviders(<DatabaseCredentialsPage />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: ADD_CREDENTIAL_LABEL })).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: ADD_CREDENTIAL_LABEL }));
    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).getByText(ADD_CREDENTIAL_LABEL)).toBeInTheDocument();
    expect(within(dialog).getByLabelText(CREDENTIAL_NAME_LABEL)).toBeInTheDocument();
  });

  it('creates a credential', async () => {
    mockCredentials();
    vi.mocked(databaseCredentialsApi.createDatabaseCredential).mockResolvedValue({
      ...sampleCredential,
      id: 2,
      name: 'Reporting DB',
    });
    const user = userEvent.setup();
    renderWithProviders(<DatabaseCredentialsPage />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: ADD_CREDENTIAL_LABEL })).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: ADD_CREDENTIAL_LABEL }));
    const dialog = await screen.findByRole('dialog');

    await user.type(within(dialog).getByLabelText(CREDENTIAL_NAME_LABEL), 'Reporting DB');
    await user.type(within(dialog).getByLabelText('Server'), 'sql-01');
    await user.type(within(dialog).getByLabelText('Database Name'), 'Logs');
    await user.type(within(dialog).getByLabelText('Username'), 'monitor');
    await user.type(within(dialog).getByLabelText('Password'), 'secret');
    await user.click(within(dialog).getByTestId('credential-submit-button'));

    await waitFor(() => {
      expect(databaseCredentialsApi.createDatabaseCredential).toHaveBeenCalledWith({
        name: 'Reporting DB',
        server: 'sql-01',
        databaseName: 'Logs',
        username: 'monitor',
        password: 'secret',
        isActive: true,
        credentialType: 1,
        port: null,
      });
    });
  }, 15000);

  it('edits a credential without sending password when unchanged', async () => {
    mockCredentials();
    vi.mocked(databaseCredentialsApi.updateDatabaseCredential).mockResolvedValue(sampleCredential);
    const user = userEvent.setup();
    renderWithProviders(<DatabaseCredentialsPage />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'ویرایش Samih Production DB' })).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: 'ویرایش Samih Production DB' }));
    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).getByLabelText('Password')).toHaveValue('');

    const nameInput = within(dialog).getByLabelText(CREDENTIAL_NAME_LABEL);
    await user.clear(nameInput);
    await user.type(nameInput, 'Samih DB Updated');
    await user.click(within(dialog).getByTestId('credential-submit-button'));

    await waitFor(() => {
      expect(databaseCredentialsApi.updateDatabaseCredential).toHaveBeenCalledWith(1, {
        name: 'Samih DB Updated',
        server: '192.168.3.10',
        databaseName: 'Samih',
        username: 'monitor_user',
        password: null,
        isActive: true,
        credentialType: 1,
        port: null,
      });
    });
  });

  it('deactivates an active credential from the actions column', async () => {
    mockCredentials();
    vi.mocked(databaseCredentialsApi.deactivateDatabaseCredential).mockResolvedValue({
      ...sampleCredential,
      isActive: false,
    });
    const user = userEvent.setup();
    renderWithProviders(<DatabaseCredentialsPage />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'غیرفعال کردن Samih Production DB' })).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: 'غیرفعال کردن Samih Production DB' }));

    await waitFor(() => {
      expect(databaseCredentialsApi.deactivateDatabaseCredential).toHaveBeenCalledWith(1);
    });
    expect(databaseCredentialsApi.deleteDatabaseCredential).not.toHaveBeenCalled();
    expect(databaseCredentialsApi.updateDatabaseCredential).not.toHaveBeenCalled();
  });

  it('activates an inactive credential from the actions column', async () => {
    vi.mocked(databaseCredentialsApi.getDatabaseCredentials).mockResolvedValue([
      { ...sampleCredential, isActive: false },
    ]);
    vi.mocked(databaseCredentialsApi.activateDatabaseCredential).mockResolvedValue(sampleCredential);
    const user = userEvent.setup();
    renderWithProviders(<DatabaseCredentialsPage />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'فعال کردن Samih Production DB' })).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: 'فعال کردن Samih Production DB' }));

    await waitFor(() => {
      expect(databaseCredentialsApi.activateDatabaseCredential).toHaveBeenCalledWith(1);
    });
    expect(databaseCredentialsApi.deleteDatabaseCredential).not.toHaveBeenCalled();
  });

  it('deletes a credential', async () => {
    mockCredentials();
    vi.mocked(databaseCredentialsApi.deleteDatabaseCredential).mockResolvedValue(true);
    const user = userEvent.setup();
    renderWithProviders(<DatabaseCredentialsPage />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'حذف Samih Production DB' })).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: 'حذف Samih Production DB' }));
    await user.click(screen.getByRole('button', { name: 'حذف' }));

    await waitFor(() => {
      expect(databaseCredentialsApi.deleteDatabaseCredential).toHaveBeenCalledWith(1);
    });
  });

  it('does not display saved passwords in the table or view dialog', async () => {
    mockCredentials();
    const user = userEvent.setup();
    renderWithProviders(<DatabaseCredentialsPage />);

    await waitFor(() => {
      expect(screen.getByText('Samih Production DB')).toBeInTheDocument();
    });

    expect(screen.queryByDisplayValue('secret')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'مشاهده Samih Production DB' }));
    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).getByLabelText('Password')).toHaveValue('');
    expect(within(dialog).getByLabelText('Password')).toHaveAttribute('placeholder', '********');
  });

  it('shows empty password field on edit', async () => {
    mockCredentials();
    const user = userEvent.setup();
    renderWithProviders(<DatabaseCredentialsPage />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'ویرایش Samih Production DB' })).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: 'ویرایش Samih Production DB' }));
    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).getByLabelText('Password')).toHaveValue('');
  });

  it('shows success message after connection test in dialog', async () => {
    mockCredentials();
    vi.mocked(databaseCredentialsApi.testDatabaseConnection).mockResolvedValue({ success: true });
    const user = userEvent.setup();
    renderWithProviders(<DatabaseCredentialsPage />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: ADD_CREDENTIAL_LABEL })).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: ADD_CREDENTIAL_LABEL }));
    const dialog = await screen.findByRole('dialog');

    await user.type(within(dialog).getByLabelText('Server'), '192.168.3.10');
    await user.type(within(dialog).getByLabelText('Database Name'), 'Samih');
    await user.type(within(dialog).getByLabelText('Username'), 'monitor_user');
    await user.type(within(dialog).getByLabelText('Password'), 'secret');
    await user.click(within(dialog).getByRole('button', { name: 'تست اتصال' }));

    await waitFor(() => {
      expect(screen.getByText('🟢 اتصال به دیتابیس موفق بود')).toBeInTheDocument();
    });
    expect(databaseCredentialsApi.testDatabaseConnection).toHaveBeenCalledWith({
      credentialType: 1,
      server: '192.168.3.10',
      database: 'Samih',
      username: 'monitor_user',
      password: 'secret',
      port: null,
    });
    expect(databaseCredentialsApi.createDatabaseCredential).not.toHaveBeenCalled();
  });

  it('shows failure message after connection test in dialog', async () => {
    mockCredentials();
    vi.mocked(databaseCredentialsApi.testDatabaseConnection).mockResolvedValue({
      success: false,
      message: 'Login failed',
    });
    const user = userEvent.setup();
    renderWithProviders(<DatabaseCredentialsPage />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: ADD_CREDENTIAL_LABEL })).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: ADD_CREDENTIAL_LABEL }));
    const dialog = await screen.findByRole('dialog');

    await user.type(within(dialog).getByLabelText('Server'), '192.168.3.10');
    await user.type(within(dialog).getByLabelText('Database Name'), 'Samih');
    await user.type(within(dialog).getByLabelText('Username'), 'monitor_user');
    await user.type(within(dialog).getByLabelText('Password'), 'wrong');
    await user.click(within(dialog).getByRole('button', { name: 'تست اتصال' }));

    await waitFor(() => {
      expect(screen.getByText('🔴 اتصال به دیتابیس برقرار نشد')).toBeInTheDocument();
    });
    expect(screen.getByText('Login failed')).toBeInTheDocument();
  });

  it('shows Persian validation messages for required fields', async () => {
    mockCredentials();
    const user = userEvent.setup();
    renderWithProviders(<DatabaseCredentialsPage />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: ADD_CREDENTIAL_LABEL })).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: ADD_CREDENTIAL_LABEL }));
    const dialog = await screen.findByRole('dialog');
    await user.click(within(dialog).getByTestId('credential-submit-button'));

    expect(within(dialog).getByText(CREDENTIAL_NAME_REQUIRED_MESSAGE)).toBeInTheDocument();
    expect(within(dialog).getByText('Server الزامی است')).toBeInTheDocument();
    expect(within(dialog).getByText('Database Name الزامی است')).toBeInTheDocument();
    expect(within(dialog).getByText('Username الزامی است')).toBeInTheDocument();
    expect(within(dialog).getByText('Password الزامی است')).toBeInTheDocument();
    expect(databaseCredentialsApi.createDatabaseCredential).not.toHaveBeenCalled();
  });

  it('shows write actions for Admin', async () => {
    mockCredentials();
    renderWithProviders(<DatabaseCredentialsPage />);

    await waitFor(() => {
      expect(screen.getByText('Samih Production DB')).toBeInTheDocument();
    });

    expect(screen.getByRole('button', { name: ADD_CREDENTIAL_LABEL })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'مشاهده Samih Production DB' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'ویرایش Samih Production DB' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'غیرفعال کردن Samih Production DB' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'حذف Samih Production DB' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'تست اتصال Samih Production DB' })).toBeInTheDocument();
  });

  it('shows write actions when Admin role is only in JWT roles array', async () => {
    browserStorageTokenProvider.setToken(createTestJwt({ roles: ['Admin'] }));
    vi.mocked(portalApi.getCurrentUser).mockResolvedValue({
      id: 1,
      userName: 'admin',
      fullName: 'Admin User',
      email: null,
      mobile: null,
      avatar: null,
      roles: [],
      role: null,
    });
    mockCredentials();
    renderWithProviders(<DatabaseCredentialsPage />);

    await waitFor(() => {
      expect(screen.getByText('Samih Production DB')).toBeInTheDocument();
    });

    expect(screen.getByRole('button', { name: ADD_CREDENTIAL_LABEL })).toBeInTheDocument();
  });

  it('shows write actions for Viewer while credential access checks are disabled', async () => {
    browserStorageTokenProvider.setToken(createTestJwt({ role: 'Viewer' }));
    mockUser('Viewer');
    mockCredentials();
    renderWithProviders(<DatabaseCredentialsPage />);

    await waitFor(() => {
      expect(screen.getByText('Samih Production DB')).toBeInTheDocument();
    });

    expect(screen.getByRole('button', { name: ADD_CREDENTIAL_LABEL })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'ویرایش Samih Production DB' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'غیرفعال کردن Samih Production DB' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'حذف Samih Production DB' })).toBeInTheDocument();
  });

  it('shows write actions for Operator while credential access checks are disabled', async () => {
    browserStorageTokenProvider.setToken(createTestJwt({ role: 'Operator' }));
    vi.mocked(portalApi.getCurrentUser).mockResolvedValue({
      id: 3,
      userName: 'operator',
      fullName: 'Operator User',
      email: null,
      mobile: null,
      avatar: null,
      roles: ['Operator'],
      role: 'Operator',
    });
    mockCredentials();
    renderWithProviders(<DatabaseCredentialsPage />);

    await waitFor(() => {
      expect(screen.getByText('Samih Production DB')).toBeInTheDocument();
    });

    expect(screen.getByRole('button', { name: ADD_CREDENTIAL_LABEL })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'ویرایش Samih Production DB' })).toBeInTheDocument();
  });
});
