import { describe, it, expect } from 'vitest'
import { generateTotalCompDocument } from '../totalCompContent'
import { DEFAULT_DISTRICT_CONFIG } from '../sampleData'
import type { LetterData } from '../../types/letter'

function baseLetter(overrides: Partial<LetterData> = {}): LetterData {
  return {
    id: 'test-letter',
    type: 'classified',
    letterDate: 'August 24, 2026',
    boardMeetingDate: 'August 24, 2026',
    schoolYear: '2026-2027',
    recipientFirstName: 'Jane',
    recipientLastName: 'Doe',
    streetAddress: '',
    city: '',
    state: '',
    zip: '',
    positionTitle: 'School Health Technician',
    location: 'District-wide',
    ...overrides,
  }
}

describe('generateTotalCompDocument', () => {
  it('is the single source consumed by every renderer: base pay label reflects hourly vs. salaried', () => {
    const hourly = generateTotalCompDocument(
      baseLetter({
        classified: { classification: 'P6', level: 'E', baseWage: '$19.67', startDate: '2026-08-20' },
        totalComp: { isHourly: true },
      }),
      DEFAULT_DISTRICT_CONFIG
    )
    const cashSection = hourly.sections[0]
    expect(cashSection.items[0].label).toMatch(/Baseline Hourly/i)

    const salaried = generateTotalCompDocument(
      baseLetter({
        type: 'certified',
        certified: { lane: 'MA', step: '5', baseSalary: '$52,400.00', startDate: '2026-09-01' },
      }),
      DEFAULT_DISTRICT_CONFIG
    )
    expect(salaried.sections[0].items[0].label).toMatch(/Base Annual Salary/i)
  })

  it('reports $0.00 insurance with an ineligibility footnote for < 0.5 FTE staff', () => {
    const doc = generateTotalCompDocument(
      baseLetter({
        classified: { classification: 'S2', level: 'C', baseWage: '$18.00', startDate: '2026-08-20' },
        totalComp: { fte: 0.4 },
      }),
      DEFAULT_DISTRICT_CONFIG
    )
    const insuranceSection = doc.sections[1]
    expect(insuranceSection.totalValue).toBe('$0.00')
    expect(insuranceSection.footnote).toMatch(/not eligible/i)
  })

  it('produces one welcome paragraph that mentions the district and position (no per-renderer copies)', () => {
    const doc = generateTotalCompDocument(baseLetter(), DEFAULT_DISTRICT_CONFIG)
    expect(doc.welcomeParagraph).toContain(DEFAULT_DISTRICT_CONFIG.districtName)
    expect(doc.welcomeParagraph).toContain('School Health Technician')
  })
})
