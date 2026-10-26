import { describe, expect, it } from 'vitest';
import { AlertThresholdMode, ApplicationHealthStatus, NotificationChannel } from '@/types/enums';
import {
  createDefaultAlertPolicyForm,
  toUpsertAlertPolicyRequest,
  validateAlertPolicyForm,
} from './alertPolicyForm';

describe('alertPolicyForm', () => {
  it('sends count thresholds and drops the duration fields', () => {
    const values = createDefaultAlertPolicyForm();
    values.recipients = [{ address: ' Ops@Example.com ', isActive: true, isExisting: false }];

    expect(toUpsertAlertPolicyRequest(values)).toEqual({
      isActive: true,
      triggerStatus: ApplicationHealthStatus.OutOfService,
      triggerMode: AlertThresholdMode.ConsecutiveCount,
      triggerThresholdCount: 3,
      triggerThresholdSeconds: null,
      recoveryStatus: ApplicationHealthStatus.Normal,
      recoveryMode: AlertThresholdMode.ConsecutiveCount,
      recoveryThresholdCount: 3,
      recoveryThresholdSeconds: null,
      recipients: [
        {
          channel: NotificationChannel.Email,
          address: 'Ops@Example.com',
          isActive: true,
        },
      ],
    });
  });

  it('sends duration thresholds when that mode is selected', () => {
    const values = createDefaultAlertPolicyForm();
    values.triggerMode = AlertThresholdMode.Duration;
    values.triggerThreshold = 120;
    values.recoveryMode = AlertThresholdMode.Duration;
    values.recoveryThreshold = 60;

    const request = toUpsertAlertPolicyRequest(values);

    expect(request.triggerThresholdCount).toBeNull();
    expect(request.triggerThresholdSeconds).toBe(120);
    expect(request.recoveryThresholdCount).toBeNull();
    expect(request.recoveryThresholdSeconds).toBe(60);
  });

  it('rejects an invalid or duplicated email', () => {
    const values = createDefaultAlertPolicyForm();
    values.recipients = [
      { address: 'ops@example.com', isActive: true, isExisting: false },
      { address: 'OPS@example.com', isActive: true, isExisting: false },
      { address: 'not-an-email', isActive: true, isExisting: false },
    ];

    expect(validateAlertPolicyForm(values)).toEqual([
      'ایمیل «OPS@example.com» تکراری است.',
      'ایمیل «not-an-email» معتبر نیست.',
    ]);
  });
});
