import { httpClient } from '@/api/httpClient';
import { requestApiData } from '@/api/apiUtils';
import type {
  CreateDatabaseHealthQueryRequest,
  DatabaseHealthQueryDto,
  DatabaseHealthQueryListFilters,
  UpdateDatabaseHealthQueryRequest,
} from '@/types/databaseHealthQueries';

const HEALTH_QUERIES_PATH = '/api/database-health-queries';

function toListParams(filters: DatabaseHealthQueryListFilters) {
  const params: Record<string, string | number | boolean> = {};

  if (filters.databaseType != null) {
    params.databaseType = filters.databaseType;
  }

  if (filters.category != null) {
    params.category = filters.category;
  }

  if (filters.isActive != null) {
    params.isActive = filters.isActive;
  }

  const search = filters.search?.trim();
  if (search) {
    params.search = search;
  }

  return params;
}

export const databaseHealthQueriesApi = {
  getDatabaseHealthQueries(filters: DatabaseHealthQueryListFilters = {}) {
    return requestApiData<DatabaseHealthQueryDto[]>(() =>
      httpClient.get(HEALTH_QUERIES_PATH, { params: toListParams(filters) }),
    );
  },

  getDatabaseHealthQuery(id: number) {
    return requestApiData<DatabaseHealthQueryDto>(() =>
      httpClient.get(`${HEALTH_QUERIES_PATH}/${id}`),
    );
  },

  createDatabaseHealthQuery(payload: CreateDatabaseHealthQueryRequest) {
    return requestApiData<DatabaseHealthQueryDto>(() => httpClient.post(HEALTH_QUERIES_PATH, payload));
  },

  updateDatabaseHealthQuery(id: number, payload: UpdateDatabaseHealthQueryRequest) {
    return requestApiData<DatabaseHealthQueryDto>(() =>
      httpClient.put(`${HEALTH_QUERIES_PATH}/${id}`, payload),
    );
  },

  activateDatabaseHealthQuery(id: number) {
    return requestApiData<DatabaseHealthQueryDto>(() =>
      httpClient.put(`${HEALTH_QUERIES_PATH}/${id}/activate`),
    );
  },

  deactivateDatabaseHealthQuery(id: number) {
    return requestApiData<DatabaseHealthQueryDto>(() =>
      httpClient.put(`${HEALTH_QUERIES_PATH}/${id}/deactivate`),
    );
  },
};
