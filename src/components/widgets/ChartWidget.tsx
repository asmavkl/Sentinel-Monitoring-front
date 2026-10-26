import { MetricChartWidget } from './MetricChartWidget';
import { DatasetChartWidget } from './DatasetChartWidget';
import type { WidgetComponentProps } from './types';
import { readDataSourceType } from '@/utils/datasetWidget';

export function ChartWidget(props: WidgetComponentProps) {
  const dataSourceType = readDataSourceType(props.configuration);

  if (dataSourceType === 'Dataset') {
    return <DatasetChartWidget {...props} />;
  }

  return <MetricChartWidget {...props} />;
}
