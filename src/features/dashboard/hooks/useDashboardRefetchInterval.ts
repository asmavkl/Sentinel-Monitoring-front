import { useDashboardStore } from '@/store/dashboardStore';

/** @param overrideMs Optional per-widget refresh interval from configuration.refreshInterval */
export function useDashboardRefetchInterval(overrideMs?: number | null): number | false {
  const autoRefreshEnabled = useDashboardStore((state) => state.autoRefreshEnabled);
  const refreshInterval = useDashboardStore((state) => state.refreshInterval);
  const isEditMode = useDashboardStore((state) => state.isEditMode);

  if (!autoRefreshEnabled || isEditMode) {
    return false;
  }

  if (overrideMs != null && overrideMs > 0) {
    return overrideMs;
  }

  return refreshInterval;
}
