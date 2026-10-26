import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { MetricChartWidget } from '@/components/widgets/MetricChartWidget';
import { defaultWidgetLayout } from '@/test/widgetFixtures';

const mockUseMetricDefinitions = vi.fn();
const mockUseMetricDefinition = vi.fn();
const mockUseMetricHistory = vi.fn();

vi.mock('@/features/dashboard/hooks/useMetricQueries', () => ({
  useMetricDefinitions: (checkId: number) => mockUseMetricDefinitions(checkId),
  useMetricDefinition: (checkId: number, metricId: number) =>
    mockUseMetricDefinition(checkId, metricId),
  useMetricHistory: (checkId: number, metricId: number, query: unknown) =>
    mockUseMetricHistory(checkId, metricId, query),
  useMetricLatest: () => ({ isLoading: false, isError: false, data: null }),
  useMetricAggregate: () => ({ isLoading: false, isError: false, data: null }),
}));

vi.mock('echarts-for-react', () => ({
  default: () => <div>ECharts Mock</div>,
}));

describe('MetricChartWidget', () => {
  beforeEach(() => {
    mockUseMetricDefinitions.mockReturnValue({
      isLoading: false,
      data: [
        {
          id: 5,
          checkDefinitionId: 101,
          name: 'response_time',
          displayName: 'زمان پاسخ',
          metricType: 'Duration',
          aggregationType: 'Average',
          isVisible: true,
          createdDate: '2026-01-01T00:00:00Z',
        },
      ],
    });
    mockUseMetricDefinition.mockReturnValue({
      isLoading: false,
      data: {
        id: 5,
        displayName: 'زمان پاسخ',
        name: 'response_time',
      },
    });
  });

  it('loads metric history for the chart series', () => {
    mockUseMetricHistory.mockReturnValue({
      isLoading: false,
      isError: false,
      data: [
        { timestamp: '2026-01-01T10:00:00Z', value: 120 },
        { timestamp: '2026-01-01T10:05:00Z', value: 140 },
      ],
    });

    render(
      <MetricChartWidget
        title="Response Time"
        configuration={{ chartType: 'line', showLegend: true, timeRange: '1h', metricId: 5 }}
        layout={defaultWidgetLayout}
        dataSources={[{ id: 1, checkId: 101, metricName: 'response_time' }]}
      />,
    );

    expect(mockUseMetricHistory).toHaveBeenCalledWith(101, 5, expect.any(Object));
    expect(screen.getByText(/متریک: زمان پاسخ/)).toBeInTheDocument();
    expect(screen.getByText('ECharts Mock')).toBeInTheDocument();
  });

  it('shows empty state when no metric points exist', () => {
    mockUseMetricHistory.mockReturnValue({
      isLoading: false,
      isError: false,
      data: [],
    });

    render(
      <MetricChartWidget
        title="Response Time"
        configuration={{ metricId: 5, timeRange: '24h' }}
        layout={defaultWidgetLayout}
        dataSources={[{ id: 1, checkId: 101, metricName: 'response_time' }]}
      />,
    );

    expect(screen.getByText('برای این ویجت داده‌ای ثبت نشده است')).toBeInTheDocument();
  });
});
