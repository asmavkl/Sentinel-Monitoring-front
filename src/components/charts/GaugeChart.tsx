import ReactECharts from 'echarts-for-react';
import type { EChartsOption } from 'echarts';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Box } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { chartFontFamily, formatChartNumber } from './chartTheme';

export interface GaugeChartProps {
  value: number | null;
  min?: number;
  max?: number;
  title?: string;
  height?: number | string;
  unit?: string;
  decimalPlaces?: number;
}

const GAUGE_SPECTRUM: Array<{ stop: number; color: string }> = [
  { stop: 0, color: '#10B981' },
  { stop: 0.55, color: '#84CC16' },
  { stop: 0.78, color: '#f59f0bb0' },
  { stop: 1, color: '#ac0000' },
];

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function fillRatio(value: number, min: number, max: number): number {
  const span = max - min;
  if (!Number.isFinite(value) || span <= 0) {
    return 0;
  }
  return clamp((value - min) / span, 0, 1);
}

function parseHex(color: string): [number, number, number] {
  const hex = color.replace('#', '');
  return [
    Number.parseInt(hex.slice(0, 2), 16),
    Number.parseInt(hex.slice(2, 4), 16),
    Number.parseInt(hex.slice(4, 6), 16),
  ];
}

function colorAtRatio(ratio: number): string {
  const t = clamp(ratio, 0, 1);
  let index = 0;
  while (index < GAUGE_SPECTRUM.length - 1 && t > GAUGE_SPECTRUM[index + 1].stop) {
    index += 1;
  }
  const start = GAUGE_SPECTRUM[index];
  const end = GAUGE_SPECTRUM[Math.min(index + 1, GAUGE_SPECTRUM.length - 1)];
  const span = end.stop - start.stop || 1;
  const local = (t - start.stop) / span;
  const from = parseHex(start.color);
  const to = parseHex(end.color);
  const mixed = from.map((channel, channelIndex) => Math.round(channel + (to[channelIndex] - channel) * local));
  return `rgb(${mixed[0]}, ${mixed[1]}, ${mixed[2]})`;
}

function arcEnd(width: number, centerY: number, radius: number, angle: number) {
  const radians = (angle * Math.PI) / 180;
  return {
    x: width / 2 + Math.cos(radians) * radius,
    y: centerY - Math.sin(radians) * radius,
  };
}

function BoundLabel({
  x,
  y,
  boxWidth,
  boxHeight,
  ring,
  fontSize,
  text,
}: {
  x: number;
  y: number;
  boxWidth: number;
  boxHeight: number;
  ring: number;
  fontSize: number;
  text: string;
}) {
  const left = clamp(x, fontSize * 1.6, boxWidth - fontSize * 1.6);
  const top = clamp(y + ring * 0.55 + 4, 0, boxHeight - fontSize);

  return (
    <Box
      component="span"
      style={{
        position: 'absolute',
        left,
        top,
        transform: 'translateX(-50%)',
      }}
      sx={{
        color: 'text.secondary',
        fontSize,
        fontWeight: 600,
        lineHeight: 1,
        pointerEvents: 'none',
        whiteSpace: 'nowrap',
      }}
    >
      {text}
    </Box>
  );
}

function formatGaugeValue(value: number, decimalPlaces: number): string {
  if (!Number.isFinite(value)) {
    return '—';
  }
  if (decimalPlaces <= 0) {
    return formatChartNumber(value);
  }
  return value.toLocaleString('fa-IR', {
    minimumFractionDigits: decimalPlaces,
    maximumFractionDigits: decimalPlaces,
    useGrouping: true,
  });
}

function GaugeBounds({
  width,
  height,
  centerY,
  radius,
  ring,
  wide,
  fontSize,
  minLabel,
  maxLabel,
}: {
  width: number;
  height: number;
  centerY: number;
  radius: number;
  ring: number;
  wide: boolean;
  fontSize: number;
  minLabel: string;
  maxLabel: string;
}) {
  const minPoint = arcEnd(width, centerY, radius, wide ? 180 : 210);
  const maxPoint = arcEnd(width, centerY, radius, wide ? 0 : -30);

  return (
    <>
      <BoundLabel x={minPoint.x} y={minPoint.y} boxWidth={width} boxHeight={height} ring={ring} fontSize={fontSize} text={minLabel} />
      <BoundLabel x={maxPoint.x} y={maxPoint.y} boxWidth={width} boxHeight={height} ring={ring} fontSize={fontSize} text={maxLabel} />
    </>
  );
}

