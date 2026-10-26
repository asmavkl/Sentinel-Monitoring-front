import ReactECharts from 'echarts-for-react';
import type { EChartsOption } from 'echarts';
import { useMemo } from 'react';
import { useTheme } from '@mui/material/styles';
import {
  buildAreaGradient,
  buildCategoryAxis,
  buildChartGrid,
  buildChartLegend,
  buildChartTooltip,
  buildValueAxis,
  CHART_SERIES_COLORS,
  seriesColor,
  seriesShadow,
} from './chartTheme';

export interface LineChartProps {
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

export function LineChart({
  categories,
  series,
  height = 320,
  width = '100%',
  rotateXAxisLabels = false,
  customColors,
}: LineChartProps) {
  const theme = useTheme();
  const isSingleSeries = series.length <= 1;

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
      xAxis: buildCategoryAxis(categories, theme, rotateXAxisLabels, false),
      yAxis: buildValueAxis(theme),
      series: series.map((item, index) => {
        const color = seriesColor(index, customColors);
        return {
          name: item.name,
          type: 'line' as const,
          smooth: 0.35,
          showSymbol: false,
          symbol: 'circle',
          symbolSize: 7,
          data: item.data,
          lineStyle: {
            width: 2,
            color,
            cap: 'round' as const,
            join: 'round' as const,
            ...seriesShadow(color, isDark),
          },
          itemStyle: {
            color,
            borderWidth: 2,
            borderColor: theme.palette.background.paper,
          },
          areaStyle: isSingleSeries ? { color: buildAreaGradient(color, isDark) } : undefined,
          emphasis: {
            focus: 'series' as const,
            lineStyle: { width: 2.5 },
          },
        };
      }),
    };
  }, [
    categories,
    customColors,
    isSingleSeries,
    rotateXAxisLabels,
    series,
    theme,
  ]);

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
