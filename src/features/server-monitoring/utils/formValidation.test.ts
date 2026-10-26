import { describe, expect, it } from 'vitest';
import { EMPTY_SERVER_FORM, toServerRequest, validateServerForm } from './formValidation';

describe('validateServerForm', () => {
  it('requires name, host, and an SNMP credential', () => {
    const errors = validateServerForm({
      ...EMPTY_SERVER_FORM,
      intervalSeconds: '30',
      timeoutSeconds: '20',
      retryCount: '0',
      retryDelaySeconds: '5',
    });

    expect(errors.name).toBeTruthy();
    expect(errors.host).toBeTruthy();
    expect(errors.credentialId).toBeTruthy();
  });

  it('treats an empty port as the backend default and keeps scheduling defaults', () => {
    const values = {
      ...EMPTY_SERVER_FORM,
      name: 'Production DB Server',
      host: '10.10.1.20',
      credentialId: '7',
    };

    expect(validateServerForm(values)).toEqual({});
    expect(toServerRequest(values)).toMatchObject({
      port: null,
      credentialId: 7,
      intervalSeconds: 30,
      timeoutSeconds: 20,
      retryCount: 0,
      retryDelaySeconds: 5,
      description: null,
    });
    expect(toServerRequest(values)).not.toHaveProperty('monitoringMethod');
  });

  it('rejects a port outside 1 to 65535', () => {
    const errors = validateServerForm({
      ...EMPTY_SERVER_FORM,
      name: 'Server',
      host: '10.0.0.1',
      port: '70000',
      credentialId: '1',
    });

    expect(errors.port).toBe('پورت باید بین ۱ و ۶۵۵۳۵ باشد');
  });
});
