import { beforeEach, describe, expect, it, vi } from 'vitest';
import { serverDashboardApi } from './serverDashboardApi';
import { httpClient } from '@/api/httpClient';

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

describe('serverDashboardApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('loads a server dashboard without a check id', async () => {
    vi.mocked(httpClient.get).mockResolvedValue(
      ok({
        dashboardId: 12,
        applicationId: null,
        monitoredServerId: 4,
        name: 'Samih Dashboard',
        sections: [],
        widgets: [
          {
            id: 3,
            title: 'CPU',
            widgetType: 'NumberCard',
            displayOrder: 1,
            layout: { x: 0, y: 0, width: 4, height: 2 },
            configuration: {},
            dataSources: [
              {
                id: 8,
                serverMetricDefinitionId: 15,
                metricName: 'cpu.usage_percent',
                value: 42,
                healthStatus: 2,
                displayOrder: 0,
              },
            ],
          },
        ],
      }),
    );

    const layout = await serverDashboardApi.getDashboard(4);

    expect(httpClient.get).toHaveBeenCalledWith('/api/monitored-servers/4/dashboard');
    expect(layout.monitoredServerId).toBe(4);
    expect(layout.widgets[0]?.dataSources[0]).toMatchObject({
      serverMetricDefinitionId: 15,
      value: 42,
    });
    expect(layout.widgets[0]?.dataSources[0]?.checkId).toBeUndefined();
  });

  it('creates a widget with a server metric and no check id', async () => {
    vi.mocked(httpClient.post).mockResolvedValue(ok({ id: 9, title: 'CPU' }));

    await serverDashboardApi.createWidget(4, {
      title: 'CPU',
      widgetType: 'StatusCard',
      displayOrder: 1,
      dataSources: [{ serverMetricDefinitionId: 15, dataSourceType: 'Metric', displayOrder: 0 }],
    });

    expect(httpClient.post).toHaveBeenCalledWith('/api/monitored-servers/4/dashboard/widgets', {
      title: 'CPU',
      widgetType: 'StatusCard',
      displayOrder: 1,
      dataSources: [{ serverMetricDefinitionId: 15, dataSourceType: 'Metric', displayOrder: 0 }],
    });
  });
});
