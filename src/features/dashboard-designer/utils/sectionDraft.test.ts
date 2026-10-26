import { describe, expect, it } from 'vitest';
import {
  getChangedWidgetsAcrossSections,
  moveWidgetToSection,
  toCreateSectionRequest,
} from './sectionDraft';
import { createChartWidget, createStatusCardWidget } from '@/test/widgetFixtures';
import type { DashboardSectionDto } from '@/types/dashboard';

const sections: DashboardSectionDto[] = [
  {
    id: 1,
    title: 'سامانه‌های حیاتی',
    color: 'blue',
    displayOrder: 0,
    isVisible: true,
    widgets: [createStatusCardWidget({ id: 10, sectionId: 1 })],
  },
  {
    id: 2,
    title: 'Metrics',
    color: 'purple',
    displayOrder: 1,
    isVisible: true,
    widgets: [createChartWidget({ id: 20, sectionId: 2 })],
  },
];

describe('sectionDraft', () => {
  it('builds create section payload', () => {
    expect(
      toCreateSectionRequest({
        title: 'سامانه‌های حیاتی',
        description: 'Critical apps',
        color: 'blue',
        displayOrder: 2,
      }),
    ).toEqual({
      title: 'سامانه‌های حیاتی',
      description: 'Critical apps',
      color: 'blue',
      displayOrder: 2,
      isVisible: true,
    });
  });

  it('moves a widget between sections', () => {
    const next = moveWidgetToSection(sections, 10, 2);

    expect(next.find((section) => section.id === 1)?.widgets).toHaveLength(0);
    expect(next.find((section) => section.id === 2)?.widgets.map((widget) => widget.id)).toEqual([
      20, 10,
    ]);
    expect(next.find((section) => section.id === 2)?.widgets[1].sectionId).toBe(2);
  });

  it('detects widget section changes for save', () => {
    const draft = moveWidgetToSection(sections, 10, 2);
    const changed = getChangedWidgetsAcrossSections(sections, draft);

    expect(changed).toHaveLength(1);
    expect(changed[0]).toMatchObject({ id: 10, sectionId: 2 });
  });
});
