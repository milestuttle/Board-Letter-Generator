import { toCanvas } from 'html-to-image'
import jsPDF from 'jspdf'
import { Document, Packer, Paragraph, TextRun, AlignmentType } from 'docx'
import { saveAs } from 'file-saver'
import type { LetterData, DistrictConfig } from '../types/letter'
import { generateLetterDocument, letterDocumentToPlainText } from './letterContent'
import { generateTotalCompDocument } from './totalCompContent'

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
  const doc = generateTotalCompDocument(letter, config)

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
          text: doc.title.toUpperCase(),
          bold: true,
          size: 24,
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 240 },
    })
  )

  // Metadata block
  paragraphs.push(
    new Paragraph({
      children: [
        new TextRun({ text: `Date: ${doc.date}\n`, bold: true, size: 21 }),
        new TextRun({ text: `Employee Name: ${doc.employeeName}\n`, bold: true, size: 21 }),
        new TextRun({ text: `Position Title: ${doc.positionTitle}\n`, bold: true, size: 21 }),
        new TextRun({ text: `Job Classification: ${doc.classificationText}`, bold: true, size: 21 }),
      ],
      spacing: { after: 200 },
    })
  )

  // Welcome narrative
  paragraphs.push(
    new Paragraph({
      children: [
        new TextRun({
          text: `${doc.salutation}\n\n${doc.welcomeParagraph}`,
          size: 21,
        }),
      ],
      spacing: { after: 200 },
    })
  )

  // Sections (Direct Cash, Insurance, Statutory, PTO)
  doc.sections.forEach((section, idx) => {
    const runs: TextRun[] = [
      new TextRun({ text: `${section.heading.toUpperCase()}\n`, bold: true, size: 22 }),
    ]

    section.items.forEach((item) => {
      runs.push(
        new TextRun({
          text: `• ${item.label}: ${item.value}\n`,
          size: 21,
        })
      )
    })

    if (section.footnote) {
      runs.push(
        new TextRun({
          text: `*(${section.footnote})*${section.totalLabel ? '\n' : ''}`,
          italics: true,
          size: 18,
          color: '555555',
        })
      )
    }

    if (section.totalLabel) {
      runs.push(
        new TextRun({
          text: `${section.totalLabel}: ${section.totalValue}`,
          bold: true,
          size: 21,
        })
      )
    }

    paragraphs.push(
      new Paragraph({
        children: runs,
        spacing: { after: idx === doc.sections.length - 1 ? 240 : 200 },
      })
    )
  })

  // Grand Total
  paragraphs.push(
    new Paragraph({
      children: [
        new TextRun({
          text: `${doc.grandTotalLabel.toUpperCase()}: ${doc.grandTotalValue}`,
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
          text: `*Note: ${doc.disclaimerNote}*`,
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
          text: `${doc.signOff}\n\n${doc.signerName}\n${doc.signerOrg}`,
          size: 21,
        }),
      ],
      spacing: { before: 100 },
    })
  )

  const docxDoc = new Document({
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

  const blob = await Packer.toBlob(docxDoc)
  saveAs(blob, finalFileName)
}

/**
 * Copy Total Compensation text to clipboard
 */
export const copyTotalCompText = async (letter: LetterData, config: DistrictConfig) => {
  const doc = generateTotalCompDocument(letter, config)

  const sectionText = (section: (typeof doc.sections)[number]) => {
    const itemLines = section.items
      .map((item) => `• ${item.label.padEnd(50, ' ')} ${item.value}`)
      .join('\n')
    const footnoteLine = section.footnote ? `\n*(${section.footnote})*` : ''
    const totalLine = section.totalLabel
      ? `\n------------------------------------------------------------------\n${section.totalLabel}:${' '.repeat(
          Math.max(1, 60 - section.totalLabel.length - 1)
        )}${section.totalValue}`
      : ''
    return `${section.heading.toUpperCase()}\n${itemLines}${footnoteLine}${totalLine}`
  }

  const fullText = `[${config.districtName.toUpperCase()} LETTERHEAD]

${doc.title.toUpperCase()}

Date: ${doc.date}
Employee Name: ${doc.employeeName}
Position Title: ${doc.positionTitle}
Job Classification: ${doc.classificationText}

${doc.salutation}

${doc.welcomeParagraph}

${doc.sections.map(sectionText).join('\n\n')}

==================================================================
${doc.grandTotalLabel.toUpperCase()}:${' '.repeat(Math.max(1, 60 - doc.grandTotalLabel.length - 1))}${doc.grandTotalValue}
==================================================================

*Note: ${doc.disclaimerNote}*

${doc.signOff}

${doc.signerName}
${doc.signerOrg}
`

  await navigator.clipboard.writeText(fullText)
}

