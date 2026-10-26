import { describe, expect, it } from 'vitest';
import { CredentialType, SnmpAuthenticationProtocol, SnmpPrivacyProtocol, SnmpVersion } from '@/types/enums';
import { toApiCredentialPayload } from './credentialType';
import { validateCredentialForm } from './formValidation';

describe('validateCredentialForm', () => {
  it('validates SQL Server fields', () => {
    const errors = validateCredentialForm(
      {
        credentialType: CredentialType.SqlServer,
        name: '',
        server: '',
        databaseName: '',
        username: '',
        password: '',
        port: '',
        isActive: true,
      },
      true,
    );

    expect(errors.name).toBeTruthy();
    expect(errors.server).toBeTruthy();
    expect(errors.databaseName).toBeTruthy();
    expect(errors.username).toBeTruthy();
    expect(errors.password).toBeTruthy();
  });

  it('validates Redis host', () => {
    const errors = validateCredentialForm(
      {
        credentialType: CredentialType.Redis,
        name: 'Redis Prod',
        server: '',
        databaseName: '',
        username: '',
        password: 'secret',
        port: '',
        isActive: true,
      },
      true,
    );

    expect(errors.server).toBe('Host الزامی است');
  });

  it('validates MongoDB host', () => {
    const errors = validateCredentialForm(
      {
        credentialType: CredentialType.MongoDb,
        name: 'Mongo Prod',
        server: '',
        databaseName: '',
        username: '',
        password: 'secret',
        port: '',
        isActive: true,
      },
      true,
    );

    expect(errors.server).toBe('Host الزامی است');
  });

  it('rejects a port outside 1 to 65535', () => {
    const errors = validateCredentialForm(
      {
        credentialType: CredentialType.PostgreSql,
        name: 'App DB',
        server: 'db.example',
        databaseName: 'app',
        username: 'monitor',
        password: 'secret',
        port: '0',
        isActive: true,
      },
      true,
    );

    expect(errors.port).toBe('Port must be between 1 and 65535.');
  });

  it('rejects SQL Server port when Server already contains a port', () => {
    const errors = validateCredentialForm(
      {
        credentialType: CredentialType.SqlServer,
        name: 'App DB',
        server: 'localhost,1433',
        databaseName: 'app',
        username: 'monitor',
        password: 'secret',
        port: '1433',
        isActive: true,
      },
      true,
    );

    expect(errors.port).toBe('SQL Server port cannot be set both in Server and Port.');
  });

  it('allows an empty port', () => {
    const errors = validateCredentialForm(
      {
        credentialType: CredentialType.MySql,
        name: 'App DB',
        server: 'db.example',
        databaseName: 'app',
        username: 'monitor',
        password: 'secret',
        port: '',
        isActive: true,
      },
      true,
    );

    expect(errors.port).toBeUndefined();
  });

  it('requires only a community for SNMPv2c and ignores database fields', () => {
    const errors = validateCredentialForm(
      {
        credentialType: CredentialType.Snmp,
        name: 'Production SNMP',
        server: '',
        databaseName: '',
        username: 'should-clear',
        password: '',
        port: '',
        isActive: true,
        snmpVersion: SnmpVersion.V2c,
      },
      true,
    );

    expect(errors.password).toBe('Community الزامی است');
    expect(errors.server).toBeUndefined();
    expect(errors.username).toBeUndefined();
  });

  it('requires AuthPriv fields for SNMPv3', () => {
    const errors = validateCredentialForm(
      {
        credentialType: CredentialType.Snmp,
        name: 'Production SNMP',
        server: '',
        databaseName: '',
        username: '',
        password: '',
        privacyPassword: '',
        port: '',
        isActive: true,
        snmpVersion: SnmpVersion.V3,
        snmpAuthenticationProtocol: '',
        snmpPrivacyProtocol: '',
      },
      true,
    );

    expect(errors.username).toBeTruthy();
    expect(errors.password).toBeTruthy();
    expect(errors.privacyPassword).toBeTruthy();
    expect(errors.snmpAuthenticationProtocol).toBeTruthy();
    expect(errors.snmpPrivacyProtocol).toBeTruthy();
  });

  it('keeps stored SNMPv3 secrets when the edit form leaves passwords empty', () => {
    const errors = validateCredentialForm(
      {
        credentialType: CredentialType.Snmp,
        name: 'Production SNMP',
        server: '',
        databaseName: '',
        username: 'snmpuser',
        password: '',
        privacyPassword: '',
        port: '',
        isActive: true,
        snmpVersion: SnmpVersion.V3,
        snmpAuthenticationProtocol: SnmpAuthenticationProtocol.Sha256,
        snmpPrivacyProtocol: SnmpPrivacyProtocol.Aes128,
      },
      false,
    );

    expect(errors).toEqual({});
  });
});

describe('toApiCredentialPayload SNMP', () => {
  it('sends an empty host for v2c and omits v3-only fields', () => {
    expect(
      toApiCredentialPayload({
        credentialType: CredentialType.Snmp,
        name: 'Plant',
        server: 'should-not-send',
        databaseName: 'db',
        username: 'user',
        password: 'public',
        port: 161,
        isActive: true,
        snmpVersion: SnmpVersion.V2c,
      }),
    ).toEqual({
      name: 'Plant',
      server: '',
      databaseName: '',
      username: '',
      password: 'public',
      port: null,
      isActive: true,
      credentialType: CredentialType.Snmp,
      snmpVersion: SnmpVersion.V2c,
    });
  });

  it('does not attach SNMP fields to SQL credentials', () => {
    const payload = toApiCredentialPayload({
      credentialType: CredentialType.SqlServer,
      name: 'DB',
      server: 'sql-01',
      databaseName: 'App',
      username: 'monitor',
      password: 'secret',
      isActive: true,
    });

    expect(payload).not.toHaveProperty('snmpVersion');
    expect(payload).not.toHaveProperty('privacyPassword');
  });
});
