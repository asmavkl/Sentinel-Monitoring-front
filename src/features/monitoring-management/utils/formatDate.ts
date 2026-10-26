import { formatPersianDateTime as formatPersianDateTimeWithJalaali } from '@/utils/dateUtils';

export function formatPersianDateTime(value?: string | null): string {
  if (!value) {
    return '—';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '—';
  }

  return formatPersianDateTimeWithJalaali(date, 'short');
}
