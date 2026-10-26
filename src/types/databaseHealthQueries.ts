import type { CredentialType, DatabaseHealthQueryCategory, ResultType } from './enums';

export interface DatabaseHealthQueryDto {
  id: number;
  name: string;
  displayName: string;
  description?: string | null;
  databaseType: CredentialType;
  category: DatabaseHealthQueryCategory;
  query: string;
  resultType: ResultType;
  unit?: string | null;
  isActive: boolean;
  createdDate?: string | null;
  updatedDate?: string | null;
}

export interface DatabaseHealthQueryListFilters {
  databaseType?: CredentialType;
  category?: DatabaseHealthQueryCategory;
  isActive?: boolean;
  search?: string;
}

export interface CreateDatabaseHealthQueryRequest {
  name: string;
  displayName: string;
  description?: string | null;
  databaseType: CredentialType;
  category: DatabaseHealthQueryCategory;
  query: string;
  resultType: ResultType;
  unit?: string | null;
  isActive: boolean;
}

export interface UpdateDatabaseHealthQueryRequest {
  name: string;
  displayName: string;
  description?: string | null;
  databaseType: CredentialType;
  category: DatabaseHealthQueryCategory;
  query: string;
  resultType: ResultType;
  unit?: string | null;
}
