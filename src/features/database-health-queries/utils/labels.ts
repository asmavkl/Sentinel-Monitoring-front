import { CredentialType, DatabaseHealthQueryCategory } from '@/types/enums';
import { getCredentialTypeLabel } from '@/features/database-credentials/utils/credentialType';

export const HEALTH_QUERIES_LABEL = 'کوئری‌های سلامت';
export const ADD_HEALTH_QUERY_LABEL = 'افزودن کوئری سلامت';
export const EDIT_HEALTH_QUERY_LABEL = 'ویرایش کوئری سلامت';
export const HEALTH_QUERY_UPDATED_NOTICE =
  'ویرایش ذخیره شد. اجرای بعدی شاخص‌های متصل همین متن کاتالوگ را استفاده می‌کند.';

export const DEACTIVATE_HEALTH_QUERY_TITLE = 'غیرفعال کردن کوئری سلامت دیتابیس؟';
export const DEACTIVATE_HEALTH_QUERY_MESSAGE =
  'شاخص‌های فعلی که از این کوئری استفاده می‌کنند، در اجراهای بعدی همان متن فعلی کاتالوگ را اجرا می‌کنند. شاخص جدید نمی‌تواند کوئری غیرفعال را انتخاب کند.';

export function getHealthQueryCategoryLabel(category: DatabaseHealthQueryCategory | number): string {
  switch (category) {
    case DatabaseHealthQueryCategory.Connection:
      return 'Connection';
    case DatabaseHealthQueryCategory.Availability:
      return 'Availability';
    case DatabaseHealthQueryCategory.Performance:
      return 'Performance';
    case DatabaseHealthQueryCategory.Capacity:
      return 'Capacity';
    case DatabaseHealthQueryCategory.Storage:
      return 'Storage';
    default:
      return '—';
  }
}

export function getHealthQueryDatabaseTypeLabel(databaseType: CredentialType | number): string {
  return getCredentialTypeLabel(databaseType as CredentialType);
}
