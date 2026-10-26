import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { CreateSectionDialog } from './CreateSectionDialog';
import { renderWithProviders } from '@/test/testUtils';

describe('CreateSectionDialog', () => {
  it('submits a new section with title, color, and display order', async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();

    renderWithProviders(
      <CreateSectionDialog open defaultDisplayOrder={3} onClose={() => undefined} onSubmit={onSubmit} />,
    );

    await user.type(screen.getByLabelText('عنوان بخش'), 'سامانه‌های حیاتی');
    await user.click(screen.getByLabelText('رنگ بخش'));
    await user.click(screen.getByRole('option', { name: 'بنفش' }));
    await user.click(screen.getByRole('button', { name: 'ایجاد بخش' }));

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'سامانه‌های حیاتی',
        color: 'purple',
        displayOrder: 3,
        isVisible: true,
      }),
    );
  });

  it('requires a section title', async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();

    renderWithProviders(
      <CreateSectionDialog open onClose={() => undefined} onSubmit={onSubmit} />,
    );

    await user.click(screen.getByRole('button', { name: 'ایجاد بخش' }));
    expect(screen.getByText('عنوان بخش الزامی است')).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });
});
