import { toCanvas } from 'html-to-image'
import jsPDF from 'jspdf'
import { Document, Packer, Paragraph, TextRun, AlignmentType } from 'docx'
import { saveAs } from 'file-saver'
import type { LetterData, DistrictConfig } from '../types/letter'
import { computeTotalComp, formatCurrency } from './totalCompUtils'
import { generateLetterDocument, letterDocumentToPlainText } from './letterContent'

/**
 * Generate high quality PDF file from letter preview DOM element
 */
export const exportToPdf = async (
  elementId: string,
  fileName: string = 'board_letter.pdf'
) => {
  const element = document.getElementById(elementId)
  if (!element) {
    throw new Error(`Letter element with id "${elementId}" not found`)
  }

  // Clean filename and ensure .pdf extension
  const baseName = fileName.replace(/\.pdf$/i, '').replace(/[^a-zA-Z0-9_\-\s]/g, '_').trim()
  const finalFileName = `${baseName || 'board_letter'}.pdf`

  // Exact 8.5in x 11in dimensions at 96 DPI (standard CSS inch)
  const WIDTH_PX = 816
  const HEIGHT_PX = 1056

  // Render to canvas via browser's native engine at ultra-sharp 300 DPI resolution
  // Explicitly set width & height options so html-to-image never reads squished flexbox client dimensions
  const canvas = await toCanvas(element, {
    pixelRatio: 3,
    width: WIDTH_PX,
    height: HEIGHT_PX,
    canvasWidth: WIDTH_PX * 3,
    canvasHeight: HEIGHT_PX * 3,
    backgroundColor: '#ffffff',
    style: {
      transform: 'none',
      margin: '0',
      boxShadow: 'none',
      width: `${WIDTH_PX}px`,
      minWidth: `${WIDTH_PX}px`,
      maxWidth: `${WIDTH_PX}px`,
      height: `${HEIGHT_PX}px`,
      minHeight: `${HEIGHT_PX}px`,
      maxHeight: `${HEIGHT_PX}px`,
      flexShrink: '0',
      overflow: 'hidden',
    },
  })

  // Standard US Letter is 612 x 792 points (8.5 x 11 inches)
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'pt',
    format: 'letter',
    compress: true,
  })

  const pdfWidth = pdf.internal.pageSize.getWidth()
  const pdfHeight = pdf.internal.pageSize.getHeight()

  // Add canvas directly to PDF with identical 8.5:11 aspect ratio (exact single page fit)
  pdf.addImage(canvas, 'PNG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST')

  // Save natively using jsPDF's built-in file downloader
  pdf.save(finalFileName)
}

/**
 * Generate Microsoft Word .docx file matching the letter content
 */
