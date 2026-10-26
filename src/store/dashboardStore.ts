import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { WidgetType } from '@/types/widgets';

export const DEFAULT_DASHBOARD_REFRESH_INTERVAL = 300_000;

interface DashboardState {
  selectedApplicationId: number | null;
  selectedWidgetId: number | null;
  selectedSectionId: number | null;
  isEditMode: boolean;
  addWidgetType: WidgetType | null;
  propertiesTab: number;
  autoRefreshEnabled: boolean;
  refreshInterval: number;
  setSelectedApplicationId: (applicationId: number | null) => void;
  setSelectedWidgetId: (widgetId: number | null) => void;
  setSelectedSectionId: (sectionId: number | null) => void;
  setEditMode: (enabled: boolean) => void;
  toggleEditMode: () => void;
  enterEditMode: () => void;
  exitEditMode: () => void;
  setAddWidgetType: (widgetType: WidgetType | null) => void;
  setPropertiesTab: (tab: number) => void;
  setAutoRefreshEnabled: (enabled: boolean) => void;
  setRefreshInterval: (interval: number) => void;
  reset: () => void;
}

const initialState = {
  selectedApplicationId: null as number | null,
  selectedWidgetId: null as number | null,
  selectedSectionId: null as number | null,
  isEditMode: false,
  addWidgetType: null as WidgetType | null,
  propertiesTab: 0,
  autoRefreshEnabled: true,
  refreshInterval: DEFAULT_DASHBOARD_REFRESH_INTERVAL,
};

export const useDashboardStore = create<DashboardState>()(
  devtools(
    (set) => ({
      ...initialState,
      setSelectedApplicationId: (applicationId) => set({ selectedApplicationId: applicationId }),
      setSelectedWidgetId: (widgetId) => set({ selectedWidgetId: widgetId }),
      setSelectedSectionId: (sectionId) => set({ selectedSectionId: sectionId }),
      setEditMode: (enabled) => set({ isEditMode: enabled }),
      toggleEditMode: () => set((state) => ({ isEditMode: !state.isEditMode })),
      enterEditMode: () =>
        set({
          isEditMode: true,
          selectedWidgetId: null,
          selectedSectionId: null,
          addWidgetType: null,
          propertiesTab: 0,
        }),
      exitEditMode: () =>
        set({
          isEditMode: false,
          selectedWidgetId: null,
          selectedSectionId: null,
          addWidgetType: null,
          propertiesTab: 0,
        }),
      setAddWidgetType: (widgetType) => set({ addWidgetType: widgetType }),
      setPropertiesTab: (tab) => set({ propertiesTab: tab }),
      setAutoRefreshEnabled: (enabled) => set({ autoRefreshEnabled: enabled }),
      setRefreshInterval: (interval) => set({ refreshInterval: interval }),
      reset: () => set(initialState),
    }),
    { name: 'DashboardStore' },
  ),
);
