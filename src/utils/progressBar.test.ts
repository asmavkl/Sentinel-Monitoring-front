import { describe, expect, it } from 'vitest';
import { barPercent, barTone, findBarConfiguration, parseProgressBarConfiguration } from './progressBar';

describe('progressBar', () => {
  it('fills the bar from each source min and max', () => {
    expect(barPercent(53.3, 0, 100)).toBeCloseTo(53.3);
    expect(barPercent(150, 0, 100)).toBe(100);
    expect(barPercent(-5, 0, 100)).toBe(0);
  });

  it('uses warning and critical thresholds on the bar scale', () => {
    const scale = { min: 0, max: 100, warning: 70, critical: 90, unit: '%' };

    expect(barTone(22.7, scale)).toBe('success');
    expect(barTone(70, scale)).toBe('warning');
    expect(barTone(90, scale)).toBe('error');
  });

  it('matches a bar by metric even when sources come from different checks', () => {
    const configuration = parseProgressBarConfiguration({
      decimalPlaces: 1,
      bars: [
        { checkId: 2, metricDefinitionId: 8, min: 0, max: 200, warning: 100, critical: 160, unit: 'ms' },
        { checkId: 1, metricDefinitionId: 4, min: 0, max: 100, warning: 60, critical: 80, unit: '%' },
      ],
    });

    const bar = findBarConfiguration(
      configuration.bars,
      { checkId: 1, metricDefinitionId: 4, metricName: 'disk_d' },
      0,
    );

    expect(bar.max).toBe(100);
    expect(bar.warning).toBe(60);
    expect(configuration.decimalPlaces).toBe(1);
  });

  it('reads numeric strings stored by the API configuration', () => {
    const configuration = parseProgressBarConfiguration({
      decimalPlaces: '1',
      bars: [{ min: '0', max: '100', warning: '70', critical: '90', unit: '%' }],
    });

    expect(configuration.decimalPlaces).toBe(1);
    expect(configuration.bars[0]?.warning).toBe(70);
    expect(configuration.bars[0]?.critical).toBe(90);
  });
});
