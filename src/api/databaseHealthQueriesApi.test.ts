import { beforeEach, describe, expect, it, vi } from 'vitest';
import { databaseHealthQueriesApi } from './databaseHealthQueriesApi';
import { httpClient } from '@/api/httpClient';
import { CredentialType, DatabaseHealthQueryCategory, ResultType } from '@/types/enums';

vi.mock('@/api/httpClient', () => ({
  httpClient: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

function ok<T>(data: T) {
  return { data: { success: true, data } };
}

describe('databaseHealthQueriesApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('lists queries with optional filters', async () => {
    const queries = [{ id: 1, name: 'active_connections' }];
    vi.mocked(httpClient.get).mockResolvedValue(ok(queries));

    await expect(
      databaseHealthQueriesApi.getDatabaseHealthQueries({
        databaseType: CredentialType.PostgreSql,
        category: DatabaseHealthQueryCategory.Connection,
        isActive: true,
        search: 'active',
      }),
    ).resolves.toEqual(queries);

    expect(httpClient.get).toHaveBeenCalledWith('/api/database-health-queries', {
      params: {
        databaseType: CredentialType.PostgreSql,
        category: DatabaseHealthQueryCategory.Connection,
        isActive: true,
        search: 'active',
      },
    });
  });

  it('loads one query', async () => {
    const query = { id: 4, name: 'ping' };
    vi.mocked(httpClient.get).mockResolvedValue(ok(query));

    await expect(databaseHealthQueriesApi.getDatabaseHealthQuery(4)).resolves.toEqual(query);
    expect(httpClient.get).toHaveBeenCalledWith('/api/database-health-queries/4');
  });

  it('creates a scalar health query', async () => {
    const created = { id: 8, name: 'active_connections' };
    vi.mocked(httpClient.post).mockResolvedValue(ok(created));
    const payload = {
      name: 'active_connections',
      displayName: 'Active Connections',
      description: null,
      databaseType: CredentialType.PostgreSql,
      category: DatabaseHealthQueryCategory.Connection,
      query: 'SELECT 1',
      resultType: ResultType.Scalar,
      unit: 'count',
      isActive: true,
    };

    await expect(databaseHealthQueriesApi.createDatabaseHealthQuery(payload)).resolves.toEqual(created);
    expect(httpClient.post).toHaveBeenCalledWith('/api/database-health-queries', payload);
  });

  it('updates a query without isActive', async () => {
    const updated = { id: 8, name: 'active_connections' };
    vi.mocked(httpClient.put).mockResolvedValue(ok(updated));
    const payload = {
      name: 'active_connections',
      displayName: 'Active Connections',
      description: null,
      databaseType: CredentialType.PostgreSql,
      category: DatabaseHealthQueryCategory.Connection,
      query: 'SELECT 20',
      resultType: ResultType.Scalar,
      unit: 'count',
    };

    await expect(databaseHealthQueriesApi.updateDatabaseHealthQuery(8, payload)).resolves.toEqual(updated);
    expect(httpClient.put).toHaveBeenCalledWith('/api/database-health-queries/8', payload);
  });

  it('activates and deactivates without a body', async () => {
    vi.mocked(httpClient.put).mockResolvedValue(ok({ id: 8, isActive: true }));

    await databaseHealthQueriesApi.activateDatabaseHealthQuery(8);
    await databaseHealthQueriesApi.deactivateDatabaseHealthQuery(8);

    expect(httpClient.put).toHaveBeenNthCalledWith(1, '/api/database-health-queries/8/activate');
    expect(httpClient.put).toHaveBeenNthCalledWith(2, '/api/database-health-queries/8/deactivate');
    expect(httpClient.delete).not.toHaveBeenCalled();
  });
});
