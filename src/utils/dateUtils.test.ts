import { describe, it, expect } from 'vitest';
import {
  utcToIranTime,
  toJalaaliObject,
  formatPersianDate,
  formatPersianDateTime,
  formatPersianTime,
} from './dateUtils';

describe('dateUtils', () => {
  describe('utcToIranTime', () => {
    it('should convert UTC date to Iran time (UTC+3:30)', () => {
      const utcDate = new Date('2024-03-21T00:00:00Z');
      const iranTime = utcToIranTime(utcDate);
      
      // Check that the time is actually converted (time difference should be 3.5 hours)
      const timeDiff = iranTime.getTime() - utcDate.getTime();
      const expectedDiff = 3.5 * 60 * 60 * 1000;
      
      expect(timeDiff).toBe(expectedDiff);
    });

    it('should handle string input', () => {
      const utcDate = new Date('2024-03-21T00:00:00Z');
      const iranTimeFromString = utcToIranTime('2024-03-21T00:00:00Z');
      const iranTimeFromDate = utcToIranTime(utcDate);
      
      expect(iranTimeFromString.getTime()).toBe(iranTimeFromDate.getTime());
    });
  });

  describe('toJalaaliObject', () => {
    it('should convert Nowruz to correct Jalaali date', () => {
      const nowruz = new Date('2024-03-20T20:30:00Z');
      const jalaali = toJalaaliObject(nowruz);
      
      expect(jalaali.jy).toBe(1403);
      expect(jalaali.jm).toBeGreaterThanOrEqual(1);
      expect(jalaali.jd).toBeGreaterThanOrEqual(1);
    });

    it('should handle string input', () => {
      const jalaali = toJalaaliObject('2024-03-20T20:30:00Z');
      expect(jalaali.jy).toBe(1403);
      expect(jalaali.jm).toBeGreaterThanOrEqual(1);
      expect(jalaali.jd).toBeGreaterThanOrEqual(1);
    });
  });

  describe('formatPersianDate', () => {
    it('should format in full format by default', () => {
      const utcDate = new Date('2024-03-20T20:30:00Z');
      const formatted = formatPersianDate(utcDate);
      
      expect(formatted).toContain('۱');
      expect(formatted).toContain('فروردین');
    });

    it('should format in short format', () => {
      const utcDate = new Date('2024-03-20T20:30:00Z');
      const formatted = formatPersianDate(utcDate, 'short');
      
      expect(formatted).toContain('فروردین');
    });

    it('should format in numeric format', () => {
      const utcDate = new Date('2024-03-20T20:30:00Z');
      const formatted = formatPersianDate(utcDate, 'numeric');
      
      expect(formatted).toContain('۱۴۰۳');
      expect(formatted).toContain('/');
    });
  });

  describe('formatPersianDateTime', () => {
    it('should format date and time in full format', () => {
      const utcDate = new Date('2024-03-20T20:30:00Z');
      const formatted = formatPersianDateTime(utcDate);
      
      expect(formatted).toContain('۱');
      expect(formatted).toContain('فروردین');
      expect(formatted).toContain(':');
    });

    it('should format date and time in short format', () => {
      const utcDate = new Date('2024-03-20T20:30:00Z');
      const formatted = formatPersianDateTime(utcDate, 'short');
      
      expect(formatted).toContain('فروردین');
      expect(formatted).toContain(':');
    });

    it('should format date and time in numeric format', () => {
      const utcDate = new Date('2024-03-20T20:30:00Z');
      const formatted = formatPersianDateTime(utcDate, 'numeric');
      
      expect(formatted).toContain('۱۴۰۳');
      expect(formatted).toContain('/');
      expect(formatted).toContain(':');
    });
  });

  describe('formatPersianTime', () => {
    it('should format time only', () => {
      const utcDate = new Date('2024-03-20T20:30:00Z');
      const formatted = formatPersianTime(utcDate);
      
      expect(formatted).toMatch(/^[۰-۹]{2}:[۰-۹]{2}$/);
    });
  });
});
