import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { applicationsApi } from '@/api/applicationsApi';
import { portalApi } from '@/api/portalApi';
import { browserStorageTokenProvider } from '@/auth';
import { Header } from './Header';
import { createTestJwt, renderWithProviders } from '@/test/testUtils';
import { env } from '@/utils/env';

vi.mock('@/api/portalApi', () => ({
  portalApi: {
    getCurrentUser: vi.fn(),
  },
}));

vi.mock('@/api/applicationsApi', () => ({
  applicationsApi: {
    getApplications: vi.fn(),
    getApplicationStatus: vi.fn(),
  },
}));

describe('Header', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    browserStorageTokenProvider.setToken(createTestJwt({ role: 'Admin' }));
    vi.mocked(applicationsApi.getApplications).mockResolvedValue({
      items: [],
      totalCount: 0,
      pageNumber: 1,
      pageSize: 100,
      totalPages: 0,
    });
  });

  it('shows the current portal user name', async () => {
    vi.mocked(portalApi.getCurrentUser).mockResolvedValue({
      id: 12,
      userName: 'mohammad',
      fullName: 'محمد حسینی',
      email: null,
      mobile: null,
      avatar: null,
      roles: ['Admin'],
      role: 'Admin',
    });

    renderWithProviders(<Header />);

    await waitFor(() => {
      expect(screen.getByTestId('current-user-name')).toHaveTextContent('محمد حسینی');
    });
  });

  it('renders the monitoring header chrome', () => {
    vi.mocked(portalApi.getCurrentUser).mockResolvedValue({
      id: 12,
      userName: 'mohammad',
      fullName: 'محمد حسینی',
      email: null,
      mobile: null,
      avatar: null,
      roles: ['Admin'],
      role: 'Admin',
    });

    renderWithProviders(<Header />);

    expect(screen.getByTestId('monitoring-header')).toBeInTheDocument();
    expect(screen.getByText('Sentinel Monitoring')).toBeInTheDocument();
    expect(screen.getByTestId('monitoring-summary-bar')).toBeInTheDocument();
  });

  it('opens a profile panel from GetCurrentUser, including the avatar', async () => {
    const user = userEvent.setup();
    vi.mocked(portalApi.getCurrentUser).mockResolvedValue({
      id: 12,
      userName: 'mohammad',
      fullName: 'محمد حسینی',
      email: 'mohammad@gio24.ir',
      mobile: '09120000000',
      avatar: 'abc123',
      roles: ['Admin'],
      role: 'Admin',
    });

    renderWithProviders(<Header />);

    await user.click(await screen.findByRole('button', { name: 'پروفایل کاربر' }));

    expect(screen.getByTestId('user-profile-panel')).toBeInTheDocument();
    expect(screen.getByText('mohammad@gio24.ir')).toBeInTheDocument();
    expect(screen.getByText('09120000000')).toBeInTheDocument();
    expect(screen.getByText('Admin')).toBeInTheDocument();
    expect(screen.getAllByRole('img', { name: 'محمد حسینی' })[0]).toHaveAttribute(
      'src',
      'data:image/jpeg;base64,abc123',
    );
    expect(screen.getByRole('link', { name: 'بازگشت به درگاه' })).toHaveAttribute(
      'href',
      env.portalUrl,
    );

    await user.click(screen.getByRole('button', { name: 'خروج از حساب' }));
    expect(screen.getByText('آیا از حساب کاربری خود می‌خواهید خارج شوید؟')).toBeInTheDocument();
  });
});
