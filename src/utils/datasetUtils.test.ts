import { describe, expect, it } from 'vitest';
import {
  detectDateTimeColumn,
  detectNumericColumns,
  detectDefaultDatasetConfiguration,
  isDatasetEmpty,
} from './datasetUtils';
import type { DatasetDto } from '@/types/dashboard';

describe('datasetUtils', () => {
  describe('detectDateTimeColumn', () => {
    it('should detect datetime column', () => {
      const columns = [
        { name: 'time', type: 'datetime' },
        { name: 'value', type: 'number' },
      ];
      expect(detectDateTimeColumn(columns)).toBe('time');
    });

    it('should detect timestamp column', () => {
      const columns = [
        { name: 'timestamp', type: 'timestamp' },
        { name: 'value', type: 'number' },
      ];
      expect(detectDateTimeColumn(columns)).toBe('timestamp');
    });

    it('should detect date column', () => {
      const columns = [
        { name: 'date', type: 'date' },
        { name: 'value', type: 'number' },
      ];
      expect(detectDateTimeColumn(columns)).toBe('date');
    });

    it('should return null if no datetime column found', () => {
      const columns = [
        { name: 'name', type: 'string' },
        { name: 'value', type: 'number' },
      ];
      expect(detectDateTimeColumn(columns)).toBeNull();
    });

    it('should handle empty columns', () => {
      expect(detectDateTimeColumn([])).toBeNull();
    });
  });

  describe('detectNumericColumns', () => {
    it('should detect numeric columns', () => {
      const columns = [
        { name: 'time', type: 'datetime' },
        { name: 'success', type: 'number' },
        { name: 'failed', type: 'number' },
      ];
      expect(detectNumericColumns(columns)).toEqual(['success', 'failed']);
    });

    it('should detect int columns', () => {
      const columns = [
        { name: 'count', type: 'int' },
        { name: 'name', type: 'string' },
      ];
      expect(detectNumericColumns(columns)).toEqual(['count']);
    });

    it('should detect decimal columns', () => {
      const columns = [
        { name: 'price', type: 'decimal' },
        { name: 'name', type: 'string' },
      ];
      expect(detectNumericColumns(columns)).toEqual(['price']);
    });

    it('should detect float columns', () => {
      const columns = [
        { name: 'rate', type: 'float' },
        { name: 'name', type: 'string' },
      ];
      expect(detectNumericColumns(columns)).toEqual(['rate']);
    });

    it('should return empty array if no numeric columns found', () => {
      const columns = [
        { name: 'name', type: 'string' },
        { name: 'status', type: 'string' },
      ];
      expect(detectNumericColumns(columns)).toEqual([]);
    });

    it('should handle empty columns', () => {
      expect(detectNumericColumns([])).toEqual([]);
    });
  });

  describe('detectDefaultDatasetConfiguration', () => {
    it('should detect default configuration', () => {
      const dataset: DatasetDto = {
        columns: [
          { name: 'time', type: 'datetime' },
          { name: 'success', type: 'number' },
          { name: 'failed', type: 'number' },
        ],
        rows: [],
      };
      const result = detectDefaultDatasetConfiguration(dataset);
      expect(result.timeColumn).toBe('time');
      expect(result.valueColumns).toEqual(['success', 'failed']);
    });

    it('should handle no datetime column', () => {
      const dataset: DatasetDto = {
        columns: [
          { name: 'name', type: 'string' },
          { name: 'value', type: 'number' },
        ],
        rows: [],
      };
      const result = detectDefaultDatasetConfiguration(dataset);
      expect(result.timeColumn).toBeNull();
      expect(result.valueColumns).toEqual(['value']);
    });

    it('should handle no numeric columns', () => {
      const dataset: DatasetDto = {
        columns: [
          { name: 'time', type: 'datetime' },
          { name: 'name', type: 'string' },
        ],
        rows: [],
      };
      const result = detectDefaultDatasetConfiguration(dataset);
      expect(result.timeColumn).toBe('time');
      expect(result.valueColumns).toEqual([]);
    });
  });

  describe('isDatasetEmpty', () => {
    it('should return true for null dataset', () => {
      expect(isDatasetEmpty(null)).toBe(true);
    });

    it('should return true for dataset with no rows', () => {
      const dataset: DatasetDto = {
        columns: [{ name: 'time', type: 'datetime' }],
        rows: [],
      };
      expect(isDatasetEmpty(dataset)).toBe(true);
    });

    it('should return false for dataset with rows', () => {
      const dataset: DatasetDto = {
        columns: [{ name: 'time', type: 'datetime' }],
        rows: [{ time: '2026-09-08T10:00:00' }],
      };
      expect(isDatasetEmpty(dataset)).toBe(false);
    });
  });
});
