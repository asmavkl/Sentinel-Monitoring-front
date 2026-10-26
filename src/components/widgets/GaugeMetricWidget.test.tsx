import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { GaugeMetricWidget } from '@/components/widgets/GaugeMetricWidget';
import { defaultWidgetLayout } from '@/test/widgetFixtures';

vi.mock('@/features/dashboard/hooks/useMetricQueries', () => ({
  useMetricDefinitions: () => ({
    isLoading: false,
    data: [{ id: 7, name: 'availability', displayName: 'Availability', isVisible: true }],
  }),
  useMetricDefinition: () => ({
    isLoading: false,
    data: { id: 7, name: 'availability', displayName: 'Availability' },
  }),
  useMetricLatest: () => ({
    isLoading: false,
    isError: false,
    data: { metricId: 7, value: 99.9 },
  }),
  useMetricAggregate: () => ({ isLoading: false, isError: false, data: null }),
  useMetricHistory: () => ({ isLoading: false, data: [] }),
}));

vi.mock('echarts-for-react', () => ({
  default: () => <div>Gauge Chart Mock</div>,
}));

describe('GaugeMetricWidget', () => {
  it('displays percentage metric value', () => {
    render(
      <GaugeMetricWidget
        title="Availability"
        configuration={{ metricId: 7, aggregation: 'Latest', timeRange: '24h', variant: 'gauge' }}
        layout={defaultWidgetLayout}
        dataSources={[{ id: 1, checkId: 101, metricName: 'availability' }]}
      />,
    );

    expect(screen.getByTestId('gauge-metric-widget')).toBeInTheDocument();
    expect(screen.getByText('99.9%')).toBeInTheDocument();
    expect(screen.getByText('Gauge Chart Mock')).toBeInTheDocument();
  });
});
