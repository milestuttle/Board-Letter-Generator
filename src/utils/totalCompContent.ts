import type { LetterData, DistrictConfig } from '../types/letter'
import { computeTotalComp, formatCurrency, type ComputedTotalComp } from './totalCompUtils'

/**
 * Single source of truth for the Total Compensation Statement's structure and wording.
 * The HTML preview, the DOCX exporter, and the clipboard copy function all consume this
 * one structured model, the same way LetterDocument (see letterContent.ts) unifies the
 * board letter renderers. That keeps what HR proofreads on screen identical to what they
 * export and hand to the employee.
 */

export interface TotalCompLineItem {
  label: string
  value: string
}

export interface TotalCompSection {
  heading: string
  items: TotalCompLineItem[]
  totalLabel: string
  totalValue: string
  footnote?: string
}

export interface TotalCompDocument {
  title: string
  date: string
  employeeName: string
  positionTitle: string
  classificationText: string
  salutation: string
  welcomeParagraph: string
  sections: TotalCompSection[]
  grandTotalLabel: string
  grandTotalSubtext: string
  grandTotalValue: string
  disclaimerNote: string
  signOff: string
  signerName: string
  signerOrg: string
}

/**
 * The two narrative copy blocks that had drifted between the preview, the DOCX export,
 * and the clipboard copy (each had its own hand-typed wording). Centralizing them here
 * is a wording decision for official HR correspondence, not a plumbing one -- pick the
 * canonical phrasing that should go out under the district's name.
 */
function getNarrativeCopy(
  letter: LetterData,
  config: DistrictConfig,
  _comp: ComputedTotalComp
): { welcomeParagraph: string; insuranceIneligibleFootnote: string } {
  const districtName = config.districtName || 'Cañon City Schools'
  const positionTitle = letter.positionTitle || 'this position'

  const welcomeParagraph =
    `Welcome to ${districtName}! We are excited to offer you the position of ${positionTitle}. ` +
    `Beyond your direct cash compensation, the district invests heavily in your health, retirement, ` +
    `and paid time off. This statement highlights the total value of your complete compensation package.`

  const insuranceIneligibleFootnote =
    'Positions scheduled under half-time (< 0.5 FTE) are not eligible for district-paid insurance ' +
    'contributions per district policy.'

  return { welcomeParagraph, insuranceIneligibleFootnote }
}

