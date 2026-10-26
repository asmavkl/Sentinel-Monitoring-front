import { describe, expect, it } from 'vitest';
import { AggregationType, ApplicationHealthStatus, MetricType } from '@/types/enums';
import type { ServerMetricDefinitionDto, ServerStatusMetricDto } from '@/types/monitoredServers';
import { buildMetricViews, groupMetricViews, metricCaption } from './metricGroups';

function definition(
  partial: Partial<ServerMetricDefinitionDto> & Pick<ServerMetricDefinitionDto, 'id' | 'name'>,
): ServerMetricDefinitionDto {
  return {
    monitoredServerId: 4,
    displayName: partial.name,
    description: null,
    instanceKey: null,
    metricType: MetricType.Number,
    unit: null,
    aggregationType: AggregationType.Latest,
    isVisible: true,
    ...partial,
  };
}

describe('groupMetricViews', () => {
  it('groups disk instances and keeps network counters as cumulative bytes', () => {
    const definitions = [
      definition({ id: 1, name: 'cpu.usage_percent', displayName: 'CPU Usage', unit: '%' }),
      definition({
        id: 2,
        name: 'disk.C.usage_percent',
        displayName: 'Usage',
        instanceKey: 'C:\\',
        unit: '%',
      }),
      definition({
        id: 3,
        name: 'network.Ethernet.bytes_received',
        displayName: 'Bytes Received',
        instanceKey: 'Ethernet',
        metricType: MetricType.Count,
        unit: 'bytes',
      }),
    ];
    const snapshots: ServerStatusMetricDto[] = [
      {
        metricDefinitionId: 1,
        name: 'cpu.usage_percent',
        displayName: 'CPU Usage',
        instanceKey: null,
        unit: '%',
        value: 90,
        timestamp: '2026-09-28T10:00:00Z',
        healthStatus: ApplicationHealthStatus.Critical,
      },
      {
        metricDefinitionId: 2,
        name: 'disk.C.usage_percent',
        displayName: 'Usage',
        instanceKey: 'C:\\',
        unit: '%',
        value: 40,
        timestamp: '2026-09-28T10:00:00Z',
        healthStatus: ApplicationHealthStatus.Normal,
      },
      {
        metricDefinitionId: 3,
        name: 'network.Ethernet.bytes_received',
        displayName: 'Bytes Received',
        instanceKey: 'Ethernet',
        unit: 'bytes',
        value: 1000,
        timestamp: '2026-09-28T10:00:00Z',
        healthStatus: ApplicationHealthStatus.Unknown,
      },
    ];

    const views = buildMetricViews(definitions, snapshots);
    const groups = groupMetricViews(views);

    expect(groups.map((group) => group.id)).toEqual(['cpu', 'disk', 'network']);
    expect(groups[1]?.instances[0]?.instanceKey).toBe('C:\\');
    expect(metricCaption('network.Ethernet.bytes_received')).toContain('نرخ نیست');
    expect(metricCaption('cpu.usage_percent')).toContain('یک‌دقیقه‌ای');
    expect(views.find((view) => view.id === 1)?.healthStatus).toBe(ApplicationHealthStatus.Critical);
    expect(views.find((view) => view.id === 2)?.healthStatus).toBe(ApplicationHealthStatus.Normal);
    expect(views.find((view) => view.id === 3)?.healthStatus).toBe(ApplicationHealthStatus.Unknown);
  });
});
