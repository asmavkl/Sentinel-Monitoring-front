import { Navigate, Route, Routes, useParams } from 'react-router-dom';
import { CheckDetailPage } from '@/features/checks/pages/CheckDetailPage';
import { ApplicationsOverviewPage } from '@/features/applications/pages/ApplicationsOverviewPage';
import { ApplicationDashboardPage } from '@/features/dashboard/pages/ApplicationDashboardPage';
import { ApplicationDashboardDesignerPage } from '@/features/dashboard-designer/pages/ApplicationDashboardDesignerPage';
import { ApplicationDetailsPage } from '@/features/monitoring-management/pages/ApplicationDetailsPage';
import { MonitoringApplicationsPage } from '@/features/monitoring-management/pages/MonitoringApplicationsPage';
import { MonitoringChecksPage } from '@/features/check-management/pages/MonitoringChecksPage';
import { DatabaseCredentialsPage } from '@/features/database-credentials/pages/DatabaseCredentialsPage';
import { DatabaseHealthQueriesPage } from '@/features/database-health-queries/pages/DatabaseHealthQueriesPage';
import { ServerDashboardDesignerPage } from '@/features/dashboard-designer/pages/ServerDashboardDesignerPage';
import { MonitoredServerDetailPage } from '@/features/server-monitoring/pages/MonitoredServerDetailPage';
import { MonitoredServersPage } from '@/features/server-monitoring/pages/MonitoredServersPage';
import { SettingsPage } from '@/features/settings/pages/SettingsPage';
import { UnauthorizedPage } from '@/features/auth/pages/UnauthorizedPage';
import { MainLayout } from '@/layouts/MainLayout';
import { AdminDashboardDesignerRoute } from './AdminRoute';
import { ProtectedRoute, RootRedirect } from './ProtectedRoute';
import { buildDashboardRoute, ROUTES } from './paths';

function LegacyDashboardRedirect() {
  const { applicationId } = useParams<{ applicationId: string }>();
  return <Navigate to={buildDashboardRoute(applicationId ?? '')} replace />;
}

export function AppRoutes() {
  return (
    <Routes>
      <Route path={ROUTES.root} element={<RootRedirect />} />
      <Route path={ROUTES.unauthorized} element={<UnauthorizedPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          <Route path={ROUTES.applications} element={<ApplicationsOverviewPage />} />
          <Route path={ROUTES.dashboards} element={<ApplicationsOverviewPage />} />
          <Route path={ROUTES.applicationDashboard} element={<ApplicationDashboardPage />} />
          <Route path={ROUTES.applicationDashboardDesigner} element={<AdminDashboardDesignerRoute />}>
            <Route index element={<ApplicationDashboardDesignerPage />} />
          </Route>
          <Route path={ROUTES.dashboard} element={<LegacyDashboardRedirect />} />
          <Route path={ROUTES.check} element={<CheckDetailPage />} />
          <Route path={ROUTES.monitoringApplications} element={<MonitoringApplicationsPage />} />
          <Route path={ROUTES.monitoringApplicationDetails} element={<ApplicationDetailsPage />} />
          <Route path={ROUTES.monitoringChecks} element={<MonitoringChecksPage />} />
          <Route path={ROUTES.monitoringCredentials} element={<DatabaseCredentialsPage />} />
          <Route path={ROUTES.monitoringHealthQueries} element={<DatabaseHealthQueriesPage />} />
          <Route path={ROUTES.monitoringServers} element={<MonitoredServersPage />} />
          <Route path={ROUTES.monitoringServerDetails} element={<MonitoredServerDetailPage />} />
          <Route path={ROUTES.monitoringServerDesigner} element={<AdminDashboardDesignerRoute />}>
            <Route index element={<ServerDashboardDesignerPage />} />
          </Route>
          <Route path={ROUTES.settings} element={<SettingsPage />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to={ROUTES.root} replace />} />
    </Routes>
  );
}
