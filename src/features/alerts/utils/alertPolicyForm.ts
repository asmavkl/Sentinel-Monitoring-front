import {
  AlertIncidentStatus,
  AlertThresholdMode,
  ApplicationHealthStatus,
  NotificationChannel,
  NotificationDeliveryStatus,
} from '@/types/enums';
import type { AlertPolicyDto, AlertPolicyRecipientDto, UpsertAlertPolicyRequest } from '@/types/alertPolicy';

export interface AlertRecipientFormValue {
  address: string;
  isActive: boolean;
  isExisting: boolean;
}

export interface AlertPolicyFormValues {
  isActive: boolean;
  triggerStatus: ApplicationHealthStatus;
  triggerMode: AlertThresholdMode;
  triggerThreshold: number;
  recoveryStatus: ApplicationHealthStatus;
  recoveryMode: AlertThresholdMode;
  recoveryThreshold: number;
  recipients: AlertRecipientFormValue[];
}

export const ALERT_THRESHOLD_MODE_LABELS: Record<AlertThresholdMode, string> = {
  [AlertThresholdMode.ConsecutiveCount]: 'تعداد دفعات پیاپی',
  [AlertThresholdMode.Duration]: 'مدت زمان',
};

export const ALERT_INCIDENT_STATUS_LABELS: Record<AlertIncidentStatus, string> = {
  [AlertIncidentStatus.Open]: 'باز',
  [AlertIncidentStatus.Resolved]: 'حل شده',
};

export const NOTIFICATION_DELIVERY_STATUS_LABELS: Record<NotificationDeliveryStatus, string> = {
  [NotificationDeliveryStatus.Pending]: 'در انتظار',
  [NotificationDeliveryStatus.Processing]: 'در حال پردازش',
  [NotificationDeliveryStatus.Sent]: 'ارسال شد',
  [NotificationDeliveryStatus.Failed]: 'ناموفق',
  [NotificationDeliveryStatus.Suppressed]: 'بدون ارسال',
  [NotificationDeliveryStatus.DeliveryUnconfirmed]: 'تأیید نشده',
  [NotificationDeliveryStatus.Sending]: 'در حال ارسال',
};

export function createDefaultAlertPolicyForm(): AlertPolicyFormValues {
  return {
    isActive: true,
    triggerStatus: ApplicationHealthStatus.OutOfService,
    triggerMode: AlertThresholdMode.ConsecutiveCount,
    triggerThreshold: 3,
    recoveryStatus: ApplicationHealthStatus.Normal,
    recoveryMode: AlertThresholdMode.ConsecutiveCount,
    recoveryThreshold: 3,
    recipients: [],
  };
}

export function alertPolicyToForm(policy: AlertPolicyDto): AlertPolicyFormValues {
  return {
    isActive: policy.isActive,
    triggerStatus: policy.triggerStatus,
    triggerMode: policy.triggerMode,
    triggerThreshold:
      policy.triggerMode === AlertThresholdMode.Duration
        ? (policy.triggerThresholdSeconds ?? 3)
        : (policy.triggerThresholdCount ?? 3),
    recoveryStatus: policy.recoveryStatus,
    recoveryMode: policy.recoveryMode,
    recoveryThreshold:
      policy.recoveryMode === AlertThresholdMode.Duration
        ? (policy.recoveryThresholdSeconds ?? 3)
        : (policy.recoveryThresholdCount ?? 3),
    recipients: policy.recipients.map((recipient) => ({
      address: recipient.address,
      isActive: recipient.isActive,
      isExisting: true,
    })),
  };
}

export function validateAlertPolicyForm(values: AlertPolicyFormValues): string[] {
  const errors: string[] = [];
  if (!Number.isInteger(values.triggerThreshold) || values.triggerThreshold < 1) {
    errors.push('آستانه شروع باید عدد صحیح حداقل ۱ باشد.');
  }
  if (!Number.isInteger(values.recoveryThreshold) || values.recoveryThreshold < 1) {
    errors.push('آستانه بازگشت باید عدد صحیح حداقل ۱ باشد.');
  }

  const seen = new Set<string>();
  values.recipients.forEach((recipient) => {
    const address = recipient.address.trim();
    if (!address) {
      return;
    }
    if (!isEmail(address)) {
      errors.push(`ایمیل «${address}» معتبر نیست.`);
      return;
    }
    const key = address.toLowerCase();
    if (seen.has(key)) {
      errors.push(`ایمیل «${address}» تکراری است.`);
      return;
    }
    seen.add(key);
  });

  return errors;
}

export function toUpsertAlertPolicyRequest(values: AlertPolicyFormValues): UpsertAlertPolicyRequest {
  const recipients: AlertPolicyRecipientDto[] = values.recipients
    .map((recipient) => ({
      channel: NotificationChannel.Email,
      address: recipient.address.trim(),
      isActive: recipient.isActive,
    }))
    .filter((recipient) => recipient.address.length > 0);

  return {
    isActive: values.isActive,
    triggerStatus: values.triggerStatus,
    triggerMode: values.triggerMode,
    triggerThresholdCount:
      values.triggerMode === AlertThresholdMode.ConsecutiveCount ? values.triggerThreshold : null,
    triggerThresholdSeconds:
      values.triggerMode === AlertThresholdMode.Duration ? values.triggerThreshold : null,
    recoveryStatus: values.recoveryStatus,
    recoveryMode: values.recoveryMode,
    recoveryThresholdCount:
      values.recoveryMode === AlertThresholdMode.ConsecutiveCount ? values.recoveryThreshold : null,
    recoveryThresholdSeconds:
      values.recoveryMode === AlertThresholdMode.Duration ? values.recoveryThreshold : null,
    recipients,
  };
}

function isEmail(value: string): boolean {
  if (value.length === 0 || value.length > 320 || value.includes(' ')) {
    return false;
  }

  const at = value.indexOf('@');
  return at > 0 && at < value.length - 1 && value.indexOf('@', at + 1) < 0;
}
