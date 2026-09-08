import type { LetterData, DistrictConfig } from '../types/letter'
import { formatCertifiedSalary, formatClassifiedWage } from './formatUtils'

export interface TextSpan {
  text: string
  bold?: boolean
  italic?: boolean
  underline?: boolean
  link?: string
}

export interface ParagraphBlock {
  type: 'paragraph'
  spans: TextSpan[]
  spacingAfter?: number
}

export interface ListItem {
  label: string
  value: string
  extra?: string
}

export interface ListBlock {
  type: 'list'
  lead: string
  items: ListItem[]
  spacingAfter?: number
}

export type LetterBodyBlock = ParagraphBlock | ListBlock

export interface LetterDocument {
  letterDate: string
  recipient: {
    fullName: string
    streetAddress?: string
    cityStateZip?: string
  }
  salutation: string
  blocks: LetterBodyBlock[]
  closing: {
    signOff: string
    signerName: string
    signerTitle: string
    organization: string
    typistInitials: string
    ccLine: string
  }
}

/**
 * Single source of truth for all district board letters.
 * Both the React WYSIWYG preview (HTML), the Word Document generator (DOCX),
 * and the clipboard copy functions consume this single structured model.
 */
export function generateLetterDocument(letter: LetterData, config: DistrictConfig): LetterDocument {
  const letterDate = letter.letterDate || config.defaultBoardMeetingDate || 'August 24, 2026'
  const fullName = `${letter.recipientFirstName || ''} ${letter.recipientLastName || ''}`.trim() || 'Employee'

  const cityStateZip =
    letter.city || letter.state || letter.zip
      ? `${letter.city || ''}${letter.city && letter.state ? ', ' : ''}${letter.state || ''} ${letter.zip || ''}`.trim()
      : undefined

  const salutation =
    letter.customSalutation ||
    (letter.type === 'transfer'
      ? `Dear ${letter.recipientFirstName || 'Employee'}:`
      : `Dear ${letter.recipientFirstName || 'Employee'},`)

  const blocks: LetterBodyBlock[] = []

  // Clean mission statement quotes
  const rawMission = (config.missionStatement || '').trim()
  const cleanMission = rawMission.replace(/^[“"']+|[”"']+$/g, '')

  if (letter.type === 'certified') {
    blocks.push({
      type: 'paragraph',
      spans: [
        { text: 'On behalf of Cañon City Schools, we are pleased to inform you that the Board of Education at its regular meeting on ' },
        { text: letter.boardMeetingDate || '[Date]' },
        { text: ' has officially approved your employment in a new role as a ' },
        { text: letter.positionTitle || '[Position]', bold: true },
        { text: ', ' },
        { text: letter.location || 'District-wide' },
        { text: ', for the ' },
        { text: letter.schoolYear || '[School Year]' },
        { text: ' school year.' },
      ],
    })

    blocks.push({
      type: 'paragraph',
      spans: [
        {
          text: 'We are excited to welcome you to our team and look forward to the contributions you will make to support our students, staff, and community. While this letter serves as formal notification of your board-approved employment, an official contract will be issued through your online employee portal.',
        },
      ],
    })

    blocks.push({
      type: 'list',
      lead: 'Your initial placement on the certified salary schedule is as follows:',
      items: [
        { label: 'Lane:', value: letter.certified?.lane || '[Lane]' },
        { label: 'Step:', value: letter.certified?.step || '[Step]' },
        {
          label: 'Base Salary:',
          value: formatCertifiedSalary(letter.certified?.baseSalary) || '[Base Salary]',
        },
        { label: 'Start Date:', value: letter.certified?.startDate || '[Start Date]' },
      ],
    })

    blocks.push({
      type: 'paragraph',
      spans: [
        {
          text: 'If you have any questions or need additional information, please don’t hesitate to contact our Human Resources Department at ',
        },
        { text: config.hrEmail, underline: true, link: `mailto:${config.hrEmail}` },
        { text: ' or ' },
        { text: config.hrPhone },
        { text: '.' },
      ],
    })

    blocks.push({
      type: 'paragraph',
      spans: [
        { text: 'Again, congratulations and welcome to Cañon City Schools! The District’s mission is, ' },
        { text: `“${cleanMission}”`, italic: true },
        { text: ' and we are confident your passion, skills, and dedication will make a meaningful impact on our students and community. Welcome aboard!' },
      ],
    })
  } else if (letter.type === 'classified') {
    blocks.push({
      type: 'paragraph',
      spans: [
        { text: 'On behalf of Cañon City Schools, we are pleased to inform you that the Board of Education at its regular meeting on ' },
        { text: letter.boardMeetingDate || '[Date]' },
        { text: ' has officially approved your employment as a ' },
        { text: letter.positionTitle || '[Position]', bold: true },
        { text: ' at ' },
        { text: letter.location || '[Location]' },
        { text: ' for the ' },
        { text: letter.schoolYear || '[School Year]' },
        { text: ' school year.' },
      ],
    })

    blocks.push({
      type: 'paragraph',
      spans: [
        {
          text: 'We are excited to welcome you to our team and look forward to the contributions you will make to support our students, staff, and community. While this letter serves as formal notification of your board-approved employment, your work agreement will be issued at a later date through our online employee portal.',
        },
      ],
    })

    blocks.push({
      type: 'list',
      lead: 'Your initial placement on the classified salary schedule is as follows:',
      items: [
        { label: 'Classification:', value: letter.classified?.classification || '[Classification]' },
        { label: 'Level:', value: letter.classified?.level || '[Level]' },
        {
          label: 'Base Wage:',
          value: letter.classified?.baseWage
            ? `${formatClassifiedWage(letter.classified.baseWage)}${letter.classified.wageUnit === 'year' ? ' annually' : ''}`
            : '$19.67',
          extra: letter.classified?.stipendText ? `(${letter.classified.stipendText})` : undefined,
        },
        { label: 'Start Date:', value: letter.classified?.startDate || '[Start Date]' },
      ],
    })

    blocks.push({
      type: 'paragraph',
      spans: [
        {
          text: 'If you have any questions or need additional information, please don’t hesitate to contact our Human Resources Department at ',
        },
        { text: config.hrEmail, underline: true, link: `mailto:${config.hrEmail}` },
        { text: ' or ' },
        { text: config.hrPhone },
        { text: '.' },
      ],
    })

    blocks.push({
      type: 'paragraph',
      spans: [
        { text: 'Again, congratulations and welcome to Cañon City Schools! The District’s mission is, ' },
        { text: `“${cleanMission}”`, italic: true },
        { text: ' and we are confident your passion, skills, and dedication will make a meaningful impact on our students and community. Welcome aboard!' },
      ],
    })
  } else if (letter.type === 'transfer') {
    const transferDesc =
      letter.transfer?.transferDescription ||
      `your transfer in position and hours to ${letter.positionTitle || letter.transfer?.newPosition || '[Position]'} at ${letter.location || letter.transfer?.newLocation || '[Location]'}`

    blocks.push({
      type: 'paragraph',
      spans: [
        { text: 'The Board of Education, at its regular meeting on ' },
        { text: letter.boardMeetingDate || '[Date]' },
        { text: ', took action to approve ' },
        { text: transferDesc },
        { text: ' effective ' },
        { text: letter.transfer?.effectiveDate || 'August 12, 2026' },
        { text: ' for the ' },
        { text: letter.schoolYear || '[School Year]' },
        { text: ' School Year.' },
      ],
    })

    blocks.push({
      type: 'paragraph',
      spans: [
        { text: 'Congratulations on your previous success and good luck in this position!' },
      ],
    })
  } else if (letter.type === 'resignation') {
    blocks.push({
      type: 'paragraph',
      spans: [
        { text: 'The Board of Education, at its regular meeting on ' },
        { text: letter.boardMeetingDate || '[Date]' },
        { text: ', officially took action to accept your resignation from your position as ' },
        { text: letter.resignation?.position || letter.positionTitle || '[Position]', bold: true },
        { text: ' at ' },
        { text: letter.resignation?.location || letter.location || '[Location]' },
        { text: ', effective ' },
        { text: letter.resignation?.effectiveDate || 'June 30, 2026' },
        { text: ' for the ' },
        { text: letter.schoolYear || '[School Year]' },
        { text: ' school year.' },
      ],
    })

    blocks.push({
      type: 'paragraph',
      spans: [
        {
          text:
            letter.resignation?.customAppreciation ||
            'Thank you for your dedicated service and commitment to the students, staff, and families of Cañon City Schools. We wish you the very best in all of your future personal and professional endeavors.',
        },
      ],
    })

    blocks.push({
      type: 'paragraph',
      spans: [
        {
          text: 'If you have any questions regarding end-of-service documentation or benefits transitions, please contact our Human Resources Department at ',
        },
        { text: config.hrEmail, underline: true, link: `mailto:${config.hrEmail}` },
        { text: ' or ' },
        { text: config.hrPhone },
        { text: '.' },
      ],
    })
  } else {
    // Retirement
    const retirementRemainder = letter.retirement?.includeRemainderOfYear
      ? ` ${letter.retirement.remainderYearText || `for the remainder of the ${letter.schoolYear} School Year.`}`
      : '.'

    blocks.push({
      type: 'paragraph',
      spans: [
        { text: 'The Board of Education, at their regular meeting on ' },
        { text: letter.boardMeetingDate || '[Date]' },
        { text: ', approved your request for retirement as ' },
        { text: letter.positionTitle || letter.retirement?.position || '[POSITION]', bold: true },
        { text: ' at ' },
        { text: letter.location || letter.retirement?.location || '[LOCATION]' },
        { text: ' effective ' },
        { text: letter.retirement?.effectiveDate || '[DATE]' },
        { text: retirementRemainder },
      ],
    })

    blocks.push({
      type: 'paragraph',
      spans: [
        {
          text:
            letter.retirement?.celebrationText ||
            'We will be holding a celebration for retirees in April, 2027. Please watch for more detailed information to be shared closer to the event.',
        },
      ],
    })

    const yearsText = letter.retirement?.yearsOfService
      ? `${letter.retirement.yearsOfService} Years`
      : 'XX Years'

    blocks.push({
      type: 'paragraph',
      spans: [
        { text: 'Thank you for your service to the Cañon City School District. Your ' },
        { text: yearsText, bold: true },
        { text: ' of service with the District are very much appreciated. We wish you the best in your future endeavors!' },
      ],
    })
  }

  return {
    letterDate,
    recipient: {
      fullName,
      streetAddress: letter.streetAddress || undefined,
      cityStateZip,
    },
    salutation,
    blocks,
    closing: {
      signOff: 'Sincerely,',
      signerName: letter.signerName || config.defaultSignerName || 'Jamie Davis',
      signerTitle: letter.signerTitle || config.defaultSignerTitle || 'Director of Human Resources',
      organization: 'Cañon City Schools',
      typistInitials: letter.typistInitials || config.defaultTypistInitials || '/ks',
      ccLine: letter.ccLine || config.defaultCc || 'Cc: personnel file',
    },
  }
}

/**
 * Converts a structured LetterDocument into a clean, formatted plain text string
 * suitable for clipboard copying and plain text exports.
 */
export function letterDocumentToPlainText(doc: LetterDocument): string {
  const parts: string[] = []

  // Date
  parts.push(doc.letterDate)
  parts.push('')

  // Recipient block
  parts.push(doc.recipient.fullName)
  if (doc.recipient.streetAddress) {
    parts.push(doc.recipient.streetAddress)
  }
  if (doc.recipient.cityStateZip) {
    parts.push(doc.recipient.cityStateZip)
  }
  parts.push('')

  // Salutation
  parts.push(doc.salutation)
  parts.push('')

  // Body Blocks
  for (const block of doc.blocks) {
    if (block.type === 'paragraph') {
      const paragraphText = block.spans.map((s) => s.text).join('')
      parts.push(paragraphText)
      parts.push('')
    } else if (block.type === 'list') {
      parts.push(block.lead)
      for (const item of block.items) {
        const extraText = item.extra ? ` ${item.extra}` : ''
        parts.push(`• ${item.label} ${item.value}${extraText}`)
      }
      parts.push('')
    }
  }

  // Closing
  parts.push(doc.closing.signOff)
  parts.push('')
  parts.push(doc.closing.signerName)
  parts.push(doc.closing.signerTitle)
  parts.push(doc.closing.organization)
  parts.push('')
  parts.push(doc.closing.typistInitials)
  parts.push(doc.closing.ccLine)

  return parts.join('\n')
}
