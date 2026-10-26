import { AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { httpClient } from '@/api/httpClient';
import { monitoredServersApi } from './monitoredServersApi';

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

function axiosStatus(status: number, message: string) {
  return new AxiosError(
    message,
    'ERR_BAD_REQUEST',
    undefined,
    undefined,
    {
      status,
      statusText: 'Error',
      headers: {},
      config: {} as InternalAxiosRequestConfig,
      data: { success: false, message, data: null, errors: null },
    },
  );
}

describe('monitoredServersApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('lists servers from GET /api/monitored-servers', async () => {
    const servers = [{ id: 4, name: 'Samih' }];
    vi.mocked(httpClient.get).mockResolvedValue(ok(servers));

    await expect(monitoredServersApi.getMonitoredServers()).resolves.toEqual(servers);
    expect(httpClient.get).toHaveBeenCalledWith('/api/monitored-servers');
  });

  it('creates a server without MonitoringMethod', async () => {
    const created = { id: 4, name: 'Samih', monitoringMethod: 1 };
    vi.mocked(httpClient.post).mockResolvedValue(ok(created));
    const payload = {
      name: 'Samih',
      description: null,
      host: '10.10.1.20',
      port: null,
      credentialId: 7,
      isActive: true,
      intervalSeconds: 30,
      timeoutSeconds: 20,
      retryCount: 0,
      retryDelaySeconds: 5,
    };

    await expect(monitoredServersApi.createMonitoredServer(payload)).resolves.toEqual(created);
    expect(httpClient.post).toHaveBeenCalledWith('/api/monitored-servers', payload);
    expect(httpClient.post).not.toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ monitoringMethod: expect.anything() }),
    );
  });

  it('activates and deactivates without a body', async () => {
    vi.mocked(httpClient.put).mockResolvedValue(ok({ id: 4, isActive: true }));

    await monitoredServersApi.activateMonitoredServer(4);
    await monitoredServersApi.deactivateMonitoredServer(4);

    expect(httpClient.put).toHaveBeenNthCalledWith(1, '/api/monitored-servers/4/activate');
    expect(httpClient.put).toHaveBeenNthCalledWith(2, '/api/monitored-servers/4/deactivate');
  });

  it('loads status, metrics, and history in timestamp order from the API', async () => {
    const history = [
      { value: 42, timestamp: '2026-09-28T10:00:00Z' },
      { value: 55, timestamp: '2026-09-28T10:01:00Z' },
    ];
    vi.mocked(httpClient.get)
      .mockResolvedValueOnce(ok({ serverId: 4, healthStatus: 1, metrics: [] }))
      .mockResolvedValueOnce(ok([]))
      .mockResolvedValueOnce(ok(history));

    await expect(monitoredServersApi.getServerStatus(4)).resolves.toMatchObject({ serverId: 4 });
    await expect(monitoredServersApi.getServerMetrics(4)).resolves.toEqual([]);
    await expect(monitoredServersApi.getMetricHistory(4, 10, 100)).resolves.toEqual(history);

    expect(httpClient.get).toHaveBeenNthCalledWith(1, '/api/monitored-servers/4/status');
    expect(httpClient.get).toHaveBeenNthCalledWith(2, '/api/monitored-servers/4/metrics');
    expect(httpClient.get).toHaveBeenNthCalledWith(3, '/api/monitored-servers/4/metrics/10/history', {
      params: { limit: 100 },
    });
  });

  it('treats a missing criteria definition as an empty form', async () => {
    vi.mocked(httpClient.get).mockRejectedValue(
      axiosStatus(404, 'Criteria definition not found.'),
    );

    await expect(monitoredServersApi.getMetricCriteria(4, 10)).resolves.toBeNull();
  });

  it('rejects a missing server metric instead of opening a create form', async () => {
    vi.mocked(httpClient.get).mockRejectedValue(axiosStatus(404, 'Server metric not found.'));

    await expect(monitoredServersApi.getMetricCriteria(4, 10)).rejects.toThrow(
      'Server metric not found.',
    );
  });

  it('replaces metric criteria with PUT', async () => {
    const saved = { id: 1, serverMetricDefinitionId: 10, isActive: true, rules: [] };
    vi.mocked(httpClient.put).mockResolvedValue(ok(saved));
    const payload = { isActive: true, rules: [] };

    await expect(monitoredServersApi.updateMetricCriteria(4, 10, payload)).resolves.toEqual(saved);
    expect(httpClient.put).toHaveBeenCalledWith(
      '/api/monitored-servers/4/metrics/10/criteria',
      payload,
    );
  });
});
