import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { databaseHealthQueriesApi } from '@/api/databaseHealthQueriesApi';
import { credentialScopeLabel } from '@/features/database-credentials/utils/credentialLabels';
import { DatabaseCheckForm } from './DatabaseCheckForm';
import { renderWithProviders } from '@/test/testUtils';
import { CredentialType, HttpMethod, MongoOperationType, RedisOperationType, ResultType } from '@/types/enums';
import type { DatabaseCredentialDto } from '@/types/databaseCredentials';
import type { DatabaseHealthQueryDto } from '@/types/databaseHealthQueries';
import type { CheckFormValues } from '../utils/formValidation';

vi.mock('@/api/databaseHealthQueriesApi', () => ({
  databaseHealthQueriesApi: {
    getDatabaseHealthQueries: vi.fn(),
    getDatabaseHealthQuery: vi.fn(),
  },
}));

const credentials: DatabaseCredentialDto[] = [
  {
    id: 1,
    name: 'SQL Prod',
    server: 'sql.example',
    databaseName: 'app',
    username: 'monitor',
    isActive: true,
    credentialType: CredentialType.SqlServer,
  },
  {
    id: 2,
    name: 'PG Prod',
    server: 'pg.example',
    databaseName: 'app',
    username: 'monitor',
    isActive: true,
    credentialType: CredentialType.PostgreSql,
  },
  {
    id: 3,
    name: 'MySQL Prod',
    server: 'mysql.example',
    databaseName: 'app',
    username: 'monitor',
    isActive: true,
    credentialType: CredentialType.MySql,
  },
  {
    id: 4,
    name: 'Oracle Prod',
    server: 'oracle.example',
    databaseName: 'ORCL',
    username: 'monitor',
    isActive: true,
    credentialType: CredentialType.Oracle,
  },
  {
    id: 5,
    name: 'Redis Prod',
    server: 'redis.example',
    databaseName: '__redis__0',
    username: '',
    isActive: true,
    credentialType: CredentialType.Redis,
  },
];

function queryFor(type: number, id: number, displayName: string): DatabaseHealthQueryDto {
  return {
    id,
    name: displayName.toLowerCase().replace(/\s+/g, '_'),
    displayName,
    databaseType: type as DatabaseHealthQueryDto['databaseType'],
    category: 1,
    query: `SELECT ${id}`,
    resultType: ResultType.Scalar,
    isActive: true,
  };
}

const emptyValues: CheckFormValues = {
  name: '',
  description: '',
  intervalSeconds: '60',
  timeoutSeconds: '10',
  retryCount: '3',
  retryDelaySeconds: '5',
  isActive: true,
  url: '',
  httpMethod: HttpMethod.GET,
  expectedStatusCode: '200',
  headers: '',
  requestBody: '',
  useSSOToken: false,
  databaseCredentialId: '',
  querySource: 'custom',
  healthQueryId: '',
  query: 'SELECT 1',
  resultType: ResultType.StatusCount,
  redisCredentialId: '',
  redisDatabaseNumber: '0',
  redisOperationType: RedisOperationType.Ping,
  redisCommandOrKeyName: '',
  redisExpectedValue: '',
  redisTimeoutSeconds: '30',
  mongoCredentialId: '',
  mongoOperationType: MongoOperationType.Ping,
  mongoCollectionName: '',
  mongoQueryJson: '',
  mongoExpectedValue: '',
  mongoTimeoutSeconds: '30',
};

function Harness() {
  const [values, setValues] = useState<CheckFormValues>(emptyValues);
  return (
    <DatabaseCheckForm
      values={values}
      errors={{}}
      credentials={credentials}
      onChange={(patch) => setValues((current) => ({ ...current, ...patch }))}
    />
  );
}

describe('DatabaseCheckForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(databaseHealthQueriesApi.getDatabaseHealthQuery).mockResolvedValue(
      queryFor(CredentialType.PostgreSql, 10, 'PG Sessions'),
    );
    vi.mocked(databaseHealthQueriesApi.getDatabaseHealthQueries).mockImplementation(async (filters) => {
      const databaseType = filters?.databaseType;
      if (databaseType == null || filters?.isActive !== true) {
        return [];
      }

      return [queryFor(databaseType, databaseType * 10, `Type ${databaseType}`)];
    });
  });

  it('keeps custom SQL fields and hides Redis credentials', async () => {
    const user = userEvent.setup();
    renderWithProviders(<Harness />);

    expect(screen.getByLabelText('Query')).toBeInTheDocument();
    expect(screen.getByLabelText('Result Type')).toBeInTheDocument();

    await user.click(screen.getByLabelText(credentialScopeLabel('Database')));
    expect(screen.getByRole('option', { name: 'PG Prod' })).toBeInTheDocument();
    expect(screen.queryByRole('option', { name: 'Redis Prod' })).not.toBeInTheDocument();
  });

  it('loads only active queries for the selected credential type and resets on type change', async () => {
    const user = userEvent.setup();
    renderWithProviders(<Harness />);

    await user.click(screen.getByRole('radio', { name: 'کوئری سلامت دیتابیس' }));
    expect(screen.getByLabelText('کوئری سلامت')).toHaveAttribute('aria-disabled', 'true');
    expect(screen.queryByLabelText('Query')).not.toBeInTheDocument();

    await user.click(screen.getByLabelText(credentialScopeLabel('Database')));
    await user.click(await screen.findByRole('option', { name: 'PG Prod' }));

    await waitFor(() => {
      expect(databaseHealthQueriesApi.getDatabaseHealthQueries).toHaveBeenCalledWith({
        databaseType: CredentialType.PostgreSql,
        isActive: true,
      });
    });

    await user.click(screen.getByLabelText('کوئری سلامت'));
    await user.click(await screen.findByRole('option', { name: 'Type 4' }));
    expect(screen.getByLabelText('کوئری سلامت')).toHaveTextContent('Type 4');

    await user.click(screen.getByLabelText(credentialScopeLabel('Database')));
    await user.click(await screen.findByRole('option', { name: 'MySQL Prod' }));

    await waitFor(() => {
      expect(screen.getByLabelText('کوئری سلامت')).not.toHaveTextContent('Type 4');
    });
    await waitFor(() => {
      expect(databaseHealthQueriesApi.getDatabaseHealthQueries).toHaveBeenCalledWith({
        databaseType: CredentialType.MySql,
        isActive: true,
      });
    });

    await user.click(screen.getByLabelText('کوئری سلامت'));
    expect(await screen.findByRole('option', { name: 'Type 5' })).toBeInTheDocument();
    expect(screen.queryByRole('option', { name: 'Type 4' })).not.toBeInTheDocument();
  });

  it.each([
    ['SQL Prod', CredentialType.SqlServer],
    ['PG Prod', CredentialType.PostgreSql],
    ['MySQL Prod', CredentialType.MySql],
    ['Oracle Prod', CredentialType.Oracle],
  ])('requests active %s queries only', async (credentialName, databaseType) => {
    const user = userEvent.setup();
    renderWithProviders(<Harness />);

    await user.click(screen.getByRole('radio', { name: 'کوئری سلامت دیتابیس' }));
    await user.click(screen.getByLabelText(credentialScopeLabel('Database')));
    await user.click(await screen.findByRole('option', { name: credentialName }));

    await waitFor(() => {
      expect(databaseHealthQueriesApi.getDatabaseHealthQueries).toHaveBeenCalledWith({
        databaseType,
        isActive: true,
      });
    });
  });
});
