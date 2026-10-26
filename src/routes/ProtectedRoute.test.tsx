import { QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import type { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { portalApi } from '@/api/portalApi';
import { BrowserStorageTokenProvider } from '@/auth/browserStorageTokenProvider';
import { resetLoginRedirectState } from '@/auth/loginRedirect';
import { ThemeProvider } from '@/theme';
import { createTestQueryClient } from '@/test/testUtils';
import { ProtectedRoute } from './ProtectedRoute';

vi.mock('@/auth/loginRedirect', async () => {
  const actual = await vi.importActual<typeof import('@/auth/loginRedirect')>('@/auth/loginRedirect');
  return {
    ...actual,
    redirectToLogin: vi.fn(),
  };
});

vi.mock('@/api/portalApi', () => ({
  portalApi: {
    getCurrentUser: vi.fn(),
  },
}));

import { redirectToLogin } from '@/auth/loginRedirect';

function renderProtectedRoute(initialPath = '/applications') {
  const queryClient = createTestQueryClient();

  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>{children}</ThemeProvider>
      </QueryClientProvider>
    );
  }

  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route element={<ProtectedRoute />}>
          <Route path="/applications" element={<div>Protected content</div>} />
        </Route>
        <Route path="/unauthorized" element={<div>Unauthorized page</div>} />
      </Routes>
    </MemoryRouter>,
    { wrapper: Wrapper },
  );
}

describe('ProtectedRoute', () => {
  const tokenProvider = new BrowserStorageTokenProvider();

  beforeEach(() => {
    localStorage.clear();
    resetLoginRedirectState();
    vi.mocked(redirectToLogin).mockClear();
    vi.mocked(portalApi.getCurrentUser).mockReset();
  });

  afterEach(() => {
    localStorage.clear();
    resetLoginRedirectState();
    window.history.replaceState(null, '', '/');
  });

  it('renders protected content when GetCurrentUser succeeds', async () => {
    tokenProvider.setToken('valid-token');
    vi.mocked(portalApi.getCurrentUser).mockResolvedValue({
      id: 1,
      userName: 'mohammad',
      fullName: 'محمد حسینی',
      email: null,
      mobile: null,
      avatar: null,
      roles: ['Admin'],
      role: 'Admin',
    });

    renderProtectedRoute();

    expect(await screen.findByText('Protected content')).toBeInTheDocument();
    expect(redirectToLogin).not.toHaveBeenCalled();
  });

  it('stores a token from the URL and renders protected content', async () => {
    window.history.replaceState(null, '', '/applications?token=url-jwt');
    vi.mocked(portalApi.getCurrentUser).mockResolvedValue({
      id: 1,
      userName: 'mohammad',
      fullName: 'محمد حسینی',
      email: null,
      mobile: null,
      avatar: null,
      roles: ['Admin'],
      role: 'Admin',
    });

    renderProtectedRoute();

    expect(tokenProvider.getToken()).toBe('url-jwt');
    expect(await screen.findByText('Protected content')).toBeInTheDocument();
    expect(redirectToLogin).not.toHaveBeenCalled();
  });

  it('allows access when the portal cookie session is valid', async () => {
    vi.mocked(portalApi.getCurrentUser).mockResolvedValue({
      id: 1,
      userName: 'mohammad',
      fullName: 'محمد حسینی',
      email: null,
      mobile: null,
      avatar: null,
      roles: ['Admin'],
      role: 'Admin',
    });

    renderProtectedRoute();

    expect(await screen.findByText('Protected content')).toBeInTheDocument();
    expect(redirectToLogin).not.toHaveBeenCalled();
  });

  it('redirects to the portal when token is missing and the session check fails', async () => {
    vi.mocked(portalApi.getCurrentUser).mockRejectedValue(new Error('Unauthorized'));

    renderProtectedRoute();

    await waitFor(() => {
      expect(redirectToLogin).toHaveBeenCalledOnce();
      expect(screen.getByText('Unauthorized page')).toBeInTheDocument();
    });
    expect(screen.queryByText('Protected content')).not.toBeInTheDocument();
  });
});
