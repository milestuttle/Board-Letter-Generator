import { describe, it, expect } from 'vitest'
import { generateLetterDocument, letterDocumentToPlainText } from '../letterContent'
import { DEFAULT_DISTRICT_CONFIG } from '../sampleData'
import type { LetterData } from '../../types/letter'

describe('letterContent engine', () => {
  const baseLetter: LetterData = {
    id: 'test-1',
    type: 'certified',
    letterDate: 'August 24, 2026',
    boardMeetingDate: 'August 24, 2026',
    schoolYear: '2026-2027',
    recipientFirstName: 'Sarah',
    recipientLastName: 'Jenkins',
    streetAddress: '123 Main St',
    city: 'Cañon City',
    state: 'CO',
    zip: '81212',
    positionTitle: 'English Teacher',
    location: 'Cañon City High School',
    certified: {
      lane: 'MA+30',
      step: 'Step 5',
      baseSalary: '$54,000.00',
      startDate: 'August 15, 2026',
    },
  }

  it('generates structured document for certified appointment', () => {
    const doc = generateLetterDocument(baseLetter, DEFAULT_DISTRICT_CONFIG)

    expect(doc.letterDate).toBe('August 24, 2026')
    expect(doc.recipient.fullName).toBe('Sarah Jenkins')
    expect(doc.recipient.streetAddress).toBe('123 Main St')
    expect(doc.recipient.cityStateZip).toBe('Cañon City, CO 81212')
    expect(doc.salutation).toBe('Dear Sarah,')

    // Expect 5 body blocks (paragraph, paragraph, list, paragraph, paragraph)
    expect(doc.blocks.length).toBe(5)
    expect(doc.blocks[0].type).toBe('paragraph')
    expect(doc.blocks[2].type).toBe('list')

    const listBlock = doc.blocks[2]
    if (listBlock.type === 'list') {
      expect(listBlock.lead).toContain('certified salary schedule')
      expect(listBlock.items).toHaveLength(4)
      expect(listBlock.items[0]).toEqual({ label: 'Lane:', value: 'MA+30' })
      expect(listBlock.items[2]).toEqual({ label: 'Base Salary:', value: '$54,000' })
    }

    // Closing
    expect(doc.closing.signerName).toBe('Jamie Davis')
    expect(doc.closing.typistInitials).toBe('/ks')
    expect(doc.closing.ccLine).toBe('Cc: personnel file')
  })

  it('generates classified letter with center-based stipend in list block', () => {
    const classifiedLetter: LetterData = {
      ...baseLetter,
      type: 'classified',
      positionTitle: 'Paraprofessional',
      location: 'Harrison K-8 School',
      classified: {
        classification: 'Level C',
        level: 'C',
        baseWage: '$19.67',
        wageUnit: 'hour',
        startDate: 'August 20, 2026',
        stipendText: 'Plus a center-based stipend of $1,500.00',
      },
    }

    const doc = generateLetterDocument(classifiedLetter, DEFAULT_DISTRICT_CONFIG)
    const listBlock = doc.blocks.find((b) => b.type === 'list')
    expect(listBlock).toBeDefined()

    if (listBlock && listBlock.type === 'list') {
      const wageItem = listBlock.items.find((i) => i.label === 'Base Wage:')
      expect(wageItem?.value).toBe('$19.67')
      expect(wageItem?.extra).toBe('(Plus a center-based stipend of $1,500.00)')
    }
  })

  it('generates retirement letter with remainder of year and years of service', () => {
    const retirementLetter: LetterData = {
      ...baseLetter,
      type: 'retirement',
      retirement: {
        position: 'Head Custodian',
        location: 'Cañon City Middle School',
        effectiveDate: 'June 30, 2026',
        includeRemainderOfYear: true,
        yearsOfService: '27',
      },
    }

    const doc = generateLetterDocument(retirementLetter, DEFAULT_DISTRICT_CONFIG)
    const plainText = letterDocumentToPlainText(doc)

    expect(plainText).toContain('approved your request for retirement')
    expect(plainText).toContain('for the remainder of the 2026-2027 School Year')
    expect(plainText).toContain('27 Years')
  })

  it('converts document model to clean formatted plain text for clipboard', () => {
    const doc = generateLetterDocument(baseLetter, DEFAULT_DISTRICT_CONFIG)
    const text = letterDocumentToPlainText(doc)

    expect(text).toContain('August 24, 2026')
    expect(text).toContain('Sarah Jenkins')
    expect(text).toContain('Dear Sarah,')
    expect(text).toContain('• Lane: MA+30')
    expect(text).toContain('• Base Salary: $54,000')
    expect(text).toContain('Jamie Davis')
    expect(text).toContain('Cc: personnel file')
  })
})
