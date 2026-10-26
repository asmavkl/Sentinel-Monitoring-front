import { describe, expect, it } from 'vitest';
import { LastUpdatedLabel } from './LastUpdatedLabel';
import { formatLastUpdated } from '../utils/formatLastUpdated';
import { renderWithProviders } from '@/test/testUtils';
import { screen } from '@testing-library/react';

describe('LastUpdatedLabel', () => {
  it('renders the last successful update time', () => {
    const updatedAt = new Date('2026-01-01T10:35:20');

    renderWithProviders(<LastUpdatedLabel updatedAt={updatedAt} />);

    expect(screen.getByTestId('last-updated-label').textContent).toContain('آخرین بروزرسانی:');
    expect(screen.getByTestId('last-updated-label').textContent).toContain(
      formatLastUpdated(updatedAt),
    );
  });

  it('does not invent a time when refresh has not succeeded', () => {
    renderWithProviders(<LastUpdatedLabel updatedAt={null} />);

    expect(screen.getByTestId('last-updated-label')).toHaveTextContent('آخرین بروزرسانی: —');
  });
});
