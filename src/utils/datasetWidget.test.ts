import { describe, expect, it } from 'vitest';
import {
  readDataSourceType,
  readTimeColumn,
  readValueColumns,
  readDatasetTake,
} from './datasetWidget';
import type { WidgetConfiguration } from '@/types/widgets';

describe('datasetWidget', () => {
  describe('readDataSourceType', () => {
    it('should return Metric by default', () => {
      const config: WidgetConfiguration = {};
      expect(readDataSourceType(config)).toBe('Metric');
    });

    it('should return Metric when explicitly set', () => {
      const config: WidgetConfiguration = { dataSourceType: 'Metric' };
      expect(readDataSourceType(config)).toBe('Metric');
    });

    it('should return Dataset when set', () => {
      const config: WidgetConfiguration = { dataSourceType: 'Dataset' };
      expect(readDataSourceType(config)).toBe('Dataset');
    });

    it('should handle invalid values by returning Metric', () => {
      const config: WidgetConfiguration = { dataSourceType: 'Invalid' as any };
      expect(readDataSourceType(config)).toBe('Metric');
    });
  });

  describe('readTimeColumn', () => {
    it('should return undefined when not set', () => {
      const config: WidgetConfiguration = {};
      expect(readTimeColumn(config)).toBeUndefined();
    });

    it('should return time column when set', () => {
      const config: WidgetConfiguration = { timeColumn: 'time' };
      expect(readTimeColumn(config)).toBe('time');
    });

    it('should handle non-string values', () => {
      const config: WidgetConfiguration = { timeColumn: 123 as any };
      expect(readTimeColumn(config)).toBeUndefined();
    });
  });

  describe('readValueColumns', () => {
    it('should return empty array when not set', () => {
      const config: WidgetConfiguration = {};
      expect(readValueColumns(config)).toEqual([]);
    });

    it('should return value columns when set', () => {
      const config: WidgetConfiguration = { valueColumns: ['success', 'failed'] };
      expect(readValueColumns(config)).toEqual(['success', 'failed']);
    });

    it('should handle non-array values', () => {
      const config: WidgetConfiguration = { valueColumns: 'invalid' as any };
      expect(readValueColumns(config)).toEqual([]);
    });

    it('should handle array with non-string values', () => {
      const config: WidgetConfiguration = { valueColumns: [123, 456] as any };
      expect(readValueColumns(config)).toEqual([]);
    });
  });

  describe('readDatasetTake', () => {
    it('should return undefined when not set', () => {
      const config: WidgetConfiguration = {};
      expect(readDatasetTake(config)).toBeUndefined();
    });

    it('should return take value when set', () => {
      const config: WidgetConfiguration = { take: 10 };
      expect(readDatasetTake(config)).toBe(10);
    });

    it('should handle non-number values', () => {
      const config: WidgetConfiguration = { take: 'invalid' as any };
      expect(readDatasetTake(config)).toBeUndefined();
    });

    it('should handle zero or negative values', () => {
      expect(readDatasetTake({ take: 0 })).toBeUndefined();
      expect(readDatasetTake({ take: -5 })).toBeUndefined();
    });
  });
});