export function generateTotalCompDocument(
  letter: LetterData,
  config: DistrictConfig
): TotalCompDocument {
  const comp = computeTotalComp(letter, config)
  const { welcomeParagraph, insuranceIneligibleFootnote } = getNarrativeCopy(letter, config, comp)

  const employeeName =
    `${letter.recipientFirstName || ''} ${letter.recipientLastName || ''}`.trim() || 'Employee'
  const classificationText =
    comp.fte !== 1.0 ? `${comp.classification} (${comp.fte} FTE)` : comp.classification

  const sections: TotalCompSection[] = []

  // 1. Direct Cash Compensation
  const cashItems: TotalCompLineItem[] = [{ label: comp.basePayLabel, value: comp.formattedBasePay }]
  if (comp.stipend > 0) {
    cashItems.push({
      label: 'Stipends (Hard-to-Fill / Center-Based, if applicable)',
      value: comp.formattedStipend,
    })
  }
  sections.push({
    heading: '1. Direct Cash Compensation',
    items: cashItems,
    totalLabel: 'TOTAL DIRECT CASH PAY',
    totalValue: comp.formattedDirectPayTotal,
    footnote:
      'Gross cash pay before employee PERA contributions, state and federal taxes, and Medicare withholdings.',
  })

  // 2. District-Paid Insurance Benefits
  const insuranceItems: TotalCompLineItem[] = []
  if (comp.isBenefitEligible) {
    if (comp.healthAnnual > 0) {
      insuranceItems.push({
        label: `Health Insurance Contribution (${formatCurrency(comp.healthMonthlyRate)}/month)`,
        value: formatCurrency(comp.healthAnnual),
      })
    }
    if (comp.dentalAnnual > 0) {
      insuranceItems.push({
        label: `Dental Insurance Contribution (${formatCurrency(comp.dentalMonthlyRate)}/month)`,
        value: formatCurrency(comp.dentalAnnual),
      })
    }
    if (comp.lifePremiumAnnual > 0) {
      insuranceItems.push({
        label: 'Basic Life Insurance Premium ($20,000 Coverage Policy)',
        value: formatCurrency(comp.lifePremiumAnnual),
      })
    }
    sections.push({
      heading: '2. District-Paid Insurance Benefits',
      items: insuranceItems,
      totalLabel: 'TOTAL INSURANCE CONTRIBUTIONS',
      totalValue: formatCurrency(comp.insuranceTotal),
    })
  } else {
    sections.push({
      heading: '2. District-Paid Insurance Benefits',
      items: [{ label: 'District Insurance Benefits Package', value: formatCurrency(0) }],
      totalLabel: 'TOTAL INSURANCE CONTRIBUTIONS',
      totalValue: formatCurrency(0),
      footnote: insuranceIneligibleFootnote,
    })
  }

  // 3. Retirement & Mandatory Statutory Contributions
  sections.push({
    heading: '3. Retirement & Mandatory Statutory Contributions',
    items: [
      {
        label: `Employer PERA Retirement Contribution (${(comp.peraRate * 100).toFixed(2)}%)`,
        value: formatCurrency(comp.peraContribution),
      },
      {
        label: `Employer Medicare Contribution (${(comp.medicareRate * 100).toFixed(2)}%)`,
        value: formatCurrency(comp.medicareContribution),
      },
    ],
    totalLabel: 'TOTAL RETIREMENT & STATUTORY CONTRIBUTIONS',
    totalValue: formatCurrency(comp.statutoryTotal),
  })

  // 4. Paid Time Off & Holidays Allocation
  const ptoItems: TotalCompLineItem[] =
    comp.leaveBreakdown && comp.leaveBreakdown.length > 0
      ? comp.leaveBreakdown.map((item) => ({ label: item.label, value: item.value }))
      : comp.leaveDays > 0
      ? [{ label: 'Allocated Annual Paid Leave Days', value: `${comp.leaveDays} Days` }]
      : []
  if (comp.holidaysDays > 0) {
    ptoItems.push({ label: 'Paid District Holidays', value: `${comp.holidaysDays} Days` })
  }
  if (comp.additionalLeavesText) {
    ptoItems.push({ label: 'Additional Protected Leaves', value: comp.additionalLeavesText })
  }
  sections.push({
    heading: '4. Paid Time Off & Holidays Allocation',
    items: ptoItems,
    totalLabel: '',
    totalValue: '',
    footnote: comp.vacationScaleNote,
  })

  return {
    title: 'Offer & Total Compensation Statement',
    date: letter.letterDate || 'August 24, 2026',
    employeeName,
    positionTitle: letter.positionTitle || '[Position Title]',
    classificationText,
    salutation: `Dear ${letter.recipientFirstName || employeeName},`,
    welcomeParagraph,
    sections,
    grandTotalLabel: 'Estimated Total Annual Investment',
    grandTotalSubtext: `Direct Pay (${formatCurrency(comp.directPayTotal, { includeCents: false })}) + Benefits & Statutory (${formatCurrency(comp.benefitsAndStatutoryTotal, { includeCents: false })})`,
    grandTotalValue: formatCurrency(comp.grandTotal),
    disclaimerNote:
      'Overtime, elective extra-duty stipends (e.g., coaching), and variable sub coverage pay are not included in initial hire statements but add further to earned annual pay.',
    signOff: 'Sincerely,',
    signerName: letter.signerName || config.defaultSignerName,
    signerOrg: `${config.districtName || 'Cañon City Schools'} Human Resources`,
  }
}
