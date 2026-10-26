import { describe, expect, it } from 'vitest';
import { CREDENTIAL_REQUIRED_MESSAGE } from '@/features/database-credentials/utils/credentialLabels';
import { CheckType, HttpMethod, MongoOperationType, RedisOperationType, ResultType } from '@/types/enums';
import { validateCheckForm, type CheckFormValues } from './formValidation';

// Use numeric values for testing to avoid type conflicts
const HttpCheckType = 1; // HttpRequest or Http (both have value 1)
const DatabaseCheckType = 2; // SqlQuery or DatabaseQuery (both have value 2)

const baseValues: CheckFormValues = {
  name: 'Health API',
  description: '',
  intervalSeconds: '60',
  timeoutSeconds: '10',
  retryCount: '3',
  retryDelaySeconds: '5',
  isActive: true,
  url: '/api/health',
  httpMethod: HttpMethod.GET,
  expectedStatusCode: '200',
  headers: '',
  requestBody: '',
  useSSOToken: false,
  databaseCredentialId: 5,
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

describe('validateCheckForm', () => {
  it('requires common name and interval', () => {
    const errors = validateCheckForm(
      { ...baseValues, name: '', intervalSeconds: '' },
      CheckType.Http,
    );

    expect(errors.name).toBe('نام شاخص الزامی است');
    expect(errors.intervalSeconds).toBe('فاصله اجرا الزامی است');
  });

  it('requires HTTP URL and expected status', () => {
    const errors = validateCheckForm(
      { ...baseValues, url: '', expectedStatusCode: '' },
      HttpCheckType,
    );

    expect(errors.url).toBe('آدرس URL الزامی است');
    expect(errors.expectedStatusCode).toBe('کد وضعیت مورد انتظار الزامی است');
  });

  it('requires database query and credential', () => {
    const errors = validateCheckForm(
      { ...baseValues, query: '', databaseCredentialId: '' },
      DatabaseCheckType,
    );

    expect(errors.query).toBe('کوئری الزامی است');
    expect(errors.databaseCredentialId).toBe(CREDENTIAL_REQUIRED_MESSAGE);
  });

  it('requires a health query when that source is selected', () => {
    const errors = validateCheckForm(
      { ...baseValues, querySource: 'healthQuery', healthQueryId: '', query: '' },
      DatabaseCheckType,
    );

    expect(errors.healthQueryId).toBe('انتخاب کوئری سلامت الزامی است');
    expect(errors.query).toBeUndefined();
  });

  it('accepts a health query without custom SQL text', () => {
    expect(
      validateCheckForm(
        { ...baseValues, querySource: 'healthQuery', healthQueryId: 9, query: '' },
        DatabaseCheckType,
      ),
    ).toEqual({});
  });

  it('validates Redis credential and key for Get', () => {
    const errors = validateCheckForm(
      {
        ...baseValues,
        redisCredentialId: '',
        redisOperationType: RedisOperationType.Get,
        redisCommandOrKeyName: '',
      },
      CheckType.Redis,
    );

    expect(errors.redisCredentialId).toBe(CREDENTIAL_REQUIRED_MESSAGE);
    expect(errors.redisCommandOrKeyName).toBe('Key برای این Command الزامی است');
  });

  it('validates MongoDB credential and collection for Query', () => {
    const errors = validateCheckForm(
      {
        ...baseValues,
        mongoCredentialId: '',
        mongoOperationType: MongoOperationType.Query,
        mongoCollectionName: '',
        mongoQueryJson: '{bad',
      },
      CheckType.MongoDb,
    );

    expect(errors.mongoCredentialId).toBe(CREDENTIAL_REQUIRED_MESSAGE);
    expect(errors.mongoCollectionName).toBe('Collection الزامی است');
    expect(errors.mongoQueryJson).toBe('JSON کوئری معتبر نیست');
  });

  it('accepts a valid HTTP check form', () => {
    expect(validateCheckForm(baseValues, HttpCheckType)).toEqual({});
  });

  it('accepts a valid Redis check form', () => {
    expect(
      validateCheckForm(
        {
          ...baseValues,
          redisCredentialId: 1,
          redisOperationType: RedisOperationType.Get,
          redisCommandOrKeyName: 'redis.connected_users',
        },
        CheckType.Redis,
      ),
    ).toEqual({});
  });

  it('accepts a valid MongoDB check form', () => {
    expect(
      validateCheckForm(
        {
          ...baseValues,
          mongoCredentialId: 1,
        },
        CheckType.MongoDb,
      ),
    ).toEqual({});
  });
});
