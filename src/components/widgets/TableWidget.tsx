import type { WidgetComponentProps } from './types';
import { DatasetTableWidget } from './DatasetTableWidget';

export function TableWidget({ title, dataSources, configuration, layout }: WidgetComponentProps) {
  return <DatasetTableWidget title={title} dataSources={dataSources} configuration={configuration} layout={layout} />;
}
