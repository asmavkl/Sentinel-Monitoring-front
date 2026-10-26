import { beforeEach, describe, expect, it, vi } from 'vitest';
import { databaseHealthMonitoringApi } from './databaseHealthMonitoringApi';
import { httpClient } from '@/api/httpClient';

vi.mock('@/api/httpClient', () => ({
  httpClient: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

function ok<T>(data: T) {
  return { data: { success: true, data } };
}

describe('databaseHealthMonitoringApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('provisions health monitoring on POST /api/applications/{id}/database-health-monitoring/provision', async () => {
    const result = {
      createdChecks: 2,
      existingChecks: 1,
      createdWidgets: 2,
      skipped: 0,
      items: [],
    };
    vi.mocked(httpClient.post).mockResolvedValue(ok(result));
    const payload = {
      databaseCredentialIds: [1, 2],
      databaseHealthQueryIds: [5, 7],
    };

    await expect(databaseHealthMonitoringApi.provisionDatabaseHealthMonitoring(123, payload)).resolves.toEqual(
      result,
    );
    expect(httpClient.post).toHaveBeenCalledWith(
      '/api/applications/123/database-health-monitoring/provision',
      payload,
    );
  });

  it('adds health monitoring on POST /api/applications/{id}/database-health-monitoring/add', async () => {
    const result = {
      createdChecks: 1,
      existingChecks: 0,
      createdWidgets: 1,
      skipped: 0,
      items: [],
    };
    vi.mocked(httpClient.post).mockResolvedValue(ok(result));
    const payload = {
      databaseCredentialIds: [1],
      databaseHealthQueryIds: [5],
    };

    await expect(databaseHealthMonitoringApi.addDatabaseHealthMonitoring(123, payload)).resolves.toEqual(result);
    expect(httpClient.post).toHaveBeenCalledWith('/api/applications/123/database-health-monitoring/add', payload);
  });

  it('gets available queries on GET /api/applications/{id}/database-health-monitoring/available-queries', async () => {
    const queries = [
      {
        id: 5,
        name: 'connection_check',
        displayName: 'Connection Check',
        description: 'Tests database connectivity',
        databaseType: 1,
        category: 1,
        resultType: 1,
        unit: null,
        isAlreadyProvisioned: false,
      },
    ];
    vi.mocked(httpClient.get).mockResolvedValue(ok(queries));

    await expect(databaseHealthMonitoringApi.getAvailableHealthQueries(123, 1)).resolves.toEqual(queries);
    expect(httpClient.get).toHaveBeenCalledWith('/api/applications/123/database-health-monitoring/available-queries', {
      params: { databaseCredentialId: 1 },
    });
  });

  it('gets provisioned checks on GET /api/applications/{id}/database-health-monitoring/provisioned-checks', async () => {
    const checks = [
      {
        healthQueryId: 5,
        databaseCredentialId: 1,
        checkId: 100,
        widgetId: 200,
      },
    ];
    vi.mocked(httpClient.get).mockResolvedValue(ok(checks));

    await expect(databaseHealthMonitoringApi.getProvisionedChecks(123)).resolves.toEqual(checks);
    expect(httpClient.get).toHaveBeenCalledWith('/api/applications/123/database-health-monitoring/provisioned-checks');
  });
});