export const exportToDocx = async (
  letter: LetterData,
  config: DistrictConfig,
  fileName: string = 'board_letter.docx'
) => {
  const baseName = fileName.replace(/\.docx$/i, '').replace(/[^a-zA-Z0-9_\-\s]/g, '_').trim()
  const finalFileName = `${baseName || 'board_letter'}.docx`

  const paragraphs: Paragraph[] = []

  // Top District Header
  paragraphs.push(
    new Paragraph({
      children: [
        new TextRun({
          text: config.districtName,
          bold: true,
          size: 26,
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 100 },
    })
  )

  paragraphs.push(
    new Paragraph({
      children: [
        new TextRun({
          text: `${config.districtSubtitle} • ${config.addressLine1}, ${config.cityStateZip} • Phone ${config.phone}`,
          size: 18,
          color: '555555',
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 300 },
    })
  )

  // Date
  paragraphs.push(
    new Paragraph({
      children: [new TextRun({ text: letter.letterDate, bold: true, size: 22 })],
      spacing: { after: 200 },
    })
  )

  const docModel = generateLetterDocument(letter, config)

  // Recipient block
  const recipientRuns: TextRun[] = [
    new TextRun({
      text: `${docModel.recipient.fullName}\n`,
      bold: true,
      size: 22,
    }),
  ]
  if (docModel.recipient.streetAddress) {
    recipientRuns.push(new TextRun({ text: `${docModel.recipient.streetAddress}\n`, size: 22 }))
  }
  if (docModel.recipient.cityStateZip) {
    recipientRuns.push(new TextRun({ text: docModel.recipient.cityStateZip, size: 22 }))
  }
  paragraphs.push(
    new Paragraph({
      children: recipientRuns,
      spacing: { after: 250 },
    })
  )

  // Salutation
  paragraphs.push(
    new Paragraph({
      children: [new TextRun({ text: docModel.salutation, size: 22 })],
      spacing: { after: 200 },
    })
  )

  // Body content from unified document blocks
  for (const block of docModel.blocks) {
    if (block.type === 'paragraph') {
      paragraphs.push(
        new Paragraph({
          children: block.spans.map(
            (s) =>
              new TextRun({
                text: s.text,
                bold: s.bold,
                italics: s.italic,
                underline: s.underline ? {} : undefined,
                size: 22,
              })
          ),
          spacing: { after: 200 },
        })
      )
    } else if (block.type === 'list') {
      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({ text: `${block.lead}\n`, size: 22 }),
            ...block.items.flatMap((item, idx) => [
              new TextRun({ text: `• ${item.label} `, bold: true, size: 22 }),
              new TextRun({
                text: `${item.value}${item.extra ? ` ${item.extra}` : ''}${
                  idx < block.items.length - 1 ? '\n' : ''
                }`,
                bold: true,
                size: 22,
              }),
            ]),
          ],
          spacing: { after: 200 },
        })
      )
    }
  }

  // Common closing & Sign-off
  paragraphs.push(
    new Paragraph({
      children: [
        new TextRun({
          text: `${docModel.closing.signOff}\n\n${docModel.closing.signerName}\n${docModel.closing.signerTitle}\n${docModel.closing.organization}\n\n${docModel.closing.typistInitials}\n${docModel.closing.ccLine}`,
          size: 22,
        }),
      ],
      spacing: { before: 200 },
    })
  )

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1000,
              right: 1000,
              bottom: 1000,
              left: 1000,
            },
          },
        },
        children: paragraphs,
      },
    ],
  })

  const blob = await Packer.toBlob(doc)
  saveAs(blob, finalFileName)
}

/**
 * Copy letter text to clipboard
 */
export const copyLetterText = async (letter: LetterData, config: DistrictConfig) => {
  const docModel = generateLetterDocument(letter, config)
  const fullText = letterDocumentToPlainText(docModel)
  await navigator.clipboard.writeText(fullText)
}

/**
 * Generate Microsoft Word .docx file for Total Compensation Statement
 */
