import type {
  AlertIncidentStatus,
  AlertThresholdMode,
  ApplicationHealthStatus,
  NotificationChannel,
  NotificationDeliveryStatus,
} from '@/types/enums';

export interface AlertPolicyRecipientDto {
  channel: NotificationChannel;
  address: string;
  isActive: boolean;
}

export interface UpsertAlertPolicyRequest {
  isActive: boolean;
  triggerStatus: ApplicationHealthStatus;
  triggerMode: AlertThresholdMode;
  triggerThresholdCount: number | null;
  triggerThresholdSeconds: number | null;
  recoveryStatus: ApplicationHealthStatus;
  recoveryMode: AlertThresholdMode;
  recoveryThresholdCount: number | null;
  recoveryThresholdSeconds: number | null;
  recipients: AlertPolicyRecipientDto[];
}

export interface AlertPolicyDto extends UpsertAlertPolicyRequest {
  id: number;
  checkDefinitionId: number | null;
  serverMetricDefinitionId: number | null;
}

export interface AlertIncidentDto {
  id: number;
  alertPolicyId: number;
  status: AlertIncidentStatus;
  openedAt: string;
  resolvedAt: string | null;
  incidentNotificationStatus: NotificationDeliveryStatus;
  recoveryNotificationStatus: NotificationDeliveryStatus | null;
  valueAtOpen: number | null;
}

export type AlertPolicyOwner =
  | { type: 'check'; checkId: number }
  | { type: 'serverMetric'; serverMetricDefinitionId: number };
