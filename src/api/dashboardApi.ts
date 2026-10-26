import { httpClient } from '@/api/httpClient';
import { requestApiData } from '@/api/apiUtils';
import type { PaginationQuery, PagedResult } from '@/types/api';
import type {
  ApplicationOverviewDto,
  CheckHistoryDto,
  CheckStatusDto,
  ComponentStatusDto,
  MetricPointDto,
} from '@/types/dashboard';

const BASE_PATH = '/api/dashboard';

export const dashboardApi = {
  getApplicationOverview(applicationId: number) {
    return requestApiData<ApplicationOverviewDto>(() =>
      httpClient.get(`${BASE_PATH}/applications/${applicationId}/overview`),
    );
  },

  getApplicationComponents(applicationId: number) {
    return requestApiData<ComponentStatusDto[]>(() =>
      httpClient.get(`${BASE_PATH}/applications/${applicationId}/components`),
    );
  },

  getComponentDetails(componentId: number) {
    return requestApiData<ComponentStatusDto>(() =>
      httpClient.get(`${BASE_PATH}/components/${componentId}`),
    );
  },

  getCheckStatus(checkId: number) {
    return requestApiData<CheckStatusDto>(() =>
      httpClient.get(`${BASE_PATH}/checks/${checkId}/status`),
    );
  },

  getCheckHistory(checkId: number, query: PaginationQuery = { pageNumber: 1, pageSize: 50 }) {
    return requestApiData<PagedResult<CheckHistoryDto>>(() =>
      httpClient.get(`${BASE_PATH}/checks/${checkId}/history`, { params: query }),
    );
  },

  getCheckMetrics(checkId: number, limit = 50) {
    return requestApiData<MetricPointDto[]>(() =>
      httpClient.get(`${BASE_PATH}/checks/${checkId}/metrics`, { params: { limit } }),
    );
  },
};
