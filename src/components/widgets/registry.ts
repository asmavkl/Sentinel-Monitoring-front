import type { WidgetType } from '@/types/widgets';
import type { WidgetComponent } from './types';
import { StatusCardWidget } from './StatusCardWidget';
import { NumberMetricWidget } from './NumberMetricWidget';
import { MetricChartWidget } from './MetricChartWidget';
import { MultiSeriesChartWidget } from './MultiSeriesChartWidget';
import { TableWidget } from './TableWidget';
import { GaugeWidget } from './GaugeWidget';
import { ProgressBarWidget } from './ProgressBarWidget';

const widgetRegistry: Record<WidgetType, WidgetComponent> = {
  StatusCard: StatusCardWidget,
  NumberCard: NumberMetricWidget,
  Chart: MetricChartWidget,
  MultiSeriesChart: MultiSeriesChartWidget,
  Table: TableWidget,
  Gauge: GaugeWidget,
  ProgressBar: ProgressBarWidget,
};

export function registerWidget(type: WidgetType, component: WidgetComponent): void {
  widgetRegistry[type] = component;
}

export function getWidgetComponent(type: string): WidgetComponent | undefined {
  if (type in widgetRegistry) {
    return widgetRegistry[type as WidgetType];
  }

  return undefined;
}

export function getRegisteredWidgetTypes(): WidgetType[] {
  return Object.keys(widgetRegistry) as WidgetType[];
}
