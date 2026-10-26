export interface CheckMetricDefinitionDto {
  id: number;
  checkDefinitionId: number;
  name: string;
  displayName: string;
  description?: string | null;
  metricType: string;
  unit?: string | null;
  aggregationType: string;
  isVisible: boolean;
  createdDate: string;
}

export interface MetricTimeSeriesPointDto {
  timestamp: string;
  value: number;
}

export interface MetricLatestDto {
  checkId: number;
  metricId: number;
  metricName?: string | null;
  name?: string | null;
  displayName?: string | null;
  value: number;
  unit?: string | null;
  timestamp?: string | null;
}

export interface MetricAggregateDto {
  metricId: number;
  aggregation: string;
  value: number;
  unit?: string | null;
  from?: string | null;
  to?: string | null;
  sampleCount?: number | null;
}

export type MetricAggregationOption = 'Latest' | 'Average' | 'Min' | 'Max' | 'Sum';

export type MetricTimeRangeOption = '1h' | '24h' | '7d';

export interface MetricHistoryQuery {
  applicationId?: number;
  from?: string;
  to?: string;
  take?: number;
}

export interface MetricAggregateQuery {
  aggregation: Exclude<MetricAggregationOption, 'Latest'>;
  applicationId?: number;
  from?: string;
  to?: string;
}
