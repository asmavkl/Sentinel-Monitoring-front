import { beforeEach, describe, expect, it, vi } from 'vitest';
import { dashboardSectionsApi } from './dashboardSectionsApi';
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

describe('dashboardSectionsApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('lists sections from GET /api/dashboards/{id}/sections', async () => {
    const sections = [{ id: 1, title: 'Health', displayOrder: 0, isVisible: true, widgets: [] }];
    vi.mocked(httpClient.get).mockResolvedValue(ok(sections));

    await expect(dashboardSectionsApi.getSections(10)).resolves.toEqual(sections);
    expect(httpClient.get).toHaveBeenCalledWith('/api/dashboards/10/sections');
  });

  it('creates a section on POST /api/dashboards/{id}/sections', async () => {
    const created = {
      id: 2,
      title: 'سامانه‌های حیاتی',
      color: 'blue',
      displayOrder: 1,
      isVisible: true,
      widgets: [],
    };
    vi.mocked(httpClient.post).mockResolvedValue(ok(created));
    const payload = {
      title: 'سامانه‌های حیاتی',
      description: null,
      color: 'blue',
      displayOrder: 1,
      isVisible: true,
    };

    await expect(dashboardSectionsApi.createSection(10, payload)).resolves.toEqual(created);
    expect(httpClient.post).toHaveBeenCalledWith('/api/dashboards/10/sections', payload);
  });

  it('updates a section on PUT /api/dashboard/sections/{sectionId}', async () => {
    const updated = {
      id: 2,
      title: 'Metrics',
      displayOrder: 0,
      isVisible: false,
      widgets: [],
    };
    vi.mocked(httpClient.put).mockResolvedValue(ok(updated));
    const payload = { title: 'Metrics', isVisible: false };

    await expect(dashboardSectionsApi.updateSection(10, 2, payload)).resolves.toEqual(updated);
    expect(httpClient.put).toHaveBeenCalledWith('/api/dashboard/sections/2', payload);
  });

  it('deletes a section on DELETE /api/dashboard/sections/{sectionId}', async () => {
    vi.mocked(httpClient.delete).mockResolvedValue({ data: { success: true, data: null } });

    await expect(dashboardSectionsApi.deleteSection(10, 2)).resolves.toBeUndefined();
    expect(httpClient.delete).toHaveBeenCalledWith('/api/dashboard/sections/2');
  });
});
