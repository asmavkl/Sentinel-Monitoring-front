import type { WidgetConfiguration } from '@/types/widgets';
import type { DataSourceType } from '@/types/widgets';

export function readDataSourceType(configuration: WidgetConfiguration): DataSourceType {
  const value = configuration.dataSourceType;
  if (value === 'Metric' || value === 'Dataset') {
    return value;
  }
  return 'Metric';
}

export function readTimeColumn(configuration: WidgetConfiguration): string | undefined {
  return typeof configuration.timeColumn === 'string' ? configuration.timeColumn : undefined;
}

export function readValueColumns(configuration: WidgetConfiguration): string[] {
  const value = configuration.valueColumns;
  if (Array.isArray(value) && value.every((item) => typeof item === 'string')) {
    return value;
  }
  return [];
}

export function readDatasetTake(configuration: WidgetConfiguration): number | undefined {
  const value = configuration.take;
  return typeof value === 'number' && value > 0 ? value : undefined;
}
