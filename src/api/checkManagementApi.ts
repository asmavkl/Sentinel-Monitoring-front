import { httpClient } from '@/api/httpClient';
import { requestApiData } from '@/api/apiUtils';
import type { PagedResult, PaginationQuery } from '@/types/api';
import type {
  CheckDefinitionDto,
  CheckDatasetResponse,
  CheckListItem,
  CreateCheckRequest,
  CreateCriteriaRequest,
  CriteriaDefinitionDto,
  ManualCheckExecutionResponse,
  UpdateCheckRequest,
} from '@/types/checkManagement';
import type { MonitoringApplicationDto, MonitoringComponentDto } from '@/types/monitoringManagement';

const APPLICATIONS_PATH = '/api/applications';
const COMPONENTS_PATH = '/api/components';
const CHECKS_PATH = '/api/checks';

export const checkManagementApi = {
  getMonitoringApplications(query: PaginationQuery = { pageNumber: 1, pageSize: 100 }) {
    return requestApiData<PagedResult<MonitoringApplicationDto>>(() =>
      httpClient.get(APPLICATIONS_PATH, { params: query }),
    );
  },

  getApplicationComponents(applicationId: number) {
    return requestApiData<MonitoringComponentDto[]>(() =>
      httpClient.get(`${COMPONENTS_PATH}/application/${applicationId}`),
    );
  },

  getApplicationChecks(applicationId: number) {
    return requestApiData<CheckDefinitionDto[]>(() =>
      httpClient.get(`${CHECKS_PATH}/application/${applicationId}`),
    );
  },

  getChecks(query: PaginationQuery = { pageNumber: 1, pageSize: 10 }) {
    return requestApiData<PagedResult<CheckListItem>>(() =>
      httpClient.get(CHECKS_PATH, { params: query }),
    );
  },

  getCheck(id: number) {
    return requestApiData<CheckDefinitionDto>(() => httpClient.get(`${CHECKS_PATH}/${id}`));
  },

  createCheck(payload: CreateCheckRequest) {
    return requestApiData<CheckDefinitionDto>(() => httpClient.post(CHECKS_PATH, payload));
  },

  updateCheck(id: number, payload: UpdateCheckRequest) {
    return requestApiData<CheckDefinitionDto>(() => httpClient.put(`${CHECKS_PATH}/${id}`, payload));
  },

  deleteCheck(id: number) {
    return requestApiData<boolean>(() => httpClient.delete(`${CHECKS_PATH}/${id}`));
  },

  activateCheck(id: number) {
    return requestApiData<CheckDefinitionDto>(() => httpClient.put(`${CHECKS_PATH}/${id}/activate`));
  },

  deactivateCheck(id: number) {
    return requestApiData<CheckDefinitionDto>(() => httpClient.put(`${CHECKS_PATH}/${id}/deactivate`));
  },

  getCheckDataset(checkId: number, applicationId: number) {
    return requestApiData<CheckDatasetResponse>(() =>
      httpClient.get(`${CHECKS_PATH}/${checkId}/dataset/latest`, { params: { applicationId } }),
    );
  },

  getCheckCriteria(checkId: number) {
    return requestApiData<CriteriaDefinitionDto>(() =>
      httpClient.get(`${CHECKS_PATH}/${checkId}/criteria`),
    );
  },

  createCheckCriteria(checkId: number, payload: CreateCriteriaRequest) {
    return requestApiData<CriteriaDefinitionDto>(() =>
      httpClient.post(`${CHECKS_PATH}/${checkId}/criteria`, payload),
    );
  },

  updateCheckCriteria(criteriaId: number, payload: CreateCriteriaRequest) {
    return requestApiData<CriteriaDefinitionDto>(() =>
      httpClient.put(`${CHECKS_PATH}/criteria/${criteriaId}`, payload),
    );
  },

  deleteCheckCriteria(criteriaId: number) {
    return requestApiData<boolean>(() =>
      httpClient.delete(`${CHECKS_PATH}/criteria/${criteriaId}`),
    );
  },

  runCheck(id: number) {
    return requestApiData<ManualCheckExecutionResponse>(() =>
      httpClient.post(`${CHECKS_PATH}/${id}/run`),
    );
  },
};
