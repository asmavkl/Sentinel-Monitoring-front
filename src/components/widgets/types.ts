import type { ComponentType } from 'react';
import type { WidgetConfiguration, WidgetDataSourceDto, WidgetLayoutDto } from '@/types/widgets';
import type { WidgetDto } from '@/types/dashboard';

export interface WidgetComponentProps {
  title: string;
  configuration: WidgetConfiguration;
  layout: WidgetLayoutDto;
  dataSources: WidgetDataSourceDto[];
  /** When true, chrome already shows title — render body only. */
  embedded?: boolean;
}

export interface WidgetRendererProps {
  widget: WidgetDto;
  onWidgetClick?: (widget: WidgetDto) => void;
  embedded?: boolean;
}

export type WidgetComponent = ComponentType<WidgetComponentProps>;
