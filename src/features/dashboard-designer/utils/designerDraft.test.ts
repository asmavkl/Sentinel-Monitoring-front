import { describe, expect, it, beforeEach } from 'vitest';
import {
  createDraftWidget,
  duplicateWidget,
  ensureSectionForWidget,
  getNewDraftSections,
  getNewDraftWidgets,
  isDraftId,
  isPersistedSectionId,
  resetTempIdSequence,
} from './designerDraft';

describe('designerDraft', () => {
  beforeEach(() => {
    resetTempIdSequence(-1);
  });

  it('creates a draft widget with negative id and default layout', () => {
    const draft = createDraftWidget({
      widgetType: 'Chart',
      sectionId: 10,
      existingWidgets: [],
    });

    expect(isDraftId(draft.id)).toBe(true);
    expect(draft.sectionId).toBe(10);
    expect(draft.widgetType).toBe('Chart');
    expect(draft.layout.width).toBe(6);
    expect(draft.dataSources).toEqual([]);
  });

  it('duplicates a widget as a new draft', () => {
    const original = createDraftWidget({
      widgetType: 'NumberCard',
      sectionId: 1,
      existingWidgets: [],
    });
    const copy = duplicateWidget(original, [original]);

    expect(copy.id).not.toBe(original.id);
    expect(isDraftId(copy.id)).toBe(true);
    expect(copy.title).toContain('کپی');
  });

  it('auto-creates a section when canvas has none', () => {
    const result = ensureSectionForWidget([], null);
    expect(result.sections).toHaveLength(1);
    expect(isDraftId(result.sectionId)).toBe(true);
  });

  it('places a new status card beside an existing chart when space remains', () => {
    const chart = createDraftWidget({
      widgetType: 'Chart',
      sectionId: 1,
      existingWidgets: [],
    });
    const status = createDraftWidget({
      widgetType: 'StatusCard',
      sectionId: 1,
      existingWidgets: [chart],
    });

    expect(chart.layout).toMatchObject({ x: 0, y: 0, width: 6 });
    expect(status.layout).toMatchObject({ x: 6, y: 0, width: 2 });
  });

  it('creates the placeholder section instead of updating id 0', () => {
    const placeholder = {
      id: 0,
      title: 'ویجت ها',
      description: null,
      color: null,
      displayOrder: 1,
      isVisible: true,
      widgets: [],
    };
    const added = {
      id: -5,
      title: 'بخش جدید',
      description: null,
      color: 'blue',
      displayOrder: 2,
      isVisible: true,
      widgets: [],
    };

    const found = getNewDraftSections([placeholder], [placeholder, added]);

    expect(found.map((section) => section.id)).toEqual([0, -5]);
    expect(isPersistedSectionId(0)).toBe(false);
    expect(isPersistedSectionId(35)).toBe(true);
  });

  it('detects new draft widgets against baseline', () => {
    const draft = createDraftWidget({
      widgetType: 'StatusCard',
      sectionId: 1,
      existingWidgets: [],
    });

    const found = getNewDraftWidgets(
      [{ id: 1, title: 'A', displayOrder: 0, isVisible: true, widgets: [] }],
      [{ id: 1, title: 'A', displayOrder: 0, isVisible: true, widgets: [draft] }],
    );

    expect(found).toHaveLength(1);
    expect(found[0].id).toBe(draft.id);
  });
});
