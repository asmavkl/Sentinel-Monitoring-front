export interface MetricHistoryPointDto {
  timestamp: string;
  value: number;
}

export interface MetricSeriesDto {
  metricId: number;
  name: string;
  displayName: string;
  unit: string | null;
  points: MetricHistoryPointDto[];
}

export interface MultiSeriesMetricHistoryDto {
  checkId: number;
  series: MetricSeriesDto[];
}

export interface MultiSeriesMetricHistoryQuery {
  metricIds?: number[];
  from?: string; // Can be time range string (e.g., '24h') or ISO timestamp
  to?: string; // Can be ISO timestamp
  take?: number;
}
