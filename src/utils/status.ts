import { ApplicationHealthStatus } from '@/types/enums';
import type { ApplicationOverviewDto } from '@/types/dashboard';

export type MonitoringStatus = 'UP' | 'DOWN' | 'WARNING' | 'UNKNOWN' | 'OUT_OF_SERVICE';

export const statusLabels: Record<MonitoringStatus, string> = {
  UP: 'سالم',
  DOWN: 'بحرانی',
  WARNING: 'هشدار',
  UNKNOWN: 'نامشخص',
  OUT_OF_SERVICE: 'قطع',
};

export const statusColors: Record<
  MonitoringStatus,
  'success' | 'error' | 'warning' | 'default' | 'info'
> = {
  UP: 'success',
  DOWN: 'error',
  WARNING: 'warning',
  UNKNOWN: 'default',
  OUT_OF_SERVICE: 'error',
};

export function mapApplicationHealthStatus(
  status?: ApplicationHealthStatus | null,
): MonitoringStatus {
  // Use numeric comparisons to avoid type conflicts
  const statusValue = status as number | undefined;
  
  if (statusValue === 2) { // Normal/Up
    return 'UP';
  }

  if (statusValue === 4) { // Critical/Down
    return 'DOWN';
  }

  if (statusValue === 3) { // Warning
    return 'WARNING';
  }

  if (statusValue === 5) { // OutOfService
    return 'OUT_OF_SERVICE';
  }

  return 'UNKNOWN';
}

export function deriveStatusFromOverview(overview: ApplicationOverviewDto): MonitoringStatus {
  const calculatedStatus = mapApplicationHealthStatus(overview.calculatedHealthStatus);
  const availabilityStatus = mapApplicationHealthStatus(overview.availabilityStatus);

  // OutOfService takes precedence
  if (availabilityStatus === 'OUT_OF_SERVICE') {
    return 'OUT_OF_SERVICE';
  }

  return calculatedStatus;
}

export function deriveAvailabilityStatusFromOverview(overview: ApplicationOverviewDto): MonitoringStatus | undefined {
  const calculatedStatus = mapApplicationHealthStatus(overview.calculatedHealthStatus);
  const availabilityStatus = mapApplicationHealthStatus(overview.availabilityStatus);

  // Only return availability status if it differs from calculated status
  return availabilityStatus !== calculatedStatus ? availabilityStatus : undefined;
}
