import { beforeEach, describe, expect, it, vi } from 'vitest';
import { alertPolicyApi } from './alertPolicyApi';
import { httpClient } from '@/api/httpClient';
import { ApiError } from '@/api/apiUtils';
import { AlertThresholdMode, ApplicationHealthStatus, NotificationChannel } from '@/types/enums';
import type { UpsertAlertPolicyRequest } from '@/types/alertPolicy';

vi.mock('@/api/httpClient', () => ({
  httpClient: {
    get: vi.fn(),
    put: vi.fn(),
  },
}));

function ok<T>(data: T) {
  return { data: { success: true, data } };
}

describe('alertPolicyApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('reads a missing check policy as empty', async () => {
    vi.mocked(httpClient.get).mockRejectedValue({
      isAxiosError: true,
      message: 'Not Found',
      response: { status: 404, data: { success: false, message: 'Alert policy not found.', data: null } },
    });

    await expect(alertPolicyApi.getForCheck(7)).resolves.toBeNull();
    expect(httpClient.get).toHaveBeenCalledWith('/api/checks/7/alert-policy');
  });

  it('saves a server metric policy', async () => {
    const policy = { id: 4, serverMetricDefinitionId: 9, recipients: [] };
    vi.mocked(httpClient.put).mockResolvedValue(ok(policy));
    const payload: UpsertAlertPolicyRequest = {
      isActive: true,
      triggerStatus: ApplicationHealthStatus.OutOfService,
      triggerMode: AlertThresholdMode.ConsecutiveCount,
      triggerThresholdCount: 3,
      triggerThresholdSeconds: null,
      recoveryStatus: ApplicationHealthStatus.Normal,
      recoveryMode: AlertThresholdMode.ConsecutiveCount,
      recoveryThresholdCount: 3,
      recoveryThresholdSeconds: null,
      recipients: [{ channel: NotificationChannel.Email, address: 'ops@example.com', isActive: true }],
    };

    await expect(alertPolicyApi.saveForServerMetric(9, payload)).resolves.toEqual(policy);
    expect(httpClient.put).toHaveBeenCalledWith('/api/monitored-servers/metrics/9/alert-policy', payload);
  });

  it('loads incidents for a policy', async () => {
    vi.mocked(httpClient.get).mockResolvedValue(ok([]));

    await expect(alertPolicyApi.getIncidents(4)).resolves.toEqual([]);
    expect(httpClient.get).toHaveBeenCalledWith('/api/alert-incidents', { params: { policyId: 4 } });
  });

  it('keeps non-404 failures', async () => {
    vi.mocked(httpClient.get).mockRejectedValue({
      isAxiosError: true,
      message: 'Forbidden',
      response: { status: 403, data: { success: false, message: 'forbidden', data: null } },
    });

    await expect(alertPolicyApi.getForCheck(7)).rejects.toBeInstanceOf(ApiError);
  });
});
