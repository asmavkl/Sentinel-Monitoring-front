import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { applicationDashboardApi } from '@/api/applicationDashboardApi';
import { dashboardSectionsApi } from '@/api/dashboardSectionsApi';
import { DashboardDesignerPage } from '../pages/DashboardDesignerPage';
import { renderWithProviders } from '@/test/testUtils';
import { createChartWidget, createStatusCardWidget } from '@/test/widgetFixtures';
import { useDashboardStore } from '@/store/dashboardStore';
import type { ComponentStatusDto, DashboardLayoutDto } from '@/types/dashboard';
import { normalizeDashboardLayout } from '@/utils/dashboardLayout';

vi.mock('@/api/applicationDashboardApi', () => ({
  applicationDashboardApi: {
    getDashboard: vi.fn(),
    getLayout: vi.fn(),
    createWidget: vi.fn(),
    updateWidget: vi.fn(),
    deleteWidget: vi.fn(),
  },
}));

vi.mock('@/api/dashboardSectionsApi', () => ({
  dashboardSectionsApi: {
    getSections: vi.fn(),
    createSection: vi.fn(),
    updateSection: vi.fn(),
    deleteSection: vi.fn(),
  },
}));

vi.mock('@/components/widgets/MetricChartWidget', () => ({
  MetricChartWidget: ({ title }: { title: string }) => <div>{title} Chart</div>,
}));

vi.mock('@/features/dashboard/hooks/useMetricQueries', () => ({
  useMetricDefinitions: () => ({ isLoading: false, data: [] }),
  useMetricDefinition: () => ({ isLoading: false, data: null }),
  useMetricHistory: () => ({ isLoading: false, data: [] }),
  useMetricLatest: () => ({ isLoading: false, data: null }),
  useMetricAggregate: () => ({ isLoading: false, data: null }),
}));

