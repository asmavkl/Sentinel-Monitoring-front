import type {
  CredentialType,
  SnmpAuthenticationProtocol,
  SnmpPrivacyProtocol,
  SnmpVersion,
} from './enums';

export interface DatabaseCredentialDto {
  id: number;
  name: string;
  server: string | null;
  databaseName: string | null;
  username: string;
  isActive: boolean;
  port?: number | null;
  createdDate?: string | null;
  /** Present when API supports typed credentials; otherwise inferred client-side. */
  credentialType?: CredentialType;
  snmpVersion?: SnmpVersion | null;
  snmpAuthenticationProtocol?: SnmpAuthenticationProtocol | null;
  snmpPrivacyProtocol?: SnmpPrivacyProtocol | null;
}

export interface CreateDatabaseCredentialRequest {
  name: string;
  server: string;
  databaseName: string;
  username: string;
  password: string;
  privacyPassword?: string | null;
  port?: number | null;
  isActive?: boolean;
  credentialType?: CredentialType;
  snmpVersion?: SnmpVersion | null;
  snmpAuthenticationProtocol?: SnmpAuthenticationProtocol | null;
  snmpPrivacyProtocol?: SnmpPrivacyProtocol | null;
}

export interface UpdateDatabaseCredentialRequest {
  name: string;
  server: string;
  databaseName: string;
  username: string;
  password?: string | null;
  privacyPassword?: string | null;
  port?: number | null;
  isActive: boolean;
  credentialType?: CredentialType;
  snmpVersion?: SnmpVersion | null;
  snmpAuthenticationProtocol?: SnmpAuthenticationProtocol | null;
  snmpPrivacyProtocol?: SnmpPrivacyProtocol | null;
}

export interface TestDatabaseConnectionRequest {
  credentialType: CredentialType;
  server: string;
  database: string;
  username: string;
  password: string;
  port?: number | null;
}

export interface TestDatabaseConnectionResult {
  success: boolean;
  message?: string | null;
  durationMs?: number | null;
}
