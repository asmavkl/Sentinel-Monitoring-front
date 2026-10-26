import type { ApplicationHealthStatus, CheckType, ExecutionStatus } from './enums';
import type {
  WidgetConfiguration,
  WidgetDataSourceDto,
  WidgetDataSourceRequestDto,
  WidgetLayoutDto,
  WidgetType,
} from './widgets';

export interface ApplicationOverviewDto {
  applicationId: number;
  name: string;
  code: string;
  description?: string | null;
  baseUrl?: string | null;
  isActive: boolean;
  calculatedHealthStatus: ApplicationHealthStatus;
  availabilityStatus: ApplicationHealthStatus;
  statusCalculatedAt: string;
  totalComponents: number;
  activeComponents: number;
  totalChecks: number;
  activeChecks: number;
  healthyChecks: number;
  unhealthyChecks: number;
  hasDashboard: boolean;
}

export interface CheckStatusDto {
  checkId: number;
  componentId: number;
  name: string;
  checkType: CheckType;
  isActive: boolean;
  lastStatus?: ExecutionStatus | null;
  healthStatus?: ApplicationHealthStatus | null;
  lastExecutionTime?: string | null;
  lastDurationMs?: number | null;
  lastSuccessRate?: number | null;
  lastErrorMessage?: string | null;
  nextRunTime?: string | null;
}

export interface ComponentStatusDto {
  componentId: number;
  applicationId: number;
  name: string;
  code: string;
  description?: string | null;
  isActive: boolean;
  status: ApplicationHealthStatus;
  totalChecks: number;
  activeChecks: number;
  healthyChecks: number;
  unhealthyChecks: number;
  checks: CheckStatusDto[];
}

export interface WidgetDto {
  id: number;
  dashboardId?: number;
  /** Normalized section id used by the UI. */
  sectionId?: number | null;
  /** Wire field from the dashboard layout API. Mapped onto `sectionId`. */
  dashboardSectionId?: number | null;
  title: string;
  description?: string | null;
  widgetType: WidgetType;
  order?: number;
  displayOrder?: number;
  layout: WidgetLayoutDto;
  configuration: WidgetConfiguration;
  dataSources: WidgetDataSourceDto[];
}

export interface DashboardSectionDto {
  id: number;
  title: string;
  description?: string | null;
  color?: string | null;
  displayOrder: number;
  isVisible: boolean;
  widgets: WidgetDto[];
}

export interface CreateSectionRequestDto {
  title: string;
  description?: string | null;
  color?: string | null;
  displayOrder?: number;
  isVisible?: boolean;
}

export interface UpdateSectionRequestDto {
  title?: string | null;
  description?: string | null;
  color?: string | null;
  displayOrder?: number | null;
  isVisible?: boolean | null;
}

export interface CreateWidgetRequestDto {
  title: string;
  widgetType: string;
  displayOrder: number;
  description?: string;
  dashboardSectionId?: number;
  layout?: WidgetLayoutDto;
  configuration?: object;
  dataSources?: WidgetDataSourceRequestDto[];
}

export interface UpdateWidgetRequestDto {
  title?: string;
  description?: string;
  widgetType?: string;
  dashboardSectionId?: number;
  clearSection?: boolean;
  displayOrder?: number;
  layout?: WidgetLayoutDto;
  configuration?: object;
  dataSources?: WidgetDataSourceRequestDto[];
}

export interface DashboardLayoutDto {
  /** Backend may return either `id` or `dashboardId`. Normalized to `dashboardId`. */
  id?: number;
  dashboardId: number;
  applicationId: number;
  monitoredServerId?: number | null;
  /** Prefer `title` from newer APIs; `name` kept for compatibility. */
  title?: string;
  name?: string;
  sections: DashboardSectionDto[];
  /**
   * Flattened widgets across sections for legacy consumers (designer, tests).
   * Prefer rendering via `sections`.
   */
  widgets: WidgetDto[];
}

export interface DashboardTemplateDto {
  id: number;
  name: string;
  code?: string | null;
  description?: string | null;
}

export interface CheckHistoryDto {
  id: number;
  checkId: number;
  executionTime: string;
  durationMs: number;
  status: ExecutionStatus;
  totalCount?: number | null;
  successCount?: number | null;
  failedCount?: number | null;
  successRate?: number | null;
  errorMessage?: string | null;
}

export interface MetricPointDto {
  timestamp: string;
  status: ExecutionStatus;
  durationMs: number;
  successRate?: number | null;
  totalCount?: number | null;
}

export interface DatasetColumnDto {
  name: string;
  type: string;
}

export interface DatasetRowDto {
  [key: string]: unknown;
}

export interface DatasetDto {
  columns: DatasetColumnDto[];
  rows: DatasetRowDto[];
}

export interface DatasetHistoryDto {
  executionTime: string;
  dataset: DatasetDto;
}

export type {
  WidgetConfiguration,
  WidgetDataSourceDto,
  WidgetDataSourceRequestDto,
  WidgetLayoutDto,
  WidgetType,
} from './widgets';
