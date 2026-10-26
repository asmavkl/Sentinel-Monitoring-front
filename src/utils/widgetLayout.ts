import type { WidgetLayoutDto, WidgetType } from '@/types/widgets';

export interface WidgetGridSize {
  xs: number;
  sm: number;
  md: number;
  lg?: number;
  minHeight: number;
}

export interface GridLayoutPosition {
  i: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

const DEFAULT_LAYOUT: WidgetLayoutDto = {
  x: 0,
  y: 0,
  width: 2,
  height: 2,
};

export const GRID_COLUMNS = 12;
/** Short rows so six status tiles fit a row and a gauge can be about twice as tall. */
export const ROW_HEIGHT_PX = 70;

const DEFAULT_LAYOUTS: Record<WidgetType, WidgetLayoutDto> = {
  StatusCard: { x: 0, y: 0, width: 2, height: 2 },
  NumberCard: { x: 0, y: 0, width: 2, height: 2 },
  Chart: { x: 0, y: 0, width: 6, height: 5 },
  MultiSeriesChart: { x: 0, y: 0, width: 8, height: 5 },
  Table: { x: 0, y: 0, width: 12, height: 4 },
  Gauge: { x: 0, y: 0, width: 2, height: 4 },
  ProgressBar: { x: 0, y: 0, width: 6, height: 4 },
};

/**
 * Floors matched to a dense NOC board: six cards per row, gauges the same
 * width and roughly twice the height, charts still wide enough for axes.
 */
const WIDGET_GRID_CONSTRAINTS: Record<WidgetType, { minWidth: number; minHeight: number }> = {
  StatusCard: { minWidth: 2, minHeight: 2 },
  NumberCard: { minWidth: 2, minHeight: 2 },
  Chart: { minWidth: 4, minHeight: 4 },
  MultiSeriesChart: { minWidth: 4, minHeight: 4 },
  Table: { minWidth: 6, minHeight: 3 },
  Gauge: { minWidth: 2, minHeight: 3 },
  ProgressBar: { minWidth: 4, minHeight: 3 },
};

export function getWidgetGridConstraints(widgetType?: string | null): {
  minWidth: number;
  minHeight: number;
} {
  if (widgetType && widgetType in WIDGET_GRID_CONSTRAINTS) {
    return WIDGET_GRID_CONSTRAINTS[widgetType as WidgetType];
  }

  return { minWidth: 2, minHeight: 2 };
}

export function parseWidgetLayout(layout?: WidgetLayoutDto | null): WidgetLayoutDto {
  if (!layout) {
    return { ...DEFAULT_LAYOUT };
  }

  return {
    x: layout.x ?? 0,
    y: layout.y ?? 0,
    width: layout.width > 0 ? layout.width : DEFAULT_LAYOUT.width,
    height: layout.height > 0 ? layout.height : DEFAULT_LAYOUT.height,
  };
}

export function getDefaultWidgetLayout(widgetType: WidgetType): WidgetLayoutDto {
  return { ...DEFAULT_LAYOUTS[widgetType] };
}

export function toGridLayoutPosition(
  id: string | number,
  layout?: WidgetLayoutDto | null,
  isRtl: boolean = false,
): GridLayoutPosition {
  const parsed = parseWidgetLayout(layout);

  // Mirror x-coordinate for RTL mode
  const mirroredX = isRtl ? GRID_COLUMNS - parsed.x - parsed.width : parsed.x;

  return {
    i: String(id),
    x: mirroredX,
    y: parsed.y,
    w: parsed.width,
    h: parsed.height,
  };
}

export function fromGridLayoutPosition(position: GridLayoutPosition, isRtl: boolean = false): WidgetLayoutDto {
  const x = Math.max(0, position.x);
  const y = Math.max(0, position.y);
  const w = Math.max(1, position.w);
  const h = Math.max(1, position.h);
  
  // Ensure widget doesn't exceed grid boundaries
  const boundedW = Math.min(GRID_COLUMNS - x, w);
  
  // Mirror x-coordinate back for RTL mode
  const mirroredX = isRtl ? GRID_COLUMNS - x - boundedW : x;
  
  return {
    x: mirroredX,
    y,
    width: boundedW,
    height: h,
  };
}

function layoutsOverlap(
  left: WidgetLayoutDto,
  right: { x: number; y: number; width: number; height: number },
): boolean {
  return !(
    left.x + left.width <= right.x ||
    right.x + right.width <= left.x ||
    left.y + left.height <= right.y ||
    right.y + right.height <= left.y
  );
}

/**
 * First-fit placement on the 12-col grid so new widgets can sit beside existing ones
 * (e.g. status cards next to a chart) instead of always stacking under everything.
 */
export function findAvailableLayoutSlot(
  occupied: Array<WidgetLayoutDto | null | undefined>,
  width: number,
  height: number,
  cols: number = GRID_COLUMNS,
): { x: number; y: number } {
  const w = Math.min(cols, Math.max(1, width));
  const h = Math.max(1, height);
  const items = occupied
    .filter((item): item is WidgetLayoutDto => item != null)
    .map((item) => parseWidgetLayout(item));

  const maxBottom =
    items.length === 0 ? 0 : Math.max(...items.map((item) => item.y + item.height));

  for (let y = 0; y <= maxBottom; y += 1) {
    for (let x = 0; x <= cols - w; x += 1) {
      const candidate = { x, y, width: w, height: h };
      const collides = items.some((item) => layoutsOverlap(item, candidate));
      if (!collides) {
        return { x, y };
      }
    }
  }

  return { x: 0, y: maxBottom };
}

export function getGridSize(layout?: WidgetLayoutDto | null): WidgetGridSize {
  const parsed = parseWidgetLayout(layout);
  const width = Math.min(GRID_COLUMNS, Math.max(1, parsed.width));

  return {
    xs: GRID_COLUMNS,
    sm: Math.min(GRID_COLUMNS, width),
    md: width,
    minHeight: parsed.height * ROW_HEIGHT_PX,
  };
}
