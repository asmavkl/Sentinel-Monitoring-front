import { screen } from '@testing-library/react';
import { Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { portalApi } from '@/api/portalApi';
import { browserStorageTokenProvider } from '@/auth';
import { AdminDashboardDesignerRoute } from './AdminRoute';
import { createTestJwt, renderWithProviders } from '@/test/testUtils';

vi.mock('@/api/portalApi', () => ({
  portalApi: {
    getCurrentUser: vi.fn(),
  },
}));

function renderDesignerRoute() {
  return renderWithProviders(
    <Routes>
      <Route path="/applications/:applicationId/dashboard" element={<div>Dashboard view</div>} />
      <Route
        path="/applications/:applicationId/dashboard/designer"
        element={<AdminDashboardDesignerRoute />}
      >
        <Route index element={<div>Designer route</div>} />
      </Route>
    </Routes>,
    { route: '/applications/1/dashboard/designer' },
  );
}

describe('AdminDashboardDesignerRoute', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('allows any authenticated user to open the designer route', async () => {
    browserStorageTokenProvider.setToken(createTestJwt({ role: 'Viewer' }));
    vi.mocked(portalApi.getCurrentUser).mockResolvedValue({
      id: 2,
      userName: 'viewer',
      fullName: 'Viewer',
      email: null,
      mobile: null,
      avatar: null,
      roles: ['Viewer'],
      role: 'Viewer',
    });

    renderDesignerRoute();

    expect(await screen.findByText('Designer route')).toBeInTheDocument();
  });
});
