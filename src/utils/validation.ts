import type { LetterData, LetterType } from '../types/letter'

export interface RequiredFieldIssue {
  /** Stable identifier for the field, for keys and future field-highlighting. */
  key: string
  label: string
}

const POSITION_LABEL: Record<LetterType, string> = {
  certified: 'Position / Role Title',
  classified: 'Position / Role Title',
  resignation: 'Position Resigning From',
  retirement: 'Retiring Position Title',
  transfer: 'Position / Role Title',
}

/**
 * Fields that, left blank, would send a document to print/export still carrying
 * the content engines' bracketed placeholder text - "[Position]", "[Location]",
 * "Employee" - instead of real employee data (see letterContent.ts and
 * totalCompContent.ts). This list mirrors the "*" markers already shown in each
 * letter-type's own form section, so it isn't a new policy - it's enforcement of
 * requirements the forms already declare but never checked before export.
 *
 * Transfer letters are the one type with no required position/location: its form
 * never marks either with "*", because the transfer description field always has
 * a safe generated fallback sentence, so there's nothing that would print as a
 * bare placeholder.
 */
export function getMissingRequiredFields(
  letter: LetterData,
  documentTab: 'board_letter' | 'total_comp'
): RequiredFieldIssue[] {
  const missing: RequiredFieldIssue[] = []

  if (!letter.recipientFirstName?.trim()) missing.push({ key: 'recipientFirstName', label: 'First Name' })
  if (!letter.recipientLastName?.trim()) missing.push({ key: 'recipientLastName', label: 'Last Name' })
  if (!letter.positionTitle?.trim()) missing.push({ key: 'positionTitle', label: POSITION_LABEL[letter.type] })

  if (documentTab === 'board_letter') {
    if (letter.type !== 'transfer' && !letter.location?.trim()) {
      missing.push({ key: 'location', label: 'School / Department' })
    }
    if (letter.type === 'retirement' && !letter.retirement?.effectiveDate?.trim()) {
      missing.push({ key: 'retirement.effectiveDate', label: 'Effective Date of Retirement' })
    }
  }

  return missing
}
