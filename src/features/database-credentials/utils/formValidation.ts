import {
  CredentialType,
  SnmpAuthenticationProtocol,
  SnmpPrivacyProtocol,
  SnmpVersion,
} from '@/types/enums';
import { CREDENTIAL_NAME_REQUIRED_MESSAGE } from './credentialLabels';

export interface CredentialFormValues {
  credentialType: CredentialType;
  name: string;
  server: string;
  databaseName: string;
  username: string;
  password: string;
  privacyPassword?: string;
  port: string;
  isActive: boolean;
  snmpVersion?: SnmpVersion | '';
  snmpAuthenticationProtocol?: SnmpAuthenticationProtocol | '';
  snmpPrivacyProtocol?: SnmpPrivacyProtocol | '';
}

export interface CredentialFormErrors {
  name?: string;
  server?: string;
  databaseName?: string;
  username?: string;
  password?: string;
  privacyPassword?: string;
  port?: string;
  snmpVersion?: string;
  snmpAuthenticationProtocol?: string;
  snmpPrivacyProtocol?: string;
}

export const PORT_RANGE_MESSAGE = 'Port must be between 1 and 65535.';
export const SQL_SERVER_PORT_CONFLICT_MESSAGE =
  'SQL Server port cannot be set both in Server and Port.';

export function parseCredentialPort(value: string): { port: number | null; error?: string } {
  const trimmed = value.trim();
  if (!trimmed) {
    return { port: null };
  }

  if (!/^\d+$/.test(trimmed)) {
    return { port: null, error: PORT_RANGE_MESSAGE };
  }

  const port = Number(trimmed);
  if (port < 1 || port > 65535) {
    return { port: null, error: PORT_RANGE_MESSAGE };
  }

  return { port };
}

export function validateCredentialPort(
  credentialType: CredentialType,
  server: string,
  portText: string,
): string | undefined {
  const parsed = parseCredentialPort(portText);
  if (parsed.error) {
    return parsed.error;
  }

  if (
    credentialType === CredentialType.SqlServer &&
    parsed.port != null &&
    server.includes(',')
  ) {
    return SQL_SERVER_PORT_CONFLICT_MESSAGE;
  }

  return undefined;
}

function validateSnmpCredentialForm(
  values: CredentialFormValues,
  isCreate: boolean,
): CredentialFormErrors {
  const errors: CredentialFormErrors = {};

  if (!values.name.trim()) {
    errors.name = CREDENTIAL_NAME_REQUIRED_MESSAGE;
  }

  if (!values.snmpVersion) {
    errors.snmpVersion = 'نسخه SNMP الزامی است';
    return errors;
  }

  if (values.snmpVersion === SnmpVersion.V1 || values.snmpVersion === SnmpVersion.V2c) {
    if (isCreate && !values.password.trim()) {
      errors.password = 'Community الزامی است';
    }
    return errors;
  }

  if (!values.username.trim()) {
    errors.username = 'نام کاربری SNMPv3 الزامی است';
  }

  if (!values.snmpAuthenticationProtocol) {
    errors.snmpAuthenticationProtocol = 'پروتکل احراز هویت SNMPv3 الزامی است';
  }

  if (isCreate && !values.password.trim()) {
    errors.password = 'رمز احراز هویت SNMPv3 الزامی است';
  }

  if (!values.snmpPrivacyProtocol) {
    errors.snmpPrivacyProtocol = 'پروتکل حریم خصوصی SNMPv3 الزامی است';
  }

  if (isCreate && !(values.privacyPassword ?? '').trim()) {
    errors.privacyPassword = 'رمز حریم خصوصی SNMPv3 الزامی است';
  }

  return errors;
}

export function validateCredentialForm(
  values: CredentialFormValues,
  isCreate: boolean,
): CredentialFormErrors {
  if (values.credentialType === CredentialType.Snmp) {
    return validateSnmpCredentialForm(values, isCreate);
  }

  const errors: CredentialFormErrors = {};

  if (!values.name.trim()) {
    errors.name = CREDENTIAL_NAME_REQUIRED_MESSAGE;
  }

  const portError = validateCredentialPort(values.credentialType, values.server, values.port);
  if (portError) {
    errors.port = portError;
  }

  if (values.credentialType === CredentialType.Redis) {
    if (!values.server.trim()) {
      errors.server = 'Host الزامی است';
    }

    if (isCreate && !values.password) {
      errors.password = 'Password الزامی است';
    }

    return errors;
  }

  if (values.credentialType === CredentialType.MongoDb) {
    if (!values.server.trim()) {
      errors.server = 'Host الزامی است';
    }

    if (isCreate && !values.password) {
      errors.password = 'Password الزامی است';
    }

    return errors;
  }

  if (!values.server.trim()) {
    errors.server = 'سرور الزامی است';
  }

  if (!values.databaseName.trim()) {
    errors.databaseName =
      values.credentialType === CredentialType.Oracle
        ? 'Service Name الزامی است'
        : 'نام دیتابیس الزامی است';
  }

  if (!values.username.trim()) {
    errors.username = 'Username الزامی است';
  }

  if (isCreate && !values.password) {
    errors.password = 'Password الزامی است';
  }

  return errors;
}
