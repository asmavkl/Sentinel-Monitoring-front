import { beforeEach, describe, expect, it } from 'vitest';
import { useDashboardStore } from './dashboardStore';

describe('dashboardStore', () => {
  beforeEach(() => {
    useDashboardStore.getState().reset();
  });

  it('tracks selected application id', () => {
    useDashboardStore.getState().setSelectedApplicationId(42);

    expect(useDashboardStore.getState().selectedApplicationId).toBe(42);
  });

  it('toggles dashboard edit mode', () => {
    expect(useDashboardStore.getState().isEditMode).toBe(false);

    useDashboardStore.getState().toggleEditMode();
    expect(useDashboardStore.getState().isEditMode).toBe(true);

    useDashboardStore.getState().setEditMode(false);
    expect(useDashboardStore.getState().isEditMode).toBe(false);
  });

  it('tracks selected section id', () => {
    useDashboardStore.getState().setSelectedSectionId(7);

    expect(useDashboardStore.getState().selectedSectionId).toBe(7);
  });

  it('enters and exits edit mode and clears selected widget', () => {
    useDashboardStore.getState().setSelectedWidgetId(9);
    useDashboardStore.getState().enterEditMode();

    expect(useDashboardStore.getState().isEditMode).toBe(true);
    expect(useDashboardStore.getState().selectedWidgetId).toBeNull();

    useDashboardStore.getState().setSelectedWidgetId(3);
    useDashboardStore.getState().exitEditMode();

    expect(useDashboardStore.getState().isEditMode).toBe(false);
    expect(useDashboardStore.getState().selectedWidgetId).toBeNull();
  });

  it('resets state', () => {
    useDashboardStore.getState().setSelectedApplicationId(10);
    useDashboardStore.getState().setSelectedWidgetId(5);
    useDashboardStore.getState().setEditMode(true);
    useDashboardStore.getState().reset();

    const state = useDashboardStore.getState();
    expect(state.selectedApplicationId).toBeNull();
    expect(state.selectedWidgetId).toBeNull();
    expect(state.selectedSectionId).toBeNull();
    expect(state.isEditMode).toBe(false);
    expect(state.addWidgetType).toBeNull();
    expect(state.propertiesTab).toBe(0);
    expect(state.autoRefreshEnabled).toBe(true);
    expect(state.refreshInterval).toBe(300_000);
  });

  it('stores auto refresh preference', () => {
    expect(useDashboardStore.getState().autoRefreshEnabled).toBe(true);
    expect(useDashboardStore.getState().refreshInterval).toBe(300_000);

    useDashboardStore.getState().setAutoRefreshEnabled(false);
    useDashboardStore.getState().setRefreshInterval(60_000);

    expect(useDashboardStore.getState().autoRefreshEnabled).toBe(false);
    expect(useDashboardStore.getState().refreshInterval).toBe(60_000);
  });
});
