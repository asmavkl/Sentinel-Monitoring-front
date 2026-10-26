import { ApplicationHealthStatus } from '@/types/enums';
import type { ServerMetricDefinitionDto, ServerStatusMetricDto } from '@/types/monitoredServers';

export type MetricGroupId = 'system' | 'cpu' | 'memory' | 'disk' | 'network' | 'other';

export interface MetricView {
  id: number;
  name: string;
  displayName: string;
  description: string | null;
  instanceKey: string | null;
  unit: string | null;
  value: number | null;
  timestamp: string | null;
  healthStatus: ApplicationHealthStatus;
}

export interface MetricInstanceGroup {
  instanceKey: string | null;
  metrics: MetricView[];
}

export interface MetricGroup {
  id: MetricGroupId;
  label: string;
  instances: MetricInstanceGroup[];
}

const GROUP_LABELS: Record<MetricGroupId, string> = {
  system: 'سیستم',
  cpu: 'پردازنده',
  memory: 'حافظه',
  disk: 'دیسک',
  network: 'شبکه',
  other: 'سایر',
};

const GROUP_ORDER: MetricGroupId[] = ['system', 'cpu', 'memory', 'disk', 'network', 'other'];

export function getMetricGroupId(name: string): MetricGroupId {
  if (name.startsWith('system.')) {
    return 'system';
  }
  if (name.startsWith('cpu.')) {
    return 'cpu';
  }
  if (name.startsWith('memory.')) {
    return 'memory';
  }
  if (name.startsWith('disk.')) {
    return 'disk';
  }
  if (name.startsWith('network.')) {
    return 'network';
  }
  return 'other';
}

export function networkCounterCaption(name: string): string | null {
  if (name.endsWith('.bytes_received') || name.endsWith('bytes_received')) {
    return 'بایت دریافت‌شده از شروع شمارنده. این مقدار نرخ نیست.';
  }
  if (name.endsWith('.bytes_sent') || name.endsWith('bytes_sent')) {
    return 'بایت ارسال‌شده از شروع شمارنده. این مقدار نرخ نیست.';
  }
  return null;
}

export function metricCaption(name: string): string | null {
  if (name === 'cpu.usage_percent') {
    return 'میانگین یک‌دقیقه‌ای است و نمونه لحظه‌ای نیست.';
  }
  return networkCounterCaption(name);
}

export function buildMetricViews(
  definitions: ServerMetricDefinitionDto[],
  snapshots: ServerStatusMetricDto[],
): MetricView[] {
  const byId = new Map(snapshots.map((snapshot) => [snapshot.metricDefinitionId, snapshot]));
  const seen = new Set<number>();
  const views: MetricView[] = [];

  for (const definition of definitions) {
    if (!definition.isVisible) {
      seen.add(definition.id);
      continue;
    }

    seen.add(definition.id);
    const latest = byId.get(definition.id);
    views.push({
      id: definition.id,
      name: definition.name,
      displayName: definition.displayName || latest?.displayName || definition.name,
      description: definition.description,
      instanceKey: definition.instanceKey,
      unit: definition.unit ?? latest?.unit ?? null,
      value: latest?.value ?? null,
      timestamp: latest?.timestamp ?? null,
      healthStatus: latest?.healthStatus ?? ApplicationHealthStatus.Unknown,
    });
  }

  for (const snapshot of snapshots) {
    if (seen.has(snapshot.metricDefinitionId)) {
      continue;
    }

    views.push({
      id: snapshot.metricDefinitionId,
      name: snapshot.name,
      displayName: snapshot.displayName || snapshot.name,
      description: null,
      instanceKey: snapshot.instanceKey,
      unit: snapshot.unit,
      value: snapshot.value,
      timestamp: snapshot.timestamp,
      healthStatus: snapshot.healthStatus,
    });
  }

  return views;
}

export function groupMetricViews(views: MetricView[]): MetricGroup[] {
  const grouped = new Map<MetricGroupId, Map<string, MetricView[]>>();

  for (const view of views) {
    const groupId = getMetricGroupId(view.name);
    const instanceKey = view.instanceKey ?? '';
    const instances = grouped.get(groupId) ?? new Map<string, MetricView[]>();
    const metrics = instances.get(instanceKey) ?? [];
    metrics.push(view);
    instances.set(instanceKey, metrics);
    grouped.set(groupId, instances);
  }

  return GROUP_ORDER.flatMap((id) => {
    const instances = grouped.get(id);
    if (!instances || instances.size === 0) {
      return [];
    }

    return [
      {
        id,
        label: GROUP_LABELS[id],
        instances: [...instances.entries()].map(([key, metrics]) => ({
          instanceKey: key || null,
          metrics,
        })),
      },
    ];
  });
}
