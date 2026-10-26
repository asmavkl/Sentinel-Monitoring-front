import {
  CredentialType,
  SnmpAuthenticationProtocol,
  SnmpPrivacyProtocol,
  SnmpVersion,
} from '@/types/enums';
import type { DatabaseCredentialDto } from '@/types/databaseCredentials';

const REDIS_PREFIX = '__redis__';
const MONGO_PREFIX = '__mongodb__';

const RELATIONAL_CREDENTIAL_TYPES = new Set<CredentialType>([
  CredentialType.SqlServer,
  CredentialType.PostgreSql,
  CredentialType.MySql,
  CredentialType.Oracle,
]);

export function isRelationalCredentialType(type: CredentialType): boolean {
  return RELATIONAL_CREDENTIAL_TYPES.has(type);
}

export function isSnmpCredentialType(type: CredentialType): boolean {
  return type === CredentialType.Snmp;
}

export const SNMP_COLLECTION_VERIFICATION_MESSAGE =
  'SNMP credentials are verified when a monitored server is collected.';

export function isSnmpCollectionVerification(message?: string | null): boolean {
  return message === SNMP_COLLECTION_VERIFICATION_MESSAGE;
}

export function getCredentialTypeLabel(type: CredentialType): string {
  switch (type) {
    case CredentialType.SqlServer:
      return 'SQL Server';
    case CredentialType.Redis:
      return 'Redis';
    case CredentialType.MongoDb:
      return 'MongoDB';
    case CredentialType.PostgreSql:
      return 'PostgreSQL';
    case CredentialType.MySql:
      return 'MySQL';
    case CredentialType.Oracle:
      return 'Oracle';
    case CredentialType.Snmp:
      return 'SNMP';
    default:
      return 'SQL Server';
  }
}

export function getSnmpVersionLabel(version: SnmpVersion): string {
  switch (version) {
    case SnmpVersion.V1:
      return 'V1';
    case SnmpVersion.V2c:
      return 'V2c';
    case SnmpVersion.V3:
      return 'V3';
    default:
      return '—';
  }
}

export function getSnmpAuthenticationProtocolLabel(protocol: SnmpAuthenticationProtocol): string {
  switch (protocol) {
    case SnmpAuthenticationProtocol.Md5:
      return 'MD5 (فقط برای عامل قدیمی)';
    case SnmpAuthenticationProtocol.Sha1:
      return 'SHA-1';
    case SnmpAuthenticationProtocol.Sha256:
      return 'SHA-256 (پیشنهادی)';
    case SnmpAuthenticationProtocol.Sha384:
      return 'SHA-384';
    case SnmpAuthenticationProtocol.Sha512:
      return 'SHA-512';
    default:
      return '—';
  }
}

export function getSnmpPrivacyProtocolLabel(protocol: SnmpPrivacyProtocol): string {
  switch (protocol) {
    case SnmpPrivacyProtocol.Des:
      return 'DES (فقط برای عامل قدیمی)';
    case SnmpPrivacyProtocol.Aes128:
      return 'AES-128 (پیشنهادی)';
    case SnmpPrivacyProtocol.Aes192:
      return 'AES-192';
    case SnmpPrivacyProtocol.Aes256:
      return 'AES-256';
    default:
      return '—';
  }
}

export function getCredentialType(credential: DatabaseCredentialDto): CredentialType {
  if (
    credential.credentialType === CredentialType.SqlServer ||
    credential.credentialType === CredentialType.Redis ||
    credential.credentialType === CredentialType.MongoDb ||
    credential.credentialType === CredentialType.PostgreSql ||
    credential.credentialType === CredentialType.MySql ||
    credential.credentialType === CredentialType.Oracle ||
    credential.credentialType === CredentialType.Snmp
  ) {
    return credential.credentialType;
  }

  const databaseName = credential.databaseName ?? '';

  if (databaseName.startsWith(REDIS_PREFIX)) {
    return CredentialType.Redis;
  }

  if (databaseName.startsWith(MONGO_PREFIX)) {
    return CredentialType.MongoDb;
  }

  return CredentialType.SqlServer;
}

