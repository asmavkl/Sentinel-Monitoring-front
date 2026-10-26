import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

export type ColorMode = 'light' | 'dark';

interface UiState {
  sidebarOpen: boolean;
  colorMode: ColorMode;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setColorMode: (mode: ColorMode) => void;
  toggleColorMode: () => void;
}

export const useUiStore = create<UiState>()(
  devtools(
    persist(
      (set) => ({
        sidebarOpen: true,
        colorMode: 'light',
        toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
        setSidebarOpen: (open) => set({ sidebarOpen: open }),
        setColorMode: (mode) => set({ colorMode: mode }),
        toggleColorMode: () =>
          set((state) => ({ colorMode: state.colorMode === 'light' ? 'dark' : 'light' })),
      }),
      {
        name: 'sentinel-ui-store',
        partialize: (state) => ({
          sidebarOpen: state.sidebarOpen,
          colorMode: state.colorMode,
        }),
      },
    ),
    { name: 'UiStore' },
  ),
);
