import { ExecutionStatus } from '@/types/enums';
import type { WidgetDto } from '@/types/dashboard';
import type { WidgetLayoutDto } from '@/types/widgets';

export const defaultWidgetLayout: WidgetLayoutDto = {
  x: 0,
  y: 0,
  width: 4,
  height: 2,
};

export function createStatusCardWidget(overrides: Partial<WidgetDto> = {}): WidgetDto {
  return {
    id: 1,
    title: 'API Health',
    widgetType: 'StatusCard',
    layout: defaultWidgetLayout,
    configuration: { showDuration: true },
    dataSources: [
      {
        id: 1,
        checkId: 101,
        status: {
          checkId: 101,
          componentId: 11,
          name: 'API Check',
          checkType: 1,
          isActive: true,
          lastStatus: ExecutionStatus.Success,
          lastExecutionTime: '2026-01-01T10:00:00Z',
          lastDurationMs: 120,
        },
      },
    ],
    ...overrides,
  };
}

export function createChartWidget(overrides: Partial<WidgetDto> = {}): WidgetDto {
  return {
    id: 2,
    title: 'Response Time',
    widgetType: 'Chart',
    layout: { x: 4, y: 0, width: 8, height: 2 },
    configuration: { chartType: 'line', showLegend: true },
    dataSources: [{ id: 2, checkId: 102 }],
    ...overrides,
  };
}
