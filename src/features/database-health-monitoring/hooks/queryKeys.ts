export const databaseHealthMonitoringQueryKeys = {
  all: ['database-health-monitoring'] as const,
  provisionedChecks: (applicationId: number) =>
    [...databaseHealthMonitoringQueryKeys.all, 'provisioned-checks', applicationId] as const,
  availableQueries: (applicationId: number, credentialId: number) =>
    [...databaseHealthMonitoringQueryKeys.all, 'available-queries', applicationId, credentialId] as const,
};
