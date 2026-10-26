export const ROUTES = {
  applications: '/applications',
  dashboards: '/dashboards',
  applicationDashboard: '/applications/:applicationId/dashboard',
  applicationDashboardDesigner: '/applications/:applicationId/dashboard/designer',
  dashboard: '/dashboard/:applicationId',
  check: '/checks/:checkId',
  settings: '/settings',
  unauthorized: '/unauthorized',
  root: '/',
  monitoringApplications: '/monitoring/applications',
  monitoringApplicationDetails: '/monitoring/applications/:id',
  monitoringChecks: '/monitoring/checks',
  monitoringCredentials: '/monitoring/credentials',
  monitoringHealthQueries: '/monitoring/health-queries',
  monitoringServers: '/monitoring/servers',
  monitoringServerDetails: '/monitoring/servers/:id',
  monitoringServerDesigner: '/monitoring/servers/:id/designer',
} as const;

export function buildDashboardRoute(applicationId: number | string): string {
  return `/applications/${applicationId}/dashboard`;
}

export function buildDashboardDesignerRoute(applicationId: number | string): string {
  return `/applications/${applicationId}/dashboard/designer`;
}

export function buildCheckRoute(checkId: number | string): string {
  return `/checks/${checkId}`;
}

export function buildMonitoringApplicationRoute(applicationId: number | string): string {
  return `/monitoring/applications/${applicationId}`;
}

export function buildMonitoringServerRoute(serverId: number | string): string {
  return `/monitoring/servers/${serverId}`;
}

export function buildMonitoringServerDesignerRoute(serverId: number | string): string {
  return `/monitoring/servers/${serverId}/designer`;
}

export function isApplicationDashboardPath(pathname: string): boolean {
  return /^\/applications\/[^/]+\/dashboard(\/|$)/.test(pathname);
}
