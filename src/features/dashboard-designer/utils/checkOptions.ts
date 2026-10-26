import type { ComponentStatusDto, WidgetDto } from '@/types/dashboard';
import { CheckType } from '@/types/enums';

export interface CheckOption {
  checkId: number;
  name: string;
  componentName: string;
  componentId: number;
  applicationId: number;
  checkType: CheckType;
}

export interface CheckComponentGroup {
  componentId: number;
  componentName: string;
  checks: CheckOption[];
}

export function getAvailableChecks(components: ComponentStatusDto[]): CheckOption[] {
  return getChecksGroupedByComponent(components).flatMap((group) => group.checks);
}

export function getChecksGroupedByComponent(components: ComponentStatusDto[]): CheckComponentGroup[] {
  return components
    .map((component) => ({
      componentId: component.componentId,
      componentName: component.name,
      checks: (component.checks ?? []).map((check) => ({
        checkId: check.checkId,
        name: check.name,
        componentName: component.name,
        componentId: component.componentId,
        applicationId: component.applicationId,
        checkType: check.checkType,
      })),
    }))
    .filter((group) => group.checks.length > 0);
}

export function getNextLayoutY(widgets: WidgetDto[]): number {
  if (widgets.length === 0) {
    return 0;
  }

  return Math.max(
    ...widgets.map((widget) => (widget.layout?.y ?? 0) + (widget.layout?.height ?? 2)),
  );
}
