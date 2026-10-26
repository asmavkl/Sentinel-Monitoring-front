import type { ApplicationPriority } from './enums';

export interface MonitoringApplicationDto {
  id: number;
  name: string;
  code: string;
  description?: string | null;
  baseUrl?: string | null;
  isActive: boolean;
  priority: ApplicationPriority;
  createdDate?: string | null;
}

export interface MonitoringApplicationListItem extends MonitoringApplicationDto {
  componentCount: number | null;
  checkCount: number | null;
}

export interface CreateApplicationRequest {
  name: string;
  code: string;
  description?: string | null;
  baseUrl?: string | null;
  isActive: boolean;
  priority: ApplicationPriority;
  dashboardTemplateId?: number | null;
}

export interface UpdateApplicationRequest {
  name: string;
  description?: string | null;
  baseUrl?: string | null;
  isActive: boolean;
  priority: ApplicationPriority;
}

export interface MonitoringComponentDto {
  id: number;
  applicationId: number;
  name: string;
  code: string;
  description?: string | null;
  isActive: boolean;
  createdDate?: string | null;
}

export interface CreateComponentRequest {
  applicationId: number;
  name: string;
  code: string;
  description?: string | null;
  isActive: boolean;
}

export interface UpdateComponentRequest {
  name: string;
  description?: string | null;
  isActive: boolean;
}

export interface MonitoringCheckListItem {
  id: number;
}
