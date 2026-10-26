import { describe, expect, it } from 'vitest';
import { CheckType, ExecutionStatus } from '@/types/enums';
import type { CheckListItem } from '@/types/checkManagement';
import { filterChecks, getCheckTypeLabel } from './checkLabels';

const checks: CheckListItem[] = [
  {
    id: 21,
    applicationComponentId: 11,
    applicationId: 1,
    name: 'Health API',
    checkType: 1, // HttpRequest or Http (both have value 1)
    intervalSeconds: 60,
    timeoutSeconds: 10,
    retryCount: 3,
    retryDelaySeconds: 5,
    isActive: true,
    applicationName: 'سمیح',
    componentName: 'API',
    lastStatus: ExecutionStatus.Success,
  },
  {
    id: 22,
    applicationComponentId: 12,
    applicationId: 2,
    name: 'Status Count',
    checkType: 2, // SqlQuery or DatabaseQuery (both have value 2)
    intervalSeconds: 120,
    timeoutSeconds: 20,
    retryCount: 1,
    retryDelaySeconds: 5,
    isActive: false,
    applicationName: 'پرداخت',
    componentName: 'DB',
    lastStatus: null,
  },
];

describe('checkLabels', () => {
  it('returns Persian-facing type labels', () => {
    expect(getCheckTypeLabel(1)).toBe('شاخص HTTP'); // HttpRequest or Http
    expect(getCheckTypeLabel(2)).toBe('شاخص Database'); // SqlQuery or DatabaseQuery
    expect(getCheckTypeLabel(CheckType.Redis)).toBe('شاخص Redis');
    expect(getCheckTypeLabel(CheckType.MongoDb)).toBe('شاخص MongoDB');
  });

  it('filters checks by search text and type', () => {
    expect(filterChecks(checks, 'health')).toHaveLength(1);
    expect(filterChecks(checks, 'پرداخت')).toEqual([expect.objectContaining({ id: 22 })]);
    expect(filterChecks(checks, '', 1)).toHaveLength(1);
    expect(filterChecks(checks, '', '', 2)).toHaveLength(1); // SqlQuery or DatabaseQuery
  });
});
