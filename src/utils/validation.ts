import type { LetterData, LetterType } from '../types/letter'

export interface RequiredFieldIssue {
  /** Stable identifier for the field, for keys. */
  key: string
  label: string
  /** The rendered input's DOM id, for scrolling to and focusing the field. */
  domId: string
}

const POSITION_LABEL: Record<LetterType, string> = {
  certified: 'Position / Role Title',
  classified: 'Position / Role Title',
  resignation: 'Position Resigning From',
  retirement: 'Retiring Position Title',
  transfer: 'Position / Role Title',
}

// Mirrors the ids each letter-type form section actually renders (see
// CertifiedFieldsSection.tsx, ClassifiedFieldsSection.tsx, etc.) so a missing
// field can be scrolled to and focused, not just named in a toast.
const POSITION_DOM_ID: Record<LetterType, string> = {
  certified: 'certified-position-role-title',
  classified: 'classified-position-role-title',
  resignation: 'resignation-position-resigning-from',
  retirement: 'retirement-retiring-position-title',
  transfer: 'transfer-new-position-location-reference',
}

const LOCATION_DOM_ID: Record<LetterType, string> = {
  certified: 'certified-location-department',
  classified: 'classified-school-location',
  resignation: 'resignation-school-department',
  retirement: 'retirement-school-department',
  transfer: '',
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
  const namePrefix = documentTab === 'total_comp' ? 'tc' : 'letter'

  if (!letter.recipientFirstName?.trim()) {
    missing.push({ key: 'recipientFirstName', label: 'First Name', domId: `${namePrefix}-first-name` })
  }
  if (!letter.recipientLastName?.trim()) {
    missing.push({ key: 'recipientLastName', label: 'Last Name', domId: `${namePrefix}-last-name` })
  }
  if (!letter.positionTitle?.trim()) {
    const domId = documentTab === 'total_comp' ? 'tc-position-title' : POSITION_DOM_ID[letter.type]
    missing.push({ key: 'positionTitle', label: POSITION_LABEL[letter.type], domId })
  }

  if (documentTab === 'board_letter') {
    if (letter.type !== 'transfer' && !letter.location?.trim()) {
      missing.push({ key: 'location', label: 'School / Department', domId: LOCATION_DOM_ID[letter.type] })
    }
    if (letter.type === 'retirement' && !letter.retirement?.effectiveDate?.trim()) {
      missing.push({
        key: 'retirement.effectiveDate',
        label: 'Effective Date of Retirement',
        domId: 'retirement-effective-date-of-retirement',
      })
    }
  }

  return missing
}
