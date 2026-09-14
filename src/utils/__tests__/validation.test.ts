import { describe, it, expect } from 'vitest'
import { getMissingRequiredFields } from '../validation'
import { SAMPLE_PRESETS } from '../sampleData'
import type { LetterData } from '../../types/letter'

// The bundled presets are starter templates with the recipient name left
// blank on purpose, so fill it in here to get a genuinely complete letter.
const baseLetter = (): LetterData => ({
  ...SAMPLE_PRESETS[0].letter,
  recipientFirstName: 'Sarah',
  recipientLastName: 'Jenkins',
})

describe('getMissingRequiredFields', () => {
  it('finds nothing missing on a fully-filled certified letter', () => {
    expect(getMissingRequiredFields(baseLetter(), 'board_letter')).toEqual([])
  })

  it('flags blank recipient name on both document tabs', () => {
    const letter = { ...baseLetter(), recipientFirstName: '', recipientLastName: '  ' }

    const boardMissing = getMissingRequiredFields(letter, 'board_letter')
    expect(boardMissing.map((m) => m.label)).toEqual(
      expect.arrayContaining(['First Name', 'Last Name'])
    )

    const compMissing = getMissingRequiredFields(letter, 'total_comp')
    expect(compMissing.map((m) => m.label)).toEqual(
      expect.arrayContaining(['First Name', 'Last Name'])
    )
  })

  it('flags blank position title with a type-specific label and matching form field id', () => {
    const resignation = { ...baseLetter(), type: 'resignation' as const, positionTitle: '' }
    expect(getMissingRequiredFields(resignation, 'board_letter')).toEqual(
      expect.arrayContaining([
        {
          key: 'positionTitle',
          label: 'Position Resigning From',
          domId: 'resignation-position-resigning-from',
        },
      ])
    )

    const retirement = { ...baseLetter(), type: 'retirement' as const, positionTitle: '' }
    expect(getMissingRequiredFields(retirement, 'board_letter')).toEqual(
      expect.arrayContaining([
        {
          key: 'positionTitle',
          label: 'Retiring Position Title',
          domId: 'retirement-retiring-position-title',
        },
      ])
    )
  })

  it('flags blank location for non-transfer types but not for transfer', () => {
    const classified = { ...baseLetter(), type: 'classified' as const, location: '' }
    expect(getMissingRequiredFields(classified, 'board_letter').map((m) => m.key)).toContain('location')

    const transfer = { ...baseLetter(), type: 'transfer' as const, location: '' }
    expect(getMissingRequiredFields(transfer, 'board_letter').map((m) => m.key)).not.toContain('location')
  })

  it('flags a missing retirement effective date only for retirement letters', () => {
    const retirement = {
      ...baseLetter(),
      type: 'retirement' as const,
      retirement: { position: 'Teacher', location: 'District-wide', effectiveDate: '', yearsOfService: '20' },
    }
    expect(getMissingRequiredFields(retirement, 'board_letter').map((m) => m.key)).toContain(
      'retirement.effectiveDate'
    )

    const classified = { ...baseLetter(), type: 'classified' as const }
    expect(getMissingRequiredFields(classified, 'board_letter').map((m) => m.key)).not.toContain(
      'retirement.effectiveDate'
    )
  })

  it('does not require location or effective date on the total comp tab', () => {
    const retirement = {
      ...baseLetter(),
      type: 'retirement' as const,
      location: '',
      retirement: { position: 'Teacher', location: '', effectiveDate: '', yearsOfService: '20' },
    }
    const missing = getMissingRequiredFields(retirement, 'total_comp')
    expect(missing.map((m) => m.key)).not.toContain('location')
    expect(missing.map((m) => m.key)).not.toContain('retirement.effectiveDate')
  })
})
