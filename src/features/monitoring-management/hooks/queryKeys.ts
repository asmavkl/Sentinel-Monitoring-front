export const monitoringManagementQueryKeys = {
  all: ['monitoring-management'] as const,
  applications: () => [...monitoringManagementQueryKeys.all, 'applications'] as const,
  application: (id: number) => [...monitoringManagementQueryKeys.all, 'application', id] as const,
  components: (applicationId: number) =>
    [...monitoringManagementQueryKeys.all, 'components', applicationId] as const,
};
