# Database Health Query Frontend Implementation Report

## Implemented

فرانت موجود React 19، MUI، TanStack Query و Axios در `src/api` است. برای این قابلیت معماری جدید، Vue، PrimeVue، Pinia یا yup اضافه نشد و همان الگوی صفحه، سرویس، hook و فرم پروژه ادامه پیدا کرد.

هر کاربر واردشده می‌تواند کاتالوگ Database Health Query را ببیند، بسازد، فیلتر کند، ویرایش کند و فعال یا غیرفعال کند. محدودیت نقش Admin فعلاً اعمال نشده و بعداً اضافه می‌شود. Check نوع SqlQuery (`CheckType = 2`) می‌تواند SQL سفارشی قبلی را نگه دارد یا یک Health Query فعال و هم‌نوع Credential را با `healthQueryId` انتخاب کند. فرم Credential فیلد `port` دارد.

هیچ endpoint، DTO یا رفتار بک‌اند عوض نشده است. Widget، Dashboard، Criteria و Metric دست نخورده‌اند. package جدیدی اضافه نشده است.

## Admin Catalog

مسیر جدید: `/monitoring/health-queries`

منوی «کوئری‌های سلامت» و اکشن‌های نوشتن فعلاً برای همه کاربران واردشده باز است. محدودیت Admin بعداً روی همین صفحه و منو اضافه می‌شود.

جدول ستون‌های Name، Display Name، Database Type، Category، Unit، وضعیت، تاریخ به‌روزرسانی و عملیات را نشان می‌دهد. عملیات: ویرایش، فعال، غیرفعال. دکمه حذف وجود ندارد.

فیلترها به API می‌روند و صفحه‌بندی ساختگی ساخته نشده است:

- `search` روی name و displayName
- `databaseType`
- `category`
- `isActive`

## Create/Edit

یک دیالوگ برای ایجاد و ویرایش استفاده می‌شود.

فیلدها: Name، Display Name، Description، Database Type، Category، Query، Unit. `isActive` فقط در ایجاد است.

Result Type در فرم قابل تغییر نیست و همیشه `1` (Scalar) ارسال می‌شود.

Database Type فقط SqlServer، PostgreSQL، MySQL و Oracle است. Redis و MongoDB در این فرم نیستند.

به‌روزرسانی `isActive` نمی‌فرستد. اگر بک‌اند به‌خاطر Check متصل نوع دیتابیس را رد کند، همان پیام نشان داده می‌شود:

`Database type cannot be changed because this health query is used by checks.`

نام تکراری هم با همان پیام بک‌اند نشان داده می‌شود، مثلاً `Health query 'active_connections' already exists for PostgreSql.`

بعد از ذخیره ویرایش این پیام نمایش داده می‌شود: اجرای بعدی شاخص‌های متصل همین متن کاتالوگ را استفاده می‌کند. دکمه reschedule ساخته نشده است.

## Activate/Deactivate

- `PUT /api/database-health-queries/{id}/activate`
- `PUT /api/database-health-queries/{id}/deactivate`

غیرفعال‌کردن تأیید می‌خواهد و توضیح می‌دهد شاخص‌های فعلی متن فعلی کاتالوگ را ادامه می‌دهند و شاخص جدید نمی‌تواند Query غیرفعال را انتخاب کند.

## Check Creation Integration

تغییر در `DatabaseCheckForm` و `CreateCheckDialog` است، فقط برای `CheckType = 2`.

منبع کوئری:

- SQL سفارشی: Query و Result Type مثل قبل. payload: `healthQueryId: null`، `query` غیرخالی، `resultType` انتخاب‌شده.
- کوئری سلامت دیتابیس: textarea سفارشی مخفی است. payload: `healthQueryId`، `query: null`، `resultType: 1`. متن کاتالوگ کپی نمی‌شود.

تا وقتی Credential انتخاب نشده، انتخاب Query غیرفعال است.

در جزئیات Check (`CheckSqlSourceCard` داخل `CheckDetailPage`):

- اگر `healthQueryId` دارد، نام و متن فعلی کاتالوگ نشان داده می‌شود. `query: null` خطای داده نیست.
- اگر `healthQueryId` خالی است، SQL سفارشی مثل قبل نشان داده می‌شود.

`databaseConfiguration` فقط برای خواندن، به‌عنوان alias قدیمی `sqlConfiguration`، پشتیبانی می‌شود. درخواست جدید `sqlConfiguration` می‌فرستد.

ویرایش Check همچنان scheduling را می‌فرستد. ویرایش کاتالوگ scheduling نمی‌سازد.

## Credential Filtering

لیست Check فقط Credentialهای رابطه‌ای را نشان می‌دهد: SqlServer، PostgreSQL، MySQL، Oracle.

