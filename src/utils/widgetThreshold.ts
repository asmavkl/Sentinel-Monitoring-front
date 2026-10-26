import type { WidgetConfiguration } from '@/types/widgets';
import { ApplicationHealthStatus } from '@/types/enums';

export const NOC_STATUS_FILL: Record<ApplicationHealthStatus, string> = {
  [ApplicationHealthStatus.Unknown]: '#94A3B8',
  [ApplicationHealthStatus.Normal]: '#22C55E',
  [ApplicationHealthStatus.Warning]: '#FACC15',
  [ApplicationHealthStatus.Critical]: '#F97316',
  [ApplicationHealthStatus.OutOfService]: '#DC2626',
};

export function readThreshold(configuration?: WidgetConfiguration | null): number | null {
  const value = configuration?.threshold;
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

export function readRefreshIntervalMs(configuration?: WidgetConfiguration | null): number | null {
  const value = configuration?.refreshInterval;
  if (typeof value === 'number' && Number.isFinite(value) && value > 0) {
    return value;
  }
  return null;
}

/** Higher-is-worse threshold: value >= threshold → WARNING (or DOWN if much higher). */
export function statusFromThreshold(
  value: number | null | undefined,
  threshold: number | null,
): ApplicationHealthStatus | null {
  if (value == null || !Number.isFinite(value) || threshold == null) {
    return null;
  }

  if (value >= threshold * 2) {
    return ApplicationHealthStatus.OutOfService;
  }
  if (value >= threshold * 1.5) {
    return ApplicationHealthStatus.Critical;
  }
  if (value >= threshold) {
    return ApplicationHealthStatus.Warning;
  }
  return ApplicationHealthStatus.Normal;
}
