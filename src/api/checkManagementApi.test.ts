import { beforeEach, describe, expect, it, vi } from 'vitest';
import { checkManagementApi } from './checkManagementApi';
import { httpClient } from '@/api/httpClient';
import { HttpMethod, ResultType } from '@/types/enums';

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

describe('checkManagementApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('lists applications from GET /api/applications', async () => {
    const paged = {
      items: [{ id: 1, name: 'سمیح', code: 'SAMIH', isActive: true }],
      totalCount: 1,
      pageNumber: 1,
      pageSize: 100,
      totalPages: 1,
    };
    vi.mocked(httpClient.get).mockResolvedValue(ok(paged));

    await expect(checkManagementApi.getMonitoringApplications()).resolves.toEqual(paged);
    expect(httpClient.get).toHaveBeenCalledWith('/api/applications', {
      params: { pageNumber: 1, pageSize: 100 },
    });
  });

  it('loads components from GET /api/components/application/{id}', async () => {
    const components = [{ id: 11, applicationId: 1, name: 'API', code: 'API', isActive: true }];
    vi.mocked(httpClient.get).mockResolvedValue(ok(components));

    await expect(checkManagementApi.getApplicationComponents(1)).resolves.toEqual(components);
    expect(httpClient.get).toHaveBeenCalledWith('/api/components/application/1');
  });

  it('aggregates checks from existing application check endpoints', async () => {
    vi.mocked(httpClient.get).mockImplementation(async (url: string) => {
      if (url === '/api/applications') {
        return ok({
          items: [{ id: 1, name: 'سمیح', code: 'SAMIH', isActive: true }],
          totalCount: 1,
          pageNumber: 1,
          pageSize: 100,
          totalPages: 1,
        });
      }

      if (url === '/api/checks/application/1') {
        return ok([
          {
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
          },
        ]);
      }

      if (url === '/api/components/application/1') {
        return ok([{ id: 11, applicationId: 1, name: 'API', code: 'API', isActive: true }]);
      }

      throw new Error(`Unexpected GET ${url}`);
    });

    await expect(checkManagementApi.getChecks()).resolves.toEqual([
      expect.objectContaining({
        id: 21,
        name: 'Health API',
        applicationName: 'سمیح',
        componentName: 'API',
      }),
    ]);
  });

  it('loads a single check from GET /api/checks/{id}', async () => {
    const check = { id: 21, name: 'Health API', checkType: 1 }; // HttpRequest or Http
    vi.mocked(httpClient.get).mockResolvedValue(ok(check));

    await expect(checkManagementApi.getCheck(21)).resolves.toEqual(check);
    expect(httpClient.get).toHaveBeenCalledWith('/api/checks/21');
  });

  it('creates a check on POST /api/checks', async () => {
    const created = { id: 21, name: 'Health API', checkType: 1 }; // HttpRequest or Http
    vi.mocked(httpClient.post).mockResolvedValue(ok(created));
    const payload = {
      applicationComponentId: 11,
      name: 'Health API',
      checkType: 1 as any, // HttpRequest or Http (using any for test compatibility)
      intervalSeconds: 60,
      timeoutSeconds: 10,
      retryCount: 3,
      retryDelaySeconds: 5,
      isActive: true,
      httpConfiguration: {
        url: '/api/health',
        httpMethod: HttpMethod.GET,
        expectedStatusCode: 200,
        useSSOToken: false,
      },
    };

    await expect(checkManagementApi.createCheck(payload)).resolves.toEqual(created);
    expect(httpClient.post).toHaveBeenCalledWith('/api/checks', payload);
  });

  it('updates a check on PUT /api/checks/{id}', async () => {
    const updated = { id: 21, name: 'Health API 2' };
    vi.mocked(httpClient.put).mockResolvedValue(ok(updated));
    const payload = {
      name: 'Health API 2',
      intervalSeconds: 60,
      timeoutSeconds: 10,
      retryCount: 3,
      retryDelaySeconds: 5,
      isActive: true,
    };

    await expect(checkManagementApi.updateCheck(21, payload)).resolves.toEqual(updated);
    expect(httpClient.put).toHaveBeenCalledWith('/api/checks/21', payload);
  });

  it('deletes a check on DELETE /api/checks/{id}', async () => {
    vi.mocked(httpClient.delete).mockResolvedValue(ok(true));

    await expect(checkManagementApi.deleteCheck(21)).resolves.toBe(true);
    expect(httpClient.delete).toHaveBeenCalledWith('/api/checks/21');
  });

  it('creates a database check payload with query configuration', async () => {
    const created = { id: 22, name: 'Status Count', checkType: 2 }; // SqlQuery or DatabaseQuery
    vi.mocked(httpClient.post).mockResolvedValue(ok(created));
    const payload = {
      applicationComponentId: 12,
      name: 'Status Count',
      checkType: 2, // SqlQuery or DatabaseQuery
      intervalSeconds: 60,
      timeoutSeconds: 10,
      retryCount: 3,
      retryDelaySeconds: 5,
      isActive: true,
      sqlConfiguration: {
        databaseCredentialId: 5,
        query: 'SELECT StatusCode,COUNT(*) FROM RequestLogs GROUP BY StatusCode',
        resultType: ResultType.StatusCount,
        successCriteria: '200',
      },
    };

    await expect(checkManagementApi.createCheck(payload)).resolves.toEqual(created);
    expect(httpClient.post).toHaveBeenCalledWith('/api/checks', payload);
  });
});
