import { Box } from '@mui/material';
import { getWidgetComponent } from './registry';
import { UnknownWidget } from './UnknownWidget';
import type { WidgetRendererProps } from './types';
import { resolveWidgetType } from '@/types/widgets';
import { parseWidgetConfiguration } from '@/utils/widgetConfiguration';
import { parseWidgetLayout } from '@/utils/widgetLayout';

/* Widgets are resolved from a static registry; the component identity is stable per type. */
/* eslint-disable react-hooks/static-components */
export function WidgetRenderer({ widget, onWidgetClick, embedded = false }: WidgetRendererProps) {
  const configuration = parseWidgetConfiguration(widget.configuration);
  const resolvedType = resolveWidgetType(widget.widgetType);
  const WidgetComponent = getWidgetComponent(resolvedType) ?? UnknownWidget;
  const isUnknown = WidgetComponent === UnknownWidget;

  return (
    <Box
      sx={{ height: '100%', cursor: onWidgetClick && !isUnknown ? 'pointer' : 'default' }}
      onClick={onWidgetClick && !isUnknown ? () => onWidgetClick(widget) : undefined}
      role={onWidgetClick && !isUnknown ? 'button' : undefined}
      tabIndex={onWidgetClick && !isUnknown ? 0 : undefined}
      onKeyDown={
        onWidgetClick && !isUnknown
          ? (event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                onWidgetClick(widget);
              }
            }
          : undefined
      }
    >
      <WidgetComponent
        title={widget.title}
        configuration={configuration}
        layout={parseWidgetLayout(widget.layout)}
        dataSources={widget.dataSources}
        embedded={embedded}
      />
    </Box>
  );
}
/* eslint-enable react-hooks/static-components */
