import type {
  ApplicationHealthStatus,
  CheckType,
  CriteriaOperator,
  ExecutionStatus,
  HttpMethod,
  MongoOperationType,
  RedisOperationType,
  ResultType,
} from './enums';

export interface HttpCheckConfigurationDto {
  id?: number;
  checkId?: number;
  url: string;
  httpMethod: HttpMethod;
  headers?: string | null;
  requestBody?: string | null;
  expectedStatusCode: number;
  useSSOToken: boolean;
}

export interface DatabaseCheckConfigurationDto {
  id?: number;
  checkId?: number;
  databaseCredentialId: number;
  query?: string | null;
  resultType: ResultType;
  healthQueryId?: number | null;
}

export interface RedisCheckConfigurationDto {
  id?: number;
  checkDefinitionId?: number;
  databaseCredentialId: number;
  databaseNumber: number;
  operationType: RedisOperationType;
  commandOrKeyName?: string | null;
  expectedValue?: string | null;
  thresholdValue?: number | null;
  timeoutSeconds: number;
}

export interface MongoDbCheckConfigurationDto {
  id?: number;
  checkDefinitionId?: number;
  databaseCredentialId: number;
  operationType: MongoOperationType;
  collectionName?: string | null;
  queryJson?: string | null;
  expectedValue?: string | null;
  thresholdValue?: number | null;
  timeoutSeconds: number;
}

export interface CheckDefinitionDto {
  id: number;
  applicationComponentId: number;
  applicationId: number;
  name: string;
  description?: string | null;
  checkType: CheckType;
  intervalSeconds: number;
  timeoutSeconds: number;
  retryCount: number;
  retryDelaySeconds: number;
  isActive: boolean;
  lastRunTime?: string | null;
  nextRunTime?: string | null;
  createdDate?: string | null;
  lastStatus?: ExecutionStatus | null;
  lastHealthStatus?: ApplicationHealthStatus | null;
  httpConfiguration?: HttpCheckConfigurationDto | null;
  sqlConfiguration?: DatabaseCheckConfigurationDto | null;
  /** Obsolete alias for sqlConfiguration. New requests send sqlConfiguration. */
  databaseConfiguration?: DatabaseCheckConfigurationDto | null;
  redisConfiguration?: RedisCheckConfigurationDto | null;
  mongoDbConfiguration?: MongoDbCheckConfigurationDto | null;
  criteriaDefinition?: CriteriaDefinitionDto | null;
}

export interface CheckListItem extends CheckDefinitionDto {
  applicationName: string;
  componentName: string;
}

export interface CreateHttpCheckConfigurationRequest {
  url: string;
  httpMethod: HttpMethod;
  headers?: string | null;
  requestBody?: string | null;
  expectedStatusCode: number;
  useSSOToken: boolean;
}

export interface CreateDatabaseCheckConfigurationRequest {
  databaseCredentialId: number;
  query: string | null;
  resultType: ResultType;
  healthQueryId?: number | null;
}

export interface CreateRedisCheckConfigurationRequest {
  databaseCredentialId: number;
  databaseNumber: number;
  operationType: RedisOperationType;
  commandOrKeyName?: string | null;
  expectedValue?: string | null;
  thresholdValue?: number | null;
  timeoutSeconds: number;
}

export interface CreateMongoDbCheckConfigurationRequest {
  databaseCredentialId: number;
  operationType: MongoOperationType;
  collectionName?: string | null;
  queryJson?: string | null;
  expectedValue?: string | null;
  thresholdValue?: number | null;
  timeoutSeconds: number;
}

export interface CreateCheckRequest {
  applicationComponentId: number;
  name: string;
  description?: string | null;
  checkType: CheckType | number; // Accept both enum and number for compatibility
  intervalSeconds: number;
  timeoutSeconds: number;
  retryCount: number;
  retryDelaySeconds: number;
  isActive: boolean;
  httpConfiguration?: CreateHttpCheckConfigurationRequest | null;
  sqlConfiguration?: CreateDatabaseCheckConfigurationRequest | null;
  redisConfiguration?: CreateRedisCheckConfigurationRequest | null;
  mongoDbConfiguration?: CreateMongoDbCheckConfigurationRequest | null;
}

export interface UpdateCheckRequest {
  name: string;
  description?: string | null;
  intervalSeconds: number;
  timeoutSeconds: number;
  retryCount: number;
  retryDelaySeconds: number;
  isActive: boolean;
  httpConfiguration?: CreateHttpCheckConfigurationRequest | null;
  sqlConfiguration?: CreateDatabaseCheckConfigurationRequest | null;
  redisConfiguration?: CreateRedisCheckConfigurationRequest | null;
  mongoDbConfiguration?: CreateMongoDbCheckConfigurationRequest | null;
}

export interface DatasetColumn {
  name: string;
  type: string;
}

export interface DatasetResult {
  columns: DatasetColumn[];
  rows: Record<string, unknown>[];
}

export interface CheckDatasetResponse {
  status: string;
  totalCount: number;
  resultJson: string;
  metadataJson: string;
  dataset: DatasetResult;
}

export interface CriteriaRuleDto {
  id?: number;
  operator: CriteriaOperator;
  expectedValue?: number | null;
  minValue?: number | null;
  maxValue?: number | null;
  healthStatus: ApplicationHealthStatus;
  priority: number;
}

export interface CriteriaDefinitionDto {
  id?: number;
  checkDefinitionId: number;
  isActive: boolean;
  rules: CriteriaRuleDto[];
}

export interface CreateCriteriaRequest {
  isActive: boolean;
  rules: Omit<CriteriaRuleDto, 'id'>[];
}

export interface ManualCheckExecutionResponse {
  requestId: number;
  status: 'Pending' | 'Processing' | 'Completed' | 'Failed';
  message: string;
}

export type { DatabaseCredentialDto } from './databaseCredentials';
