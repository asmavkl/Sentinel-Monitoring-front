import { beforeEach, describe, expect, it, vi } from 'vitest';
import { monitoringManagementApi } from './monitoringManagementApi';
import { httpClient } from '@/api/httpClient';
import { ApplicationPriority } from '@/types/enums';

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

describe('monitoringManagementApi', () => {
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

    await expect(monitoringManagementApi.getMonitoringApplications()).resolves.toEqual(paged);
    expect(httpClient.get).toHaveBeenCalledWith('/api/applications', {
      params: { pageNumber: 1, pageSize: 100 },
    });
  });

  it('loads a single application from GET /api/applications/{id}', async () => {
    const application = { id: 4, name: 'سمیح', code: 'SAMIH', isActive: true };
    vi.mocked(httpClient.get).mockResolvedValue(ok(application));

    await expect(monitoringManagementApi.getMonitoringApplication(4)).resolves.toEqual(application);
    expect(httpClient.get).toHaveBeenCalledWith('/api/applications/4');
  });

  it('creates an application on POST /api/applications', async () => {
    const created = { id: 2, name: 'پرداخت', code: 'PAY', isActive: true };
    vi.mocked(httpClient.post).mockResolvedValue(ok(created));
    const payload = {
      name: 'پرداخت',
      code: 'PAY',
      description: null,
      baseUrl: null,
      isActive: true,
      priority: ApplicationPriority.Important,
    };

    await expect(monitoringManagementApi.createMonitoringApplication(payload)).resolves.toEqual(
      created,
    );
    expect(httpClient.post).toHaveBeenCalledWith('/api/applications', payload);
  });

  it('updates an application on PUT /api/applications/{id}', async () => {
    const updated = { id: 1, name: 'سمیح به روز', code: 'SAMIH', isActive: true };
    vi.mocked(httpClient.put).mockResolvedValue(ok(updated));
    const payload = {
      name: 'سمیح به روز',
      description: null,
      baseUrl: null,
      isActive: true,
      priority: ApplicationPriority.Important,
    };

    await expect(monitoringManagementApi.updateMonitoringApplication(1, payload)).resolves.toEqual(
      updated,
    );
    expect(httpClient.put).toHaveBeenCalledWith('/api/applications/1', payload);
  });

  it('unwraps delete application as ApiResponse<boolean>', async () => {
    vi.mocked(httpClient.delete).mockResolvedValue(ok(true));

    await expect(monitoringManagementApi.deleteMonitoringApplication(7)).resolves.toBe(true);
    expect(httpClient.delete).toHaveBeenCalledWith('/api/applications/7');
  });

  it('loads components from GET /api/components/application/{id} as an array', async () => {
    const components = [
      {
        id: 11,
        applicationId: 1,
        name: 'API',
        code: 'API',
        description: null,
        isActive: true,
        createdDate: '2026-01-01T00:00:00Z',
      },
    ];
    vi.mocked(httpClient.get).mockResolvedValue(ok(components));

    await expect(monitoringManagementApi.getApplicationComponents(1)).resolves.toEqual(components);
    expect(httpClient.get).toHaveBeenCalledWith('/api/components/application/1');
  });

  it('creates a component with applicationId and required code on POST /api/components', async () => {
    const created = {
      id: 13,
      applicationId: 1,
      name: 'Auth',
      code: 'AUTH',
      description: null,
      isActive: true,
    };
    vi.mocked(httpClient.post).mockResolvedValue(ok(created));

    const payload = {
      applicationId: 1,
      name: 'Auth',
      code: 'AUTH',
      description: null,
      isActive: true,
    };

    await expect(monitoringManagementApi.createApplicationComponent(payload)).resolves.toEqual(
      created,
    );
    expect(httpClient.post).toHaveBeenCalledWith('/api/components', payload);
  });

  it('updates a component without code on PUT /api/components/{id}', async () => {
    const updated = {
      id: 11,
      applicationId: 1,
      name: 'Public API',
      code: 'API',
      description: null,
      isActive: true,
    };
    vi.mocked(httpClient.put).mockResolvedValue(ok(updated));

    const payload = { name: 'Public API', description: null, isActive: true };

    await expect(monitoringManagementApi.updateApplicationComponent(11, payload)).resolves.toEqual(
      updated,
    );
    expect(httpClient.put).toHaveBeenCalledWith('/api/components/11', payload);
  });

  it('deletes a component on DELETE /api/components/{id}', async () => {
    vi.mocked(httpClient.delete).mockResolvedValue(ok(true));

    await expect(monitoringManagementApi.deleteApplicationComponent(11)).resolves.toBe(true);
    expect(httpClient.delete).toHaveBeenCalledWith('/api/components/11');
  });

  it('loads application checks from GET /api/checks/application/{id}', async () => {
    const checks = [{ id: 21 }, { id: 22 }];
    vi.mocked(httpClient.get).mockResolvedValue(ok(checks));

    await expect(monitoringManagementApi.getApplicationChecks(1)).resolves.toEqual(checks);
    expect(httpClient.get).toHaveBeenCalledWith('/api/checks/application/1');
  });
});
