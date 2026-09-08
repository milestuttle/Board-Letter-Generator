import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { LetterPreview } from '../LetterPreview'
import { DEFAULT_DISTRICT_CONFIG } from '../../utils/sampleData'
import type { LetterData } from '../../types/letter'

describe('LetterPreview', () => {
  it('renders a certified board approval letter with all official elements', () => {
    const letter: LetterData = {
      id: 'cert-1',
      type: 'certified',
      letterDate: 'August 24, 2026',
      boardMeetingDate: 'August 24, 2026',
      schoolYear: '2026-2027',
      recipientFirstName: 'Sarah',
      recipientLastName: 'Jenkins',
      streetAddress: '123 Main Street',
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

    render(<LetterPreview letter={letter} config={DEFAULT_DISTRICT_CONFIG} />)

    // Recipient & Salutation
    expect(screen.getByText(/Sarah Jenkins/)).toBeInTheDocument()
    expect(screen.getByText('123 Main Street')).toBeInTheDocument()
    expect(screen.getByText('Cañon City, CO 81212')).toBeInTheDocument()
    expect(screen.getByText('Dear Sarah,')).toBeInTheDocument()

    // Board action language
    expect(screen.getAllByText(/August 24, 2026/).length).toBeGreaterThan(0)
    expect(screen.getByText(/Board of Education at its regular meeting/i)).toBeInTheDocument()
    expect(screen.getByText(/has officially approved your employment/i)).toBeInTheDocument()

    // Certified details
    expect(screen.getByText('MA+30')).toBeInTheDocument()
    expect(screen.getByText('Step 5')).toBeInTheDocument()
    expect(screen.getByText('$54,000')).toBeInTheDocument()

    // Official District Footer Elements
    expect(screen.getByText('Jamie Davis')).toBeInTheDocument()
    expect(screen.getByText('Director of Human Resources')).toBeInTheDocument()
    expect(screen.getByText('/ks')).toBeInTheDocument()
    expect(screen.getByText('Cc: personnel file')).toBeInTheDocument()
  })

  it('renders a classified letter with center-based stipend', () => {
    const letter: LetterData = {
      id: 'class-1',
      type: 'classified',
      letterDate: 'August 24, 2026',
      boardMeetingDate: 'August 24, 2026',
      schoolYear: '2026-2027',
      recipientFirstName: 'Mark',
      recipientLastName: 'Ruffalo',
      streetAddress: '',
      city: '',
      state: '',
      zip: '',
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

    render(<LetterPreview letter={letter} config={DEFAULT_DISTRICT_CONFIG} />)

    expect(screen.getByText(/Mark Ruffalo/)).toBeInTheDocument()
    expect(screen.getByText('Dear Mark,')).toBeInTheDocument()
    expect(screen.getByText(/19\.67/)).toBeInTheDocument()
    expect(screen.getByText(/center-based stipend of \$1,500\.00/i)).toBeInTheDocument()
  })

  it('renders a retirement letter with service recognition and celebration details', () => {
    const letter: LetterData = {
      id: 'retire-1',
      type: 'retirement',
      letterDate: 'May 1, 2026',
      boardMeetingDate: 'April 28, 2026',
      schoolYear: '2025-2026',
      recipientFirstName: 'Eleanor',
      recipientLastName: 'Vance',
      streetAddress: '500 Granite Ave',
      city: 'Cañon City',
      state: 'CO',
      zip: '81212',
      positionTitle: 'Head Custodian',
      location: 'Cañon City Middle School',
      retirement: {
        position: 'Head Custodian',
        location: 'Cañon City Middle School',
        effectiveDate: 'June 30, 2026',
        yearsOfService: '27',
        celebrationText: 'We will be holding a celebration for retirees in April, 2027.',
      },
    }

    render(<LetterPreview letter={letter} config={DEFAULT_DISTRICT_CONFIG} />)

    expect(screen.getByText(/Eleanor Vance/)).toBeInTheDocument()
    expect(screen.getByText(/approved your request for retirement/i)).toBeInTheDocument()
    expect(screen.getByText('27 Years')).toBeInTheDocument()
    expect(screen.getByText(/service with the District are very much appreciated/i)).toBeInTheDocument()
    expect(screen.getByText(/celebration for retirees in April, 2027/i)).toBeInTheDocument()
  })
})
