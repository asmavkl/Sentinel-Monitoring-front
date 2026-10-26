import { requestApiData, toApiError } from '@/api/apiUtils';
import { httpClient } from '@/api/httpClient';
import type { AlertIncidentDto, AlertPolicyDto, UpsertAlertPolicyRequest } from '@/types/alertPolicy';

const CHECKS_PATH = '/api/checks';
const SERVER_METRICS_PATH = '/api/monitored-servers/metrics';
const INCIDENTS_PATH = '/api/alert-incidents';

async function readOptionalPolicy(request: () => Promise<{ data: { success: boolean; data: AlertPolicyDto | null } }>) {
  try {
    return await requestApiData<AlertPolicyDto>(request);
  } catch (error) {
    if (toApiError(error).statusCode === 404) {
      return null;
    }

    throw error;
  }
}

export const alertPolicyApi = {
  getForCheck(checkId: number) {
    return readOptionalPolicy(() => httpClient.get(`${CHECKS_PATH}/${checkId}/alert-policy`));
  },

  saveForCheck(checkId: number, payload: UpsertAlertPolicyRequest) {
    return requestApiData<AlertPolicyDto>(() =>
      httpClient.put(`${CHECKS_PATH}/${checkId}/alert-policy`, payload),
    );
  },

  getForServerMetric(serverMetricDefinitionId: number) {
    return readOptionalPolicy(() =>
      httpClient.get(`${SERVER_METRICS_PATH}/${serverMetricDefinitionId}/alert-policy`),
    );
  },

  saveForServerMetric(serverMetricDefinitionId: number, payload: UpsertAlertPolicyRequest) {
    return requestApiData<AlertPolicyDto>(() =>
      httpClient.put(`${SERVER_METRICS_PATH}/${serverMetricDefinitionId}/alert-policy`, payload),
    );
  },

  getIncidents(policyId: number) {
    return requestApiData<AlertIncidentDto[]>(() =>
      httpClient.get(INCIDENTS_PATH, { params: { policyId } }),
    );
  },
};
