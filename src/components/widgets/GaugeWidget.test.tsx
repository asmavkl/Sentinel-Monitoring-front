import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { GaugeWidget } from '@/components/widgets/GaugeWidget';
import { defaultWidgetLayout } from '@/test/widgetFixtures';

const queries = vi.hoisted(() => ({
  latest: {
    isLoading: false,
    isError: false,
    error: null as unknown,
    data: { value: 42, unit: 'ms', displayName: 'زمان پاسخ' } as { value: number; unit?: string; displayName?: string } | null,
  },
  status: {
    isLoading: false,
    isError: false,
    data: { lastDurationMs: 2092 } as { lastDurationMs?: number | null } | undefined,
  },
}));

vi.mock('@/features/dashboard/hooks/useMetricQueries', () => ({
  useMetricDefinitions: () => ({
    isLoading: false,
    data: [{ id: 84, name: 'response_time', displayName: 'زمان پاسخ', isVisible: true }],
  }),
  useMetricLatest: () => queries.latest,
  useMetricAggregate: () => ({ isLoading: false, isError: false, data: null }),
  useMetricHistory: () => ({ isLoading: false, data: [] }),
}));

vi.mock('@/features/dashboard/hooks/useCheckStatus', () => ({
  useCheckStatus: () => queries.status,
}));

vi.mock('@/components/charts', () => ({
  GaugeChart: ({ value, unit }: { value: number; unit?: string }) => (
    <div data-testid="gauge-chart">
      {value}
      {unit ? ` ${unit}` : ''}
    </div>
  ),
}));

describe('GaugeWidget', () => {
  it('shows the metric value when the saved data source only has metricId', () => {
    queries.latest = {
      isLoading: false,
      isError: false,
      error: null,
      data: { value: 42, unit: 'ms', displayName: 'زمان پاسخ' },
    };

    render(
      <GaugeWidget
        title="گیج پاسخ"
        configuration={{ min: 0, max: 5000, decimalPlaces: 0 }}
        layout={defaultWidgetLayout}
        dataSources={[{ id: 1, checkId: 39, metricId: 84, metricName: 'response_time' }]}
      />,
    );

    expect(screen.getByTestId('gauge-chart')).toHaveTextContent('42 ms');
  });

  it('falls back to check status duration when response time has no metric sample', () => {
    queries.latest = {
      isLoading: false,
      isError: false,
      error: null,
      data: null,
    };
    queries.status = {
      isLoading: false,
      isError: false,
      data: { lastDurationMs: 2092 },
    };

    render(
      <GaugeWidget
        title="سلامت متد"
        configuration={{ min: 0, max: 5000, decimalPlaces: 0 }}
        layout={defaultWidgetLayout}
        dataSources={[{ id: 1, checkId: 39, metricId: 84, metricName: 'response_time' }]}
      />,
    );

    expect(screen.getByTestId('gauge-chart')).toHaveTextContent('2092 ms');
  });
});
