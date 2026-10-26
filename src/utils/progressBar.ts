import type { WidgetConfiguration, WidgetDataSourceDto } from '@/types/widgets';

export interface ProgressBarItemConfiguration {
  checkId?: number;
  serverMetricDefinitionId?: number;
  metricDefinitionId?: number;
  metricName?: string;
  min: number;
  max: number;
  warning: number | null;
  critical: number | null;
  unit: string;
}

export interface ProgressBarConfiguration {
  decimalPlaces: number;
  bars: ProgressBarItemConfiguration[];
}

export const defaultProgressBarItem: ProgressBarItemConfiguration = {
  min: 0,
  max: 100,
  warning: 70,
  critical: 90,
  unit: '',
};

const defaultProgressBarConfiguration: ProgressBarConfiguration = {
  decimalPlaces: 1,
  bars: [],
};

function readNumber(value: unknown, fallback: number): number {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return fallback;
}

function readOptionalNumber(value: unknown): number | null {
  if (value == null || value === '') {
    return null;
  }

  const parsed = readNumber(value, Number.NaN);
  return Number.isFinite(parsed) ? parsed : null;
}

function readString(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

function readBar(value: unknown): ProgressBarItemConfiguration {
  if (value == null || typeof value !== 'object') {
    return { ...defaultProgressBarItem };
  }

  const bar = value as Record<string, unknown>;
  const min = readNumber(bar.min, defaultProgressBarItem.min);
  const max = readNumber(bar.max, defaultProgressBarItem.max);

  return {
    checkId: typeof bar.checkId === 'number' ? bar.checkId : undefined,
    serverMetricDefinitionId: typeof bar.serverMetricDefinitionId === 'number' ? bar.serverMetricDefinitionId : undefined,
    metricDefinitionId: typeof bar.metricDefinitionId === 'number' ? bar.metricDefinitionId : undefined,
    metricName: typeof bar.metricName === 'string' ? bar.metricName : undefined,
    min,
    max,
    warning: readOptionalNumber(bar.warning),
    critical: readOptionalNumber(bar.critical),
    unit: readString(bar.unit),
  };
}

export function parseProgressBarConfiguration(
  configuration?: WidgetConfiguration | null,
): ProgressBarConfiguration {
  const config = configuration ?? {};
  const bars = Array.isArray(config.bars) ? config.bars.map(readBar) : [];

  return {
    decimalPlaces: Math.max(0, readNumber(config.decimalPlaces, defaultProgressBarConfiguration.decimalPlaces)),
    bars,
  };
}

export function barScale(bar: ProgressBarItemConfiguration | undefined): ProgressBarItemConfiguration {
  return {
    ...defaultProgressBarItem,
    ...bar,
    warning: bar?.warning ?? defaultProgressBarItem.warning,
    critical: bar?.critical ?? defaultProgressBarItem.critical,
    unit: bar?.unit ?? '',
  };
}

export function findBarConfiguration(
  bars: ProgressBarItemConfiguration[],
  source: Pick<WidgetDataSourceDto, 'checkId' | 'serverMetricDefinitionId' | 'metricDefinitionId' | 'metricId' | 'metricName'>,
  index: number,
): ProgressBarItemConfiguration {
  const metricId = source.serverMetricDefinitionId ?? source.metricDefinitionId ?? source.metricId ?? null;
  const matched = bars.find((bar) => {
    if (bar.checkId != null && source.checkId != null && bar.checkId !== source.checkId) {
      return false;
    }

    if (bar.serverMetricDefinitionId != null && source.serverMetricDefinitionId != null) {
      return bar.serverMetricDefinitionId === source.serverMetricDefinitionId;
    }

    if (bar.metricDefinitionId != null && metricId != null) {
      return bar.metricDefinitionId === metricId;
    }

    if (bar.metricName && source.metricName) {
      return bar.metricName === source.metricName;
    }

    return false;
  });

  return barScale(matched ?? bars[index]);
}

export function barPercent(value: number, min: number, max: number): number {
  if (!Number.isFinite(value) || max <= min) {
    return 0;
  }

  const ratio = ((value - min) / (max - min)) * 100;
  return Math.min(100, Math.max(0, ratio));
}

export type ProgressBarTone = 'success' | 'warning' | 'error';

export function barTone(value: number, bar: ProgressBarItemConfiguration): ProgressBarTone {
  const warning = bar.warning ?? bar.min + (bar.max - bar.min) * 0.7;
  const critical = bar.critical ?? bar.min + (bar.max - bar.min) * 0.9;

  if (value >= critical) {
    return 'error';
  }

  if (value >= warning) {
    return 'warning';
  }

  return 'success';
}
