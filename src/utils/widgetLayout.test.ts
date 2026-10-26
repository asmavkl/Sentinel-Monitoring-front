import { describe, expect, it } from 'vitest';
import {
  findAvailableLayoutSlot,
  fromGridLayoutPosition,
  getGridSize,
  getWidgetGridConstraints,
  toGridLayoutPosition,
} from '@/utils/widgetLayout';

describe('widgetLayout', () => {
  it('uses layout.width for grid size', () => {
    const gridSize = getGridSize({ x: 0, y: 0, width: 8, height: 3 });

    expect(gridSize.md).toBe(8);
    expect(gridSize.minHeight).toBe(210);
  });

  it('converts backend layout to grid position', () => {
    const position = toGridLayoutPosition(42, { x: 2, y: 1, width: 6, height: 3 }, false);

    expect(position).toEqual({
      i: '42',
      x: 2,
      y: 1,
      w: 6,
      h: 3,
    });
  });

  it('converts backend layout to grid position in RTL mode', () => {
    const position = toGridLayoutPosition(42, { x: 2, y: 1, width: 6, height: 3 }, true);

    expect(position).toEqual({
      i: '42',
      x: 4, // 12 - 2 - 6 = 4
      y: 1,
      w: 6,
      h: 3,
    });
  });

  it('converts grid position to backend layout', () => {
    const layout = fromGridLayoutPosition({
      i: '42',
      x: 2,
      y: 1,
      w: 6,
      h: 3,
    }, false);

    expect(layout).toEqual({
      x: 2,
      y: 1,
      width: 6,
      height: 3,
    });
  });

  it('converts grid position to backend layout in RTL mode', () => {
    const layout = fromGridLayoutPosition({
      i: '42',
      x: 4,
      y: 1,
      w: 6,
      h: 3,
    }, true);

    expect(layout).toEqual({
      x: 2, // 12 - 4 - 6 = 2
      y: 1,
      width: 6,
      height: 3,
    });
  });

  it('keeps status and number cards on the same size floor, and charts wider', () => {
    expect(getWidgetGridConstraints('StatusCard')).toEqual({ minWidth: 2, minHeight: 2 });
    expect(getWidgetGridConstraints('NumberCard')).toEqual(getWidgetGridConstraints('StatusCard'));
    expect(getWidgetGridConstraints('Chart')).toEqual({ minWidth: 4, minHeight: 4 });
    expect(getWidgetGridConstraints('MultiSeriesChart')).toEqual(getWidgetGridConstraints('Chart'));
    expect(getWidgetGridConstraints('Gauge')).toEqual({ minWidth: 2, minHeight: 3 });
  });

  it('places widgets side-by-side when horizontal space remains', () => {
    const next = findAvailableLayoutSlot([{ x: 0, y: 0, width: 8, height: 3 }], 4, 2);

    expect(next).toEqual({ x: 8, y: 0 });
  });

  it('stacks to the next row when the current row is full', () => {
    const next = findAvailableLayoutSlot(
      [
        { x: 0, y: 0, width: 4, height: 2 },
        { x: 4, y: 0, width: 4, height: 2 },
        { x: 8, y: 0, width: 4, height: 2 },
      ],
      4,
      2,
    );

    expect(next).toEqual({ x: 0, y: 2 });
  });
});
