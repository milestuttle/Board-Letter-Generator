import { describe, it, expect } from 'vitest'
import {
  formatLetterDate,
  getCurrentSchoolYear,
  getDefaultLetterDate,
  getDefaultSchoolYear,
} from '../dateUtils'

describe('dateUtils', () => {
  describe('formatLetterDate', () => {
    it('formats dates in formal district long format', () => {
      const date = new Date(2026, 7, 24) // August 24, 2026
      expect(formatLetterDate(date)).toBe('August 24, 2026')
    })
  })

  describe('getCurrentSchoolYear', () => {
    it('computes year-nextYear for dates from July through December', () => {
      const july = new Date(2026, 6, 1) // July 1, 2026
      const sept = new Date(2026, 8, 15) // Sept 15, 2026
      const dec = new Date(2026, 11, 31) // Dec 31, 2026

      expect(getCurrentSchoolYear(july)).toBe('2026-2027')
      expect(getCurrentSchoolYear(sept)).toBe('2026-2027')
      expect(getCurrentSchoolYear(dec)).toBe('2026-2027')
    })

    it('computes previousYear-year for dates from January through June', () => {
      const jan = new Date(2027, 0, 15) // Jan 15, 2027
      const may = new Date(2027, 4, 20) // May 20, 2027
      const june = new Date(2027, 5, 30) // June 30, 2027

      expect(getCurrentSchoolYear(jan)).toBe('2026-2027')
      expect(getCurrentSchoolYear(may)).toBe('2026-2027')
      expect(getCurrentSchoolYear(june)).toBe('2026-2027')
    })
  })

  describe('getDefaultLetterDate', () => {
    it('returns config date when present', () => {
      expect(getDefaultLetterDate('September 1, 2026')).toBe('September 1, 2026')
    })

    it('falls back to formatted date when config date is empty or undefined', () => {
      const testDate = new Date(2026, 9, 12) // October 12, 2026
      expect(getDefaultLetterDate('', testDate)).toBe('October 12, 2026')
      expect(getDefaultLetterDate(undefined, testDate)).toBe('October 12, 2026')
    })
  })

  describe('getDefaultSchoolYear', () => {
    it('returns config year when present', () => {
      expect(getDefaultSchoolYear('2028-2029')).toBe('2028-2029')
    })

    it('falls back to computed dynamic school year when config is empty or undefined', () => {
      const testDate = new Date(2026, 7, 1) // August 1, 2026
      expect(getDefaultSchoolYear('', testDate)).toBe('2026-2027')
      expect(getDefaultSchoolYear(undefined, testDate)).toBe('2026-2027')
    })
  })
})
