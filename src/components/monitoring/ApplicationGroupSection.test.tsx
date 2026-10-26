import { screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ApplicationGroupSection } from './ApplicationGroupSection';
import { renderWithProviders } from '@/test/testUtils';
import type { ApplicationListItem } from '@/types/applications';
import { ApplicationPriority } from '@/types/enums';

const applications: ApplicationListItem[] = [
  {
    id: 1,
    name: 'سامانه سمیح',
    code: 'SAMIH',
    isActive: true,
    priority: ApplicationPriority.Critical,
    status: 'UP',
    lastUpdate: '2026-01-01T10:00:00Z',
  },
  {
    id: 2,
    name: 'سامانه پرداخت',
    code: 'PAY',
    isActive: true,
    priority: ApplicationPriority.Critical,
    status: 'DOWN',
    lastUpdate: null,
  },
];

describe('ApplicationGroupSection', () => {
  it('renders the group title and application cards', () => {
    renderWithProviders(
      <ApplicationGroupSection
        title="سامانه های حیاتی"
        color="blue"
        applications={applications}
        onOpenApplication={vi.fn()}
      />,
    );

    expect(screen.getByText('سامانه های حیاتی')).toBeInTheDocument();
    expect(screen.getByText('سامانه سمیح')).toBeInTheDocument();
    expect(screen.getByText('سامانه پرداخت')).toBeInTheDocument();
  });
});
