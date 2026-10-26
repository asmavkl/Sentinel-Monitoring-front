import type { WidgetConfiguration } from '@/types/widgets';

export interface StatusCardConfiguration {
  showDuration: boolean;
}

export interface ChartWidgetConfiguration {
  chartType: 'line' | 'bar';
  showLegend: boolean;
}

export interface NumberCardConfiguration {
  valueKey?: 'totalCount' | 'successCount' | 'failedCount' | 'successRate';
}

export interface GaugeConfiguration {
  min: number;
  max: number;
  unit: string;
  decimalPlaces: number;
}

const defaultStatusCardConfiguration: StatusCardConfiguration = {
  showDuration: true,
};

const defaultChartConfiguration: ChartWidgetConfiguration = {
  chartType: 'line',
  showLegend: true,
};

const defaultGaugeConfiguration: GaugeConfiguration = {
  min: 0,
  max: 100,
  unit: '',
  decimalPlaces: 0,
};

function readBoolean(value: unknown, fallback: boolean): boolean {
  return typeof value === 'boolean' ? value : fallback;
}

function readString(value: unknown): string | undefined {
  return typeof value === 'string' ? value : undefined;
}

function readNumber(value: unknown, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

export function parseWidgetConfiguration(
  configuration?: WidgetConfiguration | null,
): WidgetConfiguration {
  return configuration ?? {};
}

export function parseStatusCardConfiguration(
  configuration?: WidgetConfiguration | null,
): StatusCardConfiguration {
  const config = parseWidgetConfiguration(configuration);

  return {
    showDuration: readBoolean(config.showDuration, defaultStatusCardConfiguration.showDuration),
  };
}

export function parseChartConfiguration(
  configuration?: WidgetConfiguration | null,
): ChartWidgetConfiguration {
  const config = parseWidgetConfiguration(configuration);
  const chartType = readString(config.chartType);

  return {
    chartType: chartType === 'bar' ? 'bar' : defaultChartConfiguration.chartType,
    showLegend: readBoolean(config.showLegend, defaultChartConfiguration.showLegend),
  };
}

export function parseNumberCardConfiguration(
  configuration?: WidgetConfiguration | null,
): NumberCardConfiguration {
  const config = parseWidgetConfiguration(configuration);
  const valueKey = readString(config.valueKey);

  if (
    valueKey === 'totalCount' ||
    valueKey === 'successCount' ||
    valueKey === 'failedCount' ||
    valueKey === 'successRate'
  ) {
    return { valueKey };
  }

  return {};
}

export function parseGaugeConfiguration(
  configuration?: WidgetConfiguration | null,
): GaugeConfiguration {
  const config = parseWidgetConfiguration(configuration);

  return {
    min: readNumber(config.min, defaultGaugeConfiguration.min),
    max: readNumber(config.max, defaultGaugeConfiguration.max),
    unit: readString(config.unit) ?? defaultGaugeConfiguration.unit,
    decimalPlaces: readNumber(config.decimalPlaces, defaultGaugeConfiguration.decimalPlaces),
  };
}
