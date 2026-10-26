import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiError } from '@/api/apiUtils';
import { databaseHealthQueriesApi } from '@/api/databaseHealthQueriesApi';
import { portalApi } from '@/api/portalApi';
import { browserStorageTokenProvider } from '@/auth';
import { DatabaseHealthQueriesPage } from './DatabaseHealthQueriesPage';
import { HEALTH_QUERY_UPDATED_NOTICE } from '../utils/labels';
import { createTestJwt, renderWithProviders } from '@/test/testUtils';
import { CredentialType, DatabaseHealthQueryCategory, ResultType } from '@/types/enums';
import type { DatabaseHealthQueryDto } from '@/types/databaseHealthQueries';

vi.mock('@/api/databaseHealthQueriesApi', () => ({
  databaseHealthQueriesApi: {
    getDatabaseHealthQueries: vi.fn(),
    getDatabaseHealthQuery: vi.fn(),
    createDatabaseHealthQuery: vi.fn(),
    updateDatabaseHealthQuery: vi.fn(),
    activateDatabaseHealthQuery: vi.fn(),
    deactivateDatabaseHealthQuery: vi.fn(),
  },
}));

vi.mock('@/api/portalApi', () => ({
  portalApi: {
    getCurrentUser: vi.fn(),
  },
}));

const sampleQuery: DatabaseHealthQueryDto = {
  id: 7,
  name: 'active_connections',
  displayName: 'Active Connections',
  description: 'sessions',
  databaseType: CredentialType.PostgreSql,
  category: DatabaseHealthQueryCategory.Connection,
  query: 'SELECT 1',
  resultType: ResultType.Scalar,
  unit: 'count',
  isActive: true,
  createdDate: '2026-01-01T10:00:00Z',
  updatedDate: '2026-02-01T10:00:00Z',
};

function mockUser(role: 'Admin' | 'Viewer') {
  vi.mocked(portalApi.getCurrentUser).mockResolvedValue({
    id: 1,
    userName: role.toLowerCase(),
    fullName: `${role} User`,
    email: null,
    mobile: null,
    avatar: null,
    roles: [role],
    role: role,
  });
}

describe('DatabaseHealthQueriesPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    browserStorageTokenProvider.setToken(createTestJwt({ role: 'Admin' }));
    mockUser('Admin');
    vi.mocked(databaseHealthQueriesApi.getDatabaseHealthQueries).mockResolvedValue([sampleQuery]);
  });

  it('lists catalog columns without a delete action', async () => {
    renderWithProviders(<DatabaseHealthQueriesPage />);

    await waitFor(() => {
      expect(screen.getByText('active_connections')).toBeInTheDocument();
    });

    expect(screen.getByText('Active Connections')).toBeInTheDocument();
    expect(screen.getByText('PostgreSQL')).toBeInTheDocument();
    expect(screen.getByText('Connection')).toBeInTheDocument();
    expect(screen.getByText('count')).toBeInTheDocument();
    expect(screen.getByText('فعال')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'ویرایش Active Connections' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'غیرفعال کردن Active Connections' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /حذف/ })).not.toBeInTheDocument();
  });

  it('filters through the API', async () => {
    const user = userEvent.setup();
    renderWithProviders(<DatabaseHealthQueriesPage />);

    await screen.findByText('active_connections');
    await user.click(screen.getByLabelText('فیلتر نوع دیتابیس'));
    await user.click(await screen.findByRole('option', { name: 'PostgreSQL' }));

    await waitFor(() => {
      expect(databaseHealthQueriesApi.getDatabaseHealthQueries).toHaveBeenCalledWith(
        expect.objectContaining({ databaseType: CredentialType.PostgreSql }),
      );
    });

    await user.click(screen.getByLabelText('فیلتر دسته‌بندی'));
    await user.click(await screen.findByRole('option', { name: 'Performance' }));
    await waitFor(() => {
      expect(databaseHealthQueriesApi.getDatabaseHealthQueries).toHaveBeenCalledWith(
        expect.objectContaining({ category: DatabaseHealthQueryCategory.Performance }),
      );
    });

    await user.click(screen.getByLabelText('فیلتر وضعیت'));
    await user.click(await screen.findByRole('option', { name: 'فعال' }));
    await waitFor(() => {
      expect(databaseHealthQueriesApi.getDatabaseHealthQueries).toHaveBeenCalledWith(
        expect.objectContaining({ isActive: true }),
      );
    });

    await user.type(screen.getByLabelText('جستجو'), 'active');
    await waitFor(() => {
      expect(databaseHealthQueriesApi.getDatabaseHealthQueries).toHaveBeenCalledWith(
        expect.objectContaining({ search: 'active' }),
      );
    });
  });

  it('creates a scalar health query and shows a duplicate-name error from the API', async () => {
    const user = userEvent.setup();
    vi.mocked(databaseHealthQueriesApi.createDatabaseHealthQuery).mockRejectedValueOnce(
      new ApiError("Health query 'active_connections' already exists for PostgreSql."),
    );
    renderWithProviders(<DatabaseHealthQueriesPage />);

    await user.click(await screen.findByRole('button', { name: 'افزودن کوئری سلامت' }));
    const dialog = await screen.findByRole('dialog');
    await user.type(within(dialog).getByLabelText('Name'), 'active_connections');
    await user.type(within(dialog).getByLabelText('Display Name'), 'Active Connections');
    await user.click(within(dialog).getByLabelText('Database Type'));
    await user.click(await screen.findByRole('option', { name: 'PostgreSQL' }));
    fireEvent.change(within(dialog).getByLabelText('Query'), { target: { value: 'SELECT 1' } });
    await user.type(within(dialog).getByLabelText('Unit'), 'count');
    await user.click(within(dialog).getByRole('button', { name: 'ذخیره' }));

    await waitFor(() => {
      expect(databaseHealthQueriesApi.createDatabaseHealthQuery).toHaveBeenCalledWith({
        name: 'active_connections',
        displayName: 'Active Connections',
        description: null,
        databaseType: CredentialType.PostgreSql,
        category: DatabaseHealthQueryCategory.Connection,
        query: 'SELECT 1',
        resultType: ResultType.Scalar,
        unit: 'count',
        isActive: true,
      });
    });
    expect(
      within(dialog).getByText("Health query 'active_connections' already exists for PostgreSql."),
    ).toBeInTheDocument();
  }, 15000);

  it('edits a query without isActive and tells the user the next run uses the catalog text', async () => {
    const user = userEvent.setup();
    vi.mocked(databaseHealthQueriesApi.updateDatabaseHealthQuery).mockResolvedValue({
      ...sampleQuery,
      query: 'SELECT 20',
    });
    renderWithProviders(<DatabaseHealthQueriesPage />);

    await user.click(await screen.findByRole('button', { name: 'ویرایش Active Connections' }));
    const dialog = await screen.findByRole('dialog');
    const queryField = within(dialog).getByLabelText('Query');
    fireEvent.change(queryField, { target: { value: 'SELECT 20' } });
    await user.click(within(dialog).getByRole('button', { name: 'ذخیره' }));

    await waitFor(() => {
      expect(databaseHealthQueriesApi.updateDatabaseHealthQuery).toHaveBeenCalledWith(
        7,
        expect.not.objectContaining({ isActive: expect.anything() }),
      );
    });
    const payload = vi.mocked(databaseHealthQueriesApi.updateDatabaseHealthQuery).mock.calls[0][1];
    expect(payload.resultType).toBe(ResultType.Scalar);
    expect(payload.query).toBe('SELECT 20');
    expect(payload).not.toHaveProperty('isActive');
    expect(await screen.findByText(HEALTH_QUERY_UPDATED_NOTICE)).toBeInTheDocument();
  });

  it('shows the database-type change error from the API', async () => {
    const user = userEvent.setup();
    vi.mocked(databaseHealthQueriesApi.updateDatabaseHealthQuery).mockRejectedValue(
      new ApiError('Database type cannot be changed because this health query is used by checks.'),
    );
    renderWithProviders(<DatabaseHealthQueriesPage />);

    await user.click(await screen.findByRole('button', { name: 'ویرایش Active Connections' }));
    const dialog = await screen.findByRole('dialog');
    await user.click(within(dialog).getByLabelText('Database Type'));
    await user.click(await screen.findByRole('option', { name: 'MySQL' }));
    await user.click(within(dialog).getByRole('button', { name: 'ذخیره' }));

    expect(
      await within(dialog).findByText(
        'Database type cannot be changed because this health query is used by checks.',
      ),
    ).toBeInTheDocument();
  });

  it('asks for confirmation before deactivating', async () => {
    const user = userEvent.setup();
    vi.mocked(databaseHealthQueriesApi.deactivateDatabaseHealthQuery).mockResolvedValue({
      ...sampleQuery,
      isActive: false,
    });
    renderWithProviders(<DatabaseHealthQueriesPage />);

    await user.click(await screen.findByRole('button', { name: 'غیرفعال کردن Active Connections' }));
    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).getByText(/شاخص جدید نمی‌تواند کوئری غیرفعال را انتخاب کند/)).toBeInTheDocument();
    await user.click(within(dialog).getByRole('button', { name: 'غیرفعال کردن' }));

    await waitFor(() => {
      expect(databaseHealthQueriesApi.deactivateDatabaseHealthQuery).toHaveBeenCalledWith(7);
    });
  });

  it('activates an inactive query without a delete call', async () => {
    const user = userEvent.setup();
    vi.mocked(databaseHealthQueriesApi.getDatabaseHealthQueries).mockResolvedValue([
      { ...sampleQuery, isActive: false },
    ]);
    vi.mocked(databaseHealthQueriesApi.activateDatabaseHealthQuery).mockResolvedValue(sampleQuery);
    renderWithProviders(<DatabaseHealthQueriesPage />);

    await user.click(await screen.findByRole('button', { name: 'فعال کردن Active Connections' }));

    await waitFor(() => {
      expect(databaseHealthQueriesApi.activateDatabaseHealthQuery).toHaveBeenCalledWith(7);
    });
  });

  it('shows write actions to non-admins until role checks are enabled', async () => {
    browserStorageTokenProvider.setToken(createTestJwt({ role: 'Viewer' }));
    mockUser('Viewer');
    renderWithProviders(<DatabaseHealthQueriesPage />);

    await screen.findByText('active_connections');
    expect(screen.getByRole('button', { name: 'افزودن کوئری سلامت' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'ویرایش Active Connections' })).toBeInTheDocument();
  });
});
