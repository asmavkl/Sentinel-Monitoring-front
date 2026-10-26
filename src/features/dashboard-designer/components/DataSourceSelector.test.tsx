import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { DataSourceSelector, type MetricSelection } from './DataSourceSelector';
import { renderWithProviders } from '@/test/testUtils';
import type { ComponentStatusDto } from '@/types/dashboard';
import type { WidgetDataSourceRequestDto } from '@/types/widgets';

const mockUseMetricDefinitions = vi.fn();

vi.mock('@/features/dashboard/hooks/useMetricQueries', () => ({
  useMetricDefinitions: (checkId: number) => mockUseMetricDefinitions(checkId),
}));

const components: ComponentStatusDto[] = [
  {
    componentId: 11,
    applicationId: 1,
    name: 'Backend',
    code: 'API',
    isActive: true,
    status: 1,
    totalChecks: 1,
    activeChecks: 1,
    healthyChecks: 1,
    unhealthyChecks: 0,
    checks: [
      {
        checkId: 101,
        componentId: 11,
        name: 'Orders Health API',
        checkType: 1, // HttpRequest or Http (both have value 1)
        isActive: true,
      },
    ],
  },
  {
    componentId: 12,
    applicationId: 1,
    name: 'Database',
    code: 'DB',
    isActive: true,
    status: 1,
    totalChecks: 1,
    activeChecks: 1,
    healthyChecks: 1,
    unhealthyChecks: 0,
    checks: [
      {
        checkId: 202,
        componentId: 12,
        name: 'DB Ping',
        checkType: 2, // SqlQuery or DatabaseQuery (both have value 2)
        isActive: true,
      },
    ],
  },
];

function StatefulSelector({
  onChange,
}: {
  onChange: (
    dataSources: WidgetDataSourceRequestDto[],
    metric?: MetricSelection | null,
  ) => void;
}) {
  const [dataSources, setDataSources] = useState<WidgetDataSourceRequestDto[]>([]);
  return (
    <DataSourceSelector
      applicationName="سمیح"
      components={components}
      dataSources={dataSources}
      onChange={(nextSources) => {
        setDataSources(nextSources);
        onChange(nextSources);
      }}
    />
  );
}

describe('DataSourceSelector', () => {
  beforeEach(() => {
    mockUseMetricDefinitions.mockReturnValue({
      isLoading: false,
      data: [
        {
          id: 5,
          checkDefinitionId: 101,
          name: 'response_time',
          displayName: 'زمان پاسخ',
          metricType: 'Duration',
          aggregationType: 'Average',
          isVisible: true,
          createdDate: '2026-01-01T00:00:00Z',
        },
      ],
    });
  });

  it('loads metric definitions after cascading Application → Component → Check', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();

    renderWithProviders(<StatefulSelector onChange={onChange} />);

    expect(screen.getByLabelText('سامانه')).toBeInTheDocument();

    await user.click(screen.getByLabelText('مولفه'));
    await user.click(screen.getByRole('option', { name: 'Backend' }));

    await user.click(screen.getByLabelText('پایش'));
    await user.click(screen.getByRole('option', { name: 'Orders Health API' }));

    expect(onChange).toHaveBeenCalledWith([
      expect.objectContaining({
        checkId: 101,
        dataSourceType: 'Metric',
        displayOrder: 0,
      }),
    ]);

    await waitFor(() => {
      expect(mockUseMetricDefinitions).toHaveBeenCalledWith(101);
    });

    await user.click(screen.getByLabelText('متریک'));
    await user.click(screen.getByRole('option', { name: 'زمان پاسخ' }));

    expect(onChange).toHaveBeenCalledWith(
      [expect.objectContaining({ checkId: 101, metricName: 'response_time', metricDefinitionId: 5 })],
    );
  });
});
