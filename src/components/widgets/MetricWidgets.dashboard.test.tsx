import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { WidgetRenderer } from '@/components/widgets/WidgetRenderer';
import { createChartWidget, defaultWidgetLayout } from '@/test/widgetFixtures';
import { getWidgetComponent } from '@/components/widgets/registry';
import { MetricChartWidget } from '@/components/widgets/MetricChartWidget';
import { KpiMetricWidget } from '@/components/widgets/KpiMetricWidget';
import { GaugeMetricWidget } from '@/components/widgets/GaugeMetricWidget';
import { NumberMetricWidget } from '@/components/widgets/NumberMetricWidget';

vi.mock('@/features/dashboard/hooks/useMetricQueries', () => ({
  useMetricDefinitions: () => ({
    isLoading: false,
    data: [{ id: 5, name: 'response_time', displayName: 'زمان پاسخ', isVisible: true }],
  }),
  useMetricDefinition: () => ({
    isLoading: false,
    data: { id: 5, name: 'response_time', displayName: 'زمان پاسخ' },
  }),
  useMetricHistory: () => ({
    isLoading: false,
    isError: false,
    data: [
      { timestamp: '2026-01-01T10:00:00Z', value: 120 },
      { timestamp: '2026-01-01T10:05:00Z', value: 140 },
    ],
  }),
  useMetricLatest: () => ({
    isLoading: false,
    isError: false,
    data: { metricId: 5, value: 42 },
  }),
  useMetricAggregate: () => ({ isLoading: false, isError: false, data: null }),
}));

vi.mock('echarts-for-react', () => ({
  default: () => <div>ECharts Mock</div>,
}));

describe('Dashboard metric widgets rendering', () => {
  it('registers metric widgets in WidgetRegistry', () => {
    expect(getWidgetComponent('Chart')).toBe(MetricChartWidget);
    expect(getWidgetComponent('KpiCard')).toBe(KpiMetricWidget);
    expect(getWidgetComponent('Gauge')).toBe(GaugeMetricWidget);
    expect(getWidgetComponent('NumberCard')).toBe(NumberMetricWidget);
  });

  it('renders metric chart widget from dashboard widget dto', () => {
    const widget = createChartWidget({
      configuration: {
        chartType: 'line',
        showLegend: true,
        timeRange: '24h',
        aggregation: 'Average',
        metricId: 5,
      },
      dataSources: [{ id: 2, checkId: 101, metricName: 'response_time' }],
      layout: defaultWidgetLayout,
    });

    render(<WidgetRenderer widget={widget} />);

    expect(screen.getByTestId('metric-chart-widget')).toBeInTheDocument();
    expect(screen.getByText('ECharts Mock')).toBeInTheDocument();
  });
});
