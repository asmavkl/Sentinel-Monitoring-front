import { formatPersianTime } from '@/utils/dateUtils';

export function formatLastUpdated(updatedAt?: number | Date | null): string {
  if (updatedAt == null || updatedAt === 0) {
    return '—';
  }

  const date = updatedAt instanceof Date ? updatedAt : new Date(updatedAt);
  if (Number.isNaN(date.getTime())) {
    return '—';
  }

  return formatPersianTime(date);
}
