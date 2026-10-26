import { screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { databaseHealthQueriesApi } from '@/api/databaseHealthQueriesApi';
import { CheckSqlSourceCard } from './CheckSqlSourceCard';
import { renderWithProviders } from '@/test/testUtils';
import { CheckType, ResultType } from '@/types/enums';
import type { CheckDefinitionDto } from '@/types/checkManagement';

vi.mock('@/api/databaseHealthQueriesApi', () => ({
  databaseHealthQueriesApi: {
    getDatabaseHealthQueries: vi.fn(),
    getDatabaseHealthQuery: vi.fn(),
  },
}));

function check(partial: Partial<CheckDefinitionDto>): CheckDefinitionDto {
  return {
    id: 9,
    applicationComponentId: 1,
    applicationId: 1,
    name: 'DB check',
    checkType: CheckType.SqlQuery,
    intervalSeconds: 60,
    timeoutSeconds: 10,
    retryCount: 0,
    retryDelaySeconds: 0,
    isActive: true,
    ...partial,
  };
}

describe('CheckSqlSourceCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows the current catalog query when healthQueryId is set', async () => {
    vi.mocked(databaseHealthQueriesApi.getDatabaseHealthQuery).mockResolvedValue({
      id: 7,
      name: 'active_connections',
      displayName: 'Active Connections',
      databaseType: 4,
      category: 1,
      query: 'SELECT 20',
      resultType: ResultType.Scalar,
      isActive: true,
    });

    renderWithProviders(
      <CheckSqlSourceCard
        check={check({
          sqlConfiguration: {
            databaseCredentialId: 2,
            query: null,
            resultType: ResultType.Scalar,
            healthQueryId: 7,
          },
        })}
      />,
    );

    expect(await screen.findByText(/Active Connections/)).toBeInTheDocument();
    expect(screen.getByText('SELECT 20')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('shows custom SQL when healthQueryId is empty', async () => {
    renderWithProviders(
      <CheckSqlSourceCard
        check={check({
          sqlConfiguration: {
            databaseCredentialId: 2,
            query: 'SELECT COUNT(*) FROM Queue',
            resultType: ResultType.StatusCount,
            healthQueryId: null,
          },
        })}
      />,
    );

    expect(screen.getByText('SQL سفارشی')).toBeInTheDocument();
    expect(screen.getByText('SELECT COUNT(*) FROM Queue')).toBeInTheDocument();
    await waitFor(() => {
      expect(databaseHealthQueriesApi.getDatabaseHealthQuery).not.toHaveBeenCalled();
    });
  });
});
