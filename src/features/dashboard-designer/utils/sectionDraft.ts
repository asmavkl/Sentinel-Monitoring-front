import type {
  CreateSectionRequestDto,
  DashboardSectionDto,
  UpdateSectionRequestDto,
  WidgetDto,
} from '@/types/dashboard';
import { cloneWidgets, toUpdateRequest } from './widgetDraft';
import { parseWidgetLayout } from '@/utils/widgetLayout';

export const SECTION_COLOR_OPTIONS = [
  { value: 'blue', label: 'آبی', color: '#5B8DEF' },
  { value: 'purple', label: 'بنفش', color: '#9B7FC0' },
  { value: 'teal', label: 'فیروزه‌ای', color: '#5FBDB5' },
  { value: 'red', label: 'قرمز', color: '#E57373' },
  { value: 'gray', label: 'خاکستری', color: '#8FA3AD' },
] as const;

export type SectionColorValue = (typeof SECTION_COLOR_OPTIONS)[number]['value'];

export function resolveSectionColor(color?: string | null): string {
  if (!color) {
    return SECTION_COLOR_OPTIONS[0].color;
  }

  const named = SECTION_COLOR_OPTIONS.find(
    (option) => option.value === color || option.color.toLowerCase() === color.toLowerCase(),
  );
  return named?.color ?? color;
}

export function cloneSections(sections: DashboardSectionDto[]): DashboardSectionDto[] {
  return sections.map((section) => ({
    ...section,
    description: section.description ?? null,
    color: section.color ?? null,
    widgets: cloneWidgets(section.widgets ?? []),
  }));
}

export function flattenSectionWidgets(sections: DashboardSectionDto[]): WidgetDto[] {
  return sections.flatMap((section) =>
    (section.widgets ?? []).map((widget) => ({
      ...widget,
      sectionId: widget.sectionId ?? section.id,
      layout: parseWidgetLayout(widget.layout),
    })),
  );
}

export function toCreateSectionRequest(input: {
  title: string;
  description?: string | null;
  color?: string | null;
  displayOrder?: number;
  isVisible?: boolean;
}): CreateSectionRequestDto {
  return {
    title: input.title,
    description: input.description ?? null,
    color: input.color ?? 'blue',
    displayOrder: input.displayOrder ?? 0,
    isVisible: input.isVisible ?? true,
  };
}

export function toUpdateSectionRequest(section: DashboardSectionDto): UpdateSectionRequestDto {
  return {
    title: section.title,
    description: section.description ?? null,
    color: section.color ?? null,
    displayOrder: section.displayOrder,
    isVisible: section.isVisible,
  };
}

export function getChangedSections(
  baseline: DashboardSectionDto[],
  draft: DashboardSectionDto[],
): DashboardSectionDto[] {
  const baselineById = new Map(baseline.map((section) => [section.id, section]));

  return draft.filter((section) => {
    const original = baselineById.get(section.id);
    if (!original) {
      return false;
    }

    return (
      JSON.stringify(toUpdateSectionRequest(original)) !==
      JSON.stringify(toUpdateSectionRequest(section))
    );
  });
}

export function getChangedWidgetsAcrossSections(
  baseline: DashboardSectionDto[],
  draft: DashboardSectionDto[],
): WidgetDto[] {
  const baselineWidgets = flattenSectionWidgets(baseline);
  const draftWidgets = flattenSectionWidgets(draft);
  const baselineById = new Map(baselineWidgets.map((widget) => [widget.id, widget]));

  return draftWidgets.filter((widget) => {
    const original = baselineById.get(widget.id);
    if (!original) {
      return false;
    }

    return (
      JSON.stringify(toUpdateRequest(original)) !== JSON.stringify(toUpdateRequest(widget)) ||
      (original.sectionId ?? null) !== (widget.sectionId ?? null)
    );
  });
}

export function getNextSectionDisplayOrder(sections: DashboardSectionDto[]): number {
  if (sections.length === 0) {
    return 0;
  }

  return Math.max(...sections.map((section) => section.displayOrder ?? 0)) + 1;
}

export function moveWidgetToSection(
  sections: DashboardSectionDto[],
  widgetId: number,
  targetSectionId: number,
): DashboardSectionDto[] {
  let moving: WidgetDto | null = null;

  const withoutWidget = sections.map((section) => {
    const remaining = section.widgets.filter((widget) => {
      if (widget.id === widgetId) {
        moving = { ...widget, sectionId: targetSectionId };
        return false;
      }
      return true;
    });
    return { ...section, widgets: remaining };
  });

  if (!moving) {
    return sections;
  }

  return withoutWidget.map((section) =>
    section.id === targetSectionId
      ? {
        ...section,
        widgets: [...section.widgets, { ...moving!, sectionId: targetSectionId }],
      }
      : section,
  );
}

export function updateWidgetInSections(
  sections: DashboardSectionDto[],
  widgetId: number,
  patch: Partial<WidgetDto>,
): DashboardSectionDto[] {
  const nextSectionId = patch.sectionId;
  if (nextSectionId != null) {
    const current = flattenSectionWidgets(sections).find((widget) => widget.id === widgetId);
    if (current && (current.sectionId ?? null) !== nextSectionId) {
      const moved = moveWidgetToSection(sections, widgetId, nextSectionId);
      return updateWidgetInSections(moved, widgetId, { ...patch, sectionId: nextSectionId });
    }
  }

  return sections.map((section) => ({
    ...section,
    widgets: section.widgets.map((widget) =>
      widget.id === widgetId ? { ...widget, ...patch } : widget,
    ),
  }));
}

export function replaceSectionWidgets(
  sections: DashboardSectionDto[],
  sectionId: number,
  widgets: WidgetDto[],
): DashboardSectionDto[] {
  return sections.map((section) =>
    section.id === sectionId
      ? {
        ...section,
        widgets: widgets.map((widget) => ({
          ...widget,
          sectionId: section.id,
        })),
      }
      : section,
  );
}
