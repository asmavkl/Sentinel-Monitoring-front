import { httpClient } from '@/api/httpClient';
import { requestApiData } from '@/api/apiUtils';
import type {
  CreateDatabaseCredentialRequest,
  DatabaseCredentialDto,
  TestDatabaseConnectionRequest,
  TestDatabaseConnectionResult,
  UpdateDatabaseCredentialRequest,
} from '@/types/databaseCredentials';

const CREDENTIALS_PATH = '/api/databasecredentials';

export const databaseCredentialsApi = {
  getDatabaseCredentials() {
    return requestApiData<DatabaseCredentialDto[]>(() => httpClient.get(CREDENTIALS_PATH));
  },

  getDatabaseCredential(id: number) {
    return requestApiData<DatabaseCredentialDto>(() => httpClient.get(`${CREDENTIALS_PATH}/${id}`));
  },

  createDatabaseCredential(payload: CreateDatabaseCredentialRequest) {
    return requestApiData<DatabaseCredentialDto>(() => httpClient.post(CREDENTIALS_PATH, payload));
  },

  updateDatabaseCredential(id: number, payload: UpdateDatabaseCredentialRequest) {
    return requestApiData<DatabaseCredentialDto>(() =>
      httpClient.put(`${CREDENTIALS_PATH}/${id}`, payload),
    );
  },

  deleteDatabaseCredential(id: number) {
    return requestApiData<boolean>(() => httpClient.delete(`${CREDENTIALS_PATH}/${id}`));
  },

  deactivateDatabaseCredential(id: number) {
    return requestApiData<DatabaseCredentialDto>(() =>
      httpClient.put(`${CREDENTIALS_PATH}/${id}/deactivate`),
    );
  },

  activateDatabaseCredential(id: number) {
    return requestApiData<DatabaseCredentialDto>(() =>
      httpClient.put(`${CREDENTIALS_PATH}/${id}/activate`),
    );
  },

  testDatabaseConnection(payload: TestDatabaseConnectionRequest) {
    return httpClient.post<TestDatabaseConnectionResult>(`${CREDENTIALS_PATH}/test`, payload).then((response) => response.data);
  },

  testDatabaseCredential(id: number) {
    return httpClient.post<TestDatabaseConnectionResult>(`${CREDENTIALS_PATH}/${id}/test`).then((response) => response.data);
  },
};
