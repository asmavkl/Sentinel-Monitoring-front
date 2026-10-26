import { jwtTokenReader } from './jwtTokenReader';
import type { CurrentUser } from '@/types/portal';

export const DASHBOARD_WRITE_ROLE = 'Admin';

const ROLE_CLAIM = 'http://schemas.microsoft.com/ws/2008/06/identity/claims/role';

const WRITE_ROLE_ALIASES = new Set([
  'admin',
  'administrator',
  'superadmin',
  'super-admin',
  'sysadmin',
  'مدیر',
  'ادمین',
  'مدیر سیستم',
  'مدیر اصلی',
]);

const READ_ONLY_ROLE_ALIASES = new Set([
  'viewer',
  'operator',
  'read',
  'readonly',
  'read-only',
  'بیننده',
  'مشاهده کننده',
  'اپراتور',
]);

export function parseJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split('.');
    if (parts.length < 2) {
      return null;
    }

    const normalized = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padding = (4 - (normalized.length % 4)) % 4;
    const padded = normalized.padEnd(normalized.length + padding, '=');
    return JSON.parse(atob(padded)) as Record<string, unknown>;
  } catch {
    return null;
  }
}

function uniqueRoleNames(roles: string[]): string[] {
  const seen = new Set<string>();
  const unique: string[] = [];

  for (const role of roles) {
    const key = normalizeRoleKey(role);
    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    unique.push(role);
  }

  return unique;
}

export function extractRoleNames(value: unknown): string[] {
  if (typeof value === 'string' && value.trim().length > 0) {
    return value
      .split(/[,;]/)
      .map((part) => part.trim())
      .filter((part) => part.length > 0);
  }

  if (!Array.isArray(value)) {
    return [];
  }

  return value.flatMap((item) => {
    if (typeof item === 'string' && item.trim().length > 0) {
      return [item.trim()];
    }

    if (item && typeof item === 'object') {
      const record = item as Record<string, unknown>;
      const name =
        record.name ??
        record.Name ??
        record.roleName ??
        record.RoleName ??
        record.title ??
        record.Title ??
        record.role ??
        record.Role;
      return typeof name === 'string' && name.trim().length > 0 ? [name.trim()] : [];
    }

    return [];
  });
}

export function normalizeRoleKey(role: string): string {
  return role.trim().toLowerCase().replace(/\s+/g, ' ');
}

export function hasWriteRole(roles: string[]): boolean {
  return roles.some((role) => WRITE_ROLE_ALIASES.has(normalizeRoleKey(role)));
}

export function hasExplicitReadOnlyRole(roles: string[]): boolean {
  return roles.some((role) => READ_ONLY_ROLE_ALIASES.has(normalizeRoleKey(role)));
}

export function getEffectiveUserRoles(user?: CurrentUser | null, token = jwtTokenReader.readToken()): string[] {
  return uniqueRoleNames([...(user?.roles ?? []), ...getCurrentUserRoles(token)]);
}

export function getCurrentUserRoles(token = jwtTokenReader.readToken()): string[] {
  if (!token) {
    return [];
  }

  const payload = parseJwtPayload(token);
  if (!payload) {
    return [];
  }

  return uniqueRoleNames([
    ...extractRoleNames(payload.role),
    ...extractRoleNames(payload.roles),
    ...extractRoleNames(payload.Role),
    ...extractRoleNames(payload.Roles),
    ...extractRoleNames(payload[ROLE_CLAIM]),
  ]);
}

export function canEditDashboard(token = jwtTokenReader.readToken()): boolean {
  return hasWriteRole(getCurrentUserRoles(token));
}

export function userHasDashboardWriteAccess(user?: CurrentUser | null): boolean {
  return hasWriteRole(getEffectiveUserRoles(user));
}

/** Admin-only write access for database credential management. */
export function userHasCredentialWriteAccess(user?: CurrentUser | null): boolean {
  return userHasDashboardWriteAccess(user);
}

export function userHasMonitoringWriteAccess(user?: CurrentUser | null): boolean {
  if (userHasDashboardWriteAccess(user)) {
    return true;
  }

  if (!user) {
    return false;
  }

  if (hasExplicitReadOnlyRole(getEffectiveUserRoles(user))) {
    return false;
  }

  // Portal users such as «مدیر اصلی» are authenticated but may not send an English Admin role.
  return true;
}
