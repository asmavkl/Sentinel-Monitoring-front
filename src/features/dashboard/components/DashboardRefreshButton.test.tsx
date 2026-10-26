import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { DashboardRefreshButton } from './DashboardRefreshButton';
import { renderWithProviders } from '@/test/testUtils';

describe('DashboardRefreshButton', () => {
  it('triggers refresh on click', async () => {
    const onRefresh = vi.fn();
    const user = userEvent.setup();

    renderWithProviders(<DashboardRefreshButton onRefresh={onRefresh} />);

    await user.click(screen.getByRole('button', { name: 'بروزرسانی داشبورد' }));
    expect(onRefresh).toHaveBeenCalledOnce();
  });

  it('shows a loading state while refreshing', () => {
    renderWithProviders(<DashboardRefreshButton onRefresh={() => undefined} loading />);

    expect(screen.getByRole('button', { name: 'بروزرسانی داشبورد' })).toBeDisabled();
  });
});
