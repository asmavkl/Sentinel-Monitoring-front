import { describe, expect, it } from 'vitest';
import { CredentialType, DatabaseHealthQueryCategory, ResultType } from '@/types/enums';
import {
  toCreateHealthQueryPayload,
  toUpdateHealthQueryPayload,
  validateHealthQueryForm,
  type HealthQueryFormValues,
} from './formValidation';

const valid: HealthQueryFormValues = {
  name: 'active_connections',
  displayName: 'Active Connections',
  description: '',
  databaseType: CredentialType.PostgreSql,
  category: DatabaseHealthQueryCategory.Connection,
  query: 'SELECT 1',
  unit: 'count',
  isActive: true,
};

describe('validateHealthQueryForm', () => {
  it('requires name, display name and query text', () => {
    const errors = validateHealthQueryForm({
      ...valid,
      name: '  ',
      displayName: '',
      query: '   ',
    });

    expect(errors.name).toBeTruthy();
    expect(errors.displayName).toBeTruthy();
    expect(errors.query).toBeTruthy();
  });

  it('rejects names longer than 200 characters', () => {
    const errors = validateHealthQueryForm({
      ...valid,
      name: 'n'.repeat(201),
      displayName: 'd'.repeat(201),
    });

    expect(errors.name).toBeTruthy();
    expect(errors.displayName).toBeTruthy();
  });

  it('rejects Redis as a health query database type', () => {
    const errors = validateHealthQueryForm({
      ...valid,
      databaseType: CredentialType.Redis,
    });

    expect(errors.databaseType).toBeTruthy();
  });
});

describe('health query payloads', () => {
  it('always sends Scalar and keeps isActive on create', () => {
    expect(toCreateHealthQueryPayload(valid)).toEqual({
      name: 'active_connections',
      displayName: 'Active Connections',
      description: null,
      databaseType: CredentialType.PostgreSql,
      category: DatabaseHealthQueryCategory.Connection,
      query: 'SELECT 1',
      resultType: ResultType.Scalar,
      unit: 'count',
      isActive: true,
    });
  });

  it('omits isActive on update', () => {
    const payload = toUpdateHealthQueryPayload(valid);
    expect(payload).not.toHaveProperty('isActive');
    expect(payload.resultType).toBe(ResultType.Scalar);
  });
});
