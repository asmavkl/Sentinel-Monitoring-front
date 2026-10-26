import { ResultType, type CredentialType, type DatabaseHealthQueryCategory } from '@/types/enums';
import { isRelationalCredentialType } from '@/features/database-credentials/utils/credentialType';
import type {
  CreateDatabaseHealthQueryRequest,
  UpdateDatabaseHealthQueryRequest,
} from '@/types/databaseHealthQueries';

export interface HealthQueryFormValues {
  name: string;
  displayName: string;
  description: string;
  databaseType: CredentialType | '';
  category: DatabaseHealthQueryCategory | '';
  query: string;
  unit: string;
  isActive: boolean;
}

export interface HealthQueryFormErrors {
  name?: string;
  displayName?: string;
  description?: string;
  databaseType?: string;
  category?: string;
  query?: string;
}

export function validateHealthQueryForm(values: HealthQueryFormValues): HealthQueryFormErrors {
  const errors: HealthQueryFormErrors = {};
  const name = values.name.trim();
  const displayName = values.displayName.trim();
  const description = values.description.trim();
  const query = values.query.trim();

  if (!name) {
    errors.name = 'نام الزامی است';
  } else if (name.length > 200) {
    errors.name = 'نام باید ۲۰۰ کاراکتر یا کمتر باشد';
  }

  if (!displayName) {
    errors.displayName = 'نام نمایشی الزامی است';
  } else if (displayName.length > 200) {
    errors.displayName = 'نام نمایشی باید ۲۰۰ کاراکتر یا کمتر باشد';
  }

  if (description.length > 2000) {
    errors.description = 'توضیحات باید ۲۰۰۰ کاراکتر یا کمتر باشد';
  }

  if (values.databaseType === '' || !isRelationalCredentialType(values.databaseType)) {
    errors.databaseType = 'نوع دیتابیس الزامی است';
  }

  if (values.category === '') {
    errors.category = 'دسته‌بندی الزامی است';
  }

  if (!query) {
    errors.query = 'متن کوئری الزامی است';
  }

  return errors;
}

export function toCreateHealthQueryPayload(
  values: HealthQueryFormValues,
): CreateDatabaseHealthQueryRequest {
  return {
    name: values.name.trim(),
    displayName: values.displayName.trim(),
    description: values.description.trim() || null,
    databaseType: values.databaseType as CredentialType,
    category: values.category as DatabaseHealthQueryCategory,
    query: values.query.trim(),
    resultType: ResultType.Scalar,
    unit: values.unit.trim() || null,
    isActive: values.isActive,
  };
}

export function toUpdateHealthQueryPayload(
  values: HealthQueryFormValues,
): UpdateDatabaseHealthQueryRequest {
  const payload = toCreateHealthQueryPayload(values);
  return {
    name: payload.name,
    displayName: payload.displayName,
    description: payload.description,
    databaseType: payload.databaseType,
    category: payload.category,
    query: payload.query,
    resultType: payload.resultType,
    unit: payload.unit,
  };
}
