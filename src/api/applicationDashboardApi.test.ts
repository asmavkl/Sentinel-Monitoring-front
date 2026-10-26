import { beforeEach, describe, expect, it, vi } from 'vitest';
import { applicationDashboardApi } from './applicationDashboardApi';
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

describe('applicationDashboardApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('loads and normalizes a dashboard with sections', async () => {
    vi.mocked(httpClient.get).mockResolvedValue(
      ok({
        id: 9,
        applicationId: 4,
        title: 'Operations',
        sections: [
          {
            id: 1,
            title: 'Service Health',
            displayOrder: 0,
            isVisible: true,
            widgets: [],
          },
        ],
      }),
    );

    await expect(applicationDashboardApi.getDashboard(4)).resolves.toMatchObject({
      dashboardId: 9,
      applicationId: 4,
      title: 'Operations',
      sections: [expect.objectContaining({ title: 'Service Health' })],
      widgets: [],
    });
    expect(httpClient.get).toHaveBeenCalledWith('/api/applications/4/dashboard');
  });

  it('loads layout from GET /api/applications/{id}/dashboard/layout', async () => {
    vi.mocked(httpClient.get).mockResolvedValue(
      ok({
        dashboardId: 9,
        applicationId: 4,
        sections: [],
        widgets: [],
      }),
    );

    await expect(applicationDashboardApi.getLayout(4)).resolves.toMatchObject({
      dashboardId: 9,
      sections: [],
      widgets: [],
    });
    expect(httpClient.get).toHaveBeenCalledWith('/api/applications/4/dashboard/layout');
  });

  it('normalizes legacy flat widgets from layout responses', async () => {
    vi.mocked(httpClient.get).mockResolvedValue(
      ok({
        dashboardId: 9,
        applicationId: 4,
        name: 'Legacy',
        widgets: [
          {
            id: 1,
            title: 'Health',
            widgetType: 'StatusCard',
            layout: { x: 0, y: 0, width: 4, height: 2 },
            configuration: {},
            dataSources: [],
          },
        ],
      }),
    );

    const layout = await applicationDashboardApi.getLayout(4);
    expect(layout.sections).toHaveLength(1);
    expect(layout.widgets).toHaveLength(1);
  });

  it('creates a widget on POST /api/applications/{id}/dashboard/widgets', async () => {
    const created = { id: 77, title: 'Health', widgetType: 'StatusCard' };
    vi.mocked(httpClient.post).mockResolvedValue(ok(created));
    const payload = {
      title: 'Health',
      widgetType: 'StatusCard' as const,
      displayOrder: 0,
      configuration: { showDuration: true },
      dataSources: [{ checkId: 101, displayOrder: 0 }],
      layout: { x: 0, y: 0, width: 4, height: 2 },
    };

    await expect(applicationDashboardApi.createWidget(4, payload)).resolves.toEqual(created);
    expect(httpClient.post).toHaveBeenCalledWith('/api/applications/4/dashboard/widgets', payload);
  });

  it('updates a widget on PUT /api/applications/{id}/dashboard/widgets/{widgetId}', async () => {
    const updated = { id: 12, title: 'Availability', widgetType: 'StatusCard' };
    vi.mocked(httpClient.put).mockResolvedValue(ok(updated));
    const payload = {
      title: 'Availability',
      layout: { x: 2, y: 1, width: 6, height: 3 },
    };

    await expect(applicationDashboardApi.updateWidget(4, 12, payload)).resolves.toEqual(updated);
    expect(httpClient.put).toHaveBeenCalledWith(
      '/api/applications/4/dashboard/widgets/12',
      payload,
    );
  });

  it('deletes a widget on DELETE /api/applications/{id}/dashboard/widgets/{widgetId}', async () => {
    vi.mocked(httpClient.delete).mockResolvedValue({ data: { success: true, data: null } });

    await expect(applicationDashboardApi.deleteWidget(4, 12)).resolves.toBeUndefined();
    expect(httpClient.delete).toHaveBeenCalledWith('/api/applications/4/dashboard/widgets/12');
  });
});
