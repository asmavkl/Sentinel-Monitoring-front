import { describe, expect, it } from 'vitest';
import {
  getChangedWidgets,
  multiSeriesChartSourceError,
  toCreateRequest,
  toUpdateRequest,
} from './widgetDraft';
import { createStatusCardWidget } from '@/test/widgetFixtures';
import type { WidgetDataSourceDto } from '@/types/widgets';

describe('widgetDraft', () => {
  it('builds a create widget payload', () => {
    const payload = toCreateRequest({
      title: 'API Health',
      description: 'Primary API check',
      widgetType: 'StatusCard',
      layout: { x: 0, y: 0, width: 4, height: 2 },
      configuration: { showDuration: true },
      dataSources: [{ checkId: 101, metricName: undefined, displayOrder: 0 }],
    });

    expect(payload).toEqual({
      title: 'API Health',
      description: 'Primary API check',
      widgetType: 'StatusCard',
      dashboardSectionId: undefined,
      displayOrder: 0,
      layout: { x: 0, y: 0, width: 4, height: 2 },
      configuration: { showDuration: true },
      dataSources: [{ checkId: 101, dataSourceType: 'Metric', displayOrder: 0 }],
    });
  });

  it('builds a server widget payload without a check id', () => {
    const payload = toCreateRequest({
      title: 'CPU',
      widgetType: 'NumberCard',
      layout: { x: 0, y: 0, width: 4, height: 2 },
      configuration: {},
      server: true,
      dataSources: [{ serverMetricDefinitionId: 15, metricName: 'cpu.usage_percent', displayOrder: 0 }],
    });

    expect(payload.dataSources).toEqual([
      {
        serverMetricDefinitionId: 15,
        metricDefinitionId: 15,
        metricName: 'cpu.usage_percent',
        dataSourceType: 'Metric',
        displayOrder: 0,
      },
    ]);
    expect(payload.dataSources?.[0]).not.toHaveProperty('checkId');
  });

  it('detects changed widgets for save', () => {
    const original = createStatusCardWidget({ title: 'API Health' });
    const draft = createStatusCardWidget({
      title: 'Availability',
      layout: { x: 2, y: 1, width: 6, height: 2 },
    });

    const changed = getChangedWidgets([original], [draft]);

    expect(changed).toHaveLength(1);
    expect(toUpdateRequest(changed[0])).toMatchObject({
      title: 'Availability',
      layout: { x: 2, y: 1, width: 6, height: 2 },
    });
  });

  it('converts dashboardSectionId 0 to undefined in update request', () => {
    const widget = createStatusCardWidget({ sectionId: 0 });
    const request = toUpdateRequest(widget);

    expect(request.dashboardSectionId).toBeUndefined();
  });

  it('preserves valid dashboardSectionId in update request', () => {
    const widget = createStatusCardWidget({ sectionId: 5 });
    const request = toUpdateRequest(widget);

    expect(request.dashboardSectionId).toBe(5);
  });

  it('converts dashboardSectionId 0 to undefined in create request', () => {
    const payload = toCreateRequest({
      title: 'API Health',
      widgetType: 'StatusCard',
      dashboardSectionId: 0,
      layout: { x: 0, y: 0, width: 4, height: 2 },
      configuration: {},
      dataSources: [],
    });

    expect(payload.dashboardSectionId).toBeUndefined();
  });

  it('preserves valid dashboardSectionId in create request', () => {
    const payload = toCreateRequest({
      title: 'API Health',
      widgetType: 'StatusCard',
      dashboardSectionId: 5,
      layout: { x: 0, y: 0, width: 4, height: 2 },
      configuration: {},
      dataSources: [],
    });

    expect(payload.dashboardSectionId).toBe(5);
  });

  it('writes metricId from GET as metricDefinitionId and does not send metricId', () => {
    const payload = toCreateRequest({
      title: 'نمودار چند سری',
      widgetType: 'MultiSeriesChart',
      layout: { x: 0, y: 0, width: 8, height: 5 },
      configuration: {},
      dataSources: [
        { checkId: 44, metricId: 123, displayOrder: 0 } as WidgetDataSourceDto,
      ],
    });

    expect(payload.dataSources).toEqual([
      {
        checkId: 44,
        dataSourceType: 'Metric',
        metricDefinitionId: 123,
        displayOrder: 0,
      },
    ]);
    expect(payload.dataSources?.[0]).not.toHaveProperty('metricId');
  });

  it('prefers metricDefinitionId when both metric ids are present', () => {
    const payload = toCreateRequest({
      title: 'نمودار چند سری',
      widgetType: 'MultiSeriesChart',
      layout: { x: 0, y: 0, width: 8, height: 5 },
      configuration: {},
      dataSources: [
        {
          checkId: 44,
          metricDefinitionId: 9,
          metricId: 123,
          metricName: 'response_time',
          displayOrder: 0,
        } as WidgetDataSourceDto,
      ],
    });

    expect(payload.dataSources?.[0]).toMatchObject({
      metricDefinitionId: 9,
      metricName: 'response_time',
    });
  });

  it('accepts metricName when no metric id is available', () => {
    const payload = toCreateRequest({
      title: 'نمودار چند سری',
      widgetType: 'MultiSeriesChart',
      layout: { x: 0, y: 0, width: 8, height: 5 },
      configuration: {},
      dataSources: [{ checkId: 44, metricName: 'response_time', displayOrder: 0 }],
    });

    expect(payload.dataSources?.[0]).toEqual({
      checkId: 44,
      dataSourceType: 'Metric',
      metricName: 'response_time',
      displayOrder: 0,
    });
  });

  it('rejects a MultiSeriesChart data source that only has checkId', () => {
    expect(
      multiSeriesChartSourceError({
        widgetType: 'MultiSeriesChart',
        dataSources: [{ id: 1, checkId: 44, displayOrder: 0 }],
      }),
    ).toBeTruthy();

    expect(
      multiSeriesChartSourceError({
        widgetType: 'MultiSeriesChart',
        dataSources: [{ id: 1, checkId: 44, metricId: 123, displayOrder: 0 }],
      }),
    ).toBeNull();
  });
});
