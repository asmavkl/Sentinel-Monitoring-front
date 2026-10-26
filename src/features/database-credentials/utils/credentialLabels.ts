const ZWNJ = '\u200c';

/** Persian display name for a stored connection credential. */
export const CREDENTIAL_LABEL = 'اعتبارنامه';
export const CREDENTIALS_LABEL = `${CREDENTIAL_LABEL}${ZWNJ}ها`;

export const CREDENTIAL_NAME_LABEL = `نام ${CREDENTIAL_LABEL}`;
export const CREDENTIAL_TYPE_LABEL = `نوع ${CREDENTIAL_LABEL}`;
export const ADD_CREDENTIAL_LABEL = `افزودن ${CREDENTIAL_LABEL}`;
export const EDIT_CREDENTIAL_LABEL = `ویرایش ${CREDENTIAL_LABEL}`;
export const VIEW_CREDENTIAL_LABEL = `مشاهده ${CREDENTIAL_LABEL}`;
export const REGISTER_CREDENTIAL_LABEL = `ثبت ${CREDENTIAL_LABEL}`;
export const DELETE_CREDENTIAL_LABEL = `حذف ${CREDENTIAL_LABEL}`;

export const CREDENTIAL_REQUIRED_MESSAGE = `انتخاب ${CREDENTIAL_LABEL} الزامی است`;
export const CREDENTIAL_NAME_REQUIRED_MESSAGE = `${CREDENTIAL_NAME_LABEL} الزامی است`;

export const EMPTY_CREDENTIALS_TITLE = `هنوز ${CREDENTIAL_LABEL}${ZWNJ}ای برای پایش تعریف نشده است`;
export const EMPTY_CREDENTIALS_DESCRIPTION = `${CREDENTIAL_LABEL}${ZWNJ}های پایگاه داده را برای استفاده در شاخص Database تعریف کنید.`;
export const CREDENTIALS_LOADING_MESSAGE = `در حال بارگذاری ${CREDENTIALS_LABEL}...`;
export const CREDENTIALS_LOAD_ERROR_TITLE = `امکان بارگذاری ${CREDENTIALS_LABEL} وجود ندارد`;
export const DELETE_CREDENTIAL_FALLBACK_MESSAGE = `این ${CREDENTIAL_LABEL} حذف شود؟`;

export function credentialScopeLabel(scope: string): string {
  return `${CREDENTIAL_LABEL} ${scope}`;
}

export function deleteCredentialMessage(name: string): string {
  return `${CREDENTIAL_LABEL} «${name}» حذف شود؟ این عملیات قابل بازگشت نیست.`;
}
