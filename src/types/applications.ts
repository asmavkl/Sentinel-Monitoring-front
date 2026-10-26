import type { ApplicationHealthStatus, ApplicationPriority } from './enums';
import type { MonitoringStatus } from '@/utils/status';

export interface MonitoredApplicationDto {
  id: number;
  name: string;
  code: string;
  description?: string | null;
  baseUrl?: string | null;
  isActive: boolean;
  priority: ApplicationPriority;
  createdDate: string;
}

export interface ApplicationStatusDto {
  applicationId: number;
  calculatedHealthStatus: ApplicationHealthStatus;
  availabilityStatus: ApplicationHealthStatus;
  calculatedAt: string;
}

export interface ApplicationListItem {
  id: number;
  name: string;
  code: string;
  isActive: boolean;
  priority: ApplicationPriority;
  status: MonitoringStatus;
  availabilityStatus?: MonitoringStatus;
  lastUpdate: string | null;
}
