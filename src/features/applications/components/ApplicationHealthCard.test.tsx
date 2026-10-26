import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ApplicationHealthCard } from './ApplicationHealthCard';
import { healthStatusTheme } from '@/theme/healthStatusTheme';
import { renderWithProviders } from '@/test/testUtils';
import type { ApplicationListItem } from '@/types/applications';
import type { MonitoringStatus } from '@/utils/status';

function buildApplication(
  status: MonitoringStatus,
  extra?: Partial<ApplicationListItem> & { responseTimeMs?: number },
): ApplicationListItem & { responseTimeMs?: number } {
  return {
    id: 10,
    name: 'سامانه آزمایشی',
    code: 'TEST',
    isActive: true,
    priority: 2,
    status,
    lastUpdate: '2026-01-01T10:00:00Z',
    ...extra,
  };
}

describe('ApplicationHealthCard', () => {
  it('renders green status', () => {
    renderWithProviders(
      <ApplicationHealthCard application={buildApplication('UP')} onOpen={() => undefined} />,
    );

    const block = screen.getByTestId('application-status-block');
    expect(block).toHaveAttribute('data-status', 'UP');
    expect(block).toHaveStyle({ backgroundColor: healthStatusTheme.UP.background });
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

  it('shows response time when available', () => {
    renderWithProviders(
      <ApplicationHealthCard
        application={buildApplication('UP', { responseTimeMs: 128 })}
        onOpen={() => undefined}
      />,
    );

    expect(screen.getByText('زمان پاسخ: 128 ms')).toBeInTheDocument();
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
