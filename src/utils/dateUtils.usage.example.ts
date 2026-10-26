/**
 * مثال‌های نحوه استفاده از توابع تبدیل تاریخ
 * 
 * این فایل فقط برای نمایش نحوه استفاده است و می‌توانید آن را حذف کنید
 */

import {
  utcToIranTime,
  toJalaaliObject,
  formatPersianDate,
  formatPersianDateTime,
  formatPersianTime,
} from './dateUtils';

// مثال 1: تبدیل ساده تاریخ UTC به ایران
const utcDate = '2024-03-20T20:30:00Z';
const iranTime = utcToIranTime(utcDate);
console.log('زمان ایران:', iranTime);

// مثال 2: دریافت آبجکت تاریخ شمسی
const jalaali = toJalaaliObject(utcDate);
console.log('تاریخ شمسی:', jalaali); // { jy: 1403, jm: 1, jd: 2 }

// مثال 3: فرمت کامل تاریخ شمسی
const fullDate = formatPersianDate(utcDate, 'full');
console.log('تاریخ کامل:', fullDate); // "۲ فروردین ۱۴۰۳"

// مثال 4: فرمت کوتاه تاریخ شمسی
const shortDate = formatPersianDate(utcDate, 'short');
console.log('تاریخ کوتاه:', shortDate); // "۲ فروردین"

// مثال 5: فرمت عددی تاریخ شمسی
const numericDate = formatPersianDate(utcDate, 'numeric');
console.log('تاریخ عددی:', numericDate); // "۱۴۰۳/۰۱/۰۲"

// مثال 6: فرمت کامل تاریخ و زمان شمسی
const fullDateTime = formatPersianDateTime(utcDate, 'full');
console.log('تاریخ و زمان کامل:', fullDateTime); // "۲ فروردین ۱۴۰۳ - ۰۰:۰۰:۰۰"

// مثال 7: فرمت کوتاه تاریخ و زمان شمسی
const shortDateTime = formatPersianDateTime(utcDate, 'short');
console.log('تاریخ و زمان کوتاه:', shortDateTime); // "۲ فروردین - ۰۰:۰۰:۰۰"

// مثال 8: فرمت عددی تاریخ و زمان شمسی
const numericDateTime = formatPersianDateTime(utcDate, 'numeric');
console.log('تاریخ و زمان عددی:', numericDateTime); // "۱۴۰۳/۰۱/۰۲ - ۰۰:۰۰:۰۰"

// مثال 9: فرمت فقط زمان
const timeOnly = formatPersianTime(utcDate);
console.log('فقط زمان:', timeOnly); // "۰۰:۰۰:۰۰"

// مثال 10: استفاده در کامپوننت React
/*
import { formatPersianDateTime } from '@/utils/dateUtils';

function MyComponent({ timestamp }: { timestamp: string }) {
  return (
    <div>
      <span>تاریخ: {formatPersianDateTime(timestamp, 'short')}</span>
    </div>
  );
}
*/
