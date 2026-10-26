import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { SectionList } from './SectionList';
import { renderWithProviders } from '@/test/testUtils';
import { createStatusCardWidget } from '@/test/widgetFixtures';

describe('SectionList', () => {
  it('renders sections and selects one', async () => {
    const onSelect = vi.fn();
    const onAddSection = vi.fn();
    const user = userEvent.setup();

    renderWithProviders(
      <SectionList
        sections={[
          {
            id: 1,
            title: 'سامانه‌های حیاتی',
            displayOrder: 0,
            isVisible: true,
            widgets: [createStatusCardWidget()],
          },
          {
            id: 2,
            title: 'Metrics',
            displayOrder: 1,
            isVisible: false,
            widgets: [],
          },
        ]}
        selectedSectionId={1}
        onSelect={onSelect}
        onAddSection={onAddSection}
      />,
    );

    expect(screen.getByText('سامانه‌های حیاتی')).toBeInTheDocument();
    expect(screen.getByText('Metrics')).toBeInTheDocument();
    await user.click(screen.getByText('Metrics'));
    expect(onSelect).toHaveBeenCalledWith(2);

    await user.click(screen.getByRole('button', { name: 'افزودن بخش' }));
    expect(onAddSection).toHaveBeenCalledOnce();
  });
});
