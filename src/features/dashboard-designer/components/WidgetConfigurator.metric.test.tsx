import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { WidgetConfigurator } from './WidgetConfigurator';
import { renderWithProviders } from '@/test/testUtils';

describe('WidgetConfigurator metric configuration', () => {
  it('saves aggregation, timeRange and keeps metricId in configuration', async () => {
    const onConfigurationChange = vi.fn();
    const user = userEvent.setup();

    renderWithProviders(
      <WidgetConfigurator
        widgetType="Chart"
        title="نمودار"
        description=""
        configuration={{
          chartType: 'line',
          showLegend: true,
          timeRange: '24h',
          aggregation: 'Average',
          metricId: 5,
        }}
        onTitleChange={() => undefined}
        onDescriptionChange={() => undefined}
        onConfigurationChange={onConfigurationChange}
      />,
    );

    await user.click(screen.getByLabelText('تجمیع'));
    await user.click(screen.getByRole('option', { name: 'حداکثر' }));

    expect(onConfigurationChange).toHaveBeenCalledWith(
      expect.objectContaining({
        aggregation: 'Max',
        timeRange: '24h',
        metricId: 5,
      }),
    );

    await user.click(screen.getByLabelText('بازه زمانی'));
    await user.click(screen.getByRole('option', { name: '۱ ساعت اخیر' }));

    expect(onConfigurationChange).toHaveBeenCalledWith(
      expect.objectContaining({
        timeRange: '1h',
        metricId: 5,
      }),
    );
  });
});
