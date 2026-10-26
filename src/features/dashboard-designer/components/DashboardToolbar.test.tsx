import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { DashboardToolbar } from './DashboardToolbar';
import { renderWithProviders } from '@/test/testUtils';

describe('DashboardToolbar', () => {
  it('shows Edit Dashboard in view mode for admins', async () => {
    const onEdit = vi.fn();
    const user = userEvent.setup();

    renderWithProviders(
      <DashboardToolbar dashboardName="Operations" isEditMode={false} canEdit onEdit={onEdit} />,
    );

    expect(screen.getByRole('heading', { name: 'Operations' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'ویرایش داشبورد' }));
    expect(onEdit).toHaveBeenCalledOnce();
  });

  it('hides the edit button when the user cannot edit', () => {
    renderWithProviders(
      <DashboardToolbar dashboardName="Operations" isEditMode={false} canEdit={false} />,
    );

    expect(screen.queryByRole('button', { name: 'ویرایش داشبورد' })).not.toBeInTheDocument();
  });

  it('toggles to save and cancel in edit mode', async () => {
    const onSave = vi.fn();
    const onCancel = vi.fn();
    const user = userEvent.setup();

    renderWithProviders(
      <DashboardToolbar
        dashboardName="Operations"
        isEditMode
        canEdit
        isDirty
        onSave={onSave}
        onCancel={onCancel}
      />,
    );

    expect(screen.queryByRole('button', { name: 'ویرایش داشبورد' })).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'ذخیره' }));
    await user.click(screen.getByRole('button', { name: 'انصراف' }));

    expect(onSave).toHaveBeenCalledOnce();
    expect(onCancel).toHaveBeenCalledOnce();
  });

  it('renders refresh controls in view mode', () => {
    renderWithProviders(
      <DashboardToolbar
        dashboardName="Samih"
        isEditMode={false}
        showRefreshControls
        status="UP"
        lastUpdatedAt={new Date('2026-01-01T10:35:20').getTime()}
        onRefresh={() => undefined}
      />,
    );

    expect(screen.getByRole('heading', { name: 'Samih' })).toBeInTheDocument();
    expect(screen.getByText('سالم')).toBeInTheDocument();
    expect(screen.getByTestId('last-updated-label')).toHaveTextContent(/آخرین بروزرسانی:/);
    expect(screen.getByText('بروزرسانی خودکار: فعال')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'بروزرسانی داشبورد' })).toBeInTheDocument();
  });
});
