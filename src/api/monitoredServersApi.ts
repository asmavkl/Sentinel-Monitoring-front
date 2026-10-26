import { httpClient } from '@/api/httpClient';
import { requestApiData, toApiError } from '@/api/apiUtils';
import type {
  CreateMonitoredServerRequest,
  MonitoredServerDto,
  MonitoredServerStatusDto,
  ServerMetricCriteriaDto,
  ServerMetricDefinitionDto,
  ServerMetricHistoryPointDto,
  UpdateMonitoredServerRequest,
  UpdateServerMetricCriteriaRequest,
} from '@/types/monitoredServers';

const SERVERS_PATH = '/api/monitored-servers';
const CRITERIA_NOT_FOUND_MESSAGE = 'Criteria definition not found.';
export const DEFAULT_METRIC_HISTORY_LIMIT = 100;

export const monitoredServersApi = {
  getMonitoredServers() {
    return requestApiData<MonitoredServerDto[]>(() => httpClient.get(SERVERS_PATH));
  },

  getMonitoredServer(id: number) {
    return requestApiData<MonitoredServerDto>(() => httpClient.get(`${SERVERS_PATH}/${id}`));
  },

  createMonitoredServer(payload: CreateMonitoredServerRequest) {
    return requestApiData<MonitoredServerDto>(() => httpClient.post(SERVERS_PATH, payload));
  },

  updateMonitoredServer(id: number, payload: UpdateMonitoredServerRequest) {
    return requestApiData<MonitoredServerDto>(() => httpClient.put(`${SERVERS_PATH}/${id}`, payload));
  },

  activateMonitoredServer(id: number) {
    return requestApiData<MonitoredServerDto>(() => httpClient.put(`${SERVERS_PATH}/${id}/activate`));
  },

  deactivateMonitoredServer(id: number) {
    return requestApiData<MonitoredServerDto>(() =>
      httpClient.put(`${SERVERS_PATH}/${id}/deactivate`),
    );
  },

  deleteMonitoredServer(id: number) {
    return requestApiData<boolean>(() => httpClient.delete(`${SERVERS_PATH}/${id}`));
  },

  getServerStatus(id: number) {
    return requestApiData<MonitoredServerStatusDto>(() =>
      httpClient.get(`${SERVERS_PATH}/${id}/status`),
    );
  },

  getServerMetrics(id: number) {
    return requestApiData<ServerMetricDefinitionDto[]>(() =>
      httpClient.get(`${SERVERS_PATH}/${id}/metrics`),
    );
  },

  getMetricHistory(serverId: number, metricDefinitionId: number, limit = DEFAULT_METRIC_HISTORY_LIMIT) {
    return requestApiData<ServerMetricHistoryPointDto[]>(() =>
      httpClient.get(`${SERVERS_PATH}/${serverId}/metrics/${metricDefinitionId}/history`, {
        params: { limit },
      }),
    );
  },

  async getMetricCriteria(serverId: number, metricDefinitionId: number) {
    try {
      return await requestApiData<ServerMetricCriteriaDto>(() =>
        httpClient.get(`${SERVERS_PATH}/${serverId}/metrics/${metricDefinitionId}/criteria`),
      );
    } catch (error) {
      const apiError = toApiError(error);
      if (apiError.statusCode === 404 && apiError.message === CRITERIA_NOT_FOUND_MESSAGE) {
        return null;
      }
      throw apiError;
    }
  },

  updateMetricCriteria(
    serverId: number,
    metricDefinitionId: number,
    payload: UpdateServerMetricCriteriaRequest,
  ) {
    return requestApiData<ServerMetricCriteriaDto>(() =>
      httpClient.put(`${SERVERS_PATH}/${serverId}/metrics/${metricDefinitionId}/criteria`, payload),
    );
  },
};
