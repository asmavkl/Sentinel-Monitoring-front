import type { ReactNode } from 'react';
import ComputerOutlinedIcon from '@mui/icons-material/ComputerOutlined';
import DnsOutlinedIcon from '@mui/icons-material/DnsOutlined';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import StorageOutlinedIcon from '@mui/icons-material/StorageOutlined';
import VpnKeyOutlinedIcon from '@mui/icons-material/VpnKeyOutlined';
import { CREDENTIALS_LABEL } from '@/features/database-credentials/utils/credentialLabels';
import { HEALTH_QUERIES_LABEL } from '@/features/database-health-queries/utils/labels';
import { ROUTES, isApplicationDashboardPath } from '@/routes/paths';
import { useUserRoleSimple } from '@/features/auth/hooks/useUserRoleSimple';
import { canWriteSystem } from '@/auth';

export type MonitoringNavMatch =
  | 'home'
  | 'applications'
  | 'dashboards'
  | 'settings'
  | 'management-applications'
  | 'management-checks'
  | 'management-servers'
  | 'management-credentials'
  | 'management-health-queries';

export interface MonitoringNavItem {
  id: MonitoringNavMatch;
  label: string;
  path: string;
  match: MonitoringNavMatch;
  icon: ReactNode;
  ariaLabel?: string;
}

export interface MonitoringNavSection {
  id: string;
  label?: string;
  items: MonitoringNavItem[];
}

const ALL_NAV_SECTIONS: MonitoringNavSection[] = [
  {
    id: 'ops',
    items: [
      {
        id: 'home',
        label: 'مرکز پایش',
        path: ROUTES.applications,
        match: 'home',
        icon: <HomeOutlinedIcon fontSize="small" />,
      },
    ],
  },
  {
    id: 'management',
    label: 'مدیریت پایش',
    items: [
      {
        id: 'management-applications',
        label: 'سامانه‌ها',
        path: ROUTES.monitoringApplications,
        match: 'management-applications',
        icon: <ComputerOutlinedIcon fontSize="small" />,
        ariaLabel: 'سامانه‌ها',
      },
      {
        id: 'management-checks',
        label: ' شاخص‌ها',
        path: ROUTES.monitoringChecks,
        match: 'management-checks',
        icon: <SearchOutlinedIcon fontSize="small" />,
        ariaLabel: 'شاخص‌ها',
      },
      {
        id: 'management-servers',
        label: 'مانیتورینگ سرور',
        path: ROUTES.monitoringServers,
        match: 'management-servers',
        icon: <DnsOutlinedIcon fontSize="small" />,
        ariaLabel: 'مانیتورینگ سرور',
      },
      {
        id: 'management-credentials',
        label: `${CREDENTIALS_LABEL}`,
        path: ROUTES.monitoringCredentials,
        match: 'management-credentials',
        icon: <VpnKeyOutlinedIcon fontSize="small" />,
        ariaLabel: CREDENTIALS_LABEL,
      },
      {
        id: 'management-health-queries',
        label: HEALTH_QUERIES_LABEL,
        path: ROUTES.monitoringHealthQueries,
        match: 'management-health-queries',
        icon: <StorageOutlinedIcon fontSize="small" />,
        ariaLabel: HEALTH_QUERIES_LABEL,
      },
    ],
  },
  {
    id: 'system',
    label: 'سیستم',
    items: [
      {
        id: 'settings',
        label: 'تنظیمات',
        path: ROUTES.settings,
        match: 'settings',
        icon: <SettingsOutlinedIcon fontSize="small" />,
      },
    ],
  },
];

export function useMonitoringNavSections(): MonitoringNavSection[] {
  const { data: role } = useUserRoleSimple();
  const hasSystemAccess = canWriteSystem(role);

  return ALL_NAV_SECTIONS
    .map((section) => {
      if (section.id === 'system' && !hasSystemAccess) {
        return null;
      }

      const filteredItems = section.items.filter((item) => {
        if (item.id === 'management-credentials' && !hasSystemAccess) {
          return false;
        }
        if (item.id === 'management-health-queries' && !hasSystemAccess) {
          return false;
        }
        return true;
      });

      if (filteredItems.length === 0) {
        return null;
      }

      return {
        ...section,
        items: filteredItems,
      };
    })
    .filter((section): section is MonitoringNavSection => section !== null);
}

export const MONITORING_NAV_SECTIONS = ALL_NAV_SECTIONS;


export const MONITORING_NAV_ITEMS: MonitoringNavItem[] = MONITORING_NAV_SECTIONS.flatMap(
  (section) => section.items,
);

export function isMonitoringNavItemActive(item: MonitoringNavItem, pathname: string): boolean {
  if (item.match === 'settings') {
    return pathname.startsWith(ROUTES.settings);
  }

  if (item.match === 'dashboards') {
    return (
      pathname === ROUTES.dashboards ||
      pathname.startsWith(`${ROUTES.dashboards}/`) ||
      isApplicationDashboardPath(pathname) ||
      pathname.startsWith('/dashboard') ||
      pathname.startsWith('/checks')
    );
  }

  if (item.match === 'management-applications') {
    return (
      pathname === ROUTES.monitoringApplications ||
      pathname.startsWith(`${ROUTES.monitoringApplications}/`)
    );
  }

  if (item.match === 'management-checks') {
    return pathname === ROUTES.monitoringChecks || pathname.startsWith(`${ROUTES.monitoringChecks}/`);
  }

  if (item.match === 'management-servers') {
    return pathname === ROUTES.monitoringServers || pathname.startsWith(`${ROUTES.monitoringServers}/`);
  }

  if (item.match === 'management-credentials') {
    return (
      pathname === ROUTES.monitoringCredentials ||
      pathname.startsWith(`${ROUTES.monitoringCredentials}/`)
    );
  }

  if (item.match === 'management-health-queries') {
    return (
      pathname === ROUTES.monitoringHealthQueries ||
      pathname.startsWith(`${ROUTES.monitoringHealthQueries}/`)
    );
  }

  if (item.match === 'applications') {
    return pathname === ROUTES.applications || pathname === `${ROUTES.applications}/`;
  }

  if (item.match === 'home') {
    return pathname === ROUTES.applications || pathname === `${ROUTES.applications}/` || pathname === '/' || pathname === '';
  }

  return false;
}

export function getMonitoringSectionTitle(pathname: string): string {
  if (pathname.startsWith(ROUTES.settings)) {
    return 'تنظیمات';
  }

  if (pathname === ROUTES.dashboards || pathname.startsWith(`${ROUTES.dashboards}/`)) {
    return 'داشبوردها';
  }

  if (isApplicationDashboardPath(pathname) || pathname.startsWith('/dashboard')) {
    return 'داشبورد';
  }

  if (pathname.startsWith(ROUTES.monitoringChecks)) {
    return 'شاخص‌ها';
  }

  if (pathname.startsWith(ROUTES.monitoringServers)) {
    return 'مانیتورینگ سرور';
  }

  if (pathname.startsWith(ROUTES.monitoringCredentials)) {
    return CREDENTIALS_LABEL;
  }

  if (pathname.startsWith(ROUTES.monitoringHealthQueries)) {
    return HEALTH_QUERIES_LABEL;
  }

  if (pathname.startsWith('/checks')) {
    return 'جزئیات پایش';
  }

  if (pathname.startsWith(`${ROUTES.monitoringApplications}/`)) {
    return 'جزئیات سامانه';
  }

  if (pathname.startsWith(ROUTES.monitoringApplications)) {
    return 'مدیریت پایش';
  }

  return 'مرکز پایش';
}