vi.mock('react-grid-layout', () => {
  const GridLayout = ({ children }: { children: React.ReactNode }) => (
    <div data-testid="grid-layout">{children}</div>
  );

  return {
    __esModule: true,
    default: GridLayout,
    verticalCompactor: { type: 'vertical', compact: (items: unknown[]) => items },
    noCompactor: { type: null, allowOverlap: false, compact: (items: unknown[]) => items },
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

const layout: DashboardLayoutDto = normalizeDashboardLayout({
  dashboardId: 10,
  applicationId: 1,
  title: 'سمیح Dashboard',
  sections: [
    {
      id: 1,
      title: 'سامانه‌های حیاتی',
      color: 'blue',
      displayOrder: 0,
      isVisible: true,
      widgets: [createStatusCardWidget({ id: 1, sectionId: 1, dashboardId: 10 })],
    },
    {
      id: 2,
      title: 'Metrics',
      color: 'purple',
      displayOrder: 1,
      isVisible: true,
      widgets: [createChartWidget({ id: 2, sectionId: 2, dashboardId: 10 })],
    },
  ],
});

const components: ComponentStatusDto[] = [
  {
    componentId: 11,
    applicationId: 1,
    name: 'API',
    code: 'API',
    isActive: true,
    status: 1,
    totalChecks: 1,
    activeChecks: 1,
    healthyChecks: 1,
    unhealthyChecks: 0,
    checks: [
      {
        checkId: 101,
        componentId: 11,
        name: 'Health API',
        checkType: 1, // HttpRequest or Http (both have value 1)
        isActive: true,
      },
    ],
  },
];

describe('DashboardDesignerPage sections', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useDashboardStore.getState().reset();
    useDashboardStore.getState().enterEditMode();
  });

  it('renders sections on the designer canvas', () => {
    renderWithProviders(
      <DashboardDesignerPage
        applicationId={1}
        layout={layout}
        components={components}
        applicationName="سمیح"
      />,
    );

    expect(screen.getByRole('button', { name: 'کتابخانه ویجت' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'بخش‌ها' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'ویژگی‌ها' })).toBeInTheDocument();
    expect(screen.getByTestId('dashboard-canvas')).toBeInTheDocument();
    expect(screen.getAllByTestId('designer-section')).toHaveLength(2);
    expect(screen.getAllByText('سامانه‌های حیاتی').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Metrics').length).toBeGreaterThan(0);
    expect(screen.getAllByRole('button', { name: 'افزودن بخش' }).length).toBeGreaterThan(0);
  });

  it('creates a section as a local draft', async () => {
    const user = userEvent.setup();

    renderWithProviders(
      <DashboardDesignerPage applicationId={1} layout={layout} components={components} />,
    );

    await user.click(screen.getByLabelText('افزودن بخش'));
    await user.type(screen.getByLabelText('عنوان بخش'), 'Errors');
    await user.click(screen.getByRole('button', { name: 'ایجاد بخش' }));

    expect(screen.getAllByText('Errors').length).toBeGreaterThan(0);
    expect(dashboardSectionsApi.createSection).not.toHaveBeenCalled();
  });

  it('adds a widget draft immediately to the canvas and opens properties', async () => {
    const user = userEvent.setup();

    renderWithProviders(
      <DashboardDesignerPage
        applicationId={1}
        layout={layout}
        components={components}
        applicationName="سمیح"
      />,
    );

    useDashboardStore.getState().setSelectedSectionId(1);
    await user.click(screen.getByRole('button', { name: 'کتابخانه ویجت' }));
    await user.click(screen.getByRole('button', { name: 'کارت وضعیت' }));

    expect(applicationDashboardApi.createWidget).not.toHaveBeenCalled();
    expect(screen.getByTestId('widget-properties-panel')).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /^عنوان/ })).toHaveValue('کارت وضعیت');
    expect(screen.getByText(/پیش‌نویس/)).toBeInTheDocument();
  });

  it('updates widget properties in the draft before save', async () => {
    const user = userEvent.setup();

    renderWithProviders(
      <DashboardDesignerPage
        applicationId={1}
        layout={layout}
        components={components}
        applicationName="سمیح"
      />,
    );

    useDashboardStore.getState().setSelectedSectionId(1);
    await user.click(screen.getByRole('button', { name: 'کتابخانه ویجت' }));
    await user.click(screen.getByRole('button', { name: 'نمودار' }));

    const titleInput = screen.getByRole('textbox', { name: /^عنوان/ });
    await user.clear(titleInput);
    await user.type(titleInput, 'Latency Chart');

    expect(titleInput).toHaveValue('Latency Chart');
    await user.click(screen.getByRole('button', { name: 'بستن ویژگی‌ها' }));
    expect(screen.getByRole('button', { name: 'ذخیره' })).toBeEnabled();
  });

  it('creates a widget in the selected section', async () => {
    vi.mocked(applicationDashboardApi.createWidget).mockResolvedValue(
      createStatusCardWidget({ id: 50, sectionId: 2, title: 'کارت وضعیت' }),
    );
    const user = userEvent.setup();

    renderWithProviders(
      <DashboardDesignerPage applicationId={1} layout={layout} components={components} />,
    );

    useDashboardStore.getState().setSelectedSectionId(2);
    await user.click(screen.getByRole('button', { name: 'کتابخانه ویجت' }));
    await user.click(screen.getByRole('button', { name: 'کارت وضعیت' }));
    await user.click(screen.getByRole('button', { name: 'بستن ویژگی‌ها' }));
    await user.click(screen.getByRole('button', { name: 'ذخیره' }));

    await waitFor(() => {
      expect(applicationDashboardApi.createWidget).toHaveBeenCalledWith(
        1,
        expect.objectContaining({ dashboardSectionId: 2 }),
      );
    });
  });

  it('does not save a MultiSeriesChart that has no metric identity', async () => {
    const user = userEvent.setup();

    renderWithProviders(
      <DashboardDesignerPage applicationId={1} layout={layout} components={components} />,
    );

    useDashboardStore.getState().setSelectedSectionId(2);
    await user.click(screen.getByRole('button', { name: 'کتابخانه ویجت' }));
    await user.click(screen.getByRole('button', { name: 'نمودار چند سری' }));
    await user.click(screen.getByRole('button', { name: 'بستن ویژگی‌ها' }));
    await user.click(screen.getByRole('button', { name: 'ذخیره' }));

    expect(applicationDashboardApi.createWidget).not.toHaveBeenCalled();
    expect(screen.getAllByText(/metricDefinitionId یا metricName/).length).toBeGreaterThan(0);
  });

  it('moves a widget between sections from the widget menu', async () => {
    vi.mocked(applicationDashboardApi.updateWidget).mockResolvedValue(
      createStatusCardWidget({ id: 1, sectionId: 2, title: 'API Health' }),
    );
    const user = userEvent.setup();

    renderWithProviders(
      <DashboardDesignerPage applicationId={1} layout={layout} components={components} />,
    );

    await user.click(screen.getByLabelText('عملیات ویجت API Health'));
    await user.click(screen.getByRole('menuitem', { name: 'انتقال به بخش' }));
    await user.click(screen.getByRole('menuitem', { name: 'Metrics' }));
    await user.click(screen.getByRole('button', { name: 'ذخیره' }));

    await waitFor(() => {
      expect(applicationDashboardApi.updateWidget).toHaveBeenCalledWith(
        1,
        1,
        expect.objectContaining({
          dashboardSectionId: 2,
        }),
      );
    });
  });

  it('deletes the selected widget with the Delete key', async () => {
    vi.mocked(applicationDashboardApi.deleteWidget).mockResolvedValue(undefined);
    const user = userEvent.setup();

    renderWithProviders(
      <DashboardDesignerPage applicationId={1} layout={layout} components={components} />,
    );

    await user.click(screen.getByTestId('widget-chrome-1'));
    await user.keyboard('{Delete}');
    expect(screen.getByText(/ویجت «API Health» از این داشبورد حذف شود/)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'حذف' }));

    await waitFor(() => {
      expect(applicationDashboardApi.deleteWidget).toHaveBeenCalledWith(1, 1);
    });
    expect(screen.queryByTestId('designer-widget-1')).not.toBeInTheDocument();
  });

  it('does not delete a widget with Delete while typing', async () => {
    const user = userEvent.setup();

    renderWithProviders(
      <DashboardDesignerPage applicationId={1} layout={layout} components={components} />,
    );

    await user.click(screen.getByTestId('widget-chrome-1'));
    await user.dblClick(screen.getByTestId('widget-chrome-1'));
    const titleInput = screen.getByRole('textbox', { name: /^عنوان/ });
    await user.click(titleInput);
    await user.keyboard('{Delete}');

    expect(screen.queryByText(/از این داشبورد حذف شود/)).not.toBeInTheDocument();
    expect(applicationDashboardApi.deleteWidget).not.toHaveBeenCalled();
  });

  it('deletes a section', async () => {
    vi.mocked(dashboardSectionsApi.deleteSection).mockResolvedValue(undefined);
    const user = userEvent.setup();

    renderWithProviders(
      <DashboardDesignerPage applicationId={1} layout={layout} components={components} />,
    );

    await user.click(screen.getByLabelText('حذف بخش Metrics'));
    expect(screen.getByText(/بخش «Metrics» و ویجت های داخل آن حذف شود/)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'حذف' }));

    await waitFor(() => {
      expect(dashboardSectionsApi.deleteSection).toHaveBeenCalledWith(10, 2);
    });
  });
});
