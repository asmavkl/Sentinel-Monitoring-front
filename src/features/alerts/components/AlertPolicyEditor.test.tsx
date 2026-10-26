import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { renderWithProviders } from '@/test/testUtils';
import { NotificationChannel } from '@/types/enums';
import { AlertPolicyEditor } from './AlertPolicyEditor';

describe('AlertPolicyEditor', () => {
  it('saves the entered recipient email', async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();

    renderWithProviders(<AlertPolicyEditor policy={null} isSaving={false} saveError={null} onSave={onSave} />);

    await user.click(screen.getByRole('button', { name: 'افزودن گیرنده' }));
    await user.type(screen.getByRole('textbox', { name: 'ایمیل گیرنده 1' }), 'ops@example.com');
    await user.click(screen.getByRole('button', { name: 'ذخیره اعلان' }));

    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({
        recipients: [{ channel: NotificationChannel.Email, address: 'ops@example.com', isActive: true }],
      }),
    );
  });
});
