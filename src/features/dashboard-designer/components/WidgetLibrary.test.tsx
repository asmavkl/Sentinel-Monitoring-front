import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { WidgetLibrary } from './WidgetLibrary';
import { renderWithProviders } from '@/test/testUtils';
import { WIDGET_TYPE_LABELS, WIDGET_TYPES } from '@/types/widgets';

describe('WidgetLibrary', () => {
  it('renders registered widget types', async () => {
    const onSelect = vi.fn();
    const user = userEvent.setup();

    renderWithProviders(<WidgetLibrary onSelect={onSelect} />);

    expect(screen.getByText('کتابخانه ویجت')).toBeInTheDocument();

    for (const widgetType of WIDGET_TYPES) {
      expect(
        screen.getByRole('button', { name: WIDGET_TYPE_LABELS[widgetType] }),
      ).toBeInTheDocument();
    }

    await user.click(screen.getByRole('button', { name: 'کارت وضعیت' }));
    expect(onSelect).toHaveBeenCalledWith('StatusCard');
  });
});
