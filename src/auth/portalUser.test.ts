import { describe, expect, it } from 'vitest';
import {
  extractPortalUserPayload,
  getUserAvatarSrc,
  getUserDisplayName,
  getUserInitials,
  mapPortalCurrentUser,
} from './portalUser';

describe('portalUser', () => {
  it('unwraps nested portal payloads', () => {
    const user = mapPortalCurrentUser(
      extractPortalUserPayload({
        isSuccess: true,
        data: {
          Id: 12,
          UserName: 'mohammad',
          FullName: 'محمد حسینی',
          Roles: ['Admin'],
        },
      }),
    );

    expect(user).toEqual({
      id: 12,
      userName: 'mohammad',
      fullName: 'محمد حسینی',
      email: null,
      mobile: null,
      avatar: null,
      roles: ['Admin'],
    });
    expect(getUserDisplayName(user)).toBe('محمد حسینی');
  });

  it('maps camelCase user payloads', () => {
    const user = mapPortalCurrentUser({
      userName: 'operator',
      firstName: 'Ali',
      lastName: 'Rezaei',
      email: 'ali@example.com',
      role: 'Viewer',
    });

    expect(user.fullName).toBe('Ali Rezaei');
    expect(user.roles).toEqual(['Viewer']);
    expect(getUserDisplayName(user)).toBe('Ali Rezaei');
  });

  it('maps role objects from the portal', () => {
    const user = mapPortalCurrentUser({
      userName: 'admin',
      fullName: 'مدیر اصلی',
      Roles: [{ Name: 'Admin' }],
    });

    expect(user.roles).toEqual(['Admin']);
  });

  it('maps the portal profile image and builds an avatar src', () => {
    const user = mapPortalCurrentUser({
      userName: 'mohammad',
      fullName: 'محمد حسینی',
      AvatarBase64: 'abc123',
    });

    expect(user.avatar).toBe('abc123');
    expect(getUserAvatarSrc(user.avatar)).toBe('data:image/jpeg;base64,abc123');
    expect(getUserAvatarSrc('data:image/png;base64,abc')).toBe('data:image/png;base64,abc');
    expect(getUserAvatarSrc('https://gio24.ir/avatar.jpg')).toBe('https://gio24.ir/avatar.jpg');
    expect(getUserInitials(user)).toBe('مح');
  });
});
