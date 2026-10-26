import { ApplicationHealthStatus } from '@/types/enums';

export const HEALTH_STATUS_COLORS: Record<ApplicationHealthStatus, string> = {
  [ApplicationHealthStatus.Unknown]: '#94A3B8',
  [ApplicationHealthStatus.Normal]: '#22C55E',
  [ApplicationHealthStatus.Warning]: '#FACC15',
  [ApplicationHealthStatus.Critical]: '#F97316',
  [ApplicationHealthStatus.OutOfService]: '#DC2626',
};

export const HEALTH_STATUS_LABELS: Record<ApplicationHealthStatus, string> = {
  [ApplicationHealthStatus.Unknown]: 'نامشخص',
  [ApplicationHealthStatus.Normal]: 'سالم',
  [ApplicationHealthStatus.Warning]: 'هشدار',
  [ApplicationHealthStatus.Critical]: 'بحرانی',
  [ApplicationHealthStatus.OutOfService]: 'قطع',
};

export function getHealthStatusColor(status: ApplicationHealthStatus): string {
  return HEALTH_STATUS_COLORS[status] ?? HEALTH_STATUS_COLORS[ApplicationHealthStatus.Unknown];
}

export function getHealthStatusLabel(status: ApplicationHealthStatus): string {
  return HEALTH_STATUS_LABELS[status] ?? HEALTH_STATUS_LABELS[ApplicationHealthStatus.Unknown];
}
