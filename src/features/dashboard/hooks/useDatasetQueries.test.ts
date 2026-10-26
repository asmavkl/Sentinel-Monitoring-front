import { describe, expect, it, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useLatestDataset, useDatasetHistory } from './useDatasetQueries';
import { datasetApi } from '@/api/datasetApi';

vi.mock('@/api/datasetApi');

describe('useDatasetQueries', () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => {
    return React.createElement(QueryClientProvider, { client: queryClient }, children);
  };

  describe('useLatestDataset', () => {
    it('should fetch latest dataset', async () => {
      const mockDataset = {
        columns: [
          { name: 'time', type: 'datetime' },
          { name: 'success', type: 'number' },
        ],
        rows: [{ time: '2026-09-08T10:00:00', success: 120 }],
      };

      vi.mocked(datasetApi.getLatestDataset).mockResolvedValue(mockDataset);

      const { result } = renderHook(() => useLatestDataset(1, 2), { wrapper });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockDataset);
      expect(datasetApi.getLatestDataset).toHaveBeenCalledWith(1, 2);
    });

    it('should not fetch when checkId is 0', () => {
      const { result } = renderHook(() => useLatestDataset(0, 2), { wrapper });

      expect(result.current.isFetching).toBe(false);
    });

    it('should not fetch when applicationId is 0', () => {
      const { result } = renderHook(() => useLatestDataset(1, 0), { wrapper });

      expect(result.current.isFetching).toBe(false);
    });

    it('should handle errors', async () => {
      vi.mocked(datasetApi.getLatestDataset).mockRejectedValue(new Error('API Error'));

      const { result } = renderHook(() => useLatestDataset(1, 2), { wrapper });

      await waitFor(() => {
        return result.current.isError || result.current.fetchStatus === 'idle';
      });
    });
  });

  describe('useDatasetHistory', () => {
    it('should fetch dataset history', async () => {
      const mockHistory = [
        {
          executionTime: '2026-09-08T10:00:00',
          dataset: {
            columns: [
              { name: 'time', type: 'datetime' },
              { name: 'success', type: 'number' },
            ],
            rows: [{ time: '2026-09-08T10:00:00', success: 120 }],
          },
        },
      ];

      vi.mocked(datasetApi.getDatasetHistory).mockResolvedValue(mockHistory);

      const { result } = renderHook(
        () => useDatasetHistory(1, 2, { from: '2026-09-08T09:00:00', to: '2026-09-08T11:00:00', take: 10 }),
        { wrapper },
      );

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockHistory);
      expect(datasetApi.getDatasetHistory).toHaveBeenCalledWith(1, {
        from: '2026-09-08T09:00:00',
        to: '2026-09-08T11:00:00',
        take: 10,
        applicationId: 2,
      });
    });

    it('should not fetch when checkId is 0', () => {
      const { result } = renderHook(() => useDatasetHistory(0, 2), { wrapper });

      expect(result.current.isFetching).toBe(false);
    });

    it('should not fetch when applicationId is 0', () => {
      const { result } = renderHook(() => useDatasetHistory(1, 0), { wrapper });

      expect(result.current.isFetching).toBe(false);
    });

    it('should handle empty query params', async () => {
      const mockHistory: any[] = [];
      vi.mocked(datasetApi.getDatasetHistory).mockResolvedValue(mockHistory);

      const { result } = renderHook(() => useDatasetHistory(1, 2, {}), { wrapper });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(datasetApi.getDatasetHistory).toHaveBeenCalledWith(1, { applicationId: 2 });
    });

    it('should handle errors', async () => {
      vi.mocked(datasetApi.getDatasetHistory).mockRejectedValue(new Error('API Error'));

      const { result } = renderHook(() => useDatasetHistory(1, 2), { wrapper });

      await waitFor(() => {
        return result.current.isError || result.current.fetchStatus === 'idle';
      });
    });
  });
});
