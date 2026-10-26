import { describe, expect, it } from 'vitest';
import { CredentialType, HttpMethod, MongoOperationType, RedisOperationType, ResultType } from '@/types/enums';
import type { CheckFormValues } from './formValidation';
import { buildSqlConfiguration } from './sqlCheckPayload';

const values: CheckFormValues = {
  name: 'Sessions',
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
  databaseCredentialId: 4,
  querySource: 'custom',
  healthQueryId: '',
  query: 'SELECT COUNT(*) FROM sessions',
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

describe('buildSqlConfiguration', () => {
  it('keeps custom SQL and its result type', () => {
    expect(buildSqlConfiguration(values)).toEqual({
      databaseCredentialId: 4,
      healthQueryId: null,
      query: 'SELECT COUNT(*) FROM sessions',
      resultType: ResultType.StatusCount,
    });
  });

  it('sends the catalog id and a null query for a health query', () => {
    expect(
      buildSqlConfiguration({
        ...values,
        querySource: 'healthQuery',
        healthQueryId: 12,
        query: 'SELECT 999',
        resultType: ResultType.Dataset,
      }),
    ).toEqual({
      databaseCredentialId: 4,
      healthQueryId: 12,
      query: null,
      resultType: ResultType.Scalar,
    });
  });

  it('uses credential types as the health query database type filter', () => {
    expect(CredentialType.SqlServer).toBe(1);
    expect(CredentialType.PostgreSql).toBe(4);
    expect(CredentialType.MySql).toBe(5);
    expect(CredentialType.Oracle).toBe(6);
  });
});
