import { ApplicationPriority } from '@/types/enums';
import type { ApplicationListItem } from '@/types/applications';

export type ApplicationGroupKey = 'critical' | 'important' | 'low';
export type ApplicationGroupColor = 'blue' | 'purple' | 'gray';

export interface ApplicationGroupDefinition {
  key: ApplicationGroupKey;
  title: string;
  color: ApplicationGroupColor;
}

export interface ApplicationGroup extends ApplicationGroupDefinition {
  applications: ApplicationListItem[];
}

export const APPLICATION_GROUP_DEFINITIONS: ApplicationGroupDefinition[] = [
  { key: 'critical', title: 'سامانه های حیاتی', color: 'blue' },
  { key: 'important', title: 'سامانه های مهم', color: 'purple' },
  { key: 'low', title: 'سامانه های کم اهمیت', color: 'gray' },
];

const PRIORITY_TO_GROUP: Record<ApplicationPriority, ApplicationGroupKey> = {
  [ApplicationPriority.Critical]: 'critical',
  [ApplicationPriority.Important]: 'important',
  [ApplicationPriority.Low]: 'low',
};

export function resolveApplicationGroup(application: ApplicationListItem): ApplicationGroupKey {
  return PRIORITY_TO_GROUP[application.priority] ?? 'important';
}

export function groupApplications(applications: ApplicationListItem[]): ApplicationGroup[] {
  const buckets: Record<ApplicationGroupKey, ApplicationListItem[]> = {
    critical: [],
    important: [],
    low: [],
  };

  applications.forEach((application) => {
    buckets[resolveApplicationGroup(application)].push(application);
  });

  return APPLICATION_GROUP_DEFINITIONS.map((definition) => ({
    ...definition,
    applications: buckets[definition.key],
  })).filter((group) => group.applications.length > 0);
}
