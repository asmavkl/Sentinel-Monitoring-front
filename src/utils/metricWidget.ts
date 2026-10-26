import type { WidgetConfiguration, WidgetDataSourceDto } from '@/types/widgets';
import type { MetricAggregationOption, MetricTimeRangeOption } from '@/types/metrics';
import { getPrimaryCheckId, getPrimaryDataSource } from '@/utils/widgetDataSource';

export const METRIC_EMPTY_MESSAGE = 'برای این ویجت داده‌ای ثبت نشده است';

export const METRIC_AGGREGATION_OPTIONS: MetricAggregationOption[] = [
  'Latest',
  'Average',
  'Min',
  'Max',
  'Sum',
];

export const METRIC_TIME_RANGE_OPTIONS: MetricTimeRangeOption[] = ['1h', '24h', '7d'];

export const METRIC_AGGREGATION_LABELS: Record<MetricAggregationOption, string> = {
  Latest: 'آخرین مقدار',
  Average: 'میانگین',
  Min: 'حداقل',
  Max: 'حداکثر',
  Sum: 'مجموع',
};

export const METRIC_TIME_RANGE_LABELS: Record<MetricTimeRangeOption, string> = {
  '1h': '۱ ساعت اخیر',
  '24h': '۲۴ ساعت اخیر',
  '7d': '۷ روز اخیر',
};

function readNumber(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function readString(value: unknown): string | null {
  return typeof value === 'string' && value.length > 0 ? value : null;
}

export function readMetricId(configuration?: WidgetConfiguration | null): number | null {
  return readNumber(configuration?.metricId);
}

export function readAggregation(
  configuration?: WidgetConfiguration | null,
): MetricAggregationOption {
  const value = readString(configuration?.aggregation);
  if (
    value === 'Latest' ||
    value === 'Average' ||
    value === 'Min' ||
    value === 'Max' ||
    value === 'Sum'
  ) {
    return value;
  }

  return 'Latest';
}

export function readMetricTimeRange(
  configuration?: WidgetConfiguration | null,
): MetricTimeRangeOption {
  const value = readString(configuration?.timeRange);
  if (value === '1h' || value === '24h' || value === '7d') {
    return value;
  }

  // Backward-compatible mapping for previously saved ranges
  if (value === '6h') {
    return '1h';
  }
  if (value === '30d') {
    return '7d';
  }

  return '24h';
}

export function resolveTimeRangeBounds(timeRange: string, now?: number): {
  from: string;
  to: string;
} {
  const currentTime = now ?? Date.now();
  const hourMs = 60 * 60 * 1000;
  const ranges: Record<string, number> = {
    '1h': hourMs,
    '6h': 6 * hourMs,
    '24h': 24 * hourMs,
    '7d': 7 * 24 * hourMs,
    '30d': 30 * 24 * hourMs,
  };

  const span = ranges[timeRange] ?? ranges['24h'];
  return {
    from: new Date(currentTime - span).toISOString(),
    to: new Date(currentTime).toISOString(),
  };
}

export function getFixedTimeRangeBounds(timeRange: string): {
  from: string;
  to: string;
} {
  const hourMs = 60 * 60 * 1000;
  const ranges: Record<string, number> = {
    '1h': hourMs,
    '6h': 6 * hourMs,
    '24h': 24 * hourMs,
    '7d': 7 * 24 * hourMs,
    '30d': 30 * 24 * hourMs,
  };

  const span = ranges[timeRange] ?? ranges['24h'];
  return {
    from: new Date(Date.now() - span).toISOString(),
    to: new Date(Date.now()).toISOString(),
  };
}

export function resolveMetricSource(
  configuration: WidgetConfiguration | null | undefined,
  dataSources: WidgetDataSourceDto[],
): { checkId: number | null; metricId: number | null; metricName: string | null } {
  const checkId = getPrimaryCheckId(dataSources);
  const metricId = readMetricId(configuration);
  const metricName = getPrimaryDataSource(dataSources)?.metricName ?? null;

  return {
    checkId,
    metricId,
    metricName,
  };
}

export function formatMetricValue(
  value: number | null | undefined,
  options?: { unit?: string | null; asPercent?: boolean; fractionDigits?: number },
): string {
  if (value == null || !Number.isFinite(value)) {
    return '—';
  }

  if (options?.asPercent) {
    const digits = options.fractionDigits ?? 1;
    return `${value.toFixed(digits)}%`;
  }

  const digits = options?.fractionDigits ?? (Number.isInteger(value) ? 0 : 2);
  const formatted = new Intl.NumberFormat('fa-IR', {
    maximumFractionDigits: digits,
    minimumFractionDigits: 0,
  }).format(value);

  return options?.unit ? `${formatted} ${options.unit}` : formatted;
}

export function clampPercent(value: number): number {
  if (value < 0) {
    return 0;
  }
  if (value > 100) {
    return 100;
  }
  return value;
}