export const exportTotalCompToDocx = async (
  letter: LetterData,
  config: DistrictConfig,
  fileName: string = 'total_compensation_statement.docx'
) => {
  const comp = computeTotalComp(letter, config)

  const baseName = fileName.replace(/\.docx$/i, '').replace(/[^a-zA-Z0-9_\-\s]/g, '_').trim()
  const finalFileName = `${baseName || 'total_compensation_statement'}.docx`

  const paragraphs: Paragraph[] = []

  // Header
  paragraphs.push(
    new Paragraph({
      children: [
        new TextRun({
          text: config.districtName,
          bold: true,
          size: 26,
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 80 },
    })
  )

  paragraphs.push(
    new Paragraph({
      children: [
        new TextRun({
          text: `${config.districtSubtitle} • ${config.addressLine1}, ${config.cityStateZip} • Phone ${config.phone}`,
          size: 18,
          color: '555555',
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 240 },
    })
  )

  // Document Title
  paragraphs.push(
    new Paragraph({
      children: [
        new TextRun({
          text: 'OFFER & TOTAL COMPENSATION STATEMENT',
          bold: true,
          size: 24,
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 240 },
    })
  )

  // Metadata block
  const classificationText = comp.fte !== 1.0 ? `${comp.classification} (${comp.fte} FTE)` : comp.classification
  paragraphs.push(
    new Paragraph({
      children: [
        new TextRun({ text: `Date: ${letter.letterDate}\n`, bold: true, size: 21 }),
        new TextRun({
          text: `Employee Name: ${letter.recipientFirstName} ${letter.recipientLastName}\n`,
          bold: true,
          size: 21,
        }),
        new TextRun({ text: `Position Title: ${letter.positionTitle}\n`, bold: true, size: 21 }),
        new TextRun({ text: `Job Classification: ${classificationText}`, bold: true, size: 21 }),
      ],
      spacing: { after: 200 },
    })
  )

  // Welcome narrative
  paragraphs.push(
    new Paragraph({
      children: [
        new TextRun({
          text: `Dear ${letter.recipientFirstName || 'Employee'},\n\nWelcome to ${config.districtName}! We are excited to offer you the position of ${letter.positionTitle}. Beyond your base salary, the district invests heavily in your health, retirement, and time off. This statement highlights the total value of your complete compensation package.`,
          size: 21,
        }),
      ],
      spacing: { after: 200 },
    })
  )

  // 1. Direct Cash Pay
  const directCashRuns = [
    new TextRun({ text: '1. DIRECT CASH COMPENSATION\n', bold: true, size: 22 }),
    new TextRun({
      text: `• Base Annual Salary / Baseline Hourly Rate: ${comp.formattedBasePay}\n`,
      size: 21,
    }),
  ]

  if (comp.stipend > 0) {
    directCashRuns.push(
      new TextRun({
        text: `• Stipends (Hard-to-Fill / Center-Based, if applicable): ${comp.formattedStipend}\n`,
        size: 21,
      })
    )
  }

  directCashRuns.push(
    new TextRun({
      text: `TOTAL DIRECT CASH PAY: ${comp.formattedDirectPayTotal}\n`,
      bold: true,
      size: 21,
    }),
    new TextRun({
      text: `*(Gross cash pay before employee PERA contributions, state and federal taxes, and Medicare)*`,
      italics: true,
      size: 18,
      color: '555555',
    })
  )

  paragraphs.push(
    new Paragraph({
      children: directCashRuns,
      spacing: { after: 200 },
    })
  )

  // 2. District-Paid Insurance
  const insuranceRuns = [
    new TextRun({ text: '2. DISTRICT-PAID INSURANCE BENEFITS\n', bold: true, size: 22 }),
  ]

  if (comp.isBenefitEligible) {
    if (comp.healthAnnual > 0) {
      insuranceRuns.push(
        new TextRun({
          text: `• Health Insurance Contribution (${formatCurrency(comp.healthMonthlyRate)}/month): ${formatCurrency(comp.healthAnnual)}\n`,
          size: 21,
        })
      )
    }

    if (comp.dentalAnnual > 0) {
      insuranceRuns.push(
        new TextRun({
          text: `• Dental Insurance Contribution (${formatCurrency(comp.dentalMonthlyRate)}/month): ${formatCurrency(comp.dentalAnnual)}\n`,
          size: 21,
        })
      )
    }

    if (comp.lifePremiumAnnual > 0) {
      insuranceRuns.push(
        new TextRun({
          text: `• Basic Life Insurance Premium ($20,000 Coverage Policy): ${formatCurrency(comp.lifePremiumAnnual)}\n`,
          size: 21,
        })
      )
    }

    insuranceRuns.push(
      new TextRun({
        text: `TOTAL INSURANCE CONTRIBUTIONS: ${formatCurrency(comp.insuranceTotal)}`,
        bold: true,
        size: 21,
      })
    )
  } else {
    insuranceRuns.push(
      new TextRun({
        text: `• District Insurance Benefits Package: $0.00\n`,
        size: 21,
      }),
      new TextRun({
        text: `*(Positions scheduled under half-time (< 0.5 FTE) are not eligible for district-paid insurance contributions per district policy)*\n`,
        italics: true,
        size: 18,
        color: '555555',
      }),
      new TextRun({
        text: `TOTAL INSURANCE CONTRIBUTIONS: $0.00`,
        bold: true,
        size: 21,
      })
    )
  }

  paragraphs.push(
    new Paragraph({
      children: insuranceRuns,
      spacing: { after: 200 },
    })
  )

  // 3. Retirement & Statutory
  paragraphs.push(
    new Paragraph({
      children: [
        new TextRun({
          text: '3. RETIREMENT & MANDATORY STATUTORY CONTRIBUTIONS\n',
          bold: true,
          size: 22,
        }),
        new TextRun({
          text: `• Employer PERA Retirement Contribution (${(comp.peraRate * 100).toFixed(2)}%): ${formatCurrency(comp.peraContribution)}\n`,
          size: 21,
        }),
        new TextRun({
          text: `• Employer Medicare Contribution (${(comp.medicareRate * 100).toFixed(2)}%): ${formatCurrency(comp.medicareContribution)}\n`,
          size: 21,
        }),
        new TextRun({
          text: `TOTAL RETIREMENT & STATUTORY CONTRIBUTIONS: ${formatCurrency(comp.statutoryTotal)}`,
          bold: true,
          size: 21,
        }),
      ],
      spacing: { after: 200 },
    })
  )

  // 4. Paid Time Off
  const ptoRuns = [
    new TextRun({ text: '4. PAID TIME OFF & HOLIDAYS ALLOCATION\n', bold: true, size: 22 }),
  ]

  if (comp.leaveBreakdown && comp.leaveBreakdown.length > 0) {
    comp.leaveBreakdown.forEach((item) => {
      ptoRuns.push(
        new TextRun({
          text: `• ${item.label}: ${item.value}\n`,
          size: 21,
        })
      )
    })
  } else if (comp.leaveDays > 0) {
    ptoRuns.push(
      new TextRun({
        text: `• Allocated Annual Paid Leave Days: ${comp.leaveDays} Days\n`,
        size: 21,
      })
    )
  }

  if (comp.holidaysDays > 0) {
    ptoRuns.push(
      new TextRun({
        text: `• Paid District Holidays: ${comp.holidaysDays} Days\n`,
        size: 21,
      })
    )
  }

  if (comp.additionalLeavesText) {
    ptoRuns.push(
      new TextRun({
        text: `• Additional Protected Leaves: ${comp.additionalLeavesText}${comp.vacationScaleNote ? `\n` : ''}`,
        size: 21,
      })
    )
  }

  if (comp.vacationScaleNote) {
    ptoRuns.push(
      new TextRun({
        text: comp.vacationScaleNote,
        italics: true,
        size: 19,
      })
    )
  }

  paragraphs.push(
    new Paragraph({
      children: ptoRuns,
      spacing: { after: 240 },
    })
  )

  // Grand Total
  paragraphs.push(
    new Paragraph({
      children: [
        new TextRun({
          text: `ESTIMATED TOTAL ANNUAL INVESTMENT: ${formatCurrency(comp.grandTotal)}`,
          bold: true,
          size: 24,
        }),
      ],
      spacing: { after: 150 },
    })
  )

  // Note
  paragraphs.push(
    new Paragraph({
      children: [
        new TextRun({
          text: '*Note: Overtime, elective extra-duty stipends (e.g., coaching), and variable sub coverage pay are not included in initial hire statements but add further to earned annual pay.*',
          italics: true,
          size: 18,
          color: '555555',
        }),
      ],
      spacing: { after: 250 },
    })
  )

  // Closing
  paragraphs.push(
    new Paragraph({
      children: [
        new TextRun({
          text: `Sincerely,\n\n${letter.signerName || config.defaultSignerName}\n${config.districtName} Human Resources`,
          size: 21,
        }),
      ],
      spacing: { before: 100 },
    })
  )

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1000,
              right: 1000,
              bottom: 1000,
              left: 1000,
            },
          },
        },
        children: paragraphs,
      },
    ],
  })

  const blob = await Packer.toBlob(doc)
  saveAs(blob, finalFileName)
}

