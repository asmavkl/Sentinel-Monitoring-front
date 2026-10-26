import type { DashboardSectionDto, WidgetDto } from '@/types/dashboard';
import type { WidgetType } from '@/types/widgets';
import { findAvailableLayoutSlot, getDefaultWidgetLayout } from '@/utils/widgetLayout';
import { getDefaultConfiguration, getDefaultTitle } from './widgetConfigurationForm';
import { flattenSectionWidgets, getNextSectionDisplayOrder } from './sectionDraft';

let tempIdSequence = -1;

export function isDraftId(id: number): boolean {
  return id < 0;
}

/** Sections with id 0 are client-only placeholders and are not stored yet. */
export function isPersistedSectionId(id: number): boolean {
  return id > 0;
}

export function nextTempId(): number {
  const id = tempIdSequence;
  tempIdSequence -= 1;
  return id;
}

/** Reset only in tests. */
export function resetTempIdSequence(start = -1): void {
  tempIdSequence = start;
}

export function createDraftSection(title = 'بخش اصلی'): DashboardSectionDto {
  return {
    id: nextTempId(),
    title,
    description: null,
    color: 'blue',
    displayOrder: 0,
    isVisible: true,
    widgets: [],
  };
}

export function createDraftWidget(input: {
  widgetType: WidgetType;
  sectionId: number;
  existingWidgets: WidgetDto[];
}): WidgetDto {
  const layout = getDefaultWidgetLayout(input.widgetType);
  const slot = findAvailableLayoutSlot(
    input.existingWidgets.map((widget) => widget.layout),
    layout.width,
    layout.height,
  );

  return {
    id: nextTempId(),
    sectionId: input.sectionId,
    title: getDefaultTitle(input.widgetType),
    description: null,
    widgetType: input.widgetType,
    displayOrder: input.existingWidgets.length,
    layout: {
      ...layout,
      x: slot.x,
      y: slot.y,
    },
    configuration: getDefaultConfiguration(input.widgetType),
    dataSources: [],
  };
}

export function duplicateWidget(widget: WidgetDto, existingWidgets: WidgetDto[]): WidgetDto {
  const width = widget.layout?.width ?? 4;
  const height = widget.layout?.height ?? 2;
  const slot = findAvailableLayoutSlot(
    existingWidgets.map((item) => item.layout),
    width,
    height,
  );

  return {
    ...widget,
    id: nextTempId(),
    title: `${widget.title} (کپی)`,
    displayOrder: existingWidgets.length,
    layout: {
      ...widget.layout,
      x: slot.x,
      y: slot.y,
      width,
      height,
    },
    dataSources: widget.dataSources.map((source) => ({ ...source, id: 0 })),
    configuration: { ...(widget.configuration ?? {}) },
  };
}

export function getNewDraftWidgets(
  baseline: DashboardSectionDto[],
  draft: DashboardSectionDto[],
): WidgetDto[] {
  const baselineIds = new Set(flattenSectionWidgets(baseline).map((widget) => widget.id));
  return flattenSectionWidgets(draft).filter(
    (widget) => isDraftId(widget.id) || !baselineIds.has(widget.id),
  );
}

export function getNewDraftSections(
  baseline: DashboardSectionDto[],
  draft: DashboardSectionDto[],
): DashboardSectionDto[] {
  const baselineIds = new Set(baseline.map((section) => section.id));
  return draft.filter((section) => !isPersistedSectionId(section.id) || !baselineIds.has(section.id));
}

export function getRemovedWidgetIds(
  baseline: DashboardSectionDto[],
  draft: DashboardSectionDto[],
): number[] {
  const draftIds = new Set(flattenSectionWidgets(draft).map((widget) => widget.id));
  return flattenSectionWidgets(baseline)
    .map((widget) => widget.id)
    .filter((id) => !isDraftId(id) && !draftIds.has(id));
}

export function getRemovedSectionIds(
  baseline: DashboardSectionDto[],
  draft: DashboardSectionDto[],
): number[] {
  const draftIds = new Set(draft.map((section) => section.id));
  return baseline.map((section) => section.id).filter((id) => !isDraftId(id) && !draftIds.has(id));
}

export function ensureSectionForWidget(
  sections: DashboardSectionDto[],
  preferredSectionId: number | null,
): { sections: DashboardSectionDto[]; sectionId: number } {
  if (sections.length === 0) {
    const section = createDraftSection();
    return { sections: [section], sectionId: section.id };
  }

  const preferred =
    preferredSectionId != null
      ? sections.find((section) => section.id === preferredSectionId)
      : null;

  if (preferred) {
    return { sections, sectionId: preferred.id };
  }

  const sorted = [...sections].sort((left, right) => left.displayOrder - right.displayOrder);
  return { sections, sectionId: sorted[0].id };
}

export function withDisplayOrderForNewSection(
  sections: DashboardSectionDto[],
  section: DashboardSectionDto,
): DashboardSectionDto {
  return {
    ...section,
    displayOrder: getNextSectionDisplayOrder(sections),
  };
}
