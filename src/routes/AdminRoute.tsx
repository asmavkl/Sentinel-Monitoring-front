import { Outlet } from 'react-router-dom';

/** Designer is available to any authenticated user (ProtectedRoute already gates login). */
export function AdminDashboardDesignerRoute() {
  return <Outlet />;
}
