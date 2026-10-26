import { screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { DashboardLayoutRenderer } from '@/components/widgets/DashboardLayoutRenderer';
import { createChartWidget, createStatusCardWidget } from '@/test/widgetFixtures';
import type { DashboardLayoutDto } from '@/types/dashboard';
import { normalizeDashboardLayout } from '@/utils/dashboardLayout';
import { renderWithProviders } from '@/test/testUtils';

vi.mock('@/components/widgets/MetricChartWidget', () => ({
  MetricChartWidget: ({ title }: { title: string }) => <div>{title} Chart</div>,
}));

vi.mock('@/features/dashboard/hooks/useCheckHistory', () => ({
  useCheckHistory: () => ({
    isLoading: false,
    isError: false,
    data: { items: [], totalCount: 0, pageNumber: 1, pageSize: 50, totalPages: 0 },
  }),
}));

vi.mock('@/features/dashboard/hooks/useCheckStatus', () => ({
  useCheckStatus: () => ({
    data: undefined,
    isLoading: false,
    isError: false,
    dataUpdatedAt: 0,
  }),
}));

vi.mock('react-grid-layout', () => {
  const GridLayout = ({ children }: { children: React.ReactNode }) => (
    <div data-testid="grid-layout">{children}</div>
  );

  return {
    __esModule: true,
    default: GridLayout,
    verticalCompactor: { type: 'vertical', compact: (items: any[]) => items },
    noCompactor: { type: null, allowOverlap: false, compact: (items: any[]) => items },
    useContainerWidth: () => ({
      width: 1200,
      mounted: true,
      containerRef: { current: null },
      measureWidth: () => undefined,
    }),
  };
});

vi.mock('react-grid-layout/css/styles.css', () => ({}));
vi.mock('react-resizable/css/styles.css', () => ({}));

const sectionedLayout: DashboardLayoutDto = normalizeDashboardLayout({
  dashboardId: 1,
  applicationId: 1,
  title: 'Operations Dashboard',
  sections: [
    {
      id: 10,
      title: 'Service Health',
      displayOrder: 0,
      isVisible: true,
      widgets: [createStatusCardWidget()],
    },
    {
      id: 11,
      title: 'Metrics',
      displayOrder: 1,
      isVisible: true,
      widgets: [createChartWidget()],
    },
    {
      id: 12,
      title: 'Hidden',
      displayOrder: 2,
      isVisible: false,
      widgets: [createStatusCardWidget({ id: 99, title: 'Hidden Widget' })],
    },
  ],
});

describe('DashboardLayoutRenderer', () => {
  it('renders widgets inside ordered visible sections', () => {
    renderWithProviders(<DashboardLayoutRenderer layout={sectionedLayout} />);

    expect(screen.queryByText('Operations Dashboard')).not.toBeInTheDocument();
    expect(screen.getByText('Service Health')).toBeInTheDocument();
    expect(screen.getByText('Metrics')).toBeInTheDocument();
    expect(screen.getByText('API Health')).toBeInTheDocument();
    expect(screen.getByText('Response Time Chart')).toBeInTheDocument();
    expect(screen.queryByText('Hidden')).not.toBeInTheDocument();
    expect(screen.queryByText('Hidden Widget')).not.toBeInTheDocument();
    expect(screen.getAllByTestId('dashboard-section')).toHaveLength(2);
  });

  it('renders legacy flat widgets via a compatibility section with shared grid layout', () => {
    const legacy = normalizeDashboardLayout({
      dashboardId: 1,
      applicationId: 1,
      name: 'Legacy Dashboard',
      widgets: [
        createStatusCardWidget({
          layout: { x: 0, y: 0, width: 8, height: 2 },
        }),
      ],
    });

    renderWithProviders(<DashboardLayoutRenderer layout={legacy} />);

    expect(screen.queryByText('Legacy Dashboard')).not.toBeInTheDocument();
    expect(screen.getByText('ویجت ها')).toBeInTheDocument();
    expect(screen.getByText('API Health')).toBeInTheDocument();
    expect(screen.getByTestId('view-widget-1')).toHaveAttribute('data-grid-w', '8');
  });

  it('shows an empty state when no sections are configured', () => {
    renderWithProviders(
      <DashboardLayoutRenderer
        layout={normalizeDashboardLayout({
          dashboardId: 1,
          applicationId: 1,
          sections: [],
          widgets: [],
        })}
      />,
    );

    expect(screen.getByText('داشبورد پیکربندی نشده است')).toBeInTheDocument();
    expect(screen.getByText('No dashboard configured')).toBeInTheDocument();
  });
});
