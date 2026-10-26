import type { WidgetType } from '@/types/widgets';
import type { WidgetConfiguration } from '@/types/widgets';
import {
  METRIC_AGGREGATION_OPTIONS,
  METRIC_TIME_RANGE_OPTIONS,
  readAggregation,
  readMetricTimeRange,
} from '@/utils/metricWidget';

export function readTimeRange(configuration: WidgetConfiguration): string {
  return readMetricTimeRange(configuration);
}

export const CHART_TYPE_OPTIONS = ['line', 'bar', 'area', 'pie'] as const;
/** @deprecated Prefer METRIC_TIME_RANGE_OPTIONS for metric widgets; kept for legacy configs. */
export const TIME_RANGE_OPTIONS = ['1h', '6h', '24h', '7d', '30d'] as const;
export const VALUE_FORMAT_OPTIONS = ['number', 'percent', 'duration'] as const;
export const PAGE_SIZE_OPTIONS = [5, 10, 20, 25, 50] as const;
export const AGGREGATION_OPTIONS = METRIC_AGGREGATION_OPTIONS;
export const METRIC_WIDGET_TIME_RANGE_OPTIONS = METRIC_TIME_RANGE_OPTIONS;

export const CHART_TYPE_LABELS: Record<string, string> = {
  line: 'خطی',
  bar: 'ستونی',
  area: 'سطحی',
  pie: 'دایره ای',
};

export const TIME_RANGE_LABELS: Record<string, string> = {
  '1h': '۱ ساعت اخیر',
  '6h': '۶ ساعت',
  '24h': '۲۴ ساعت اخیر',
  '7d': '۷ روز اخیر',
  '30d': '۳۰ روز',
};

export const AGGREGATION_LABELS: Record<string, string> = {
  Latest: 'آخرین مقدار',
  Average: 'میانگین',
  Min: 'حداقل',
  Max: 'حداکثر',
  Sum: 'مجموع',
};

export const VALUE_FORMAT_LABELS: Record<string, string> = {
  number: 'عدد',
  percent: 'درصد',
  duration: 'مدت',
};

export const REFRESH_INTERVAL_OPTIONS = [
  { value: null, label: 'پیش‌فرض داشبورد' },
  { value: 30_000, label: '۳۰ ثانیه' },
  { value: 60_000, label: '۱ دقیقه' },
  { value: 300_000, label: '۵ دقیقه' },
  { value: 900_000, label: '۱۵ دقیقه' },
] as const;

export type ChartTypeOption = (typeof CHART_TYPE_OPTIONS)[number];
export type TimeRangeOption = (typeof TIME_RANGE_OPTIONS)[number];
export type ValueFormatOption = (typeof VALUE_FORMAT_OPTIONS)[number];

export function isMetricConfigurableWidget(widgetType: WidgetType): boolean {
  return widgetType === 'Chart' || widgetType === 'NumberCard' || widgetType === 'Gauge';
}

export function getDefaultConfiguration(widgetType: WidgetType): WidgetConfiguration {
  switch (widgetType) {
    case 'StatusCard':
      return { showDuration: true };
    case 'Chart':
      return {
        chartType: 'line',
        showLegend: true,
        timeRange: '24h',
      };
    case 'NumberCard':
      return {
        valueFormat: '0.00',
        showTrend: true,
      };
    case 'Table':
      return {
        showPagination: true,
        pageSize: 10,
      };
    case 'Gauge':
      return {
        min: 0,
        max: 100,
        unit: '',
        decimalPlaces: 0,
      };
    case 'ProgressBar':
      return {
        decimalPlaces: 1,
        bars: [],
      };
    default:
      return {};
  }
}

export function getDefaultTitle(widgetType: WidgetType): string {
  switch (widgetType) {
    case 'StatusCard':
      return 'کارت وضعیت';
    case 'NumberCard':
      return 'کارت عددی';
    case 'Chart':
      return 'نمودار';
    case 'Table':
      return 'جدول';
    case 'Gauge':
      return 'گیج';
    case 'ProgressBar':
      return 'نوار پیشرفت';
    case 'MultiSeriesChart':
      return 'نمودار چند سری';
    default:
      return widgetType;
  }
}

function readBoolean(value: unknown, fallback: boolean): boolean {
  return typeof value === 'boolean' ? value : fallback;
}

function readString(value: unknown, fallback: string): string {
  return typeof value === 'string' && value.length > 0 ? value : fallback;
}

function readNumber(value: unknown, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

export function readShowDuration(configuration: WidgetConfiguration): boolean {
  return readBoolean(configuration.showDuration, true);
}

export function readChartType(configuration: WidgetConfiguration): string {
  return readString(configuration.chartType, 'line');
}

export function readShowLegend(configuration: WidgetConfiguration): boolean {
  return readBoolean(configuration.showLegend, true);
}

export function readAggregationOption(configuration: WidgetConfiguration): string {
  return readAggregation(configuration);
}

export function readValueFormat(configuration: WidgetConfiguration): string {
  return readString(configuration.valueFormat, 'number');
}

export function readShowTrend(configuration: WidgetConfiguration): boolean {
  return readBoolean(configuration.showTrend, true);
}

export function readShowPagination(configuration: WidgetConfiguration): boolean {
  return readBoolean(configuration.showPagination, true);
}

export function readPageSize(configuration: WidgetConfiguration): number {
  return readNumber(configuration.pageSize, 20);
}

export function readRefreshIntervalOption(configuration: WidgetConfiguration): number | null {
  const value = configuration.refreshInterval;
  if (typeof value === 'number' && Number.isFinite(value) && value > 0) {
    return value;
  }
  return null;
}

export function withCurrentOption(options: readonly string[], current: string): string[] {
  if (current && !options.includes(current)) {
    return [...options, current];
  }

  return [...options];
}
