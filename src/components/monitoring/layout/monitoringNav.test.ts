import { describe, expect, it } from 'vitest';
import { CREDENTIALS_LABEL } from '@/features/database-credentials/utils/credentialLabels';
import {
  getMonitoringSectionTitle,
  isMonitoringNavItemActive,
  MONITORING_NAV_ITEMS,
} from './monitoringNav.tsx';

describe('monitoringNav', () => {
  it('marks the monitoring home and applications items on the overview route', () => {
    const home = MONITORING_NAV_ITEMS.find((item) => item.id === 'home');
    const applications = MONITORING_NAV_ITEMS.find((item) => item.id === 'applications');
    const dashboards = MONITORING_NAV_ITEMS.find((item) => item.id === 'dashboards');
    const settings = MONITORING_NAV_ITEMS.find((item) => item.id === 'settings');

    expect(home && isMonitoringNavItemActive(home, '/applications')).toBe(true);
    expect(applications && isMonitoringNavItemActive(applications, '/applications')).toBe(true);
    expect(dashboards && isMonitoringNavItemActive(dashboards, '/applications')).toBe(false);
    expect(dashboards && isMonitoringNavItemActive(dashboards, '/dashboards')).toBe(true);
    expect(dashboards && isMonitoringNavItemActive(dashboards, '/dashboard/12')).toBe(true);
    expect(dashboards && isMonitoringNavItemActive(dashboards, '/applications/12/dashboard')).toBe(
      true,
    );
    expect(
      dashboards && isMonitoringNavItemActive(dashboards, '/applications/12/dashboard/designer'),
    ).toBe(true);
    expect(settings && isMonitoringNavItemActive(settings, '/settings')).toBe(true);
  });

  it('marks management applications on list and detail routes', () => {
    const managementApps = MONITORING_NAV_ITEMS.find((item) => item.id === 'management-applications');
    const wallApps = MONITORING_NAV_ITEMS.find((item) => item.id === 'applications');
    const futureChecks = MONITORING_NAV_ITEMS.find((item) => item.id === 'management-checks');
    const futureCredentials = MONITORING_NAV_ITEMS.find(
      (item) => item.id === 'management-credentials',
    );

    expect(managementApps?.label).toBe('🖥 سامانه‌ها');
    expect(managementApps && isMonitoringNavItemActive(managementApps, '/monitoring/applications')).toBe(
      true,
    );
    expect(
      managementApps && isMonitoringNavItemActive(managementApps, '/monitoring/applications/4'),
    ).toBe(true);
    expect(wallApps && isMonitoringNavItemActive(wallApps, '/monitoring/applications')).toBe(false);
    expect(futureChecks?.path).toBe('/monitoring/checks');
    expect(futureCredentials?.path).toBe('/monitoring/credentials');
    expect(futureChecks && isMonitoringNavItemActive(futureChecks, '/monitoring/checks')).toBe(true);
    expect(
      futureCredentials && isMonitoringNavItemActive(futureCredentials, '/monitoring/credentials'),
    ).toBe(true);
    expect(futureChecks && isMonitoringNavItemActive(futureChecks, '/monitoring/applications')).toBe(
      false,
    );
  });

  it('resolves the current section title', () => {
    expect(getMonitoringSectionTitle('/applications')).toBe('مرکز پایش');
    expect(getMonitoringSectionTitle('/dashboards')).toBe('داشبوردها');
    expect(getMonitoringSectionTitle('/dashboard/4')).toBe('داشبورد');
    expect(getMonitoringSectionTitle('/applications/4/dashboard')).toBe('داشبورد');
    expect(getMonitoringSectionTitle('/applications/4/dashboard/designer')).toBe('داشبورد');
    expect(getMonitoringSectionTitle('/settings')).toBe('تنظیمات');
    expect(getMonitoringSectionTitle('/monitoring/applications')).toBe('مدیریت پایش');
    expect(getMonitoringSectionTitle('/monitoring/applications/8')).toBe('جزئیات سامانه');
    expect(getMonitoringSectionTitle('/monitoring/checks')).toBe('شاخص‌ها');
    expect(getMonitoringSectionTitle('/monitoring/credentials')).toBe(CREDENTIALS_LABEL);
  });
});
