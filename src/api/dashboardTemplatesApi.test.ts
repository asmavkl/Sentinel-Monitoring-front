import { beforeEach, describe, expect, it, vi } from 'vitest';
import { dashboardTemplatesApi } from './dashboardTemplatesApi';
import { httpClient } from '@/api/httpClient';

vi.mock('@/api/httpClient', () => ({
  httpClient: {
    get: vi.fn(),
  },
}));

function ok<T>(data: T) {
  return { data: { success: true, data } };
}

describe('dashboardTemplatesApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('lists templates from GET /api/dashboard-templates', async () => {
    const templates = [
      { id: 1, name: 'Empty Dashboard', code: 'empty' },
      { id: 2, name: 'Standard Monitoring Dashboard', code: 'standard' },
      { id: 3, name: 'NOC Dashboard', code: 'noc' },
    ];
    vi.mocked(httpClient.get).mockResolvedValue(ok(templates));

    await expect(dashboardTemplatesApi.getTemplates()).resolves.toEqual(templates);
    expect(httpClient.get).toHaveBeenCalledWith('/api/dashboard-templates');
  });
});
