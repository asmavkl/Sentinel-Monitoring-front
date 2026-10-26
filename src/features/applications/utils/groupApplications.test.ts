import { describe, expect, it } from 'vitest';
import { groupApplications, resolveApplicationGroup } from './groupApplications';
import type { ApplicationListItem } from '@/types/applications';
import { ApplicationPriority } from '@/types/enums';

function app(
  id: number,
  name: string,
  code: string,
  priority: ApplicationPriority,
): ApplicationListItem {
  return {
    id,
    name,
    code,
    isActive: true,
    priority,
    status: 'UP',
    lastUpdate: null,
    availabilityStatus: undefined,
  };
}

describe('groupApplications', () => {
  it('groups by application priority from backend', () => {
    expect(
      resolveApplicationGroup(app(10, 'سامانه سمیح', 'X', ApplicationPriority.Critical)),
    ).toBe('critical');
    expect(
      resolveApplicationGroup(app(10, 'ERP Portal', 'ERP', ApplicationPriority.Important)),
    ).toBe('important');
    expect(resolveApplicationGroup(app(10, 'Archive', 'LOW-1', ApplicationPriority.Low))).toBe(
      'low',
    );
  });

  it('does not use keyword matching', () => {
    expect(
      resolveApplicationGroup(app(1, 'سامانه سمیح حیاتی', 'CRITICAL', ApplicationPriority.Low)),
    ).toBe('low');
  });

  it('omits empty groups', () => {
    const groups = groupApplications([
      app(1, 'Samih', 'SAMIH', ApplicationPriority.Critical),
      app(2, 'ERP', 'ERP', ApplicationPriority.Important),
    ]);

    expect(groups.map((group) => group.key)).toEqual(['critical', 'important']);
    expect(groups[0]?.title).toBe('سامانه های حیاتی');
    expect(groups[1]?.title).toBe('سامانه های مهم');
  });
});
