import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from '@/app/App';
import { capturePortalToken } from '@/auth/capturePortalToken';
import { queryClient } from '@/app/queryClient';
import { portalApi } from '@/api/portalApi';
import { authApi } from '@/api/authApi';
import '@/styles/dashboardDesigner.css';

capturePortalToken();

// Prefetch user data
queryClient.prefetchQuery({
  queryKey: ['portal-current-user'],
  queryFn: () => portalApi.getCurrentUser(),
});

// Prefetch user role
queryClient.prefetchQuery({
  queryKey: ['user-role-simple'],
  queryFn: () => authApi.getUserRole(),
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
