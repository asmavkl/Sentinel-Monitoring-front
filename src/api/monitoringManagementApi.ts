import { httpClient } from '@/api/httpClient';
import { requestApiData } from '@/api/apiUtils';
import type { PagedResult, PaginationQuery } from '@/types/api';
import type {
  CreateApplicationRequest,
  CreateComponentRequest,
  MonitoringApplicationDto,
  MonitoringCheckListItem,
  MonitoringComponentDto,
  UpdateApplicationRequest,
  UpdateComponentRequest,
} from '@/types/monitoringManagement';

const APPLICATIONS_PATH = '/api/applications';
const COMPONENTS_PATH = '/api/components';
const CHECKS_PATH = '/api/checks';

export const monitoringManagementApi = {
  getMonitoringApplications(query: PaginationQuery = { pageNumber: 1, pageSize: 100 }) {
    return requestApiData<PagedResult<MonitoringApplicationDto>>(() =>
      httpClient.get(APPLICATIONS_PATH, { params: query }),
    );
  },

  getMonitoringApplication(id: number) {
    return requestApiData<MonitoringApplicationDto>(() =>
      httpClient.get(`${APPLICATIONS_PATH}/${id}`),
    );
  },

  createMonitoringApplication(payload: CreateApplicationRequest) {
    return requestApiData<MonitoringApplicationDto>(() =>
      httpClient.post(APPLICATIONS_PATH, payload),
    );
  },

  updateMonitoringApplication(id: number, payload: UpdateApplicationRequest) {
    return requestApiData<MonitoringApplicationDto>(() =>
      httpClient.put(`${APPLICATIONS_PATH}/${id}`, payload),
    );
  },

  deleteMonitoringApplication(id: number) {
    return requestApiData<boolean>(() => httpClient.delete(`${APPLICATIONS_PATH}/${id}`));
  },

  getApplicationComponents(applicationId: number) {
    return requestApiData<MonitoringComponentDto[]>(() =>
      httpClient.get(`${COMPONENTS_PATH}/application/${applicationId}`),
    );
  },

  createApplicationComponent(payload: CreateComponentRequest) {
    return requestApiData<MonitoringComponentDto>(() => httpClient.post(COMPONENTS_PATH, payload));
  },

  updateApplicationComponent(componentId: number, payload: UpdateComponentRequest) {
    return requestApiData<MonitoringComponentDto>(() =>
      httpClient.put(`${COMPONENTS_PATH}/${componentId}`, payload),
    );
  },

  deleteApplicationComponent(componentId: number) {
    return requestApiData<boolean>(() => httpClient.delete(`${COMPONENTS_PATH}/${componentId}`));
  },

  getApplicationChecks(applicationId: number) {
    return requestApiData<MonitoringCheckListItem[]>(() =>
      httpClient.get(`${CHECKS_PATH}/application/${applicationId}`),
    );
  },
};
