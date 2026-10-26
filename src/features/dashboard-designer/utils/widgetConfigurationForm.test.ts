import { describe, expect, it } from 'vitest';
import { getDefaultConfiguration, readRefreshIntervalOption } from './widgetConfigurationForm';

describe('widgetConfigurationForm', () => {
  it('uses metric configuration defaults', () => {
    expect(getDefaultConfiguration('StatusCard')).toEqual({
      showDuration: true,
    });
    expect(getDefaultConfiguration('Chart')).toEqual({
      chartType: 'line',
      showLegend: true,
      timeRange: '24h',
    });
    expect(getDefaultConfiguration('NumberCard')).toEqual({
      valueFormat: '0.00',
      showTrend: true,
    });
    expect(getDefaultConfiguration('Table')).toEqual({
      showPagination: true,
      pageSize: 10,
    });
  });

  it('reads refreshInterval from configuration', () => {
    expect(readRefreshIntervalOption({ refreshInterval: 60_000 })).toBe(60_000);
    expect(readRefreshIntervalOption({})).toBeNull();
  });
});
