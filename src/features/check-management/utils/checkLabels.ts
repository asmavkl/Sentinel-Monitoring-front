import { CheckType, HttpMethod, ResultType } from '@/types/enums';
import type { CheckListItem } from '@/types/checkManagement';

export function getCheckTypeLabel(checkType: CheckType | number): string {
  switch (checkType) {
    case CheckType.HttpRequest:
    case CheckType.Http:
    case 1: // Numeric value for backward compatibility
      return 'شاخص HTTP';
    case CheckType.SqlQuery:
    case CheckType.DatabaseQuery:
    case 2: // Numeric value for backward compatibility
      return 'شاخص Database';
    case CheckType.Redis:
      return 'شاخص Redis';
    case CheckType.MongoDb:
      return 'شاخص MongoDB';
    default:
      return '—';
  }
}

export function getHttpMethodLabel(method: HttpMethod): string {
  switch (method) {
    case HttpMethod.GET:
      return 'GET';
    case HttpMethod.POST:
      return 'POST';
    case HttpMethod.PUT:
      return 'PUT';
    case HttpMethod.DELETE:
      return 'DELETE';
    default:
      return 'GET';
  }
}

export function getResultTypeLabel(resultType: ResultType): string {
  switch (resultType) {
    case ResultType.Scalar:
      return 'Scalar';
    case ResultType.StatusCount:
      return 'StatusCount';
    case ResultType.Dataset:
      return 'Dataset';
    default:
      return 'StatusCount';
  }
}

export function filterChecks(
  checks: CheckListItem[],
  search: string,
  applicationId?: number | '',
  checkType?: CheckType | number | '',
): CheckListItem[] {
  const query = search.trim().toLowerCase();

  return checks.filter((check) => {
    const matchesSearch =
      !query ||
      check.name.toLowerCase().includes(query) ||
      check.applicationName.toLowerCase().includes(query) ||
      check.componentName.toLowerCase().includes(query);

    const matchesApplication = !applicationId || check.applicationId === applicationId;
    const matchesType = !checkType || check.checkType === checkType;

    return matchesSearch && matchesApplication && matchesType;
  });
}
