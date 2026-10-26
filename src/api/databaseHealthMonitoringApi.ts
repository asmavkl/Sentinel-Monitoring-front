import { httpClient } from '@/api/httpClient';
import { requestApiData } from '@/api/apiUtils';
import type {
  AddDatabaseHealthMonitoringRequest,
  AvailableHealthQueryDto,
  ProvisionDatabaseHealthMonitoringRequest,
  ProvisionedCheckDto,
  ProvisioningResultDto,
} from '@/types/databaseHealthMonitoring';

const HEALTH_MONITORING_PATH = '/api/applications';

export const databaseHealthMonitoringApi = {
  provisionDatabaseHealthMonitoring(applicationId: number, payload: ProvisionDatabaseHealthMonitoringRequest) {
    return requestApiData<ProvisioningResultDto>(() =>
      httpClient.post(`${HEALTH_MONITORING_PATH}/${applicationId}/database-health-monitoring/provision`, payload),
    );
  },

  addDatabaseHealthMonitoring(applicationId: number, payload: AddDatabaseHealthMonitoringRequest) {
    return requestApiData<ProvisioningResultDto>(() =>
      httpClient.post(`${HEALTH_MONITORING_PATH}/${applicationId}/database-health-monitoring/add`, payload),
    );
  },

  getAvailableHealthQueries(applicationId: number, databaseCredentialId: number) {
    return requestApiData<AvailableHealthQueryDto[]>(() =>
      httpClient.get(`${HEALTH_MONITORING_PATH}/${applicationId}/database-health-monitoring/available-queries`, {
        params: { databaseCredentialId },
      }),
    );
  },

  getProvisionedChecks(applicationId: number) {
    return requestApiData<ProvisionedCheckDto[]>(() =>
      httpClient.get(`${HEALTH_MONITORING_PATH}/${applicationId}/database-health-monitoring/provisioned-checks`),
    );
  },
};
