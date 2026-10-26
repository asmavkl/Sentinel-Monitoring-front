import type {
  AggregationType,
  ApplicationHealthStatus,
  CriteriaOperator,
  ExecutionStatus,
  MetricType,
  MonitoringMethod,
} from './enums';
import type { CriteriaRuleDto } from './checkManagement';

export interface MonitoredServerDto {
  id: number;
  name: string;
  description: string | null;
  host: string;
  port: number;
  monitoringMethod: MonitoringMethod;
  credentialId: number;
  isActive: boolean;
  intervalSeconds: number;
  timeoutSeconds: number;
  retryCount: number;
  retryDelaySeconds: number;
  lastRunTime: string | null;
  nextRunTime: string | null;
  createdDate: string;
  updatedDate: string | null;
}

export interface CreateMonitoredServerRequest {
  name: string;
  description: string | null;
  host: string;
  port: number | null;
  credentialId: number;
  isActive: boolean;
  intervalSeconds: number;
  timeoutSeconds: number;
  retryCount: number;
  retryDelaySeconds: number;
}

export type UpdateMonitoredServerRequest = CreateMonitoredServerRequest;

export interface ServerStatusMetricDto {
  metricDefinitionId: number;
  name: string;
  displayName: string;
  instanceKey: string | null;
  unit: string | null;
  value: number | null;
  timestamp: string | null;
  healthStatus: ApplicationHealthStatus;
}

export interface MonitoredServerStatusDto {
  serverId: number;
  status: ExecutionStatus | null;
  healthStatus: ApplicationHealthStatus;
  errorMessage: string | null;
  executionTime: string | null;
  durationMs: number | null;
  metrics: ServerStatusMetricDto[];
}

export interface ServerMetricDefinitionDto {
  id: number;
  monitoredServerId: number;
  name: string;
  displayName: string;
  description: string | null;
  instanceKey: string | null;
  metricType: MetricType;
  unit: string | null;
  aggregationType: AggregationType;
  isVisible: boolean;
}

export interface ServerMetricHistoryPointDto {
  value: number | null;
  timestamp: string;
}

export interface ServerMetricCriteriaRuleDto {
  id?: number;
  operator: CriteriaOperator;
  expectedValue: number | null;
  minValue: number | null;
  maxValue: number | null;
  healthStatus: ApplicationHealthStatus;
  priority: number;
}

export interface ServerMetricCriteriaDto {
  id: number;
  serverMetricDefinitionId: number;
  isActive: boolean;
  rules: ServerMetricCriteriaRuleDto[];
}

export interface UpdateServerMetricCriteriaRequest {
  isActive: boolean;
  rules: Array<Omit<CriteriaRuleDto, 'id'>>;
}
