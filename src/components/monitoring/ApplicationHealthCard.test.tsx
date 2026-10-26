import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ApplicationHealthCard } from './ApplicationHealthCard';
import { healthStatusTheme } from '@/theme/healthStatusTheme';
import { renderWithProviders } from '@/test/testUtils';
import type { ApplicationListItem } from '@/types/applications';
import type { MonitoringStatus } from '@/utils/status';

function buildApplication(status: MonitoringStatus): ApplicationListItem {
  return {
    id: 10,
    name: 'سامانه آزمایشی',
    code: 'TEST',
    isActive: true,
    priority: 2,
    status,
    lastUpdate: '2026-01-01T10:00:00Z',
  };
}

describe('ApplicationHealthCard', () => {
  it('renders green status', () => {
    renderWithProviders(
      <ApplicationHealthCard application={buildApplication('UP')} onOpen={() => undefined} />,
    );

    expect(screen.getByTestId('application-status-block')).toHaveAttribute('data-status', 'UP');
    expect(screen.getByTestId('application-status-block')).toHaveStyle({
      backgroundColor: healthStatusTheme.UP.background,
    });
    expect(screen.getAllByText(/سالم/).length).toBeGreaterThan(0);
  });

  it('renders yellow status', () => {
    renderWithProviders(
      <ApplicationHealthCard application={buildApplication('WARNING')} onOpen={() => undefined} />,
    );

    expect(screen.getByTestId('application-status-block')).toHaveAttribute('data-status', 'WARNING');
    expect(screen.getByTestId('application-status-block')).toHaveStyle({
      backgroundColor: healthStatusTheme.WARNING.background,
    });
    expect(screen.getAllByText(/هشدار/).length).toBeGreaterThan(0);
  });

  it('renders red status', () => {
    renderWithProviders(
      <ApplicationHealthCard application={buildApplication('DOWN')} onOpen={() => undefined} />,
    );

    expect(screen.getByTestId('application-status-block')).toHaveAttribute('data-status', 'DOWN');
    expect(screen.getByTestId('application-status-block')).toHaveStyle({
      backgroundColor: healthStatusTheme.DOWN.background,
    });
    expect(screen.getAllByText(/قطع/).length).toBeGreaterThan(0);
  });

  it('opens the application dashboard', async () => {
    const onOpen = vi.fn();
    const user = userEvent.setup();

    renderWithProviders(
      <ApplicationHealthCard application={buildApplication('UP')} onOpen={onOpen} />,
    );

    await user.click(screen.getByRole('link', { name: 'سامانه آزمایشی' }));
    expect(onOpen).toHaveBeenCalledWith(10);
  });
});
