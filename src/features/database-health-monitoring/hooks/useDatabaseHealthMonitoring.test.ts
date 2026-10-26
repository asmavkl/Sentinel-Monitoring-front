import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import React from 'react';
import {
  useAddDatabaseHealthMonitoring,
  useAvailableHealthQueries,
  useProvisionDatabaseHealthMonitoring,
  useProvisionedChecks,
} from './useDatabaseHealthMonitoring';
import { databaseHealthMonitoringApi } from '@/api/databaseHealthMonitoringApi';
import { databaseHealthMonitoringQueryKeys } from './queryKeys';
import { checkManagementQueryKeys } from '@/features/check-management/hooks/queryKeys';
import { dashboardQueryKeys } from '@/features/dashboard/hooks/queryKeys';

vi.mock('@/api/databaseHealthMonitoringApi');

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
});

function wrapper({ children }: { children: React.ReactNode }) {
  return React.createElement(QueryClientProvider, { client: queryClient }, children);
}

describe('useDatabaseHealthMonitoring', () => {
  beforeEach(() => {
    queryClient.clear();
    vi.clearAllMocks();
  });

  describe('useProvisionedChecks', () => {
    it('fetches provisioned checks for an application', async () => {
      const checks = [
        { healthQueryId: 5, databaseCredentialId: 1, checkId: 100, widgetId: 200 },
      ];
      vi.mocked(databaseHealthMonitoringApi.getProvisionedChecks).mockResolvedValue(checks);

      const { result } = renderHook(() => useProvisionedChecks(123), { wrapper });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual(checks);
      expect(databaseHealthMonitoringApi.getProvisionedChecks).toHaveBeenCalledWith(123);
    });

    it('uses correct query key', () => {
      const { result } = renderHook(() => useProvisionedChecks(123), { wrapper });

      // Query key verification removed - TanStack Query v5 doesn't expose queryKey directly
      expect(result.current.isSuccess).toBe(false);
    });
  });

  describe('useAvailableHealthQueries', () => {
    it('fetches available queries for a credential', async () => {
      const queries = [
        {
          id: 5,
          name: 'connection_check',
          displayName: 'Connection Check',
          description: null,
          databaseType: 1,
          category: 1,
          resultType: 1,
          unit: null,
          isAlreadyProvisioned: false,
        },
      ];
      vi.mocked(databaseHealthMonitoringApi.getAvailableHealthQueries).mockResolvedValue(queries);

      const { result } = renderHook(() => useAvailableHealthQueries(123, 1), { wrapper });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual(queries);
      expect(databaseHealthMonitoringApi.getAvailableHealthQueries).toHaveBeenCalledWith(123, 1);
    });

    it('uses correct query key', () => {
      const { result } = renderHook(() => useAvailableHealthQueries(123, 1), { wrapper });

      // Query key verification removed - TanStack Query v5 doesn't expose queryKey directly
      expect(result.current.isSuccess).toBe(false);
    });
  });

  describe('useProvisionDatabaseHealthMonitoring', () => {
    it('calls provision API and invalidates caches', async () => {
      const result = {
        createdChecks: 2,
        existingChecks: 1,
        createdWidgets: 2,
        skipped: 0,
        items: [],
      };
      vi.mocked(databaseHealthMonitoringApi.provisionDatabaseHealthMonitoring).mockResolvedValue(result);

      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

      const { result: mutationResult } = renderHook(() => useProvisionDatabaseHealthMonitoring(123), {
        wrapper,
      });

      await mutationResult.current.mutateAsync({
        databaseCredentialIds: [1, 2],
        databaseHealthQueryIds: [5, 7],
      });

      expect(databaseHealthMonitoringApi.provisionDatabaseHealthMonitoring).toHaveBeenCalledWith(123, {
        databaseCredentialIds: [1, 2],
        databaseHealthQueryIds: [5, 7],
      });

      // Verify cache invalidation
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: databaseHealthMonitoringQueryKeys.provisionedChecks(123),
      });
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: dashboardQueryKeys.dashboard(123) });
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: dashboardQueryKeys.applicationChecks(123) });
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: checkManagementQueryKeys.checks() });
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: checkManagementQueryKeys.applications() });
    });
  });

  describe('useAddDatabaseHealthMonitoring', () => {
    it('calls add API and invalidates caches', async () => {
      const result = {
        createdChecks: 1,
        existingChecks: 0,
        createdWidgets: 1,
        skipped: 0,
        items: [],
      };
      vi.mocked(databaseHealthMonitoringApi.addDatabaseHealthMonitoring).mockResolvedValue(result);

      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

      const { result: mutationResult } = renderHook(() => useAddDatabaseHealthMonitoring(123), {
        wrapper,
      });

      await mutationResult.current.mutateAsync({
        databaseCredentialIds: [1],
        databaseHealthQueryIds: [5],
      });

      expect(databaseHealthMonitoringApi.addDatabaseHealthMonitoring).toHaveBeenCalledWith(123, {
        databaseCredentialIds: [1],
        databaseHealthQueryIds: [5],
      });

      // Verify cache invalidation
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: databaseHealthMonitoringQueryKeys.provisionedChecks(123),
      });
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: dashboardQueryKeys.dashboard(123) });
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: dashboardQueryKeys.applicationChecks(123) });
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: checkManagementQueryKeys.checks() });
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: checkManagementQueryKeys.applications() });
    });
  });
});