/**
 * Copy Total Compensation text to clipboard
 */
export const copyTotalCompText = async (letter: LetterData, config: DistrictConfig) => {
  const comp = computeTotalComp(letter, config)
  const recipientName =
    `${letter.recipientFirstName || ''} ${letter.recipientLastName || ''}`.trim() || 'Employee'

  const classificationText = comp.fte !== 1.0 ? `${comp.classification} (${comp.fte} FTE)` : comp.classification

  const fullText = `[${config.districtName.toUpperCase()} LETTERHEAD]

OFFER & TOTAL COMPENSATION STATEMENT

Date: ${letter.letterDate}
Employee Name: ${recipientName}
Position Title: ${letter.positionTitle}
Job Classification: ${classificationText}

Dear ${letter.recipientFirstName || recipientName},

Welcome to ${config.districtName}! We are excited to offer you the position of ${letter.positionTitle}. Beyond your base salary, the district invests heavily in your health, retirement, and time off. This statement highlights the total value of your complete compensation package.

1. DIRECT CASH COMPENSATION
• Base Annual Salary / Baseline Hourly Rate:                ${comp.formattedBasePay}${
    comp.stipend > 0
      ? `\n• Stipends (Hard-to-Fill / Center-Based, if applicable):     ${comp.formattedStipend}`
      : ''
  }
------------------------------------------------------------------
TOTAL DIRECT CASH PAY:                                     ${comp.formattedDirectPayTotal}
*(Gross cash pay before employee PERA contributions, state and federal taxes, and Medicare)*

2. DISTRICT-PAID INSURANCE BENEFITS
${
  comp.isBenefitEligible
    ? `• Health Insurance Contribution (${formatCurrency(comp.healthMonthlyRate)}/month):           ${formatCurrency(comp.healthAnnual)}
• Dental Insurance Contribution (${formatCurrency(comp.dentalMonthlyRate)}/month):            ${formatCurrency(comp.dentalAnnual)}${
        comp.lifePremiumAnnual > 0
          ? `\n• Basic Life Insurance Premium ($20,000 Coverage Policy):  ${formatCurrency(comp.lifePremiumAnnual)}`
          : ''
      }
------------------------------------------------------------------
TOTAL INSURANCE CONTRIBUTIONS:                             ${formatCurrency(comp.insuranceTotal)}`
    : `• District Insurance Benefits Package: Ineligible (< 0.5 FTE)    $0.00
*(Positions scheduled under half-time (< 0.5 FTE) are not eligible for district-paid insurance)*
------------------------------------------------------------------
TOTAL INSURANCE CONTRIBUTIONS:                             $0.00`
}

3. RETIREMENT & MANDATORY STATUTORY CONTRIBUTIONS
• Employer PERA Retirement Contribution (${(comp.peraRate * 100).toFixed(2)}%):          ${formatCurrency(comp.peraContribution)}
• Employer Medicare Contribution (${(comp.medicareRate * 100).toFixed(2)}%):                 ${formatCurrency(comp.medicareContribution)}
------------------------------------------------------------------
TOTAL RETIREMENT & STATUTORY CONTRIBUTIONS:                ${formatCurrency(comp.statutoryTotal)}

4. PAID TIME OFF & HOLIDAYS ALLOCATION${
    comp.leaveBreakdown && comp.leaveBreakdown.length > 0
      ? comp.leaveBreakdown.map((item) => `\n• ${item.label.padEnd(46, ' ')} ${item.value}`).join('')
      : comp.leaveDays > 0
      ? `\n• Allocated Annual Paid Leave Days:                         ${comp.leaveDays} Days`
      : ''
  }${
    comp.holidaysDays > 0 ? `\n• Paid District Holidays:                                  ${comp.holidaysDays} Days` : ''
  }${
    comp.additionalLeavesText ? `\n• Additional Protected Leaves:                             ${comp.additionalLeavesText}` : ''
  }${
    comp.vacationScaleNote ? `\n${comp.vacationScaleNote}` : ''
  }

==================================================================
ESTIMATED TOTAL ANNUAL INVESTMENT:                         ${formatCurrency(comp.grandTotal)}
==================================================================

*Note: Overtime, elective extra-duty stipends (e.g., coaching), and variable sub coverage pay are not included in initial hire statements but add further to earned annual pay.*

Sincerely,

${letter.signerName || config.defaultSignerName}
${config.districtName} Human Resources
`

  await navigator.clipboard.writeText(fullText)
}

