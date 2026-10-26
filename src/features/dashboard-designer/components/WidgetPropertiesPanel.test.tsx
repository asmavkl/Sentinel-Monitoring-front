import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { AggregationType, MetricType } from '@/types/enums';
import type { ServerMetricDefinitionDto } from '@/types/monitoredServers';
import { WidgetPropertiesPanel } from './WidgetPropertiesPanel';
import { renderWithProviders } from '@/test/testUtils';
import { createStatusCardWidget } from '@/test/widgetFixtures';
import { useDashboardStore } from '@/store/dashboardStore';

const serverMetric: ServerMetricDefinitionDto = {
  id: 7,
  monitoredServerId: 1,
  name: 'cpu.usage_percent',
  displayName: 'CPU',
  description: null,
  instanceKey: null,
  metricType: MetricType.Percentage,
  unit: '%',
  aggregationType: AggregationType.Latest,
  isVisible: true,
};

describe('WidgetPropertiesPanel section selection', () => {
  it('shows a section dropdown for the selected widget', async () => {
    useDashboardStore.getState().reset();
    const onWidgetChange = vi.fn();
    const user = userEvent.setup();

    renderWithProviders(
      <WidgetPropertiesPanel
        widget={createStatusCardWidget({ id: 1, sectionId: 1 })}
        section={null}
        sections={[
          {
            id: 1,
            title: 'سامانه‌های حیاتی',
            displayOrder: 0,
            isVisible: true,
            widgets: [],
          },
          {
            id: 2,
            title: 'Metrics',
            displayOrder: 1,
            isVisible: true,
            widgets: [],
          },
        ]}
        availableChecks={[]}
        onWidgetChange={onWidgetChange}
        onSectionChange={() => undefined}
      />,
    );

    expect(screen.getByLabelText('بخش ویجت')).toBeInTheDocument();
    await user.click(screen.getByLabelText('بخش ویجت'));
    await user.click(screen.getByRole('option', { name: 'Metrics' }));
    expect(onWidgetChange).toHaveBeenCalledWith({ sectionId: 2 });
  });

  it('shows one metric selector and the add metric button for a server progress bar', () => {
    useDashboardStore.getState().reset();
    useDashboardStore.getState().setPropertiesTab(1);

    renderWithProviders(
      <WidgetPropertiesPanel
        widget={createStatusCardWidget({
          id: 1,
          sectionId: 1,
          widgetType: 'ProgressBar',
          title: 'نوار پیشرفت',
          configuration: { decimalPlaces: 1, bars: [] },
          dataSources: [],
        })}
        section={null}
        sections={[
          {
            id: 1,
            title: 'منابع',
            displayOrder: 0,
            isVisible: true,
            widgets: [],
          },
        ]}
        availableChecks={[]}
        serverMetrics={[serverMetric]}
        isServerMode
        onWidgetChange={() => undefined}
        onSectionChange={() => undefined}
      />,
    );

    expect(screen.getByTestId('server-progress-bar-source-editor')).toBeInTheDocument();
    expect(screen.getByLabelText('متریک')).toBeInTheDocument();
    expect(screen.queryByLabelText('مولفه')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('پایش')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'افزودن متریک' })).toBeInTheDocument();
  });
});
