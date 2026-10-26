import { CREDENTIAL_REQUIRED_MESSAGE } from '@/features/database-credentials/utils/credentialLabels';
import {
  CheckType,
  HttpMethod,
  MongoOperationType,
  RedisOperationType,
  ResultType,
} from '@/types/enums';

export type SqlQuerySource = 'custom' | 'healthQuery';

export interface CheckFormValues {
  name: string;
  description: string;
  intervalSeconds: string;
  timeoutSeconds: string;
  retryCount: string;
  retryDelaySeconds: string;
  isActive: boolean;
  url: string;
  httpMethod: HttpMethod;
  expectedStatusCode: string;
  headers: string;
  requestBody: string;
  useSSOToken: boolean;
  databaseCredentialId: number | '';
  querySource: SqlQuerySource;
  healthQueryId: number | '';
  query: string;
  resultType: ResultType;
  redisCredentialId: number | '';
  redisDatabaseNumber: string;
  redisOperationType: RedisOperationType;
  redisCommandOrKeyName: string;
  redisExpectedValue: string;
  redisTimeoutSeconds: string;
  mongoCredentialId: number | '';
  mongoOperationType: MongoOperationType;
  mongoCollectionName: string;
  mongoQueryJson: string;
  mongoExpectedValue: string;
  mongoTimeoutSeconds: string;
}

export interface CheckFormErrors {
  name?: string;
  intervalSeconds?: string;
  timeoutSeconds?: string;
  retryCount?: string;
  retryDelaySeconds?: string;
  url?: string;
  expectedStatusCode?: string;
  headers?: string;
  requestBody?: string;
  databaseCredentialId?: string;
  querySource?: string;
  healthQueryId?: string;
  query?: string;
  redisCredentialId?: string;
  redisDatabaseNumber?: string;
  redisCommandOrKeyName?: string;
  redisTimeoutSeconds?: string;
  mongoCredentialId?: string;
  mongoCollectionName?: string;
  mongoQueryJson?: string;
  mongoTimeoutSeconds?: string;
}

function parseRequiredNumber(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : null;
}

function isValidJson(value: string): boolean {
  try {
    JSON.parse(value);
    return true;
  } catch {
    return false;
  }
}

export function validateCheckForm(values: CheckFormValues, checkType: CheckType | null): CheckFormErrors {
  const errors: CheckFormErrors = {};

  if (!values.name.trim()) {
    errors.name = 'نام شاخص الزامی است';
  }

  const interval = parseRequiredNumber(values.intervalSeconds);
  if (interval == null) {
    errors.intervalSeconds = 'فاصله اجرا الزامی است';
  } else if (interval <= 0) {
    errors.intervalSeconds = 'فاصله اجرا باید بزرگتر از صفر باشد';
  }

  const timeout = parseRequiredNumber(values.timeoutSeconds);
  if (timeout != null && timeout <= 0) {
    errors.timeoutSeconds = 'زمان انتظار باید بزرگتر از صفر باشد';
  }

  const retryCount = parseRequiredNumber(values.retryCount);
  if (retryCount != null && retryCount < 0) {
    errors.retryCount = 'تعداد تلاش مجدد معتبر نیست';
  }

  const retryDelay = parseRequiredNumber(values.retryDelaySeconds);
  if (retryDelay != null && retryDelay < 0) {
    errors.retryDelaySeconds = 'تاخیر تلاش مجدد معتبر نیست';
  }

  if (checkType === 1) { // HttpRequest or Http (both have value 1)
    if (!values.url.trim()) {
      errors.url = 'آدرس URL الزامی است';
    }

    const expectedStatus = parseRequiredNumber(values.expectedStatusCode);
    if (expectedStatus == null) {
      errors.expectedStatusCode = 'کد وضعیت مورد انتظار الزامی است';
    }

    if (values.headers.trim() && !isValidJson(values.headers)) {
      errors.headers = 'JSON هدرها معتبر نیست';
    }

    if (values.requestBody.trim() && !isValidJson(values.requestBody)) {
      errors.requestBody = 'JSON بدنه معتبر نیست';
    }
  }

  if (checkType === 2) { // SqlQuery or DatabaseQuery (both have value 2)
    if (!values.databaseCredentialId) {
      errors.databaseCredentialId = CREDENTIAL_REQUIRED_MESSAGE;
    }

    if (values.querySource === 'healthQuery') {
      if (!values.healthQueryId) {
        errors.healthQueryId = 'انتخاب کوئری سلامت الزامی است';
      }
    } else if (!values.query.trim()) {
      errors.query = 'کوئری الزامی است';
    }
  }

  if (checkType === CheckType.Redis) {
    if (!values.redisCredentialId) {
      errors.redisCredentialId = CREDENTIAL_REQUIRED_MESSAGE;
    }

    const redisDatabaseNumber = parseRequiredNumber(values.redisDatabaseNumber);
    if (redisDatabaseNumber == null) {
      errors.redisDatabaseNumber = 'Database Number الزامی است';
    } else if (redisDatabaseNumber < 0) {
      errors.redisDatabaseNumber = 'Database Number باید عدد صحیح مثبت باشد';
    }

    const redisTimeout = parseRequiredNumber(values.redisTimeoutSeconds);
    if (redisTimeout != null && redisTimeout <= 0) {
      errors.redisTimeoutSeconds = 'Timeout باید بزرگتر از صفر باشد';
    }

    const needsKey =
      values.redisOperationType === RedisOperationType.Get ||
      values.redisOperationType === RedisOperationType.KeyExists ||
      values.redisOperationType === RedisOperationType.ListLength;

    if (needsKey && !values.redisCommandOrKeyName.trim()) {
      errors.redisCommandOrKeyName = 'Key برای این Command الزامی است';
    }
  }

  if (checkType === CheckType.MongoDb) {
    if (!values.mongoCredentialId) {
      errors.mongoCredentialId = CREDENTIAL_REQUIRED_MESSAGE;
    }

    const mongoTimeout = parseRequiredNumber(values.mongoTimeoutSeconds);
    if (mongoTimeout != null && mongoTimeout <= 0) {
      errors.mongoTimeoutSeconds = 'Timeout باید بزرگتر از صفر باشد';
    }

    const needsCollection =
      values.mongoOperationType === MongoOperationType.CollectionCount ||
      values.mongoOperationType === MongoOperationType.Query;

    if (needsCollection && !values.mongoCollectionName.trim()) {
      errors.mongoCollectionName = 'Collection الزامی است';
    }

    if (
      values.mongoOperationType === MongoOperationType.Query &&
      values.mongoQueryJson.trim() &&
      !isValidJson(values.mongoQueryJson)
    ) {
      errors.mongoQueryJson = 'JSON کوئری معتبر نیست';
    }
  }

  return errors;
}

export function parseOptionalJsonString(value: string): string | null {
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

export function parseFormNumber(value: string, fallback: number): number {
  const parsed = parseRequiredNumber(value);
  return parsed == null ? fallback : parsed;
}
