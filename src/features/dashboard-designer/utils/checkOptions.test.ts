import { describe, expect, it } from 'vitest';
import { getAvailableChecks, getChecksGroupedByComponent } from './checkOptions';
import type { ComponentStatusDto } from '@/types/dashboard';

const components: ComponentStatusDto[] = [
  {
    componentId: 11,
    applicationId: 1,
    name: 'API',
    code: 'API',
    isActive: true,
    status: 1,
    totalChecks: 1,
    activeChecks: 1,
    healthyChecks: 1,
    unhealthyChecks: 0,
    checks: [
      {
        checkId: 101,
        componentId: 11,
        name: 'Health API',
        checkType: 1, // HttpRequest or Http (both have value 1)
        isActive: true,
      },
    ],
  },
  {
    componentId: 12,
    applicationId: 1,
    name: 'Empty',
    code: 'EMPTY',
    isActive: true,
    status: 1,
    totalChecks: 0,
    activeChecks: 0,
    healthyChecks: 0,
    unhealthyChecks: 0,
    checks: [],
  },
];

describe('checkOptions', () => {
  it('groups checks by component and ignores empty components', () => {
    const groups = getChecksGroupedByComponent(components);

    expect(groups).toEqual([
      {
        componentId: 11,
        componentName: 'API',
        checks: [
          {
            checkId: 101,
            name: 'Health API',
            componentName: 'API',
            componentId: 11,
          },
        ],
      },
    ]);
  });

  it('flattens available checks for the current application', () => {
    expect(getAvailableChecks(components)).toEqual([
      {
        checkId: 101,
        name: 'Health API',
        componentName: 'API',
        componentId: 11,
      },
    ]);
  });
});
