import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ApplicationsWall } from './ApplicationsWall';
import { renderWithProviders } from '@/test/testUtils';
import type { ApplicationListItem } from '@/types/applications';
import { ApplicationPriority } from '@/types/enums';

const applications: ApplicationListItem[] = [
  {
    id: 1,
    name: 'Samih',
    code: 'SAMIH',
    isActive: true,
    priority: ApplicationPriority.Critical,
    status: 'UP',
    lastUpdate: '2026-01-01T10:00:00Z',
  },
  {
    id: 2,
    name: 'ERP',
    code: 'ERP-MAIN',
    isActive: true,
    priority: ApplicationPriority.Important,
    status: 'DOWN',
    lastUpdate: '2026-01-01T10:00:00Z',
  },
  {
    id: 3,
    name: 'Reports',
    code: 'RPT',
    isActive: true,
    priority: ApplicationPriority.Low,
    status: 'UNKNOWN',
    lastUpdate: null,
  },
];

describe('ApplicationsWall', () => {
  it('renders grouped monitoring cards', () => {
    renderWithProviders(
      <ApplicationsWall applications={applications} onOpenApplication={vi.fn()} />,
    );

    expect(screen.getByText('سامانه های حیاتی')).toBeInTheDocument();
    expect(screen.getByText('سامانه های مهم')).toBeInTheDocument();
    expect(screen.getByText('سامانه های کم اهمیت')).toBeInTheDocument();
    expect(screen.getByText('Samih')).toBeInTheDocument();
    expect(screen.getByText('ERP')).toBeInTheDocument();
    expect(screen.getByText('Reports')).toBeInTheDocument();
  });

  it('opens an application from a group card', async () => {
    const user = userEvent.setup();
    const onOpenApplication = vi.fn();

    renderWithProviders(
      <ApplicationsWall applications={applications} onOpenApplication={onOpenApplication} />,
    );

    await user.click(screen.getByRole('link', { name: 'Samih' }));
    expect(onOpenApplication).toHaveBeenCalledWith(1);
  });
});
