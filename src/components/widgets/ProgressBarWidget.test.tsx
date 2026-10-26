import { render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ProgressBarWidget } from '@/components/widgets/ProgressBarWidget';
import { defaultWidgetLayout } from '@/test/widgetFixtures';

vi.mock('@/features/dashboard/hooks/useCheckStatus', () => ({
  useCheckStatus: (checkId: number) => {
    if (checkId === 10) {
      return { isLoading: false, data: { name: 'دیسک D' } };
    }

    if (checkId === 11) {
      return { isLoading: false, data: { name: 'دیسک C' } };
    }

    return { isLoading: false, data: undefined };
  },
}));

vi.mock('@/features/dashboard/hooks/useMetricQueries', () => ({
  useMetricDefinitions: () => ({
    isLoading: false,
    data: [
      { id: 4, name: 'disk_d', displayName: 'درصد ظرفیت استفاده‌شده‌ی فایل‌سیستم (D:)' },
      { id: 5, name: 'disk_c', displayName: 'درصد ظرفیت استفاده‌شده‌ی فایل‌سیستم (C:)' },
    ],
  }),
  useMetricLatest: (_checkId: number, metricId: number) => {
    if (metricId === 4) {
      return {
        isLoading: false,
        isError: false,
        data: { value: 53.3, unit: '%', displayName: 'درصد ظرفیت استفاده‌شده‌ی فایل‌سیستم (D:)' },
      };
    }

    if (metricId === 5) {
      return {
        isLoading: false,
        isError: false,
        data: { value: 91, unit: '%', displayName: 'درصد ظرفیت استفاده‌شده‌ی فایل‌سیستم (C:)' },
      };
    }

    return { isLoading: false, isError: false, data: null };
  },
}));

describe('ProgressBarWidget', () => {
  it('renders one bar per metric data source with its own scale', () => {
    render(
      <ProgressBarWidget
        title="پارتیشن های سیستم عامل"
        configuration={{
          decimalPlaces: 1,
          bars: [
            { checkId: 10, metricDefinitionId: 4, min: 0, max: 100, warning: 70, critical: 90, unit: '%' },
            { checkId: 11, metricDefinitionId: 5, min: 0, max: 100, warning: 70, critical: 90, unit: '%' },
          ],
        }}
        layout={defaultWidgetLayout}
        dataSources={[
          { id: 1, checkId: 10, checkName: 'پایش دیسک D', metricDefinitionId: 4, metricName: 'disk_d', displayOrder: 0 },
          { id: 2, checkId: 11, checkName: 'پایش دیسک C', metricDefinitionId: 5, metricName: 'disk_c', displayOrder: 1 },
        ]}
      />,
    );

    const rows = screen.getAllByTestId('progress-bar-row');
    expect(rows).toHaveLength(2);
    expect(rows[0].firstElementChild).toHaveAttribute('data-testid', 'progress-bar-label');
    expect(rows[0].firstElementChild).toHaveStyle({ textAlign: 'left' });
    expect(rows[0]).toHaveTextContent('پایش دیسک D');
    expect(rows[0]).toHaveTextContent(
      new Intl.NumberFormat('fa-IR', { maximumFractionDigits: 1 }).format(53.3),
    );
    const bar = within(rows[0]).getByRole('progressbar');
    expect(Number.parseFloat(bar.style.width)).toBeCloseTo(53.3, 1);
    expect(bar.nextElementSibling).toBe(within(rows[0]).getByTestId('progress-bar-value'));
    expect(rows[1]).toHaveTextContent('پایش دیسک C');
    expect(screen.getByRole('progressbar', { name: 'پایش دیسک D' })).toHaveAttribute('aria-valuenow', '53');
    expect(screen.getByRole('progressbar', { name: 'پایش دیسک C' })).toHaveAttribute('aria-valuenow', '91');
  });

  it('uses the check status name when the data source has no check name', () => {
    render(
      <ProgressBarWidget
        title="پارتیشن ها"
        configuration={{ decimalPlaces: 0, bars: [] }}
        layout={defaultWidgetLayout}
        dataSources={[{ id: 1, checkId: 10, metricDefinitionId: 4, metricName: 'disk_d', displayOrder: 0 }]}
      />,
    );

    expect(screen.getByTestId('progress-bar-label')).toHaveTextContent('دیسک D');
    expect(screen.getByTestId('progress-bar-row').firstElementChild).toHaveAttribute('data-testid', 'progress-bar-label');
  });
});
