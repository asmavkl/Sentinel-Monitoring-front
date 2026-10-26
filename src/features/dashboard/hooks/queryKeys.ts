export const dashboardQueryKeys = {
  all: ['dashboard'] as const,
  overview: (applicationId: number) => ['application-overview', applicationId] as const,
  components: (applicationId: number) => ['application-components', applicationId] as const,
  componentDetails: (componentId: number) => ['component-details', componentId] as const,
  checkStatus: (checkId: number) => ['check-status', checkId] as const,
  checkMetrics: (checkId: number) => ['check-metrics', checkId] as const,
  metricDefinitions: (checkId: number) => ['check-metric-definitions', checkId] as const,
  metricDefinition: (checkId: number, metricId: number) =>
    ['check-metric-definition', checkId, metricId] as const,
  metricLatest: (checkId: number, metricId: number) =>
    ['check-metric-latest', checkId, metricId] as const,
  metricHistory: (
    checkId: number,
    metricId: number,
    query: { from?: string; to?: string; take?: number; metricIds?: number[] } = {},
  ) => ['check-metric-history', checkId, metricId, query] as const,
  metricAggregate: (
    checkId: number,
    metricId: number,
    query: { aggregation: string; from?: string; to?: string } = { aggregation: 'Average' },
  ) => ['check-metric-aggregate', checkId, metricId, query] as const,
  checkHistory: (checkId: number, pageNumber = 1) =>
    ['check-history', checkId, pageNumber] as const,
  datasetLatest: (checkId: number, applicationId: number) => ['dataset-latest', checkId, applicationId] as const,
  datasetHistory: (
    checkId: number,
    applicationId: number,
    query: { from?: string; to?: string; take?: number } = {},
  ) => ['dataset-history', checkId, applicationId, query] as const,
  dashboard: (applicationId: number) => ['application-dashboard', applicationId] as const,
  serverDashboard: (serverId: number) => ['server-dashboard', serverId] as const,
  layout: (applicationId: number) => ['dashboard-layout', applicationId] as const,
  sections: (dashboardId: number) => ['dashboard-sections', dashboardId] as const,
  widget: (widgetId: number) => ['dashboard-widget', widgetId] as const,
  applicationChecks: (applicationId: number) => ['application-checks', applicationId] as const,
};

export const MONITORING_REFETCH_INTERVAL = 300_000;
