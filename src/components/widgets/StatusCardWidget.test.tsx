import { describe, expect, it, vi } from 'vitest';
import { StatusCardWidget } from '@/components/widgets/StatusCardWidget';
import { ExecutionStatus } from '@/types/enums';
import { defaultWidgetLayout } from '@/test/widgetFixtures';
import { renderWithProviders } from '@/test/testUtils';

vi.mock('@/features/dashboard/hooks/useCheckStatus', () => ({
  useCheckStatus: () => ({
    data: undefined,
    isLoading: false,
    isError: false,
    dataUpdatedAt: 0,
  }),
}));

describe('StatusCardWidget', () => {
  it('reads datasource status and displays UP with duration', () => {
    const { getByText, getByTestId } = renderWithProviders(
      <StatusCardWidget
        title="API Health"
        configuration={{ showDuration: true }}
        layout={defaultWidgetLayout}
        dataSources={[
          {
            id: 1,
            checkId: 101,
            status: {
              checkId: 101,
              componentId: 11,
              name: 'API Check',
              checkType: 1,
              isActive: true,
              lastStatus: ExecutionStatus.Success,
              lastDurationMs: 120,
            },
          },
        ]}
      />,
    );

    expect(getByTestId('status-card-widget')).toBeInTheDocument();
    expect(getByText('120 ms')).toBeInTheDocument();
    expect(getByText('سالم')).toBeInTheDocument();
  });

  it('displays DOWN status', () => {
    const { getByText } = renderWithProviders(
      <StatusCardWidget
        title="Database Health"
        configuration={{ showDuration: true }}
        layout={defaultWidgetLayout}
        dataSources={[
          {
            id: 2,
            checkId: 102,
            status: {
              checkId: 102,
              componentId: 12,
              name: 'DB Check',
              checkType: 2,
              isActive: true,
              lastStatus: ExecutionStatus.Failed,
              lastDurationMs: 500,
            },
          },
        ]}
      />,
    );

    expect(getByText('500 ms')).toBeInTheDocument();
    expect(getByText('قطع')).toBeInTheDocument();
  });
});
