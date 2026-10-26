import { beforeEach, describe, expect, it } from 'vitest';
import { browserStorageTokenProvider } from '@/auth/browserStorageTokenProvider';
import { canEditDashboard, getCurrentUserRoles, getEffectiveUserRoles, parseJwtPayload, userHasCredentialWriteAccess, userHasDashboardWriteAccess, userHasMonitoringWriteAccess } from '@/auth/currentUser';
import { createTestJwt } from '@/test/testUtils';

describe('currentUser', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('parses a JWT payload', () => {
    const token = createTestJwt({ role: 'Admin', sub: 'user-1' });
    const payload = parseJwtPayload(token);

    expect(payload).toMatchObject({ role: 'Admin', sub: 'user-1' });
  });

  it('reads Admin role from the token', () => {
    const token = createTestJwt({ role: 'Admin' });
    browserStorageTokenProvider.setToken(token);

    expect(getCurrentUserRoles()).toEqual(['Admin']);
    expect(canEditDashboard()).toBe(true);
  });

  it('reads Admin role from a JWT roles array', () => {
    browserStorageTokenProvider.setToken(createTestJwt({ roles: ['Admin'] }));

    expect(getCurrentUserRoles()).toEqual(['Admin']);
    expect(canEditDashboard()).toBe(true);
  });

  it('reads Admin role from alternate JWT claim keys', () => {
    browserStorageTokenProvider.setToken(
      createTestJwt({
        Role: 'Admin',
        Roles: ['Administrator'],
      }),
    );

    expect(getCurrentUserRoles()).toEqual(['Admin', 'Administrator']);
    expect(canEditDashboard()).toBe(true);
  });

  it('merges portal and JWT roles without duplicates', () => {
    browserStorageTokenProvider.setToken(createTestJwt({ role: 'Viewer' }));

    expect(
      getEffectiveUserRoles({
        id: 1,
        userName: 'admin',
        fullName: 'Admin',
        email: null,
        mobile: null,
        avatar: null,
        roles: ['Admin', 'Viewer'],
        role: null,
      }),
    ).toEqual(['Admin', 'Viewer']);
  });

  it('does not allow dashboard edits for Viewer', () => {
    browserStorageTokenProvider.setToken(createTestJwt({ role: 'Viewer' }));

    expect(canEditDashboard()).toBe(false);
  });

  it('prefers portal user roles when present', () => {
    browserStorageTokenProvider.setToken(createTestJwt({ role: 'Viewer' }));

    expect(
      userHasDashboardWriteAccess({
        id: 1,
        userName: 'admin',
        fullName: 'Admin',
        email: null,
        mobile: null,
        avatar: null,
        roles: ['Admin'],
        role: null,
      }),
    ).toBe(true);
  });

  it('allows monitoring write access only for Admin', () => {
    expect(
      userHasMonitoringWriteAccess({
        id: 2,
        userName: 'viewer',
        fullName: 'Viewer',
        email: null,
        mobile: null,
        avatar: null,
        roles: ['Viewer'],
        role: null,
      }),
    ).toBe(false);
  });

  it('allows credential write access for Admin JWT roles array', () => {
    browserStorageTokenProvider.setToken(createTestJwt({ roles: ['Admin'] }));

    expect(
      userHasCredentialWriteAccess({
        id: 1,
        userName: 'admin',
        fullName: 'Admin',
        email: null,
        mobile: null,
        avatar: null,
        roles: [],
        role: null,
      }),
    ).toBe(true);
  });

  it('denies credential write access for Viewer and Operator', () => {
    browserStorageTokenProvider.setToken(createTestJwt({ roles: ['Viewer'] }));

    expect(
      userHasCredentialWriteAccess({
        id: 2,
        userName: 'viewer',
        fullName: 'Viewer',
        email: null,
        mobile: null,
        avatar: null,
        roles: ['Viewer'],
        role: null,
      }),
    ).toBe(false);

    browserStorageTokenProvider.setToken(createTestJwt({ role: 'Operator' }));

    expect(
      userHasCredentialWriteAccess({
        id: 3,
        userName: 'operator',
        fullName: 'Operator',
        email: null,
        mobile: null,
        avatar: null,
        roles: ['Operator'],
        role: null,
      }),
    ).toBe(false);
  });

  it('does not grant dashboard write access from an authenticated user without an Admin role', () => {
    expect(
      userHasDashboardWriteAccess({
        id: 1,
        userName: 'admin',
        fullName: 'مدیر اصلی',
        email: null,
        mobile: null,
        avatar: null,
        roles: [],
        role: null,
      }),
    ).toBe(false);
  });

  it('grants monitoring write access to an authenticated portal user without an English Admin role', () => {
    expect(
      userHasMonitoringWriteAccess({
        id: 1,
        userName: 'admin',
        fullName: 'مدیر اصلی',
        email: null,
        mobile: null,
        avatar: null,
        roles: [],
        role: null,
      }),
    ).toBe(true);
  });
});
