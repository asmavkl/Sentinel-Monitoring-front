import { extractRoleNames } from './currentUser';
import type { CurrentUser, PortalCurrentUserDto } from '@/types/portal';

function readString(value: unknown): string | null {
  return typeof value === 'string' && value.trim().length > 0 ? value.trim() : null;
}

export function extractPortalUserPayload(payload: unknown): PortalCurrentUserDto {
  if (!payload || typeof payload !== 'object') {
    throw new Error('پاسخ کاربر نامعتبر است.');
  }

  const record = payload as Record<string, unknown>;
  const nested = record.data ?? record.Data ?? record.result ?? record.Result;

  if (nested && typeof nested === 'object') {
    return nested as PortalCurrentUserDto;
  }

  return record as PortalCurrentUserDto;
}

export function mapPortalCurrentUser(dto: PortalCurrentUserDto): CurrentUser {
  const firstName = readString(dto.firstName) ?? readString(dto.FirstName);
  const lastName = readString(dto.lastName) ?? readString(dto.LastName);
  const combinedName = [firstName, lastName].filter(Boolean).join(' ');

  return {
    id: dto.id ?? dto.Id ?? dto.userId ?? dto.UserId ?? null,
    userName: readString(dto.userName) ?? readString(dto.UserName) ?? readString(dto.username),
    fullName:
      readString(dto.fullName) ??
      readString(dto.FullName) ??
      readString(dto.displayName) ??
      readString(dto.DisplayName) ??
      (combinedName || null),
    email: readString(dto.email) ?? readString(dto.Email),
    mobile: readString(dto.mobile) ?? readString(dto.Mobile) ?? readString(dto.phoneNumber),
    roles: extractRoleNames(
      dto.roles ?? dto.Roles ?? dto.role ?? dto.Role ?? dto.userRoles ?? dto.UserRoles,
    ),
    avatar:
      readString(dto.avatarBase64) ??
      readString(dto.AvatarBase64) ??
      readString(dto.avatar) ??
      readString(dto.Avatar) ??
      readString(dto.profileImage) ??
      readString(dto.ProfileImage),
    role: null,
  };
}

export function getUserDisplayName(user?: CurrentUser | null): string | null {
  if (!user) {
    return null;
  }

  return user.fullName ?? user.userName ?? user.email ?? null;
}

export function getUserInitials(user?: CurrentUser | null): string {
  const source = getUserDisplayName(user);
  if (!source) {
    return '؟';
  }

  const parts = source.split(/\s+/).filter((part) => part.length > 0);
  if (parts.length === 1) {
    return parts[0].slice(0, 1);
  }

  return `${parts[0].slice(0, 1)}${parts[parts.length - 1].slice(0, 1)}`;
}

/** Turns the GetCurrentUser image into a src the avatar can render. */
export function getUserAvatarSrc(avatar?: string | null): string | null {
  const value = avatar?.trim();
  if (!value) {
    return null;
  }

  if (value.startsWith('data:image') || /^https?:\/\//i.test(value)) {
    return value;
  }

  return `data:image/jpeg;base64,${value}`;
}
