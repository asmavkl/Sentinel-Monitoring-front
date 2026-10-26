import type { DashboardLayoutDto, DashboardSectionDto, WidgetDto } from '@/types/dashboard';

const LEGACY_SECTION_ID = 0;

function sortByDisplayOrder<T extends { displayOrder?: number; order?: number }>(items: T[]): T[] {
  return [...items].sort(
    (left, right) => (left.displayOrder ?? left.order ?? 0) - (right.displayOrder ?? right.order ?? 0),
  );
}

function sortWidgets(widgets: WidgetDto[]): WidgetDto[] {
  return [...widgets].sort((left, right) => {
    const orderDiff =
      (left.displayOrder ?? left.order ?? 0) - (right.displayOrder ?? right.order ?? 0);
    if (orderDiff !== 0) {
      return orderDiff;
    }

    const yDiff = (left.layout?.y ?? 0) - (right.layout?.y ?? 0);
    if (yDiff !== 0) {
      return yDiff;
    }

    return (left.layout?.x ?? 0) - (right.layout?.x ?? 0);
  });
}

type RawWidgetDto = WidgetDto & {
  dashboardSectionId?: number | null;
};

function resolveSectionId(widget: RawWidgetDto): number | null {
  const sectionId = widget.sectionId ?? widget.dashboardSectionId;
  return sectionId == null || sectionId === 0 ? null : sectionId;
}

function withSectionId(widget: RawWidgetDto, sectionId: number | null): WidgetDto {
  return {
    ...widget,
    sectionId,
  };
}

function flattenSectionWidgets(sections: DashboardSectionDto[]): WidgetDto[] {
  return sortByDisplayOrder(sections).flatMap((section) =>
    sortWidgets(section.widgets ?? []).map((widget) => ({
      ...widget,
      sectionId: widget.sectionId ?? section.id,
    })),
  );
}

function toLegacySection(widgets: WidgetDto[]): DashboardSectionDto {
  return {
    id: LEGACY_SECTION_ID,
    title: 'ویجت ها',
    description: null,
    color: null,
    displayOrder: 0,
    isVisible: true,
    widgets: sortWidgets(widgets),
  };
}

/**
 * Normalizes backend dashboard payloads that may use either:
 * - sections[] (Phase 3-H-A+)
 * - flat widgets[] (legacy)
 */
export function normalizeDashboardLayout(
  raw: Partial<DashboardLayoutDto> & {
    id?: number;
    dashboardId?: number;
    applicationId?: number;
    monitoredServerId?: number | null;
    title?: string;
    name?: string;
    sections?: Array<Omit<DashboardSectionDto, 'widgets'> & { widgets?: RawWidgetDto[] | null }> | null;
    widgets?: RawWidgetDto[] | null;
  },
): DashboardLayoutDto {
  const dashboardId = raw.dashboardId ?? raw.id ?? 0;
  const title = raw.title ?? raw.name;
  const name = raw.name ?? raw.title;
  const applicationId = raw.applicationId ?? 0;
  const monitoredServerId = raw.monitoredServerId ?? null;
  const rawSections = raw.sections ?? [];
  const rawWidgets = raw.widgets ?? [];

  if (rawSections.length > 0) {
    const rootWidgets = rawWidgets.map((widget) => withSectionId(widget, resolveSectionId(widget)));
    const sections: DashboardSectionDto[] = sortByDisplayOrder(rawSections).map((section) => ({
      ...section,
      title: section.title ?? '',
      color: section.color ?? null,
      displayOrder: section.displayOrder ?? 0,
      isVisible: section.isVisible !== false,
      widgets: sortWidgets(
        (section.widgets ?? []).map((widget) => withSectionId(widget, section.id)),
      ),
    }));

    const placedIds = new Set(sections.flatMap((section) => section.widgets.map((widget) => widget.id)));

    for (const widget of rootWidgets) {
      if (placedIds.has(widget.id) || widget.sectionId == null) {
        continue;
      }

      const target = sections.find((section) => section.id === widget.sectionId);
      if (!target) {
        continue;
      }

      target.widgets = sortWidgets([...target.widgets, withSectionId(widget, target.id)]);
      placedIds.add(widget.id);
    }

    const unsectioned = rootWidgets.filter((widget) => !placedIds.has(widget.id));
    if (unsectioned.length > 0) {
      if (sections.length === 1) {
        const [onlySection] = sections;
        onlySection.widgets = sortWidgets([
          ...onlySection.widgets,
          ...unsectioned.map((widget) => withSectionId(widget, onlySection.id)),
        ]);
      } else {
        sections.push(toLegacySection(unsectioned));
      }
    }

    return {
      id: raw.id ?? dashboardId,
      dashboardId,
      applicationId,
      monitoredServerId,
      title,
      name,
      sections,
      widgets: flattenSectionWidgets(sections),
    };
  }

  if (rawWidgets.length > 0) {
    const section = toLegacySection(rawWidgets);
    return {
      id: raw.id ?? dashboardId,
      dashboardId,
      applicationId,
      monitoredServerId,
      title,
      name,
      sections: [section],
      widgets: section.widgets,
    };
  }

  return {
    id: raw.id ?? dashboardId,
    dashboardId,
    applicationId,
    monitoredServerId,
    title,
    name,
    sections: [],
    widgets: [],
  };
}

export function getVisibleDashboardSections(layout: DashboardLayoutDto): DashboardSectionDto[] {
  return sortByDisplayOrder(layout.sections ?? []).filter((section) => section.isVisible !== false);
}

export function hasRenderableDashboardContent(layout: DashboardLayoutDto): boolean {
  return getVisibleDashboardSections(layout).some((section) => (section.widgets?.length ?? 0) > 0);
}
