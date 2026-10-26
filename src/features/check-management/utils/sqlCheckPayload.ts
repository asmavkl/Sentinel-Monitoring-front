import { ResultType } from '@/types/enums';
import type {
  CheckDefinitionDto,
  CreateDatabaseCheckConfigurationRequest,
  DatabaseCheckConfigurationDto,
} from '@/types/checkManagement';
import type { CheckFormValues } from './formValidation';

export function getSqlConfiguration(
  check: Pick<CheckDefinitionDto, 'sqlConfiguration' | 'databaseConfiguration'>,
): DatabaseCheckConfigurationDto | null {
  return check.sqlConfiguration ?? check.databaseConfiguration ?? null;
}

export function buildSqlConfiguration(values: CheckFormValues): CreateDatabaseCheckConfigurationRequest {
  if (values.querySource === 'healthQuery') {
    return {
      databaseCredentialId: Number(values.databaseCredentialId),
      healthQueryId: Number(values.healthQueryId),
      query: null,
      resultType: ResultType.Scalar,
    };
  }

  return {
    databaseCredentialId: Number(values.databaseCredentialId),
    healthQueryId: null,
    query: values.query.trim(),
    resultType: values.resultType,
  };
}
