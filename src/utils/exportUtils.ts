import { toCanvas } from 'html-to-image'
import jsPDF from 'jspdf'
import { Document, Packer, Paragraph, TextRun, AlignmentType } from 'docx'
import { saveAs } from 'file-saver'
import type { LetterData, DistrictConfig } from '../types/letter'
import { formatCertifiedSalary, formatClassifiedWage } from './formatUtils'
import { computeTotalComp, formatCurrency } from './totalCompUtils'

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

  // Render to canvas via browser's native engine at high resolution
  const canvas = await toCanvas(element, {
    pixelRatio: 2,
    backgroundColor: '#ffffff',
    fontEmbedCSS: '',
    skipFonts: true,
    style: {
      transform: 'none',
      margin: '0',
      boxShadow: 'none',
      width: '8.5in',
      height: '11in',
      maxHeight: '11in',
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

  // Add canvas directly to PDF (exact single page fit)
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

  // Recipient block
  paragraphs.push(
    new Paragraph({
      children: [
        new TextRun({
          text: `${letter.recipientFirstName} ${letter.recipientLastName}\n`,
          bold: true,
          size: 22,
        }),
        new TextRun({ text: `${letter.streetAddress}\n`, size: 22 }),
        new TextRun({
          text: `${letter.city}, ${letter.state} ${letter.zip}`,
          size: 22,
        }),
      ],
      spacing: { after: 250 },
    })
  )

  // Salutation
  const salutation =
    letter.customSalutation ||
    (letter.type === 'transfer'
      ? `Dear ${letter.recipientFirstName}:`
      : `Dear ${letter.recipientFirstName},`)
  paragraphs.push(
    new Paragraph({
      children: [new TextRun({ text: salutation, size: 22 })],
      spacing: { after: 200 },
    })
  )

  // Body content based on letter type
  if (letter.type === 'certified') {
    paragraphs.push(
      new Paragraph({
        children: [
          new TextRun({
            text: `On behalf of Canon City Schools, we are pleased to inform you that the Board of Education at its regular meeting on ${letter.boardMeetingDate} has officially approved your employment in a new role as a ${letter.positionTitle}, ${letter.location}, for the ${letter.schoolYear} school year.`,
            size: 22,
          }),
        ],
        spacing: { after: 200 },
      })
    )

    paragraphs.push(
      new Paragraph({
        children: [
          new TextRun({
            text: `We are excited to welcome you to our team and look forward to the contributions you will make to support our students, staff, and community. While this letter serves as formal notification of your board-approved employment, an official contract will be issued through your online employee portal.`,
            size: 22,
          }),
        ],
        spacing: { after: 200 },
      })
    )

    paragraphs.push(
      new Paragraph({
        children: [
          new TextRun({
            text: 'Your initial placement on the certified salary schedule is as follows:\n',
            size: 22,
          }),
          new TextRun({ text: `• Lane: ${letter.certified?.lane}\n`, bold: true, size: 22 }),
          new TextRun({ text: `• Step: ${letter.certified?.step}\n`, bold: true, size: 22 }),
          new TextRun({ text: `• Base Salary: ${formatCertifiedSalary(letter.certified?.baseSalary)}\n`, bold: true, size: 22 }),
          new TextRun({ text: `• Start Date: ${letter.certified?.startDate}`, bold: true, size: 22 }),
        ],
        spacing: { after: 200 },
      })
    )
  } else if (letter.type === 'classified') {
    paragraphs.push(
      new Paragraph({
        children: [
          new TextRun({
            text: `On behalf of Canon City Schools, we are pleased to inform you that the Board of Education at its regular meeting on ${letter.boardMeetingDate} has officially approved your employment as a ${letter.positionTitle} at ${letter.location} for the ${letter.schoolYear} school year.`,
            size: 22,
          }),
        ],
        spacing: { after: 200 },
      })
    )

    paragraphs.push(
      new Paragraph({
        children: [
          new TextRun({
            text: `We are excited to welcome you to our team and look forward to the contributions you will make to support our students, staff, and community. While this letter serves as formal notification of your board-approved employment, your work agreement will be issued at a later date through our online employee portal.`,
            size: 22,
          }),
        ],
        spacing: { after: 200 },
      })
    )

    paragraphs.push(
      new Paragraph({
        children: [
          new TextRun({
            text: 'Your initial placement on the classified salary schedule is as follows:\n',
            size: 22,
          }),
          new TextRun({ text: `• Classification: ${letter.classified?.classification}\n`, bold: true, size: 22 }),
          new TextRun({ text: `• Level: ${letter.classified?.level}\n`, bold: true, size: 22 }),
          new TextRun({
            text: `• Base Wage: ${formatClassifiedWage(letter.classified?.baseWage)} ${letter.classified?.stipendText || ''}\n`,
            bold: true,
            size: 22,
          }),
          new TextRun({ text: `• Start Date: ${letter.classified?.startDate}`, bold: true, size: 22 }),
        ],
        spacing: { after: 200 },
      })
    )
  } else if (letter.type === 'transfer') {
    paragraphs.push(
      new Paragraph({
        children: [
          new TextRun({
            text: `The Board of Education, at its regular meeting on ${letter.boardMeetingDate}, took action to approve ${letter.transfer?.transferDescription} effective ${letter.transfer?.effectiveDate} for the ${letter.schoolYear} School Year.`,
            size: 22,
          }),
        ],
        spacing: { after: 200 },
      })
    )
    paragraphs.push(
      new Paragraph({
        children: [
          new TextRun({
            text: `Congratulations on your previous success and good luck in this position!`,
            size: 22,
          }),
        ],
        spacing: { after: 200 },
      })
    )
  } else if (letter.type === 'resignation') {
    paragraphs.push(
      new Paragraph({
        children: [
          new TextRun({
            text: `The Board of Education, at its regular meeting on ${letter.boardMeetingDate}, officially took action to accept your resignation from your position as ${letter.resignation?.position} at ${letter.resignation?.location}, effective ${letter.resignation?.effectiveDate} for the ${letter.schoolYear} school year.`,
            size: 22,
          }),
        ],
        spacing: { after: 200 },
      })
    )
    paragraphs.push(
      new Paragraph({
        children: [
          new TextRun({
            text: letter.resignation?.customAppreciation || '',
            size: 22,
          }),
        ],
        spacing: { after: 200 },
      })
    )
  } else {
    // Retirement
    const actionPhrase = `The Board of Education, at their regular meeting on ${letter.boardMeetingDate}, approved your request for retirement as ${letter.positionTitle || letter.retirement?.position || '[POSITION]'} at ${letter.location || letter.retirement?.location || '[LOCATION]'} effective ${letter.retirement?.effectiveDate || '[DATE]'}${letter.retirement?.includeRemainderOfYear ? ` ${letter.retirement.remainderYearText || 'for the remainder of the school year'}` : ''}.`

    paragraphs.push(
      new Paragraph({
        children: [new TextRun({ text: actionPhrase, size: 22 })],
        spacing: { after: 200 },
      })
    )
    paragraphs.push(
      new Paragraph({
        children: [
          new TextRun({
            text:
              letter.retirement?.celebrationText ||
              'We will be holding a celebration for retirees in April, 2027. Please watch for more detailed information to be shared closer to the event.',
            size: 22,
          }),
        ],
        spacing: { after: 200 },
      })
    )
    paragraphs.push(
      new Paragraph({
        children: [
          new TextRun({
            text: `Thank you for your service to the Cañon City School District. Your ${letter.retirement?.yearsOfService ? `${letter.retirement.yearsOfService} Years` : 'XX Years'} of service with the District are very much appreciated. We wish you the best in your future endeavors!`,
            size: 22,
          }),
        ],
        spacing: { after: 200 },
      })
    )
  }

  // Common closing & Sign-off
  paragraphs.push(
    new Paragraph({
      children: [
        new TextRun({
          text: `Sincerely,\n\n${letter.signerName || config.defaultSignerName}\n${letter.signerTitle || config.defaultSignerTitle}\nCañon City Schools\n\n${letter.typistInitials || config.defaultTypistInitials}\n${letter.ccLine || config.defaultCc}`,
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
  const salutation =
    letter.customSalutation ||
    (letter.type === 'transfer'
      ? `Dear ${letter.recipientFirstName}:`
      : `Dear ${letter.recipientFirstName},`)

  let body = ''
  if (letter.type === 'certified') {
    body = `On behalf of Canon City Schools, we are pleased to inform you that the Board of Education at its regular meeting on ${letter.boardMeetingDate} has officially approved your employment in a new role as a ${letter.positionTitle}, ${letter.location}, for the ${letter.schoolYear} school year.

We are excited to welcome you to our team and look forward to the contributions you will make to support our students, staff, and community. While this letter serves as formal notification of your board-approved employment, an official contract will be issued through your online employee portal.

Your initial placement on the certified salary schedule is as follows:
• Lane: ${letter.certified?.lane}
• Step: ${letter.certified?.step}
• Base Salary: ${formatCertifiedSalary(letter.certified?.baseSalary)}
• Start Date: ${letter.certified?.startDate}

If you have any questions or need additional information, please don't hesitate to contact our Human Resources Department at ${config.hrEmail} or ${config.hrPhone}.

Again, congratulations, and welcome to Cañon City Schools! We look forward to working with you. The District's mission is, ${config.missionStatement} and you were selected because we believe you have the passion, skills, and dedication to help bring that vision to life.

We are confident that your contributions will make a meaningful impact on our students and community. Welcome aboard. We're excited to have you as part of our team!`
  } else if (letter.type === 'classified') {
    body = `On behalf of Canon City Schools, we are pleased to inform you that the Board of Education at its regular meeting on ${letter.boardMeetingDate} has officially approved your employment as a ${letter.positionTitle} at ${letter.location} for the ${letter.schoolYear} school year.

We are excited to welcome you to our team and look forward to the contributions you will make to support our students, staff, and community. While this letter serves as formal notification of your board-approved employment, your work agreement will be issued at a later date through our online employee portal.

Your initial placement on the classified salary schedule is as follows:
• Classification: ${letter.classified?.classification}
• Level: ${letter.classified?.level}
• Base Wage: ${formatClassifiedWage(letter.classified?.baseWage)}${letter.classified?.stipendText ? ' ' + letter.classified.stipendText : ''}
• Start Date: ${letter.classified?.startDate}

If you have any questions or need additional information, please don't hesitate to contact our Human Resources Department at ${config.hrEmail} or ${config.hrPhone}.

Again, congratulations and welcome to Cañon City Schools! We look forward to working with you. The District's mission is, ${config.missionStatement} and you were selected because we believe you have the passion, skills, and dedication to help bring that vision to life.

We are confident that your contributions will make a meaningful impact on our students and community. Welcome aboard. We're excited to have you as part of our team!`
  } else if (letter.type === 'transfer') {
    body = `The Board of Education, at its regular meeting on ${letter.boardMeetingDate}, took action to approve ${letter.transfer?.transferDescription} effective ${letter.transfer?.effectiveDate} for the ${letter.schoolYear} School Year.

Congratulations on your previous success and good luck in this position!`
  } else if (letter.type === 'resignation') {
    body = `The Board of Education, at its regular meeting on ${letter.boardMeetingDate}, officially took action to accept your resignation from your position as ${letter.resignation?.position} at ${letter.resignation?.location}, effective ${letter.resignation?.effectiveDate} for the ${letter.schoolYear} school year.

${letter.resignation?.customAppreciation || ''}

If you have any questions regarding end-of-service documentation or benefits transitions, please contact our Human Resources Department at ${config.hrEmail} or ${config.hrPhone}.`
  } else {
    // Retirement
    const actionPhrase = `The Board of Education, at their regular meeting on ${letter.boardMeetingDate}, approved your request for retirement as ${letter.positionTitle || letter.retirement?.position || '[POSITION]'} at ${letter.location || letter.retirement?.location || '[LOCATION]'} effective ${letter.retirement?.effectiveDate || '[DATE]'}${letter.retirement?.includeRemainderOfYear ? ` ${letter.retirement.remainderYearText || 'for the remainder of the school year'}` : ''}.`

    const celebration =
      letter.retirement?.celebrationText ||
      'We will be holding a celebration for retirees in April, 2027. Please watch for more detailed information to be shared closer to the event.'

    const appreciation = `Thank you for your service to the Cañon City School District. Your ${letter.retirement?.yearsOfService ? `${letter.retirement.yearsOfService} Years` : 'XX Years'} of service with the District are very much appreciated. We wish you the best in your future endeavors!`

    body = `${actionPhrase}\n\n${celebration}\n\n${appreciation}`
  }

  const fullText = `${letter.letterDate}

${letter.recipientFirstName} ${letter.recipientLastName}
${letter.streetAddress}
${letter.city}, ${letter.state} ${letter.zip}

${salutation}

${body}

Sincerely,

${letter.signerName || config.defaultSignerName}
${letter.signerTitle || config.defaultSignerTitle}
Cañon City Schools

${letter.typistInitials || config.defaultTypistInitials}
${letter.ccLine || config.defaultCc}
`

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
  const comp = computeTotalComp(letter)

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
      spacing: { after: 200 },
    })
  )

  // Metadata block
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
        new TextRun({ text: `Job Classification: ${comp.classification}`, bold: true, size: 21 }),
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

  if (comp.leaveDays > 0) {
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
        text: `• Additional Protected Leaves: ${comp.additionalLeavesText}`,
        size: 21,
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
  const comp = computeTotalComp(letter)
  const recipientName =
    `${letter.recipientFirstName || ''} ${letter.recipientLastName || ''}`.trim() || 'Employee'

  const fullText = `[${config.districtName.toUpperCase()} LETTERHEAD]

OFFER & TOTAL COMPENSATION STATEMENT

Date: ${letter.letterDate}
Employee Name: ${recipientName}
Position Title: ${letter.positionTitle}
Job Classification: ${comp.classification}

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
• Health Insurance Contribution (${formatCurrency(comp.healthMonthlyRate)}/month):           ${formatCurrency(comp.healthAnnual)}
• Dental Insurance Contribution (${formatCurrency(comp.dentalMonthlyRate)}/month):            ${formatCurrency(comp.dentalAnnual)}${
    comp.lifePremiumAnnual > 0
      ? `\n• Basic Life Insurance Premium ($20,000 Coverage Policy):  ${formatCurrency(comp.lifePremiumAnnual)}`
      : ''
  }
------------------------------------------------------------------
TOTAL INSURANCE CONTRIBUTIONS:                             ${formatCurrency(comp.insuranceTotal)}

3. RETIREMENT & MANDATORY STATUTORY CONTRIBUTIONS
• Employer PERA Retirement Contribution (${(comp.peraRate * 100).toFixed(2)}%):          ${formatCurrency(comp.peraContribution)}
• Employer Medicare Contribution (${(comp.medicareRate * 100).toFixed(2)}%):                 ${formatCurrency(comp.medicareContribution)}
------------------------------------------------------------------
TOTAL RETIREMENT & STATUTORY CONTRIBUTIONS:                ${formatCurrency(comp.statutoryTotal)}

4. PAID TIME OFF & HOLIDAYS ALLOCATION${
    comp.leaveDays > 0 ? `\n• Allocated Annual Paid Leave Days:                         ${comp.leaveDays} Days` : ''
  }${
    comp.holidaysDays > 0 ? `\n• Paid District Holidays:                                  ${comp.holidaysDays} Days` : ''
  }${
    comp.additionalLeavesText ? `\n• Additional Protected Leaves:                             ${comp.additionalLeavesText}` : ''
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

