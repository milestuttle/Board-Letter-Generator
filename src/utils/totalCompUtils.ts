import type { LetterData, JobClassificationType, DistrictConfig } from '../types/letter'

export const DEFAULT_TOTAL_COMP_RATES = {
  healthMonthlyRate: 651.2, // $651.20 / month -> $7,814.40 / year
  dentalMonthlyRate: 5.0, // $5.00 / month -> $60.00 / year
  lifeInsurancePremiumAnnual: 0, // Excluded by default ($20k policy optional)
  peraRate: 0.214, // 21.40%
  medicareRate: 0.0145, // 1.45%
  defaultHoursPerDay: 8,
  defaultDays9Month: 176,
  defaultDays12Month: 260,
  defaultLeaveDaysLicensed: 11,
  defaultLeaveDays9Month: 11,
  defaultLeaveDays12Month: 25,
  defaultHolidaysDays12Month: 11,
  defaultAdditionalLeavesText: 'Up to 5 Bereavement Days & 5 Professional Days',
}

export function parseCurrency(val?: string | number | null): number {
  if (val === undefined || val === null) return 0
  if (typeof val === 'number') return isNaN(val) ? 0 : val
  const cleaned = String(val).replace(/[^0-9.-]+/g, '')
  const parsed = parseFloat(cleaned)
  return isNaN(parsed) ? 0 : parsed
}

export function formatCurrency(
  val: number,
  options: { includeCents?: boolean; fallback?: string } = {}
): string {
  const { includeCents = true, fallback = '$0.00' } = options
  if (isNaN(val) || val === null || val === undefined) return fallback
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: includeCents ? 2 : 0,
    maximumFractionDigits: includeCents ? 2 : 0,
  }).format(val)
}

export function determineDefaultClassification(letter: LetterData): JobClassificationType {
  if (letter.totalComp?.jobClassification) {
    return letter.totalComp.jobClassification
  }
  if (letter.type === 'certified') {
    return 'Licensed'
  }
  if (letter.type === 'classified') {
    return '9-Month Classified'
  }
  return 'Licensed'
}

export interface ComputedTotalComp {
  classification: JobClassificationType
  fte: number
  isBenefitEligible: boolean
  benefitEligibilityNote: string
  isHourlyClassified: boolean
  hourlyRate: number
  hoursPerDay: number
  daysPerYear: number
  basePay: number
  formattedBasePay: string
  basePayLabel: string
  stipend: number
  formattedStipend: string
  directPayTotal: number
  formattedDirectPayTotal: string
  
  // Insurance
  healthMonthlyRate: number
  healthAnnual: number
  dentalMonthlyRate: number
  dentalAnnual: number
  lifePremiumAnnual: number
  insuranceTotal: number
  
  // Statutory
  peraRate: number
  peraContribution: number
  medicareRate: number
  medicareContribution: number
  statutoryTotal: number
  
  // PTO & Leaves
  leaveDays: number
  holidaysDays: number
  additionalLeavesText: string
  
  // Summary
  grandTotal: number
  benefitsAndStatutoryTotal: number
  benefitsPercentage: number
}