بعد از انتخاب Credential، Queryها با `databaseType` همان `credentialType` و `isActive=true` از API خوانده می‌شوند.

اگر نوع Credential عوض شود، Health Query قبلی پاک می‌شود و لیست نوع جدید بارگذاری می‌شود.

Query غیرفعال در لیست Check جدید نیست. اگر Check موجود به Query غیرفعال وصل باشد، همان مورد برای نمایش انتخاب فعلی در ویرایش دیده می‌شود و Query غیرفعال دیگری قابل انتخاب نیست.

## API Integration

سرویس: `src/api/databaseHealthQueriesApi.ts`

- `GET /api/database-health-queries`
- `GET /api/database-health-queries/{id}`
- `POST /api/database-health-queries`
- `PUT /api/database-health-queries/{id}`
- `PUT /api/database-health-queries/{id}/activate`
- `PUT /api/database-health-queries/{id}/deactivate`

DELETE پیاده‌سازی نشده است.

خطاهای `ApiResponse` با `message` بک‌اند به کاربر نشان داده می‌شوند.

تست اتصال Credential داخل `ApiResponse` نیست. `success`، `message` و `durationMs` نشان داده می‌شوند. بدنه تست `port` را هم می‌فرستد.

`CredentialType` همان enum قبلی است و مقدارهای 4، 5 و 6 به آن اضافه شده‌اند. enum جداگانه‌ای برای DatabaseType ساخته نشده است.

## Cache Invalidation

بعد از Create، Update، Activate و Deactivate، کلیدهای لیست و جزئیات `database-health-queries` باطل می‌شوند. این شامل لیست `isActive=true` که فرم Check استفاده می‌کند هم می‌شود.

## Validation

کاتالوگ، قبل از ارسال:

- name و displayName الزامی، بعد از trim حداکثر 200
- description حداکثر 2000
- query الزامی و غیرخالی
- databaseType فقط نوع رابطه‌ای
- category الزامی
- resultType همیشه Scalar

اعتبارسنجی نهایی همچنان بک‌اند است و پیام خطای API بدون بازنویسی نشان داده می‌شود.

Credential port:

- خالی یعنی `null`
- فقط 1 تا 65535
- پیام `Port must be between 1 and 65535.`
- اگر SQL Server در `Server` پورت دارد (مثل `localhost,1433`) و Port هم پر باشد: `SQL Server port cannot be set both in Server and Port.`
- پورت پیش‌فرض PostgreSQL 5432، MySQL 3306، Oracle 1521 و SQL Server از رشته Server فقط راهنمای اتصال است و ذخیره نمی‌شود.
- در ویرایش، نوع Credential فقط‌خواندنی است و password خالی رمز قبلی را حفظ می‌کند.
- برای Oracle برچسب فیلد `Service Name` است.

## Tests

اجراشده و مرتبط با این قابلیت، همگی پاس شدند:

- `src/api/databaseHealthQueriesApi.test.ts`
- `src/features/database-health-queries/pages/DatabaseHealthQueriesPage.test.tsx`
- `src/features/database-health-queries/utils/formValidation.test.ts`
- `src/features/check-management/components/DatabaseCheckForm.test.tsx`
- `src/features/check-management/utils/sqlCheckPayload.test.ts`
- `src/features/check-management/utils/formValidation.test.ts`
- `src/features/checks/components/CheckSqlSourceCard.test.tsx`
- `src/features/database-credentials/pages/DatabaseCredentialsPage.test.tsx`
- `src/features/database-credentials/utils/formValidation.test.ts`
- `src/features/check-management/pages/MonitoringChecksPage.test.tsx`
- `src/api/databaseCredentialsApi.test.ts`

سناریوهای پوشش‌داده‌شده: لیست، ایجاد، ویرایش، فعال، غیرفعال، جستجو، فیلتر، خطای نام تکراری، خطای تغییر نوع دیتابیس، SQL سفارشی، ارسال `healthQueryId` با `query: null`، فیلتر SqlServer / PostgreSQL / MySQL / Oracle، مخفی بودن Redis، reset پس از تغییر Credential، و ارسال `port` در ایجاد، ویرایش و تست اتصال.

`npx vitest run` کامل: 386 پاس، 28 شکست. شکست‌ها در Widget، Dashboard، portal API، رنگ وضعیت و برچسب‌های قدیمی منو هستند و به این قابلیت مربوط نیستند. دو مورد منو از قبل با منبع فعلی نمی‌خوانند: آیتم «سامانه ها» در کد کامنت است، و تست انتظار ایموجی `🖥 سامانه‌ها` دارد در حالی که برچسب فعلی `سامانه‌ها` است.

ابزار مرورگر در این جلسه در دسترس نبود. جریان‌ها با تست کامپوننت و صفحه بررسی شدند، نه با کلیک در مرورگر.

## Build

