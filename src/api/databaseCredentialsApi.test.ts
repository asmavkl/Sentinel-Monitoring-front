import { beforeEach, describe, expect, it, vi } from 'vitest';
import { databaseCredentialsApi } from './databaseCredentialsApi';
import { httpClient } from '@/api/httpClient';
import { CredentialType } from '@/types/enums';

vi.mock('@/api/httpClient', () => ({
  httpClient: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

function ok<T>(data: T) {
  return { data: { success: true, data } };
}

describe('databaseCredentialsApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('lists credentials from GET /api/databasecredentials', async () => {
    const credentials = [
      {
        id: 1,
        name: 'Samih Production DB',
        server: '192.168.3.10',
        databaseName: 'Samih',
        username: 'monitor_user',
        isActive: true,
      },
    ];
    vi.mocked(httpClient.get).mockResolvedValue(ok(credentials));

    await expect(databaseCredentialsApi.getDatabaseCredentials()).resolves.toEqual(credentials);
    expect(httpClient.get).toHaveBeenCalledWith('/api/databasecredentials');
  });

  it('loads a credential from GET /api/databasecredentials/{id}', async () => {
    const credential = { id: 1, name: 'Samih Production DB', server: '192.168.3.10' };
    vi.mocked(httpClient.get).mockResolvedValue(ok(credential));

    await expect(databaseCredentialsApi.getDatabaseCredential(1)).resolves.toEqual(credential);
    expect(httpClient.get).toHaveBeenCalledWith('/api/databasecredentials/1');
  });

  it('creates a credential on POST /api/databasecredentials', async () => {
    const created = { id: 2, name: 'Reporting DB', server: 'sql-01' };
    vi.mocked(httpClient.post).mockResolvedValue(ok(created));
    const payload = {
      name: 'Reporting DB',
      server: 'sql-01',
      databaseName: 'Logs',
      username: 'monitor',
      password: 'secret',
      isActive: true,
    };

    await expect(databaseCredentialsApi.createDatabaseCredential(payload)).resolves.toEqual(created);
    expect(httpClient.post).toHaveBeenCalledWith('/api/databasecredentials', payload);
  });

  it('updates a credential on PUT /api/databasecredentials/{id}', async () => {
    const updated = { id: 1, name: 'Samih DB Updated' };
    vi.mocked(httpClient.put).mockResolvedValue(ok(updated));
    const payload = {
      name: 'Samih DB Updated',
      server: '192.168.3.10',
      databaseName: 'Samih',
      username: 'monitor_user',
      isActive: true,
    };

    await expect(databaseCredentialsApi.updateDatabaseCredential(1, payload)).resolves.toEqual(updated);
    expect(httpClient.put).toHaveBeenCalledWith('/api/databasecredentials/1', payload);
  });

  it('deletes a credential on DELETE /api/databasecredentials/{id}', async () => {
    vi.mocked(httpClient.delete).mockResolvedValue(ok(true));

    await expect(databaseCredentialsApi.deleteDatabaseCredential(1)).resolves.toBe(true);
    expect(httpClient.delete).toHaveBeenCalledWith('/api/databasecredentials/1');
  });

  it('deactivates a credential on PUT /api/databasecredentials/{id}/deactivate', async () => {
    const deactivated = { id: 1, name: 'Samih Production DB', isActive: false };
    vi.mocked(httpClient.put).mockResolvedValue(ok(deactivated));

    await expect(databaseCredentialsApi.deactivateDatabaseCredential(1)).resolves.toEqual(deactivated);
    expect(httpClient.put).toHaveBeenCalledWith('/api/databasecredentials/1/deactivate');
  });

  it('activates a credential on PUT /api/databasecredentials/{id}/activate', async () => {
    const activated = { id: 1, name: 'Samih Production DB', isActive: true };
    vi.mocked(httpClient.put).mockResolvedValue(ok(activated));

    await expect(databaseCredentialsApi.activateDatabaseCredential(1)).resolves.toEqual(activated);
    expect(httpClient.put).toHaveBeenCalledWith('/api/databasecredentials/1/activate');
  });

  it('tests connection on POST /api/databasecredentials/test', async () => {
    vi.mocked(httpClient.post).mockResolvedValue({
      data: { success: true, message: 'Connection successful.', durationMs: 42 },
    });
    const payload = {
      credentialType: CredentialType.SqlServer,
      server: '192.168.3.10',
      database: 'Samih',
      username: 'monitor_user',
      password: 'secret',
    };

    await expect(databaseCredentialsApi.testDatabaseConnection(payload)).resolves.toEqual({
      success: true,
      message: 'Connection successful.',
      durationMs: 42,
    });
    expect(httpClient.post).toHaveBeenCalledWith('/api/databasecredentials/test', payload);
  });

  it('tests a saved credential on POST /api/databasecredentials/{id}/test', async () => {
    vi.mocked(httpClient.post).mockResolvedValue({
      data: { success: false, message: 'Login failed' },
    });

    await expect(databaseCredentialsApi.testDatabaseCredential(1)).resolves.toEqual({
      success: false,
      message: 'Login failed',
    });
    expect(httpClient.post).toHaveBeenCalledWith('/api/databasecredentials/1/test');
  });
});