export function computeTotalComp(letter: LetterData, config?: DistrictConfig): ComputedTotalComp {
  const classification = determineDefaultClassification(letter)
  const tc = letter.totalComp || {}
  const cfgDefaults = config?.totalCompDefaults

  // Determine FTE (defaults to 1.0; if certified marked part-time without explicit fte, defaults to 0.5)
  let fte = 1.0
  if (tc.fte !== undefined && tc.fte !== null) {
    fte = Number(tc.fte)
  } else if (letter.certified?.isPartTime) {
    fte = 0.5
  }

  // Insurance Benefit Rule: < 0.5 FTE gets $0 insurance benefits, >= 0.5 FTE gets full package (not pro-rated)
  const isBenefitEligible = fte >= 0.5

  const rawHealthMonthlyRate =
    tc.healthMonthlyRate ?? cfgDefaults?.healthMonthlyRate ?? DEFAULT_TOTAL_COMP_RATES.healthMonthlyRate
  const rawDentalMonthlyRate =
    tc.dentalMonthlyRate ?? cfgDefaults?.dentalMonthlyRate ?? DEFAULT_TOTAL_COMP_RATES.dentalMonthlyRate
  const rawLifePremiumAnnual =
    tc.lifeInsurancePremiumAnnual ??
    cfgDefaults?.lifeInsurancePremiumAnnual ??
    DEFAULT_TOTAL_COMP_RATES.lifeInsurancePremiumAnnual

  const healthMonthlyRate = isBenefitEligible ? rawHealthMonthlyRate : 0
  const healthAnnual = isBenefitEligible ? rawHealthMonthlyRate * 12 : 0

  const dentalMonthlyRate = isBenefitEligible ? rawDentalMonthlyRate : 0
  const dentalAnnual = isBenefitEligible ? rawDentalMonthlyRate * 12 : 0

  const lifePremiumAnnual = isBenefitEligible ? rawLifePremiumAnnual : 0
  const insuranceTotal = healthAnnual + dentalAnnual + lifePremiumAnnual

  const benefitEligibilityNote = !isBenefitEligible
    ? 'Ineligible for District Insurance Benefits (Part-Time < 0.5 FTE)'
    : fte < 1.0
    ? 'Eligible for Full District Insurance Benefits Package (≥ 0.5 FTE)'
    : 'Full District Insurance Benefits Package'

  // Statutory Rates
  const peraRate = tc.peraRate ?? cfgDefaults?.peraRate ?? DEFAULT_TOTAL_COMP_RATES.peraRate
  const medicareRate =
    tc.medicareRate ?? cfgDefaults?.medicareRate ?? DEFAULT_TOTAL_COMP_RATES.medicareRate

  // Hourly / Annual Schedule determination
  const isHourlyClassified =
    letter.type === 'classified' &&
    (tc.isHourly ?? (letter.classified?.wageUnit !== 'year'))

  const hoursPerDay =
    tc.hoursPerDay ?? cfgDefaults?.defaultHoursPerDay ?? DEFAULT_TOTAL_COMP_RATES.defaultHoursPerDay
  const defaultDays =
    classification === '12-Month Classified'
      ? (cfgDefaults?.defaultDays12Month ?? DEFAULT_TOTAL_COMP_RATES.defaultDays12Month)
      : (cfgDefaults?.defaultDays9Month ?? DEFAULT_TOTAL_COMP_RATES.defaultDays9Month)
  const daysPerYear = tc.daysPerYear ?? defaultDays

  let hourlyRate = 0
  let basePay = 0
  let basePayLabel = 'Base Annual Salary'

  if (classification === 'Licensed' || letter.type === 'certified') {
    if (tc.baseAnnualSalary !== undefined && tc.baseAnnualSalary !== '') {
      basePay = parseCurrency(tc.baseAnnualSalary)
    } else {
      basePay = parseCurrency(letter.certified?.baseSalary || '$52,400.00')
    }
    basePayLabel = fte !== 1.0 ? `Base Annual Salary (${fte} FTE)` : 'Base Annual Salary'
  } else {
    // Classified (9-Month or 12-Month)
    if (tc.isHourly ?? true) {
      hourlyRate = parseCurrency(tc.hourlyRate || letter.classified?.baseWage || '$19.67')
      basePay = hourlyRate * hoursPerDay * daysPerYear
      basePayLabel = `Baseline Hourly (${formatCurrency(hourlyRate, { includeCents: true })}/hr × ${hoursPerDay}h/day × ${daysPerYear}d/yr)`
    } else {
      if (tc.baseAnnualSalary !== undefined && tc.baseAnnualSalary !== '') {
        basePay = parseCurrency(tc.baseAnnualSalary)
      } else {
        basePay = parseCurrency(letter.classified?.baseWage || '$40,000.00')
      }
      basePayLabel = 'Base Annual Salary'
    }
  }

  // Stipend calculation
  let stipend = 0
  if (tc.stipendAmount !== undefined && tc.stipendAmount !== '') {
    stipend = parseCurrency(tc.stipendAmount)
  } else if (letter.classified?.stipendText) {
    const matched = letter.classified.stipendText.match(/\$([0-9,]+(\.[0-9]{2})?)/)
    if (matched) {
      stipend = parseCurrency(matched[1])
    }
  }

  const directPayTotal = basePay + stipend

  const peraContribution = directPayTotal * peraRate
  const medicareContribution = directPayTotal * medicareRate
  const statutoryTotal = peraContribution + medicareContribution

  const grandTotal = directPayTotal + insuranceTotal + statutoryTotal
  const benefitsAndStatutoryTotal = insuranceTotal + statutoryTotal
  const benefitsPercentage =
    directPayTotal > 0 ? (benefitsAndStatutoryTotal / directPayTotal) * 100 : 0

  // Paid Time Off Allocations
  let defaultLeaveDays = cfgDefaults?.defaultLeaveDaysLicensed ?? DEFAULT_TOTAL_COMP_RATES.defaultLeaveDaysLicensed
  let defaultHolidaysDays = 0

  if (classification === '12-Month Classified') {
    defaultLeaveDays = cfgDefaults?.defaultLeaveDays12Month ?? DEFAULT_TOTAL_COMP_RATES.defaultLeaveDays12Month
    defaultHolidaysDays = cfgDefaults?.defaultHolidaysDays12Month ?? DEFAULT_TOTAL_COMP_RATES.defaultHolidaysDays12Month
  } else if (classification === '9-Month Classified') {
    defaultLeaveDays = cfgDefaults?.defaultLeaveDays9Month ?? DEFAULT_TOTAL_COMP_RATES.defaultLeaveDays9Month
    defaultHolidaysDays = 0
  }

  const leaveDays = tc.paidLeaveDays ?? defaultLeaveDays
  const holidaysDays = tc.paidHolidaysDays ?? defaultHolidaysDays
  const additionalLeavesText =
    tc.additionalLeavesText ||
    cfgDefaults?.defaultAdditionalLeavesText ||
    DEFAULT_TOTAL_COMP_RATES.defaultAdditionalLeavesText

  return {
    classification,
    fte,
    isBenefitEligible,
    benefitEligibilityNote,
    isHourlyClassified,
    hourlyRate,
    hoursPerDay,
    daysPerYear,
    basePay,
    formattedBasePay: formatCurrency(basePay),
    basePayLabel,
    stipend,
    formattedStipend: formatCurrency(stipend),
    directPayTotal,
    formattedDirectPayTotal: formatCurrency(directPayTotal),

    healthMonthlyRate,
    healthAnnual,
    dentalMonthlyRate,
    dentalAnnual,
    lifePremiumAnnual,
    insuranceTotal,

    peraRate,
    peraContribution,
    medicareRate,
    medicareContribution,
    statutoryTotal,

    leaveDays,
    holidaysDays,
    additionalLeavesText,

    grandTotal,
    benefitsAndStatutoryTotal,
    benefitsPercentage,
  }
}
