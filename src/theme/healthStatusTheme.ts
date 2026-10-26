import type { MonitoringStatus } from '@/utils/status';

export interface HealthStatusThemeTokens {
  background: string;
  contrastText: string;
  label: string;
}

export const HEALTH_STATUS_BODY_LABEL = 'وضعیت سلامت';

export const healthStatusTheme: Record<MonitoringStatus, HealthStatusThemeTokens> = {
  UP: {
    background: '#22C55E',
    contrastText: '#FFFFFF',
    label: 'سالم',
  },
  WARNING: {
    background: '#FACC15',
    contrastText: '#212121',
    label: 'هشدار',
  },
  DOWN: {
    background: '#F97316',
    contrastText: '#FFFFFF',
    label: 'بحرانی',
  },
  UNKNOWN: {
    background: '#94A3B8',
    contrastText: '#FFFFFF',
    label: 'نامشخص',
  },
  OUT_OF_SERVICE: {
    background: '#DC2626',
    contrastText: '#FFFFFF',
    label: 'قطع',
  },
};

export function getHealthStatusTheme(status: MonitoringStatus): HealthStatusThemeTokens {
  return healthStatusTheme[status] ?? healthStatusTheme.UNKNOWN;
}