`npm run build` (`tsc -b && vite build`) موفق بود.

هشدار اندازه chunk از قبل وجود دارد و به این تغییر مربوط نیست.

## Files Changed

جدید:

- `src/types/databaseHealthQueries.ts`
- `src/api/databaseHealthQueriesApi.ts`
- `src/api/databaseHealthQueriesApi.test.ts`
- `src/features/database-health-queries/hooks/queryKeys.ts`
- `src/features/database-health-queries/hooks/useDatabaseHealthQueries.ts`
- `src/features/database-health-queries/hooks/index.ts`
- `src/features/database-health-queries/utils/labels.ts`
- `src/features/database-health-queries/utils/formValidation.ts`
- `src/features/database-health-queries/utils/formValidation.test.ts`
- `src/features/database-health-queries/components/HealthQueryTable.tsx`
- `src/features/database-health-queries/components/HealthQueryFormDialog.tsx`
- `src/features/database-health-queries/components/index.ts`
- `src/features/database-health-queries/pages/DatabaseHealthQueriesPage.tsx`
- `src/features/database-health-queries/pages/DatabaseHealthQueriesPage.test.tsx`
- `src/features/checks/components/CheckSqlSourceCard.tsx`
- `src/features/checks/components/CheckSqlSourceCard.test.tsx`
- `src/features/check-management/utils/sqlCheckPayload.ts`
- `src/features/check-management/utils/sqlCheckPayload.test.ts`
- `src/features/check-management/components/DatabaseCheckForm.test.tsx`
- `docs/DATABASE_HEALTH_QUERY_FRONTEND_IMPLEMENTATION_REPORT.md`

کامپوننت‌های اضافه‌شده: `DatabaseHealthQueriesPage`، `HealthQueryTable`، `HealthQueryFormDialog`، `CheckSqlSourceCard`.

Hookها: `useDatabaseHealthQueries`، `useDatabaseHealthQuery`، `useCreateDatabaseHealthQuery`، `useUpdateDatabaseHealthQuery`، `useActivateDatabaseHealthQuery`، `useDeactivateDatabaseHealthQuery`.

مسیر: `/monitoring/health-queries`.

تغییر داده‌شده:

- `src/types/enums.ts`
- `src/types/databaseCredentials.ts`
- `src/types/checkManagement.ts`
- `src/routes/paths.ts`
- `src/routes/AppRoutes.tsx`
- `src/routes/AdminRoute.tsx`
- `src/components/monitoring/layout/monitoringNav.tsx`
- `src/components/monitoring/layout/MonitoringSidebar.tsx`
- `src/layouts/MainLayout.test.tsx`
- `src/features/database-credentials/utils/credentialType.ts`
- `src/features/database-credentials/utils/formValidation.ts`
- `src/features/database-credentials/utils/formValidation.test.ts`
- `src/features/database-credentials/components/CredentialFormDialog.tsx`
- `src/features/database-credentials/components/ConnectionTestResult.tsx`
- `src/features/database-credentials/pages/DatabaseCredentialsPage.tsx`
- `src/features/database-credentials/pages/DatabaseCredentialsPage.test.tsx`
- `src/api/databaseCredentialsApi.test.ts`
- `src/features/check-management/utils/formValidation.ts`
- `src/features/check-management/utils/formValidation.test.ts`
- `src/features/check-management/components/DatabaseCheckForm.tsx`
- `src/features/check-management/components/CreateCheckDialog.tsx`
- `src/features/check-management/components/RedisMongoForms.test.tsx`
- `src/features/checks/pages/CheckDetailPage.tsx`

Check Creation در `DatabaseCheckForm` و `CreateCheckDialog` تغییر کرده است. payload SQL در `buildSqlConfiguration` ساخته می‌شود.

## Existing Features Preserved

- SQL سفارشی، Result Type و scheduling چک حفظ شده‌اند.
- HTTP، Redis و MongoDB Check رابط کاربری جدید نگرفته‌اند.
- Widget، Dashboard، Criteria و Metric تغییر نکرده‌اند.
- حذف Health Query اضافه نشده است.
- password و connection string روی Health Query ذخیره نمی‌شوند.
- صفحه Credential و کاتالوگ Health Query فعلاً برای Viewer و Operator هم باز هستند. محدودیت نقش بعداً اضافه می‌شود.

## Known Issues

- مرورگر در این جلسه قابل رانندگی نبود؛ تأیید نهایی ظاهر صفحه در UI زنده انجام نشده است.
- 28 تست قبلی پروژه، خارج از این قابلیت، همچنان شکست می‌خورند.
- کاتالوگ پرچم «در حال استفاده توسط Check» برنمی‌گرداند. تغییر Database Type در UI قفل نشده و خطای بک‌اند همان‌طور که آمده نشان داده می‌شود.
