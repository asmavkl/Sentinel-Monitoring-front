import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { KpiMetricWidget } from '@/components/widgets/KpiMetricWidget';
import { defaultWidgetLayout } from '@/test/widgetFixtures';

vi.mock('@/features/dashboard/hooks/useMetricQueries', () => ({
  useMetricDefinitions: () => ({
    isLoading: false,
    data: [{ id: 5, name: 'success_rate', displayName: 'Success Rate', isVisible: true }],
  }),
  useMetricDefinition: () => ({
    isLoading: false,
    data: { id: 5, name: 'success_rate', displayName: 'Success Rate' },
  }),
  useMetricLatest: () => ({
    isLoading: false,
    isError: false,
    data: { metricId: 5, value: 99.8, unit: '%' },
  }),
  useMetricAggregate: () => ({
    isLoading: false,
    isError: false,
    data: { metricId: 5, aggregation: 'Average', value: 99.5 },
  }),
  useMetricHistory: () => ({ isLoading: false, data: [] }),
}));

describe('KpiMetricWidget', () => {
  it('displays aggregate/latest metric value', () => {
    render(
      <KpiMetricWidget
        title="Success Rate"
        configuration={{
          metricId: 5,
          aggregation: 'Latest',
          timeRange: '24h',
          valueFormat: 'percent',
          variant: 'kpi',
        }}
        layout={defaultWidgetLayout}
        dataSources={[{ id: 1, checkId: 101, metricName: 'success_rate' }]}
      />,
    );

    expect(screen.getByTestId('kpi-metric-widget')).toBeInTheDocument();
    expect(screen.getByText('99.8%')).toBeInTheDocument();
    expect(screen.getByText('Success Rate')).toBeInTheDocument();
  });
});
