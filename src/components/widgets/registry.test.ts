import { describe, expect, it } from 'vitest';
import { getWidgetComponent } from '@/components/widgets/registry';
import { StatusCardWidget } from '@/components/widgets/StatusCardWidget';
import { MetricChartWidget } from '@/components/widgets/MetricChartWidget';

describe('WidgetRegistry', () => {
  it('resolves "StatusCard"', () => {
    expect(getWidgetComponent('StatusCard')).toBe(StatusCardWidget);
  });

  it('resolves "Chart" to MetricChartWidget', () => {
    expect(getWidgetComponent('Chart')).toBe(MetricChartWidget);
  });

  it('returns undefined for unknown type', () => {
    expect(getWidgetComponent('Custom')).toBeUndefined();
  });
});
