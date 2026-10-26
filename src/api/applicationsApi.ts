import { httpClient } from '@/api/httpClient';
import { requestApiData } from '@/api/apiUtils';
import type { PaginationQuery, PagedResult } from '@/types/api';
import type { ApplicationStatusDto, MonitoredApplicationDto } from '@/types/applications';

const BASE_PATH = '/api/applications';

export const applicationsApi = {
  getApplications(query: PaginationQuery = { pageNumber: 1, pageSize: 100 }) {
    return requestApiData<PagedResult<MonitoredApplicationDto>>(() =>
      httpClient.get(BASE_PATH, { params: query }),
    );
  },

  getApplicationStatus(applicationId: number) {
    return requestApiData<ApplicationStatusDto>(() =>
      httpClient.get(`${BASE_PATH}/${applicationId}/status`),
    );
  },
};
