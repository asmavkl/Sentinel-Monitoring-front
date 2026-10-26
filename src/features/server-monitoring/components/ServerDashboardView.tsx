import { Stack } from '@mui/material';
import { useState } from 'react';
import { EmptyState } from '@/components/common';
import { DashboardLayoutRenderer } from '@/components/widgets';
import type { DashboardLayoutDto, WidgetDto } from '@/types/dashboard';
import type { WidgetDataSourceDto } from '@/types/widgets';
import { ApplicationHealthStatus } from '@/types/enums';
import type { MetricView } from '../utils/metricGroups';
import { ServerMetricDetailDialog } from './ServerMetricDetailDialog';

interface ServerDashboardViewProps {
  serverId: number;
  metrics: MetricView[];
  onConfigureCriteria: (metric: MetricView) => void;
  onConfigureAlert: (metric: MetricView) => void;
}

function findMetricByName(metrics: MetricView[], namePattern: string): MetricView | undefined {
  return metrics.find((m) => m.name.includes(namePattern));
}

function buildDefaultDashboardLayout(serverId: number, metrics: MetricView[]): DashboardLayoutDto {
  const cpuMetric = findMetricByName(metrics, 'cpu.usage_percent');
  const memoryMetric = findMetricByName(metrics, 'memory.usage_percent');
  const diskMetrics = metrics.filter((m) => m.name.includes('disk.') && m.name.includes('.usage_percent'));

  const widgets: WidgetDto[] = [];

  // CPU Gauge widget
  if (cpuMetric) {
    const dataSource: WidgetDataSourceDto = {
      id: -1,
      checkId: null,
      checkName: null,
      applicationId: null,
      monitoredServerId: serverId,
      serverMetricDefinitionId: cpuMetric.id,
      metricName: cpuMetric.name,
      metricDisplayName: cpuMetric.displayName,
      metricId: cpuMetric.id,
      value: cpuMetric.value,
      timestamp: cpuMetric.timestamp,
      healthStatus: cpuMetric.healthStatus,
      history: null,
      displayOrder: 0,
      status: null,
    };

    widgets.push({
      id: -1,
      dashboardId: 0,
      dashboardSectionId: 0,
      title: 'درصد استفاده از پردازنده',
      description: null,
      widgetType: 'Gauge',
      displayOrder: 1,
      layout: { x: 0, y: 0, width: 3, height: 3 },
      configuration: {
        min: 0,
        max: 100,
        unit: '%',
        decimalPlaces: 2,
      },
      dataSources: [dataSource],
    });
  }

  // Memory Gauge widget
  if (memoryMetric) {
    const dataSource: WidgetDataSourceDto = {
      id: -2,
      checkId: null,
      checkName: null,
      applicationId: null,
      monitoredServerId: serverId,
      serverMetricDefinitionId: memoryMetric.id,
      metricName: memoryMetric.name,
      metricDisplayName: memoryMetric.displayName,
      metricId: memoryMetric.id,
      value: memoryMetric.value,
      timestamp: memoryMetric.timestamp,
      healthStatus: memoryMetric.healthStatus,
      history: null,
      displayOrder: 0,
      status: null,
    };

    widgets.push({
      id: -2,
      dashboardId: 0,
      dashboardSectionId: 0,
      title: 'مصرف حافظه',
      description: null,
      widgetType: 'Gauge',
      displayOrder: 2,
      layout: { x: 3, y: 0, width: 3, height: 3 },
      configuration: {
        min: 0,
        max: 100,
        unit: '%',
        decimalPlaces: 2,
      },
      dataSources: [dataSource],
    });
  }

  // Disk ProgressBar widget
  if (diskMetrics.length > 0) {
    const bars = diskMetrics.map((metric) => ({
      serverMetricDefinitionId: metric.id,
      metricDefinitionId: metric.id,
      metricName: metric.name,
      min: 0,
      max: 100,
      warning: 70,
      critical: 90,
      unit: '%',
    }));

    const dataSources: WidgetDataSourceDto[] = diskMetrics.map((metric, index) => ({
      id: -3 - index,
      checkId: null,
      checkName: null,
      applicationId: null,
      monitoredServerId: serverId,
      serverMetricDefinitionId: metric.id,
      metricName: metric.name,
      metricDisplayName: metric.displayName,
      metricId: metric.id,
      value: metric.value,
      timestamp: metric.timestamp,
      healthStatus: metric.healthStatus,
      history: null,
      displayOrder: index,
      status: null,
    }));

    widgets.push({
      id: -3,
      dashboardId: 0,
      dashboardSectionId: 0,
      title: 'مصرف فضای دیسک',
      description: null,
      widgetType: 'ProgressBar',
      displayOrder: 1,
      layout: { x: 6, y: 0, width: 6, height: 4 },
      configuration: {
        decimalPlaces: 2,
        bars,
      },
      dataSources,
    });
  }

  return {
    id: 0,
    dashboardId: 0,
    applicationId: 0,
    monitoredServerId: serverId,
    title: 'Default Server Dashboard',
    name: 'Default Server Dashboard',
    sections: [
      {
        id: 0,
        title: 'بخش اصلی',
        description: null,
        color: 'blue',
        displayOrder: 1,
        isVisible: true,
        widgets,
      },
    ],
    widgets,
  };
}

export function ServerDashboardView({
  serverId,
  metrics,
  onConfigureCriteria,
  onConfigureAlert,
}: ServerDashboardViewProps) {
  const [detailMetric, setDetailMetric] = useState<MetricView | null>(null);

  const metricViews = metrics;
  const defaultLayout = buildDefaultDashboardLayout(serverId, metricViews);

  const resolveMetricView = (metricDefinitionId: number): MetricView => {
    const metric = metricViews.find((item) => item.id === metricDefinitionId);
    if (metric) {
      return metric;
    }

    const source = defaultLayout.sections
      .flatMap((section) => section.widgets ?? [])
      .flatMap((widget) => widget.dataSources ?? [])
      .find((item) => item.serverMetricDefinitionId === metricDefinitionId);

    return {
      id: metricDefinitionId,
      name: source?.metricName ?? '',
      displayName: source?.metricDisplayName || source?.metricName || `متریک ${metricDefinitionId}`,
      description: null,
      instanceKey: null,
      unit: null,
      value: source?.value ?? null,
      timestamp: source?.timestamp ?? null,
      healthStatus: source?.healthStatus ?? ApplicationHealthStatus.Unknown,
    };
  };

  return (
    <Stack spacing={2} data-testid="server-dashboard">
      {metrics.length === 0 ? (
        <EmptyState
          title="هنوز متریکی جمع نشده است"
          description="بعد از اولین جمع‌آوری موفق SNMP، داشبورد پیش‌فرض نمایش داده می‌شود."
        />
      ) : (
        <DashboardLayoutRenderer
          layout={defaultLayout}
          onConfigureServerMetric={(metricDefinitionId) => {
            onConfigureCriteria(resolveMetricView(metricDefinitionId));
          }}
          onConfigureServerAlert={(metricDefinitionId) => {
            onConfigureAlert(resolveMetricView(metricDefinitionId));
          }}
          onOpenServerMetricDetails={(metricDefinitionId) => {
            setDetailMetric(resolveMetricView(metricDefinitionId));
          }}
        />
      )}

      <ServerMetricDetailDialog
        open={detailMetric != null}
        serverId={serverId}
        metric={detailMetric}
        onClose={() => setDetailMetric(null)}
      />
    </Stack>
  );
}
