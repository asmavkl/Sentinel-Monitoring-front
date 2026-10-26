import type { Theme } from '@mui/material/styles';
import type {
  GridComponentOption,
  LegendComponentOption,
  TooltipComponentFormatterCallbackParams,
  TooltipComponentOption,
  XAXisComponentOption,
  YAXisComponentOption,
} from 'echarts';

export const CHART_SERIES_COLORS = [
  '#3B82F6',
  '#14B8A6',
  '#F59E0B',
  '#8a5cf67a',
  '#F43F5E',
  '#22C55E',
  '#0EA5E9',
  '#F97316',
  '#ae57ffa7',
  '#64748B',
] as const;

export function chartFontFamily(theme: Theme): string {
  return typeof theme.typography.fontFamily === 'string'
    ? theme.typography.fontFamily
    : 'Vazirmatn, Tahoma, sans-serif';
}

export function withAlpha(color: string, alpha: number): string {
  const hex = color.trim().replace('#', '');
  const normalized = hex.length === 3 ? hex.split('').map((char) => char + char).join('') : hex;
  if (!/^[0-9a-fA-F]{6}$/.test(normalized)) {
    return color;
  }
  const red = Number.parseInt(normalized.slice(0, 2), 16);
  const green = Number.parseInt(normalized.slice(2, 4), 16);
  const blue = Number.parseInt(normalized.slice(4, 6), 16);
  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}

export function formatChartNumber(value: number): string {
  if (!Number.isFinite(value)) {
    return '—';
  }
  const absolute = Math.abs(value);
  const maximumFractionDigits = absolute >= 100 || Number.isInteger(value) ? 0 : absolute >= 10 ? 1 : 2;
  return value.toLocaleString('fa-IR', {
    maximumFractionDigits,
    useGrouping: true,
  });
}

export function seriesColor(index: number, customColors?: string[]): string {
  const palette = customColors?.length ? customColors : CHART_SERIES_COLORS;
  return palette[index % palette.length] ?? CHART_SERIES_COLORS[0];
}

function readPointValue(value: unknown): number {
  if (typeof value === 'number') {
    return value;
  }
  if (Array.isArray(value)) {
    const last = value[value.length - 1];
    return typeof last === 'number' ? last : Number(last);
  }
  return Number(value);
}

function renderTooltip(params: TooltipComponentFormatterCallbackParams): string {
  const rows = Array.isArray(params) ? params : [params];
  const rawTitle = String(rows[0]?.name ?? '');
  // Replace newline with a space for cleaner tooltip display
  const title = rawTitle.replace(/\n/g, ' - ');
  const body = rows
    .map((row) => {
      const color = typeof row.color === 'string' ? row.color : CHART_SERIES_COLORS[0];
      const numeric = readPointValue(row.value);
      return `<div style="display:flex;align-items:center;justify-content:space-between;gap:16px;margin-top:4px;">
        <span style="display:inline-flex;align-items:center;gap:6px;min-width:0;">
          <span style="width:8px;height:8px;border-radius:50%;background:${color};flex:none;"></span>
          <span style="overflow:hidden;text-overflow:ellipsis;">${row.seriesName ?? ''}</span>
        </span>
        <strong style="font-variant-numeric:tabular-nums;">${formatChartNumber(numeric)}</strong>
      </div>`;
    })
    .join('');

  return `<div style="min-width:148px;direction:rtl;text-align:right;">
    <div style="opacity:.72;margin-bottom:2px;">${title}</div>
    ${body}
  </div>`;
}

export function buildChartTooltip(theme: Theme): TooltipComponentOption {
  const isDark = theme.palette.mode === 'dark';
  return {
    trigger: 'axis',
    confine: false,
    appendToBody: true,
    backgroundColor: isDark ? theme.palette.background.paper : '#FFFFFF',
    borderColor: theme.palette.divider,
    borderWidth: 1,
    padding: [8, 10],
    textStyle: {
      color: theme.palette.text.primary,
      fontFamily: chartFontFamily(theme),
      fontSize: 12,
    },
    extraCssText: isDark
      ? 'border-radius:8px;box-shadow:0 10px 28px rgba(0,0,0,0.35);'
      : 'border-radius:8px;box-shadow:0 10px 28px rgba(15,23,42,0.12);',
    axisPointer: {
      type: 'line',
      lineStyle: {
        color: isDark ? 'rgba(148,163,184,0.45)' : 'rgba(15,23,42,0.28)',
        type: 'dashed',
        width: 1,
      },
    },
    formatter: renderTooltip,
  };
}

export function buildChartLegend(theme: Theme, seriesCount: number): LegendComponentOption {
  return {
    show: seriesCount > 1,
    type: 'scroll',
    top: 0,
    icon: 'circle',
    itemWidth: 8,
    itemHeight: 8,
    itemGap: 14,
    textStyle: {
      color: theme.palette.text.secondary,
      fontFamily: chartFontFamily(theme),
      fontSize: 11,
    },
    pageIconColor: theme.palette.text.secondary,
    pageIconInactiveColor: theme.palette.action.disabled,
    pageTextStyle: {
      color: theme.palette.text.secondary,
      fontFamily: chartFontFamily(theme),
    },
  };
}

export function buildChartGrid(seriesCount: number, rotateLabels: boolean): GridComponentOption {
  return {
    left: 2,
    right: 8,
    top: seriesCount > 1 ? 30 : 10,
    bottom: rotateLabels ? 8 : 6,
    containLabel: true,
  };
}

export function buildCategoryAxis(
  categories: string[],
  theme: Theme,
  rotateLabels: boolean,
  boundaryGap: boolean,
): XAXisComponentOption {
  return {
    type: 'category',
    data: categories,
    boundaryGap,
    axisLine: { show: false },
    axisTick: { show: false },
    axisLabel: {
      color: theme.palette.text.secondary,
      fontFamily: chartFontFamily(theme),
      fontSize: 11,
      hideOverlap: true,
      rotate: rotateLabels ? 32 : 0,
      margin: 12,
      formatter: (value: string) => value,
      lineHeight: 14,
    },
    splitLine: { show: false },
  };
}

export function buildValueAxis(theme: Theme): YAXisComponentOption {
  const isDark = theme.palette.mode === 'dark';
  return {
    type: 'value',
    axisLine: { show: false },
    axisTick: { show: false },
    axisLabel: {
      color: theme.palette.text.secondary,
      fontFamily: chartFontFamily(theme),
      fontSize: 11,
      formatter: (value: number) => formatChartNumber(value),
    },
    splitLine: {
      lineStyle: {
        color: isDark ? 'rgba(148,163,184,0.16)' : 'rgba(15,23,42,0.08)',
        type: 'dashed',
      },
    },
  };
}

export function seriesShadow(color: string, isDark: boolean) {
  return {
    shadowBlur: isDark ? 16 : 12,
    shadowOffsetY: 7,
    shadowColor: withAlpha(color, isDark ? 0.55 : 0.32),
  };
}

export function buildAreaGradient(color: string, isDark: boolean) {
  return {
    type: 'linear' as const,
    x: 0,
    y: 0,
    x2: 0,
    y2: 1,
    colorStops: [
      { offset: 0, color: withAlpha(color, isDark ? 0.38 : 0.24) },
      { offset: 1, color: withAlpha(color, 0) },
    ],
  };
}
