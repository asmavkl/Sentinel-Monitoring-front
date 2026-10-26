import ReactECharts from 'echarts-for-react';
import type { EChartsOption } from 'echarts';
import { useMemo } from 'react';
import { useTheme } from '@mui/material/styles';
import {
  buildCategoryAxis,
  buildChartGrid,
  buildChartLegend,
  buildChartTooltip,
  buildValueAxis,
  CHART_SERIES_COLORS,
  seriesColor,
  seriesShadow,
} from './chartTheme';

export interface BarChartProps {
  categories: string[];
  series: Array<{
    name: string;
    data: number[];
  }>;
  height?: number;
  width?: number | string;
  rotateXAxisLabels?: boolean;
  customColors?: string[];
}

export function BarChart({
  categories,
  series,
  height = 320,
  width = '100%',
  rotateXAxisLabels = false,
  customColors,
}: BarChartProps) {
  const theme = useTheme();

  const option = useMemo<EChartsOption>(() => {
    const isDark = theme.palette.mode === 'dark';
    const palette = customColors?.length ? customColors : [...CHART_SERIES_COLORS];

    return {
      color: palette,
      animationDuration: 420,
      animationDurationUpdate: 280,
      tooltip: buildChartTooltip(theme),
      legend: buildChartLegend(theme, series.length),
      grid: buildChartGrid(series.length, rotateXAxisLabels),
      xAxis: buildCategoryAxis(categories, theme, rotateXAxisLabels, true),
      yAxis: buildValueAxis(theme),
      series: series.map((item, index) => {
        const color = seriesColor(index, customColors);
        return {
          name: item.name,
          type: 'bar' as const,
          data: item.data,
          barMaxWidth: 22,
          itemStyle: {
            color,
            borderRadius: [4, 4, 0, 0],
            ...seriesShadow(color, isDark),
          },
          emphasis: { focus: 'series' as const },
        };
      }),
    };
  }, [categories, customColors, rotateXAxisLabels, series, theme]);

  return (
    <ReactECharts
      option={option}
      style={{ height, width }}
      opts={{ renderer: 'canvas' }}
      notMerge
      lazyUpdate
    />
  );
}
