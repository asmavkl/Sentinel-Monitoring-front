export interface ProvisionDatabaseHealthMonitoringRequest {
  databaseCredentialIds: number[];
  databaseHealthQueryIds: number[];
}

export interface AddDatabaseHealthMonitoringRequest {
  databaseCredentialIds: number[];
  databaseHealthQueryIds: number[];
}

export interface ProvisioningResultDto {
  createdChecks: number;
  existingChecks: number;
  createdWidgets: number;
  skipped: number;
  items: ProvisioningResultItemDto[];
}

export interface ProvisioningResultItemDto {
  healthQueryId: number;
  databaseCredentialId: number;
  checkId: number | null;
  widgetId: number | null;
  created: boolean;
  error: string | null;
}

export interface AvailableHealthQueryDto {
  id: number;
  name: string;
  displayName: string;
  description: string | null;
  databaseType: number; // CredentialType enum value
  category: number; // DatabaseHealthQueryCategory enum value
  resultType: number; // ResultType enum value
  unit: string | null;
  isAlreadyProvisioned: boolean;
}

export interface ProvisionedCheckDto {
  healthQueryId: number;
  databaseCredentialId: number;
  checkId: number | null;
  widgetId: number | null;
}
