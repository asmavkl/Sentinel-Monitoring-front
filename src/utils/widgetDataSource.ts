import type { WidgetDataSourceDto } from '@/types/widgets';
import type { CheckStatusDto } from '@/types/dashboard';

export function sortDataSources(dataSources: WidgetDataSourceDto[]): WidgetDataSourceDto[] {
  return [...dataSources].sort(
    (left, right) => (left.displayOrder ?? 0) - (right.displayOrder ?? 0),
  );
}

export function getPrimaryDataSource(
  dataSources: WidgetDataSourceDto[],
): WidgetDataSourceDto | undefined {
  return sortDataSources(dataSources)[0];
}

export function isServerDataSource(source: WidgetDataSourceDto | undefined | null): boolean {
  if (source == null) {
    return false;
  }

  const metricId = source.serverMetricDefinitionId ?? 0;
  return metricId > 0 && (source.checkId == null || source.checkId <= 0);
}

export function getPrimaryCheckId(dataSources: WidgetDataSourceDto[]): number | null {
  const source = sortDataSources(dataSources).find((item) => item.checkId != null);
  return source?.checkId ?? null;
}

export interface ServerMetricSourceRef {
  id: number;
  label: string;
}

export function getServerMetricSources(dataSources: WidgetDataSourceDto[]): ServerMetricSourceRef[] {
  const sources: ServerMetricSourceRef[] = [];

  for (const source of sortDataSources(dataSources)) {
    if (!isServerDataSource(source)) {
      continue;
    }

    const id = source.serverMetricDefinitionId ?? 0;
    if (id <= 0 || sources.some((item) => item.id === id)) {
      continue;
    }

    sources.push({
      id,
      label: source.metricDisplayName || source.metricName || `متریک ${id}`,
    });
  }

  return sources;
}

export function getPrimaryMetricId(dataSources: WidgetDataSourceDto[]): number | null {
  const source = getPrimaryDataSource(dataSources);
  const metricId = source?.metricDefinitionId ?? source?.metricId ?? null;
  return metricId != null && metricId > 0 ? metricId : null;
}

export function getPrimaryStatus(dataSources: WidgetDataSourceDto[]): CheckStatusDto | null {
  const source = getPrimaryDataSource(dataSources);
  return source?.status ?? null;
}

export function getCheckIds(dataSources: WidgetDataSourceDto[]): number[] {
  return sortDataSources(dataSources)
    .map((source) => source.checkId)
    .filter((checkId): checkId is number => checkId != null);
}

export function getWidgetLastUpdatedAt(dataSources: WidgetDataSourceDto[]): string | number | Date | null {
  const status = getPrimaryStatus(dataSources);
  if (status?.lastExecutionTime) {
    return status.lastExecutionTime;
  }

  // Fallback to null
  return null;
}
