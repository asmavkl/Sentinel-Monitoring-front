import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { useDashboardRefetchInterval } from './useDashboardRefetchInterval';
import { DEFAULT_DASHBOARD_REFRESH_INTERVAL, useDashboardStore } from '@/store/dashboardStore';

describe('useDashboardRefetchInterval', () => {
  beforeEach(() => {
    useDashboardStore.getState().reset();
  });

  it('uses the configured interval when auto refresh is enabled', () => {
    const { result } = renderHook(() => useDashboardRefetchInterval());

    expect(result.current).toBe(DEFAULT_DASHBOARD_REFRESH_INTERVAL);
  });

  it('removes the interval when auto refresh is disabled', () => {
    useDashboardStore.getState().setAutoRefreshEnabled(false);
    const { result } = renderHook(() => useDashboardRefetchInterval());

    expect(result.current).toBe(false);
  });

  it('disables auto refresh while the designer is open', () => {
    useDashboardStore.getState().enterEditMode();
    const { result } = renderHook(() => useDashboardRefetchInterval());

    expect(result.current).toBe(false);
  });
});
