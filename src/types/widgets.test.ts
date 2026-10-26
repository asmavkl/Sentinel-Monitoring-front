import { describe, expect, it } from 'vitest';
import { isWidgetType, WIDGET_TYPES } from '@/types/widgets';

describe('WidgetType', () => {
  it('accepts string values', () => {
    WIDGET_TYPES.forEach((type) => {
      expect(isWidgetType(type)).toBe(true);
    });

    expect(isWidgetType('StatusCard')).toBe(true);
    expect(isWidgetType('Chart')).toBe(true);
    expect(isWidgetType('Custom')).toBe(false);
  });
});
