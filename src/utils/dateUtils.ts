import { toJalaali } from 'jalaali-js';

export function utcToIranTime(utcDate: Date | string): Date {
  const date = typeof utcDate === 'string' ? new Date(utcDate) : utcDate;

  const iranOffset = 3.5 * 60 * 60 * 1000;
  const utcTimestamp = date.getTime();
  const iranTimestamp = utcTimestamp + iranOffset;

  return new Date(iranTimestamp);
}

export function toJalaaliObject(date: Date | string) {
  const gregorianDate = typeof date === 'string' ? new Date(date) : date;
  const jy = gregorianDate.getFullYear();
  const jm = gregorianDate.getMonth() + 1;
  const jd = gregorianDate.getDate();

  return toJalaali(jy, jm, jd);
}

export function formatPersianDate(utcDate: Date | string, format: 'full' | 'short' | 'numeric' = 'full'): string {
  const iranTime = utcToIranTime(utcDate);
  const jalaali = toJalaaliObject(iranTime);

  const persianMonths = [
    'فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور',
    'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'
  ];

  const jy = jalaali.jy.toLocaleString('fa-IR', { useGrouping: false });
  const jm = jalaali.jm.toLocaleString('fa-IR', { useGrouping: false });
  const jd = jalaali.jd.toLocaleString('fa-IR', { useGrouping: false });
  const monthName = persianMonths[jalaali.jm - 1];

  if (format === 'numeric') {
    return `${jy}/${jm}/${jd}`;
  }

  if (format === 'short') {
    return `${jd} ${monthName}`;
  }

  return `${jd} ${monthName} ${jy}`;
}

export function formatPersianDateTime(utcDate: Date | string, format: 'full' | 'short' | 'numeric' = 'full'): string {
  const iranTime = utcToIranTime(utcDate);
  const datePart = formatPersianDate(iranTime, format);

  const hours = iranTime.getHours().toLocaleString('fa-IR', { minimumIntegerDigits: 2, useGrouping: false });
  const minutes = iranTime.getMinutes().toLocaleString('fa-IR', { minimumIntegerDigits: 2, useGrouping: false });

  return `${datePart} - ${hours}:${minutes}`;
}

export function formatPersianTime(utcDate: Date | string): string {
  const iranTime = utcToIranTime(utcDate);

  const hours = iranTime.getHours().toLocaleString('fa-IR', { minimumIntegerDigits: 2, useGrouping: false });
  const minutes = iranTime.getMinutes().toLocaleString('fa-IR', { minimumIntegerDigits: 2, useGrouping: false });

  return `${hours}:${minutes}`;
}

export function formatRelativeTime(utcDate: Date | string): string {
  const date = typeof utcDate === 'string' ? new Date(utcDate) : utcDate;
  // Calculate difference in UTC, then format the result
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSeconds < 60) {
    return `${diffSeconds.toLocaleString('fa-IR', { useGrouping: false })} ثانیه پیش`;
  }

  if (diffMinutes < 60) {
    return `${diffMinutes.toLocaleString('fa-IR', { useGrouping: false })} دقیقه پیش`;
  }

  if (diffHours < 24) {
    return `${diffHours.toLocaleString('fa-IR', { useGrouping: false })} ساعت پیش`;
  }

  if (diffDays < 7) {
    return `${diffDays.toLocaleString('fa-IR', { useGrouping: false })} روز پیش`;
  }

  return formatPersianDateTime(utcDate, 'short');
}
