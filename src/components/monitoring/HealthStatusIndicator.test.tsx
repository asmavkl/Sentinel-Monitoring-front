import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { HealthStatusIndicator } from './HealthStatusIndicator';
import { ApplicationHealthStatus } from '@/types/enums';
import { renderWithProviders } from '@/test/testUtils';

describe('HealthStatusIndicator', () => {
  it('renders green status', () => {
    renderWithProviders(<HealthStatusIndicator status={ApplicationHealthStatus.Normal} />);

    const indicator = screen.getByTestId('application-status-block');
    expect(indicator).toHaveAttribute('data-status', String(ApplicationHealthStatus.Normal));
    expect(screen.getByText('وضعیت سلامت')).toBeInTheDocument();
  });

  it('renders yellow status', () => {
    renderWithProviders(<HealthStatusIndicator status={ApplicationHealthStatus.Warning} />);

    const indicator = screen.getByTestId('application-status-block');
    expect(indicator).toHaveAttribute('data-status', String(ApplicationHealthStatus.Warning));
  });

  it('renders red status', () => {
    renderWithProviders(<HealthStatusIndicator status={ApplicationHealthStatus.Critical} />);

    const indicator = screen.getByTestId('application-status-block');
    expect(indicator).toHaveAttribute('data-status', String(ApplicationHealthStatus.Critical));
  });
});
