import { ApplicationPriority } from '@/types/enums';

export const APPLICATION_PRIORITY_OPTIONS = [
  { value: ApplicationPriority.Critical, label: 'حیاتی' },
  { value: ApplicationPriority.Important, label: 'مهم' },
  { value: ApplicationPriority.Low, label: 'کم اهمیت' },
] as const;

export function getApplicationPriorityLabel(priority: ApplicationPriority): string {
  return (
    APPLICATION_PRIORITY_OPTIONS.find((option) => option.value === priority)?.label ?? 'مهم'
  );
}

export function normalizeApplicationPriority(value: unknown): ApplicationPriority {
  if (
    value === ApplicationPriority.Critical ||
    value === ApplicationPriority.Important ||
    value === ApplicationPriority.Low
  ) {
    return value;
  }

  return ApplicationPriority.Important;
}
