import { httpClient } from '@/api/httpClient';
import { requestApiData } from '@/api/apiUtils';
import type { DatasetDto, DatasetHistoryDto } from '@/types/dashboard';

const BASE_PATH = '/api/checks';

export const datasetApi = {
  getLatestDataset(checkId: number, applicationId?: number) {
    return requestApiData<DatasetDto>(() =>
      httpClient.get(`${BASE_PATH}/${checkId}/dataset/latest`, { params: applicationId ? { applicationId } : {} }),
    );
  },

  getDatasetHistory(
    checkId: number,
    query: { from?: string; to?: string; take?: number; applicationId?: number } = {},
  ) {
    return requestApiData<DatasetHistoryDto[]>(() =>
      httpClient.get(`${BASE_PATH}/${checkId}/dataset/history`, { params: query }),
    );
  },
};
