import { describe, expect, it } from 'vitest';
import {
  getVisibleDashboardSections,
  normalizeDashboardLayout,
} from '@/utils/dashboardLayout';
import { createChartWidget, createStatusCardWidget } from '@/test/widgetFixtures';

describe('normalizeDashboardLayout', () => {
  it('keeps sections from the backend and flattens widgets', () => {
    const layout = normalizeDashboardLayout({
      id: 9,
      applicationId: 4,
      title: 'Operations',
      sections: [
        {
          id: 2,
          title: 'Metrics',
          displayOrder: 2,
          isVisible: true,
          widgets: [createChartWidget({ id: 20 })],
        },
        {
          id: 1,
          title: 'Service Health',
          displayOrder: 1,
          isVisible: true,
          widgets: [createStatusCardWidget({ id: 10 })],
        },
      ],
    });

    expect(layout.dashboardId).toBe(9);
    expect(layout.title).toBe('Operations');
    expect(layout.sections.map((section) => section.title)).toEqual([
      'Service Health',
      'Metrics',
    ]);
    expect(layout.widgets.map((widget) => widget.id)).toEqual([10, 20]);
  });

  it('wraps legacy flat widgets in a visible section', () => {
    const layout = normalizeDashboardLayout({
      dashboardId: 3,
      applicationId: 1,
      name: 'Legacy Dashboard',
      widgets: [createStatusCardWidget({ id: 1 }), createChartWidget({ id: 2 })],
    });

    expect(layout.sections).toHaveLength(1);
    expect(layout.sections[0]).toMatchObject({
      id: 0,
      title: 'ویجت ها',
      isVisible: true,
    });
    expect(layout.widgets).toHaveLength(2);
  });

  it('places root widgets with a null section into the only dashboard section', () => {
    const layout = normalizeDashboardLayout({
      dashboardId: 9,
      applicationId: 11,
      name: 'زیر ساخت فرایندساز Dashboard',
      sections: [
        {
          id: 35,
          title: 'بخش اصلی',
          description: null,
          color: 'blue',
          displayOrder: 1,
          isVisible: true,
          widgets: [],
        },
      ],
      widgets: [
        createStatusCardWidget({
          id: 49,
          title: 'سلامت بک اند',
          dashboardSectionId: null,
          layout: { x: 3, y: 3, width: 3, height: 2 },
        }),
        createChartWidget({
          id: 48,
          title: 'میانگین زمان',
          dashboardSectionId: null,
          layout: { x: 0, y: 3, width: 3, height: 2 },
        }),
      ],
    });

    expect(layout.sections).toHaveLength(1);
    expect(layout.sections[0].widgets.map((widget) => widget.id)).toEqual([48, 49]);
    expect(layout.sections[0].widgets.every((widget) => widget.sectionId === 35)).toBe(true);
    expect(layout.widgets).toHaveLength(2);
  });

  it('keeps section membership when widgets are only listed at the root', () => {
    const layout = normalizeDashboardLayout({
      dashboardId: 1,
      applicationId: 1,
      sections: [
        {
          id: 10,
          title: 'Health',
          displayOrder: 0,
          isVisible: true,
          widgets: [],
        },
        {
          id: 11,
          title: 'Metrics',
          displayOrder: 1,
          isVisible: true,
          widgets: [],
        },
      ],
      widgets: [
        createStatusCardWidget({ id: 1, dashboardSectionId: 10 }),
        createChartWidget({ id: 2, dashboardSectionId: null }),
      ],
    });

    expect(layout.sections[0].widgets.map((widget) => widget.id)).toEqual([1]);
    expect(layout.sections[1].widgets).toEqual([]);
    expect(layout.sections[2]).toMatchObject({ id: 0, title: 'ویجت ها' });
    expect(layout.sections[2].widgets.map((widget) => widget.id)).toEqual([2]);
  });

  it('returns an empty sections array when nothing is configured', () => {
    const layout = normalizeDashboardLayout({
      dashboardId: 1,
      applicationId: 1,
      sections: [],
      widgets: [],
    });

    expect(layout.sections).toEqual([]);
    expect(layout.widgets).toEqual([]);
  });

  it('hides sections where isVisible is false', () => {
    const layout = normalizeDashboardLayout({
      dashboardId: 1,
      applicationId: 1,
      sections: [
        {
          id: 1,
          title: 'Visible',
          displayOrder: 0,
          isVisible: true,
          widgets: [createStatusCardWidget()],
        },
        {
          id: 2,
          title: 'Hidden',
          displayOrder: 1,
          isVisible: false,
          widgets: [createChartWidget()],
        },
      ],
    });

    expect(getVisibleDashboardSections(layout).map((section) => section.title)).toEqual([
      'Visible',
    ]);
  });
});