export function GaugeChart({
  value,
  min = 0,
  max = 100,
  title,
  height = '100%',
  unit = '',
  decimalPlaces = 0,
}: GaugeChartProps) {
  const theme = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<ReactECharts>(null);
  const [box, setBox] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const node = containerRef.current;
    if (!node) {
      return;
    }

    const measure = () => {
      const nextWidth = node.clientWidth;
      const nextHeight = node.clientHeight;
      setBox((current) => (
        current.width === nextWidth && current.height === nextHeight
          ? current
          : { width: nextWidth, height: nextHeight }
      ));
    };

    measure();
    if (typeof ResizeObserver === 'undefined') {
      return;
    }
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (box.width <= 0 || box.height <= 0) {
      return;
    }

    chartRef.current?.getEchartsInstance()?.resize({
      width: box.width,
      height: box.height,
    });
  }, [box.height, box.width]);

  const layout = useMemo(() => {
    const width = Math.max(box.width, 1);
    const plotHeight = Math.max(box.height, 1);
    const shortest = Math.min(width, plotHeight);
    const wide = plotHeight / width < 0.9;
    const ring = clamp(shortest * 0.07, 5, 16);
    const labelSize = clamp(shortest * 0.07, 11, 14);
    const labelBand = labelSize + ring + 8;
    const centerY = wide ? plotHeight - labelBand : plotHeight * 0.48;
    const maxRadius = Math.max(24, centerY - 8);
    const radiusLimit = wide
      ? width * 0.46
      : Math.min(
        Math.min(width, plotHeight - labelBand) * 0.46,
        Math.max(24, (plotHeight - labelBand - centerY - ring) * 2),
      );
    const radius = Math.min(maxRadius, Math.max(24, radiusLimit));

    return {
      wide,
      ring,
      radius,
      labelSize,
      centerY,
      detailSize: clamp(radius * 0.2, 13, 26),
      showTitle: Boolean(title) && shortest >= 160,
    };
  }, [box.height, box.width, title]);

  const option = useMemo<EChartsOption>(() => {
    const { wide, ring, radius, centerY, detailSize, showTitle } = layout;
    const isDark = theme.palette.mode === 'dark';
    const track = isDark ? 'rgba(148,163,184,0.22)' : 'rgba(15,23,42,0.08)';
    const fontFamily = chartFontFamily(theme);
    const ratio = value != null ? fillRatio(value, min, max) : 0;
    const valueColor = value != null ? colorAtRatio(ratio) : theme.palette.text.secondary;

    return {
      animationDuration: 420,
      animationDurationUpdate: 280,
      series: [
        {
          type: 'gauge',
          min,
          max,
          startAngle: wide ? 180 : 210,
          endAngle: wide ? 0 : -30,
          center: ['50%', centerY],
          radius,
          pointer: { show: false },
          anchor: { show: false },
          progress: {
            show: value != null,
            width: ring,
            roundCap: true,
            itemStyle: {
              color: {
                type: 'linear',
                x: 0,
                y: 0,
                x2: 1,
                y2: 0,
                colorStops: GAUGE_SPECTRUM.map((stop) => ({ offset: stop.stop, color: stop.color })),
              },
            },
          },
          axisLine: {
            roundCap: true,
            lineStyle: {
              width: ring,
              color: [[1, track]],
            },
          },
          axisTick: { show: false },
          splitLine: { show: false },
          axisLabel: { show: false },
          detail: {
            valueAnimation: value != null,
            offsetCenter: [0, wide ? '-30%' : '0%'],
            fontSize: detailSize,
            fontWeight: 700,
            fontFamily,
            color: valueColor,
            width: Math.max(48, radius * 1.2),
            overflow: 'break',
            lineHeight: Math.round(detailSize * 1.15),
            formatter: (current: number) => {
              if (value == null) {
                return '—';
              }
              const formatted = formatGaugeValue(current, decimalPlaces);
              return unit ? `${formatted} ${unit}` : formatted;
            },
          },
          title: showTitle
            ? {
              show: true,
              offsetCenter: [0, wide ? '28%' : '62%'],
              fontSize: clamp(detailSize * 0.4, 11, 14),
              color: theme.palette.text.secondary,
              fontFamily,
            }
            : { show: false },
          data: [{ value: value ?? 0, name: showTitle ? title : '' }],
        },
      ],
    };
  }, [
    decimalPlaces,
    layout,
    max,
    min,
    theme,
    title,
    unit,
    value,
  ]);

  return (
    <Box
      ref={containerRef}
      dir="ltr"
      sx={{
        position: 'relative',
        width: '100%',
        height,
        minHeight: 0,
        flex: 1,
        overflow: 'hidden',
      }}
    >
      <ReactECharts
        ref={chartRef}
        option={option}
        style={
          box.width > 0 && box.height > 0
            ? { position: 'absolute', left: 0, top: 0, width: box.width, height: box.height }
            : { width: '100%', height: '100%' }
        }
        opts={{ renderer: 'canvas' }}
        notMerge
        lazyUpdate
      />
      {box.width > 0 && box.height > 0 ? (
        <GaugeBounds
          width={box.width}
          height={box.height}
          centerY={layout.centerY}
          radius={layout.radius}
          ring={layout.ring}
          wide={layout.wide}
          fontSize={layout.labelSize}
          minLabel={formatGaugeValue(min, decimalPlaces)}
          maxLabel={formatGaugeValue(max, decimalPlaces)}
        />
      ) : null}
    </Box>
  );
}
