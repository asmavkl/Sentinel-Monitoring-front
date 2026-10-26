import { CredentialType, SnmpVersion } from '@/types/enums';
import type { DatabaseCredentialDto } from '@/types/databaseCredentials';
import { getCredentialType, getSnmpVersionLabel } from '@/features/database-credentials/utils/credentialType';

export const SERVERS_LABEL = 'مانیتورینگ سرور';
export const SERVERS_LOADING_MESSAGE = 'در حال بارگذاری سرورها...';
export const SERVERS_LOAD_ERROR_TITLE = 'امکان بارگذاری سرورها وجود ندارد';
export const EMPTY_SERVERS_TITLE = 'هنوز سروری برای پایش SNMP تعریف نشده است';
export const EMPTY_SERVERS_DESCRIPTION =
  'یک سرور مانیتور شده جدا از شاخص‌های برنامه است و فقط یک اعتبارنامه SNMP را انتخاب می‌کند.';
export const ADD_SERVER_LABEL = 'افزودن سرور';
export const EDIT_SERVER_LABEL = 'ویرایش سرور';

export function getMonitoringMethodLabel(): string {
  return 'SNMP';
}

export function getSnmpCredentialLabel(credential: DatabaseCredentialDto | undefined): string {
  if (!credential) {
    return '—';
  }

  const version = credential.snmpVersion ? getSnmpVersionLabel(credential.snmpVersion) : null;
  return version ? `${credential.name} (${version})` : credential.name;
}

export function isSelectableSnmpCredential(credential: DatabaseCredentialDto): boolean {
  return getCredentialType(credential) === CredentialType.Snmp && credential.isActive;
}

export function snmpVersionFromCredential(credential: DatabaseCredentialDto | undefined): string {
  if (!credential?.snmpVersion) {
    return '—';
  }

  return getSnmpVersionLabel(credential.snmpVersion as SnmpVersion);
}

export function formatDurationMs(durationMs: number | null | undefined): string {
  if (durationMs == null) {
    return '—';
  }

  if (durationMs < 1000) {
    return `${durationMs.toLocaleString('fa-IR')} میلی‌ثانیه`;
  }

  return `${(durationMs / 1000).toLocaleString('fa-IR', { maximumFractionDigits: 1 })} ثانیه`;
}

export function formatMetricNumber(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) {
    return '—';
  }

  return value.toLocaleString('fa-IR', { maximumFractionDigits: 2 });
}

export function formatMetricValue(value: number | null | undefined, unit: string | null | undefined): string {
  const formatted = formatMetricNumber(value);
  if (formatted === '—') {
    return formatted;
  }

  return unit ? `${formatted} ${unit}` : formatted;
}
