import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { MonitoringSummaryBar } from './MonitoringSummaryBar';
import { renderWithProviders } from '@/test/testUtils';

describe('MonitoringSummaryBar', () => {
  it('renders overall application health counts', () => {
    renderWithProviders(
      <MonitoringSummaryBar title="وضعیت کلی سامانه ها" up={20} warning={3} down={1} outOfService={2} />,
    );

    expect(screen.getByTestId('monitoring-summary-bar')).toBeInTheDocument();
    expect(screen.getByText('وضعیت کلی سامانه ها')).toBeInTheDocument();
    expect(screen.getByText('هشدار: 3')).toBeInTheDocument();
    expect(screen.getByText('بحرانی: 1')).toBeInTheDocument();
    expect(screen.getByText('خارج از سرویس: 2')).toBeInTheDocument();
  });

  it('renders compact header labels', () => {
    renderWithProviders(<MonitoringSummaryBar compact up={24} warning={2} down={1} outOfService={4} />);

    expect(screen.getByText('سالم: 24')).toBeInTheDocument();
    expect(screen.getByText('هشدار: 2')).toBeInTheDocument();
    expect(screen.getByText('بحرانی: 1')).toBeInTheDocument();
    expect(screen.getByText('خارج از سرویس: 4')).toBeInTheDocument();
  });
});
