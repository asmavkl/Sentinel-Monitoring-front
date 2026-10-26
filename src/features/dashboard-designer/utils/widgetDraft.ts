import type { CreateWidgetRequestDto, UpdateWidgetRequestDto, WidgetDto } from '@/types/dashboard';
import type { WidgetDataSourceDto, WidgetDataSourceRequestDto, WidgetType } from '@/types/widgets';
import { toApiWidgetType } from '@/types/widgets';
import { parseWidgetLayout } from '@/utils/widgetLayout';

const MULTI_SERIES_METRIC_ERROR =
  'برای نمودار چند سری، منبع داده باید از نوع Metric باشد و metricDefinitionId یا metricName داشته باشد.';

export function hasMetricIdentity(
  source: Pick<WidgetDataSourceDto, 'metricDefinitionId' | 'metricId' | 'metricName'>,
): boolean {
  const metricId = source.metricDefinitionId ?? source.metricId ?? null;
  if (typeof metricId === 'number' && metricId > 0) {
    return true;
  }

  return typeof source.metricName === 'string' && source.metricName.trim().length > 0;
}

const PROGRESS_BAR_METRIC_ERROR =
  'برای نوار پیشرفت، هر منبع داده باید یک متریک باشد.';

export function progressBarSourceError(
  widget: Pick<WidgetDto, 'widgetType' | 'dataSources'>,
): string | null {
  if (widget.widgetType !== 'ProgressBar') {
    return null;
  }

  const sources = widget.dataSources ?? [];
  if (sources.length === 0 || sources.some((source) => !hasMetricIdentity(source))) {
    return PROGRESS_BAR_METRIC_ERROR;
  }

  return null;
}

export function multiSeriesChartSourceError(
  widget: Pick<WidgetDto, 'widgetType' | 'dataSources'>,
): string | null {
  if (widget.widgetType !== 'MultiSeriesChart') {
    return null;
  }

  const sources = widget.dataSources ?? [];
  if (sources.length === 0 || sources.some((source) => !hasMetricIdentity(source))) {
    return MULTI_SERIES_METRIC_ERROR;
  }

  return null;
}

export function cloneWidgets(widgets: WidgetDto[]): WidgetDto[] {
  return widgets.map((widget) => ({
    ...widget,
    sectionId: widget.sectionId ?? null,
    layout: parseWidgetLayout(widget.layout),
    configuration: { ...(widget.configuration ?? {}) },
    dataSources: widget.dataSources.map((source) => ({ ...source })),
  }));
}

export function toDataSourceRequests(
  dataSources: Array<WidgetDataSourceDto | WidgetDataSourceRequestDto>,
  options?: { server?: boolean },
): WidgetDataSourceRequestDto[] {
  return dataSources.map((source, index) => {
    if (options?.server) {
      const serverMetricDefinitionId =
        source.serverMetricDefinitionId ??
        (source as WidgetDataSourceDto).metricDefinitionId ??
        (source as WidgetDataSourceDto).metricId ??
        undefined;

      return {
        serverMetricDefinitionId,
        metricDefinitionId: serverMetricDefinitionId,
        metricName:
          typeof source.metricName === 'string' && source.metricName.trim().length > 0
            ? source.metricName
            : undefined,
        dataSourceType: 'Metric' as const,
        displayOrder: source.displayOrder ?? index,
      };
    }

    const metricDefinitionId =
      (source as WidgetDataSourceDto).metricDefinitionId ??
      (source as WidgetDataSourceDto).metricId ??
      undefined;
    const metricName =
      typeof source.metricName === 'string' && source.metricName.trim().length > 0
        ? source.metricName
        : undefined;

    const request: WidgetDataSourceRequestDto = {
      checkId: source.checkId ?? 0,
      dataSourceType: (source as WidgetDataSourceRequestDto).dataSourceType ?? (source as WidgetDataSourceDto).dataSourceType ?? 'Metric',
      displayOrder: source.displayOrder ?? index,
    };

    if (source.applicationId != null) {
      request.applicationId = source.applicationId;
    }

    if (typeof metricDefinitionId === 'number' && metricDefinitionId > 0) {
      request.metricDefinitionId = metricDefinitionId;
    }

    if (metricName != null) {
      request.metricName = metricName;
    }

    return request;
  });
}

export function toUpdateRequest(
  widget: WidgetDto,
  originalWidget?: WidgetDto,
  options?: { server?: boolean },
): UpdateWidgetRequestDto {
  const request: UpdateWidgetRequestDto = {
    title: widget.title,
    widgetType: toApiWidgetType(widget.widgetType),
    layout: parseWidgetLayout(widget.layout),
    configuration: widget.configuration ?? {},
  };

  if (widget.description !== undefined && widget.description !== null) {
    request.description = widget.description;
  }

  if (widget.sectionId !== undefined && widget.sectionId !== null && widget.sectionId !== 0) {
    request.dashboardSectionId = widget.sectionId;
  }

  if (widget.displayOrder !== undefined || widget.order !== undefined) {
    request.displayOrder = widget.displayOrder ?? widget.order ?? 0;
  }

  // Only send dataSources if they actually changed
  if (!originalWidget || JSON.stringify(widget.dataSources) !== JSON.stringify(originalWidget.dataSources)) {
    request.dataSources = toDataSourceRequests(widget.dataSources, options);
  }

  return request;
}

export function toCreateRequest(input: {
  title: string;
  description?: string;
  widgetType: WidgetType;
  dashboardSectionId?: number;
  layout: WidgetDto['layout'];
  configuration: WidgetDto['configuration'];
  dataSources: Array<WidgetDataSourceDto | WidgetDataSourceRequestDto>;
  displayOrder?: number;
  server?: boolean;
}): CreateWidgetRequestDto {
  return {
    title: input.title,
    widgetType: toApiWidgetType(input.widgetType),
    displayOrder: input.displayOrder ?? 0,
    description: input.description || undefined,
    dashboardSectionId: input.dashboardSectionId && input.dashboardSectionId !== 0 ? input.dashboardSectionId : undefined,
    layout: parseWidgetLayout(input.layout),
    configuration: input.configuration ?? {},
    dataSources: toDataSourceRequests(input.dataSources, { server: input.server }),
  };
}

export function getChangedWidgets(baseline: WidgetDto[], draft: WidgetDto[]): WidgetDto[] {
  const baselineById = new Map(baseline.map((widget) => [widget.id, widget]));

  return draft.filter((widget) => {
    const original = baselineById.get(widget.id);
    if (!original) {
      return false;
    }

    return JSON.stringify(toUpdateRequest(original, original)) !== JSON.stringify(toUpdateRequest(widget, original));
  });
}
