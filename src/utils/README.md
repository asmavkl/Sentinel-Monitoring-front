# توابع تبدیل تاریخ (Date Utils)

این ماژول توابعی برای تبدیل تاریخ‌های UTC به timezone ایران و تقویم شمسی فراهم می‌کند.

## نصب

کتابخانه `jalaali-js` برای تبدیل تقویم شمسی استفاده شده است:

```bash
npm install jalaali-js
```

## توابع موجود

### `utcToIranTime(utcDate: Date | string): Date`

تبدیل تاریخ UTC به timezone ایران (UTC+3:30).

```typescript
import { utcToIranTime } from '@/utils/dateUtils';

const iranTime = utcToIranTime('2024-03-20T20:30:00Z');
console.log(iranTime); // Date object with Iran time
```

### `toJalaaliObject(date: Date | string)`

تبدیل تاریخ میلادی به آبجکت تاریخ شمسی.

```typescript
import { toJalaaliObject } from '@/utils/dateUtils';

const jalaali = toJalaaliObject('2024-03-20T20:30:00Z');
console.log(jalaali); // { jy: 1403, jm: 1, jd: 2 }
```

### `formatPersianDate(utcDate: Date | string, format?: 'full' | 'short' | 'numeric'): string`

فرمت کردن تاریخ به شمسی با فرمت‌های مختلف.

```typescript
import { formatPersianDate } from '@/utils/dateUtils';

// فرمت کامل (پیش‌فرض)
formatPersianDate('2024-03-20T20:30:00Z'); // "۲ فروردین ۱۴۰۳"

// فرمت کوتاه
formatPersianDate('2024-03-20T20:30:00Z', 'short'); // "۲ فروردین"

// فرمت عددی
formatPersianDate('2024-03-20T20:30:00Z', 'numeric'); // "۱۴۰۳/۰۱/۰۲"
```

### `formatPersianDateTime(utcDate: Date | string, format?: 'full' | 'short' | 'numeric'): string`

فرمت کردن تاریخ و زمان به شمسی با فرمت‌های مختلف.

```typescript
import { formatPersianDateTime } from '@/utils/dateUtils';

// فرمت کامل (پیش‌فرض)
formatPersianDateTime('2024-03-20T20:30:00Z'); // "۲ فروردین ۱۴۰۳ - ۰۰:۰۰:۰۰"

// فرمت کوتاه
formatPersianDateTime('2024-03-20T20:30:00Z', 'short'); // "۲ فروردین - ۰۰:۰۰:۰۰"

// فرمت عددی
formatPersianDateTime('2024-03-20T20:30:00Z', 'numeric'); // "۱۴۰۳/۰۱/۰۲ - ۰۰:۰۰:۰۰"
```

### `formatPersianTime(utcDate: Date | string): string`

فرمت کردن فقط زمان به timezone ایران.

```typescript
import { formatPersianTime } from '@/utils/dateUtils';

formatPersianTime('2024-03-20T20:30:00Z'); // "۰۰:۰۰:۰۰"
```

## مثال استفاده در React

```typescript
import { formatPersianDateTime } from '@/utils/dateUtils';

function MyComponent({ timestamp }: { timestamp: string }) {
  return (
    <div>
      <span>تاریخ: {formatPersianDateTime(timestamp, 'short')}</span>
    </div>
  );
}
```

## نکات مهم

- تمام توابع timezone را به ایران (UTC+3:30) تبدیل می‌کنند
- تمام خروجی‌ها با اعداد فارسی هستند
- برای فرمت‌های عددی، از `useGrouping: false` استفاده شده تا جداکننده هزارگان نمایش داده نشود
- توابع هم `Date` و هم `string` را به عنوان ورودی قبول می‌کنند
