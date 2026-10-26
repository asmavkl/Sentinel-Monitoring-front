import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ApplicationStatusBlock } from './ApplicationStatusBlock';
import { ApplicationHealthStatus } from '@/types/enums';
import { renderWithProviders } from '@/test/testUtils';

describe('ApplicationStatusBlock', () => {
  it('renders green status', () => {
    renderWithProviders(<ApplicationStatusBlock status={ApplicationHealthStatus.Normal} />);

    const block = screen.getByTestId('application-status-block');
    expect(block).toHaveAttribute('data-status', String(ApplicationHealthStatus.Normal));
    expect(screen.getByText('وضعیت سلامت')).toBeInTheDocument();
    expect(screen.getByText(/سالم/)).toBeInTheDocument();
  });

  it('renders yellow status', () => {
    renderWithProviders(<ApplicationStatusBlock status={ApplicationHealthStatus.Warning} />);

    const block = screen.getByTestId('application-status-block');
    expect(block).toHaveAttribute('data-status', String(ApplicationHealthStatus.Warning));
    expect(screen.getByText(/هشدار/)).toBeInTheDocument();
  });

  it('renders red status', () => {
    renderWithProviders(<ApplicationStatusBlock status={ApplicationHealthStatus.Critical} />);

    const block = screen.getByTestId('application-status-block');
    expect(block).toHaveAttribute('data-status', String(ApplicationHealthStatus.Critical));
    expect(screen.getByText(/بحرانی/)).toBeInTheDocument();
  });
});