export function encodeRedisDatabaseName(databaseNumber = 0): string {
  return `${REDIS_PREFIX}${databaseNumber}`;
}

export function encodeMongoDatabaseName(databaseName = ''): string {
  return databaseName ? `${MONGO_PREFIX}${databaseName}` : '';
}

export function getRedisConnectionFromCredential(credential: DatabaseCredentialDto): {
  host: string;
  databaseNumber: number;
  username: string;
} {
  const databaseName = credential.databaseName ?? '';
  const databaseNumber = databaseName.startsWith(REDIS_PREFIX)
    ? Number(databaseName.slice(REDIS_PREFIX.length)) || 0
    : 0;

  return {
    host: credential.server ?? '',
    databaseNumber,
    username: credential.username,
  };
}

export function getMongoConnectionFromCredential(credential: DatabaseCredentialDto): {
  host: string;
  databaseName: string;
  username: string;
} {
  const storedName = credential.databaseName ?? '';
  const databaseName = storedName.startsWith(MONGO_PREFIX)
    ? storedName.slice(MONGO_PREFIX.length)
    : storedName;

  return {
    host: credential.server ?? '',
    databaseName,
    username: credential.username,
  };
}

export function toApiCredentialPayload(values: {
  credentialType: CredentialType;
  name: string;
  server: string;
  databaseName: string;
  username: string;
  password?: string;
  privacyPassword?: string;
  port?: number | null;
  isActive: boolean;
  snmpVersion?: SnmpVersion | '';
  snmpAuthenticationProtocol?: SnmpAuthenticationProtocol | '';
  snmpPrivacyProtocol?: SnmpPrivacyProtocol | '';
}): {
  name: string;
  server: string;
  databaseName: string;
  username: string;
  password?: string;
  privacyPassword?: string;
  port: number | null;
  isActive: boolean;
  credentialType: CredentialType;
  snmpVersion?: SnmpVersion;
  snmpAuthenticationProtocol?: SnmpAuthenticationProtocol;
  snmpPrivacyProtocol?: SnmpPrivacyProtocol;
} {
  const port = values.port ?? null;

  if (values.credentialType === CredentialType.Snmp) {
    const snmpVersion = values.snmpVersion || SnmpVersion.V2c;
    const base = {
      name: values.name.trim(),
      server: '',
      databaseName: '',
      port: null as number | null,
      isActive: values.isActive,
      credentialType: CredentialType.Snmp,
      snmpVersion,
    };

    if (snmpVersion === SnmpVersion.V3) {
      return {
        ...base,
        username: values.username.trim(),
        password: values.password ?? '',
        privacyPassword: values.privacyPassword ?? '',
        snmpAuthenticationProtocol:
          values.snmpAuthenticationProtocol || SnmpAuthenticationProtocol.Sha256,
        snmpPrivacyProtocol: values.snmpPrivacyProtocol || SnmpPrivacyProtocol.Aes128,
      };
    }

    return {
      ...base,
      username: '',
      password: values.password ?? '',
    };
  }

  if (values.credentialType === CredentialType.Redis) {
    return {
      name: values.name.trim(),
      server: values.server.trim(),
      databaseName: encodeRedisDatabaseName(0),
      username: values.username.trim(),
      password: values.password,
      port,
      isActive: values.isActive,
      credentialType: CredentialType.Redis,
    };
  }

  if (values.credentialType === CredentialType.MongoDb) {
    return {
      name: values.name.trim(),
      server: values.server.trim(),
      databaseName: encodeMongoDatabaseName(values.databaseName.trim()),
      username: values.username.trim(),
      password: values.password,
      port,
      isActive: values.isActive,
      credentialType: CredentialType.MongoDb,
    };
  }

  return {
    name: values.name.trim(),
    server: values.server.trim(),
    databaseName: values.databaseName.trim(),
    username: values.username.trim(),
    password: values.password,
    port,
    isActive: values.isActive,
    credentialType: values.credentialType,
  };
}
