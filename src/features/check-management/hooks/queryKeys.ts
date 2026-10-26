export const checkManagementQueryKeys = {
  all: ['check-management'] as const,
  checks: (query?: { pageNumber: number; pageSize: number }) =>
    [...checkManagementQueryKeys.all, 'checks', query] as const,
  check: (id: number) => [...checkManagementQueryKeys.all, 'check', id] as const,
  checkDataset: (checkId: number, applicationId: number) =>
    [...checkManagementQueryKeys.all, 'dataset', checkId, applicationId] as const,
  applications: () => [...checkManagementQueryKeys.all, 'applications'] as const,
  components: (applicationId: number) =>
    [...checkManagementQueryKeys.all, 'components', applicationId] as const,
  credentials: () => [...checkManagementQueryKeys.all, 'credentials'] as const,
  criteria: (checkId: number) => [...checkManagementQueryKeys.all, 'criteria', checkId] as const,
};
