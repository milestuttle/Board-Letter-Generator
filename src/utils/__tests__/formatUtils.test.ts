import { describe, it, expect } from 'vitest'
import { formatCertifiedSalary, formatClassifiedWage } from '../formatUtils'

describe('formatCertifiedSalary', () => {
  it('returns empty string for undefined, null, or empty values', () => {
    expect(formatCertifiedSalary(undefined)).toBe('')
    expect(formatCertifiedSalary(null)).toBe('')
    expect(formatCertifiedSalary('')).toBe('')
    expect(formatCertifiedSalary('   ')).toBe('')
  })

  it('formats whole integer salaries with commas and dollar signs', () => {
    expect(formatCertifiedSalary(52000)).toBe('$52,000')
    expect(formatCertifiedSalary('52000')).toBe('$52,000')
    expect(formatCertifiedSalary('21025')).toBe('$21,025')
  })

  it('discards decimal cents for certified annual salaries', () => {
    expect(formatCertifiedSalary('52000.50')).toBe('$52,000')
    expect(formatCertifiedSalary('65432.99')).toBe('$65,432')
  })

  it('handles strings already containing dollar signs or commas', () => {
    expect(formatCertifiedSalary('$45,000')).toBe('$45,000')
    expect(formatCertifiedSalary('$100,500.00')).toBe('$100,500')
  })
})

describe('formatClassifiedWage', () => {
  it('returns empty string for undefined, null, or empty values', () => {
    expect(formatClassifiedWage(undefined)).toBe('')
    expect(formatClassifiedWage(null)).toBe('')
    expect(formatClassifiedWage('')).toBe('')
    expect(formatClassifiedWage('   ')).toBe('')
  })

  it('formats hourly wages to exactly two decimal places', () => {
    expect(formatClassifiedWage(19.6)).toBe('$19.60')
    expect(formatClassifiedWage('18')).toBe('$18.00')
    expect(formatClassifiedWage('19.67')).toBe('$19.67')
  })

  it('cleans existing currency symbols while preserving decimals', () => {
    expect(formatClassifiedWage('$19.67')).toBe('$19.67')
    expect(formatClassifiedWage('$22.5/hr')).toBe('$22.50')
  })
})
