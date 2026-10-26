import { screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { WidgetRenderer } from '@/components/widgets/WidgetRenderer';
import { createChartWidget, createStatusCardWidget } from '@/test/widgetFixtures';
import { renderWithProviders } from '@/test/testUtils';

vi.mock('@/components/widgets/MetricChartWidget', () => ({
  MetricChartWidget: ({ title }: { title: string }) => <div>{title} Chart Mock</div>,
}));

vi.mock('@/features/dashboard/hooks/useCheckStatus', () => ({
  useCheckStatus: () => ({
    data: undefined,
    isLoading: false,
    isError: false,
    dataUpdatedAt: 0,
  }),
}));

describe('WidgetRenderer', () => {
  it('renders using string widgetType', () => {
    renderWithProviders(<WidgetRenderer widget={createStatusCardWidget()} />);

    expect(screen.getByText('API Health')).toBeInTheDocument();
    expect(screen.getByText('120 ms')).toBeInTheDocument();
    expect(screen.getByText('سالم')).toBeInTheDocument();
  });

  it('renders chart widget type', () => {
    renderWithProviders(<WidgetRenderer widget={createChartWidget()} />);
    expect(screen.getByText('Response Time Chart Mock')).toBeInTheDocument();
  });

  it('renders fallback for unknown widget type', () => {
    renderWithProviders(
      <WidgetRenderer
        widget={{
          ...createStatusCardWidget(),
          widgetType: 'UnknownWidget' as 'StatusCard',
        }}
      />,
    );

    expect(screen.getByText('نوع این ویجت پشتیبانی نمی شود.')).toBeInTheDocument();
  });
});
