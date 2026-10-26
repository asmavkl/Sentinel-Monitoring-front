import { Navigate, Outlet } from 'react-router-dom';
import { redirectToLogin } from '@/auth/loginRedirect';
import { Loading } from '@/components/common';
import { usePortalSession } from '@/features/auth/hooks/usePortalSession';
import { ROUTES } from './paths';

export function ProtectedRoute() {
  const session = usePortalSession();

  if (session === 'loading') {
    return <Loading message="در حال بررسی هویت" fullHeight />;
  }

  if (session === 'authenticated') {
    return <Outlet />;
  }

  redirectToLogin();
  return <Navigate to={ROUTES.unauthorized} replace />;
}

export function RootRedirect() {
  const session = usePortalSession();

  if (session === 'loading') {
    return <Loading message="در حال بررسی هویت" fullHeight />;
  }

  if (session === 'authenticated') {
    return <Navigate to={ROUTES.applications} replace />;
  }

  redirectToLogin();
  return <Navigate to={ROUTES.unauthorized} replace />;
}
