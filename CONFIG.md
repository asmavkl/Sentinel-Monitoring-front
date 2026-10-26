# Runtime Configuration

این پروژه از فایل runtime configuration برای تنظیمات deployment استفاده می‌کند.

## فایل Config

بعد از build، فایل `config.js` در پوشه `dist` قرار می‌گیرد که می‌توانید آن را در سرور تغییر دهید.

## نحوه استفاده

### 1. Build گرفتن
```bash
npm run build
```

### 2. فایل config.js را ویرایش کنید
فایل `dist/config.js` را باز کنید و مقادیر را تغییر دهید:

```javascript
window.APP_CONFIG = {
  API_BASE_URL: 'https://your-api-server.com/api',
  PORTAL_URL: 'https://your-portal.com',
  LOGIN_URL: 'https://your-portal.com/login',
  PORTAL_CURRENT_USER_URL: 'https://your-portal.com/api/user/current',
  AUTH_TOKEN_KEY: 'your_token_key',
  AUTH_COOKIE_NAME: 'your_cookie_name',
};
```

### 3. فایل‌ها را در سرور Deploy کنید
کل پوشه `dist` را در سرور قرار دهید.

## محیط Development

در محیط development، از فایل `.env` استفاده می‌شود. برای تغییر تنظیمات در development:

1. فایل `.env` را ویرایش کنید
2. سرور dev را ریستارت کنید

## متغیرهای Config

- `API_BASE_URL`: آدرس API اصلی
- `PORTAL_URL`: آدرس درگاه ورود
- `LOGIN_URL`: آدرس صفحه لاگین
- `PORTAL_CURRENT_USER_URL`: آدرس API برای دریافت اطلاعات کاربر
- `AUTH_TOKEN_KEY`: کلید توکن احراز هویت
- `AUTH_COOKIE_NAME`: نام کوکی احراز هویت
