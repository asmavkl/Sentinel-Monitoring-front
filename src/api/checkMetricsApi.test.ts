import { describe, expect, it, vi, beforeEach } from 'vitest';
import { checkMetricsApi } from '@/api/checkMetricsApi';
import { httpClient } from '@/api/httpClient';

vi.mock('@/api/httpClient', () => ({
  httpClient: {
    get: vi.fn(),
  },
}));

describe('checkMetricsApi', () => {
  beforeEach(() => {
    vi.mocked(httpClient.get).mockReset();
  });

  it('calls definitions, latest, history and aggregate endpoints', async () => {
    vi.mocked(httpClient.get).mockResolvedValue({
      data: { success: true, data: [], message: null, errors: null },
    });

    await checkMetricsApi.getMetricDefinitions(10);
    expect(httpClient.get).toHaveBeenCalledWith('/api/checks/10/metrics/definitions', {
      params: undefined,
    });

    vi.mocked(httpClient.get).mockResolvedValue({
      data: {
        success: true,
        data: { metricId: 5, value: 1 },
        message: null,
        errors: null,
      },
    });
    await checkMetricsApi.getMetricLatest(10, 5);
    expect(httpClient.get).toHaveBeenCalledWith('/api/checks/10/metrics/5/latest', {
      params: undefined,
    });

    vi.mocked(httpClient.get).mockResolvedValue({
      data: { success: true, data: [], message: null, errors: null },
    });
    await checkMetricsApi.getMetricHistory(10, 5, { from: 'a', to: 'b', take: 10 });
    expect(httpClient.get).toHaveBeenCalledWith('/api/checks/10/metrics/5/history', {
      params: { applicationId: undefined, from: 'a', to: 'b', take: 10 },
    });

    vi.mocked(httpClient.get).mockResolvedValue({
      data: {
        success: true,
        data: { metricId: 5, aggregation: 'Average', value: 2 },
        message: null,
        errors: null,
      },
    });
    await checkMetricsApi.getMetricAggregate(10, 5, {
      aggregation: 'Average',
      from: 'a',
      to: 'b',
    });
    expect(httpClient.get).toHaveBeenCalledWith('/api/checks/10/metrics/5/aggregate', {
      params: {
        aggregation: 'Average',
        applicationId: undefined,
        from: 'a',
        to: 'b',
      },
    });
  });
});
