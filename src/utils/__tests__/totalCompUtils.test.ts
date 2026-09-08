import { describe, it, expect } from 'vitest'
import {
  parseCurrency,
  formatCurrency,
  determineDefaultClassification,
  computeTotalComp,
  DEFAULT_TOTAL_COMP_RATES,
} from '../totalCompUtils'
import type { LetterData } from '../../types/letter'

describe('totalCompUtils', () => {
  describe('parseCurrency', () => {
    it('returns 0 for null, undefined, or empty values', () => {
      expect(parseCurrency(undefined)).toBe(0)
      expect(parseCurrency(null)).toBe(0)
      expect(parseCurrency('')).toBe(0)
    })

    it('returns existing number as-is', () => {
      expect(parseCurrency(52000)).toBe(52000)
      expect(parseCurrency(19.67)).toBe(19.67)
    })

    it('cleans formatted currency strings', () => {
      expect(parseCurrency('$52,400.00')).toBe(52400)
      expect(parseCurrency('$19.67/hr')).toBe(19.67)
      expect(parseCurrency('-$500')).toBe(-500)
    })
  })

  describe('formatCurrency', () => {
    it('formats numbers to standard USD string with cents', () => {
      expect(formatCurrency(52400)).toBe('$52,400.00')
      expect(formatCurrency(19.67)).toBe('$19.67')
    })

    it('supports omitting cents when specified', () => {
      expect(formatCurrency(52400, { includeCents: false })).toBe('$52,400')
    })

    it('handles NaN gracefully with fallback', () => {
      expect(formatCurrency(NaN)).toBe('$0.00')
      expect(formatCurrency(NaN, { fallback: 'N/A' })).toBe('N/A')
    })
  })

  describe('determineDefaultClassification', () => {
    it('defaults certified letters to Licensed', () => {
      const letter = { type: 'certified' } as LetterData
      expect(determineDefaultClassification(letter)).toBe('Licensed')
    })

    it('defaults classified letters to 9-Month Classified', () => {
      const letter = { type: 'classified' } as LetterData
      expect(determineDefaultClassification(letter)).toBe('9-Month Classified')
    })

    it('honors an explicit jobClassification override on totalComp', () => {
      const letter = {
        type: 'classified',
        totalComp: { jobClassification: '12-Month Classified' },
      } as LetterData
      expect(determineDefaultClassification(letter)).toBe('12-Month Classified')
    })
  })

  describe('computeTotalComp', () => {
    it('computes full total comp for a standard 1.0 FTE certified employee', () => {
      const letter: LetterData = {
        id: '1',
        type: 'certified',
        letterDate: 'May 15, 2025',
        boardMeetingDate: 'May 15, 2025',
        schoolYear: '2025-2026',
        recipientFirstName: 'Jane',
        recipientLastName: 'Doe',
        streetAddress: '123 Main St',
        city: 'Cañon City',
        state: 'CO',
        zip: '81212',
        positionTitle: 'Math Teacher',
        location: 'Cañon City High School',
        certified: {
          lane: 'MA+30',
          step: 'Step 8',
          baseSalary: '$60,000.00',
          startDate: 'August 15, 2025',
        },
      }

      const result = computeTotalComp(letter)

      expect(result.fte).toBe(1.0)
      expect(result.isBenefitEligible).toBe(true)
      expect(result.basePay).toBe(60000)
      expect(result.directPayTotal).toBe(60000)

      // Insurance: full package ($651.20/mo health + $5.00/mo dental)
      expect(result.healthAnnual).toBeCloseTo(651.2 * 12, 2)
      expect(result.dentalAnnual).toBeCloseTo(5.0 * 12, 2)
      expect(result.insuranceTotal).toBeCloseTo(651.2 * 12 + 60, 2)

      // Statutory: PERA (21.40%) and Medicare (1.45%)
      expect(result.peraRate).toBe(0.214)
      expect(result.peraContribution).toBeCloseTo(60000 * 0.214, 2)
      expect(result.medicareContribution).toBeCloseTo(60000 * 0.0145, 2)
      expect(result.statutoryTotal).toBeCloseTo(60000 * (0.214 + 0.0145), 2)

      // Grand Total
      expect(result.grandTotal).toBeCloseTo(
        60000 + result.insuranceTotal + result.statutoryTotal,
        2
      )
    })

    it('computes classified hourly direct pay correctly (176 days * 8 hours)', () => {
      const letter: LetterData = {
        id: '2',
        type: 'classified',
        letterDate: 'May 15, 2025',
        boardMeetingDate: 'May 15, 2025',
        schoolYear: '2025-2026',
        recipientFirstName: 'John',
        recipientLastName: 'Smith',
        streetAddress: '456 Oak St',
        city: 'Cañon City',
        state: 'CO',
        zip: '81212',
        positionTitle: 'Paraprofessional',
        location: 'Lincoln School of Science and Technology',
        classified: {
          classification: 'Level C',
          level: 'C',
          baseWage: '$20.00',
          wageUnit: 'hour',
          startDate: 'August 18, 2025',
        },
      }

      const result = computeTotalComp(letter)

      // $20/hr * 8 hrs/day * 176 days = $28,160
      expect(result.hourlyRate).toBe(20.0)
      expect(result.hoursPerDay).toBe(8)
      expect(result.daysPerYear).toBe(176)
      expect(result.basePay).toBe(28160)
      expect(result.directPayTotal).toBe(28160)
    })

    it('handles center-based stipend on classified positions', () => {
      const letter: LetterData = {
        id: '3',
        type: 'classified',
        letterDate: 'May 15, 2025',
        boardMeetingDate: 'May 15, 2025',
        schoolYear: '2025-2026',
        recipientFirstName: 'Sam',
        recipientLastName: 'Taylor',
        streetAddress: '789 Pine St',
        city: 'Cañon City',
        state: 'CO',
        zip: '81212',
        positionTitle: 'Special Ed Aide',
        location: 'Cañon City Middle School',
        classified: {
          classification: 'Level B',
          level: 'B',
          baseWage: '$20.00',
          wageUnit: 'hour',
          startDate: 'August 18, 2025',
          stipendText: 'Includes a $1,500.00 center-based annual stipend.',
        },
      }

      const result = computeTotalComp(letter)

      expect(result.stipend).toBe(1500)
      expect(result.directPayTotal).toBe(28160 + 1500)
      // PERA should apply to the total direct pay including stipend
      expect(result.peraContribution).toBeCloseTo((28160 + 1500) * DEFAULT_TOTAL_COMP_RATES.peraRate, 2)
    })

    it('zeros out district insurance benefits when FTE < 0.5', () => {
      const letter: LetterData = {
        id: '4',
        type: 'certified',
        letterDate: 'May 15, 2025',
        boardMeetingDate: 'May 15, 2025',
        schoolYear: '2025-2026',
        recipientFirstName: 'Part-Time',
        recipientLastName: 'Teacher',
        streetAddress: '101 Elm St',
        city: 'Cañon City',
        state: 'CO',
        zip: '81212',
        positionTitle: 'Music Specialist',
        location: 'Harrison K-8 School',
        certified: {
          lane: 'BA',
          step: 'Step 1',
          baseSalary: '$20,000.00',
          startDate: 'August 15, 2025',
        },
        totalComp: {
          fte: 0.4,
        },
      }

      const result = computeTotalComp(letter)

      expect(result.fte).toBe(0.4)
      expect(result.isBenefitEligible).toBe(false)
      expect(result.healthAnnual).toBe(0)
      expect(result.dentalAnnual).toBe(0)
      expect(result.insuranceTotal).toBe(0)
      expect(result.benefitEligibilityNote).toContain('Ineligible for District Insurance Benefits')
      // Statutory benefits should still apply
      expect(result.peraContribution).toBeCloseTo(20000 * 0.214, 2)
    })

    it('awards full insurance benefits when 0.5 <= FTE < 1.0', () => {
      const letter: LetterData = {
        id: '5',
        type: 'certified',
        letterDate: 'May 15, 2025',
        boardMeetingDate: 'May 15, 2025',
        schoolYear: '2025-2026',
        recipientFirstName: 'Half-Time',
        recipientLastName: 'Teacher',
        streetAddress: '102 Cedar St',
        city: 'Cañon City',
        state: 'CO',
        zip: '81212',
        positionTitle: 'Art Specialist',
        location: 'Harrison K-8 School',
        certified: {
          lane: 'BA',
          step: 'Step 1',
          baseSalary: '$25,000.00',
          startDate: 'August 15, 2025',
          isPartTime: true,
        },
      }

      const result = computeTotalComp(letter)

      // isPartTime defaults FTE to 0.5
      expect(result.fte).toBe(0.5)
      expect(result.isBenefitEligible).toBe(true)
      // Benefits are NOT pro-rated at 0.5 FTE in CCS policy: full package
      expect(result.healthAnnual).toBeCloseTo(651.2 * 12, 2)
      expect(result.dentalAnnual).toBeCloseTo(5.0 * 12, 2)
      expect(result.benefitEligibilityNote).toContain('Eligible for Full District Insurance Benefits Package')
    })
  })
})
