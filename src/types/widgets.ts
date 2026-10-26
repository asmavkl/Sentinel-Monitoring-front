import type { ApplicationHealthStatus } from './enums';
import type { CheckStatusDto } from './dashboard';

export type ApiWidgetType =
  | 'StatusCard'
  | 'NumberCard'
  | 'Chart'
  | 'MultiSeriesChart'
  | 'Table'
  | 'Gauge'
  | 'ProgressBar';
export type WidgetType = ApiWidgetType;

export const WIDGET_TYPES: WidgetType[] = [
  'StatusCard',
  'NumberCard',
  'Chart',
  'MultiSeriesChart',
  'Table',
  'Gauge',
  'ProgressBar',
];

export const WIDGET_TYPE_LABELS: Record<WidgetType, string> = {
  StatusCard: 'کارت وضعیت',
  NumberCard: 'کارت عددی',
  Chart: 'نمودار',
  MultiSeriesChart: 'نمودار چند سری',
  Table: 'جدول',
  Gauge: 'گیج',
  ProgressBar: 'نوار پیشرفت',
};

export function isWidgetType(value: string): value is WidgetType {
  return WIDGET_TYPES.includes(value as WidgetType);
}

export function toApiWidgetType(widgetType: WidgetType): ApiWidgetType {
  return widgetType;
}

export function resolveWidgetType(
  widgetType: string,
): WidgetType {
  return isWidgetType(widgetType) ? widgetType : (widgetType as WidgetType);
}

export interface WidgetLayoutDto {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ServerMetricHistoryPoint {
  value: number | null;
  timestamp: string;
}

export interface WidgetDataSourceDto {
  id: number;
  checkId?: number | null;
  checkName?: string | null;
  applicationId?: number | null;
  monitoredServerId?: number | null;
  serverMetricDefinitionId?: number | null;
  metricName?: string | null;
  metricDisplayName?: string | null;
  /** Wire field returned by the dashboard layout API. */
  metricId?: number | null;
  metricDefinitionId?: number | null;
  value?: number | null;
  timestamp?: string | null;
  healthStatus?: ApplicationHealthStatus | null;
  history?: ServerMetricHistoryPoint[] | null;
  displayOrder?: number;
  status?: CheckStatusDto | null;
  dataSourceType?: 'Metric' | 'Dataset';
}

export interface WidgetDataSourceRequestDto {
  checkId?: number;
  applicationId?: number;
  serverMetricDefinitionId?: number;
  dataSourceType?: 'Metric' | 'Dataset';
  metricDefinitionId?: number;
  metricName?: string;
  displayOrder: number;
}

export type WidgetConfiguration = Record<string, unknown>;

export type DataSourceType = 'Metric' | 'Dataset';

export interface DatasetChartConfiguration {
  dataSourceType: DataSourceType;
  chartType: 'line' | 'bar';
  timeColumn?: string;
  valueColumns?: string[];
  timeRange?: string;
  take?: number;
}
