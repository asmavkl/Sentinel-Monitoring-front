import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import {
  CREDENTIAL_REQUIRED_MESSAGE,
  credentialScopeLabel,
} from '@/features/database-credentials/utils/credentialLabels';
import { RedisCheckForm } from './RedisCheckForm';
import { MongoDbCheckForm } from './MongoDbCheckForm';
import { HttpMethod, MongoOperationType, RedisOperationType, ResultType } from '@/types/enums';
import type { CheckFormValues } from '../utils/formValidation';

const values: CheckFormValues = {
  name: 'Check',
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
  query: '',
  resultType: ResultType.StatusCount,
  redisCredentialId: '',
  redisDatabaseNumber: '0',
  redisOperationType: RedisOperationType.Get,
  redisCommandOrKeyName: 'redis.connected_users',
  redisExpectedValue: '1',
  redisTimeoutSeconds: '30',
  mongoCredentialId: '',
  mongoOperationType: MongoOperationType.CollectionCount,
  mongoCollectionName: 'users',
  mongoQueryJson: '',
  mongoExpectedValue: '10',
  mongoTimeoutSeconds: '30',
};

describe('RedisCheckForm', () => {
  it('renders redis fields', () => {
    render(
      <RedisCheckForm values={values} errors={{}} credentials={[]} onChange={vi.fn()} />,
    );

    expect(screen.getByTestId('redis-check-form')).toBeInTheDocument();
    expect(screen.getByLabelText(credentialScopeLabel('Redis'))).toBeInTheDocument();
    expect(screen.getByLabelText('Redis Key')).toHaveValue('redis.connected_users');
    expect(screen.getByLabelText('Redis Expected Value')).toHaveValue('1');
  });

  it('shows credential validation error', () => {
    const errors = { redisCredentialId: CREDENTIAL_REQUIRED_MESSAGE };
    render(
      <RedisCheckForm values={values} errors={errors} credentials={[]} onChange={vi.fn()} />,
    );

    expect(screen.getByText(CREDENTIAL_REQUIRED_MESSAGE)).toBeInTheDocument();
  });
});

describe('MongoDbCheckForm', () => {
  it('renders mongodb fields', () => {
    render(
      <MongoDbCheckForm values={values} errors={{}} credentials={[]} onChange={vi.fn()} />,
    );

    expect(screen.getByTestId('mongodb-check-form')).toBeInTheDocument();
    expect(screen.getByLabelText(credentialScopeLabel('MongoDB'))).toBeInTheDocument();
    expect(screen.getByLabelText('MongoDB Collection')).toHaveValue('users');
    expect(screen.getByLabelText('MongoDB Expected Result')).toHaveValue('10');
  });

  it('shows credential validation error', () => {
    const errors = { mongoCredentialId: CREDENTIAL_REQUIRED_MESSAGE };
    render(
      <MongoDbCheckForm values={values} errors={errors} credentials={[]} onChange={vi.fn()} />,
    );

    expect(screen.getByText(CREDENTIAL_REQUIRED_MESSAGE)).toBeInTheDocument();
  });
});
