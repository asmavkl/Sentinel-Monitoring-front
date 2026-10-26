import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { DeleteWidgetDialog } from './DeleteWidgetDialog';
import { renderWithProviders } from '@/test/testUtils';

describe('DeleteWidgetDialog', () => {
  it('shows confirmation and confirms delete', async () => {
    const onConfirm = vi.fn();
    const onCancel = vi.fn();
    const user = userEvent.setup();

    renderWithProviders(
      <DeleteWidgetDialog
        open
        widgetTitle="API Health"
        onConfirm={onConfirm}
        onCancel={onCancel}
      />,
    );

    expect(screen.getByText(/ویجت «API Health» از این داشبورد حذف شود/)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'حذف' }));
    expect(onConfirm).toHaveBeenCalledOnce();
  });
});
