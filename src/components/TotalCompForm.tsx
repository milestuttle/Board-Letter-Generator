import React, { useState } from 'react'
import type { LetterData, JobClassificationType, DistrictConfig } from '../types/letter'
import {
  computeTotalComp,
  formatCurrency,
  DEFAULT_TOTAL_COMP_RATES,
} from '../utils/totalCompUtils'
import {
  DollarSign,
  Calculator,
  ShieldCheck,
  CalendarCheck,
  RotateCcw,
  Sliders,
  ChevronDown,
  ChevronUp,
  UserCheck,
  Clock,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react'

interface TotalCompFormProps {
  letter: LetterData
  onChange: (updated: LetterData) => void
  config: DistrictConfig
}

export const TotalCompForm: React.FC<TotalCompFormProps> = ({ letter, onChange, config }) => {
  const [showAdvancedBenefits, setShowAdvancedBenefits] = useState(false)
  const comp = computeTotalComp(letter, config)
  const tc = letter.totalComp || {}

  // Helper to update totalComp and propagate to parent
  const updateTc = (updates: Partial<typeof tc>) => {
    onChange({
      ...letter,
      totalComp: {
        ...tc,
        ...updates,
      },
    })
  }

  // Bi-directional sync for Salary
  const handleBaseAnnualSalaryChange = (newSalary: string) => {
    const updated: LetterData = {
      ...letter,
      totalComp: {
        ...tc,
        baseAnnualSalary: newSalary,
      },
    }
    if (letter.type === 'certified') {
      updated.certified = {
        ...(letter.certified || {
          lane: 'BA',
          step: '1',
          baseSalary: newSalary,
          startDate: 'August 20, 2026',
        }),
        baseSalary: newSalary,
      }
    } else if (letter.type === 'classified') {
      updated.classified = {
        ...(letter.classified || {
          classification: 'P5',
          level: 'A',
          baseWage: newSalary,
          startDate: 'August 20, 2026',
        }),
        baseWage: newSalary,
        wageUnit: 'year',
      }
    }
    onChange(updated)
  }

  // Bi-directional sync for Hourly Rate
  const handleHourlyRateChange = (newRate: string) => {
    const updated: LetterData = {
      ...letter,
      totalComp: {
        ...tc,
        isHourly: true,
        hourlyRate: newRate,
      },
    }
    if (letter.type === 'classified') {
      updated.classified = {
        ...(letter.classified || {
          classification: 'P5',
          level: 'A',
          baseWage: newRate,
          startDate: 'August 20, 2026',
        }),
        baseWage: newRate,
        wageUnit: 'hour',
      }
    }
    onChange(updated)
  }

  // Bi-directional sync for Stipend
  const handleStipendChange = (newStipend: string, newDesc?: string) => {
    const desc = newDesc !== undefined ? newDesc : (tc.stipendDescription || 'Hard-to-Fill / Center-Based')
    const updated: LetterData = {
      ...letter,
      totalComp: {
        ...tc,
        stipendAmount: newStipend,
        stipendDescription: desc,
      },
    }
    if (letter.type === 'classified') {
      updated.classified = {
        ...(letter.classified || {
          classification: 'P5',
          level: 'A',
          baseWage: '$19.67',
          startDate: 'August 20, 2026',
        }),
        stipendText: newStipend ? `Plus a ${desc} stipend of ${newStipend}` : '',
      }
    }
    onChange(updated)
  }

  // Bi-directional sync for FTE
  const handleFteChange = (newFte: number) => {
    const updated: LetterData = {
      ...letter,
      totalComp: {
        ...tc,
        fte: newFte,
      },
    }
    if (letter.type === 'certified') {
      updated.certified = {
        ...(letter.certified || {
          lane: 'BA',
          step: '1',
          baseSalary: '$52,400.00',
          startDate: 'August 20, 2026',
        }),
        isPartTime: newFte < 1.0,
        fteText: newFte < 1.0 ? `${newFte} FTE Part-Time` : 'Full-Time',
      }
    }
    onChange(updated)
  }

  const handleClassificationChange = (cls: JobClassificationType) => {
    const cfgDefaults = config?.totalCompDefaults
    let leave = cfgDefaults?.defaultLeaveDaysLicensed ?? 11
    let hol = 0
    let days = cfgDefaults?.defaultDays9Month ?? 176
    if (cls === '12-Month Classified') {
      leave = cfgDefaults?.defaultLeaveDays12Month ?? 25
      hol = cfgDefaults?.defaultHolidaysDays12Month ?? 11
      days = cfgDefaults?.defaultDays12Month ?? 260
    } else if (cls === '9-Month Classified') {
      leave = cfgDefaults?.defaultLeaveDays9Month ?? 11
      hol = 0
      days = cfgDefaults?.defaultDays9Month ?? 176
    }

    updateTc({
      jobClassification: cls,
      paidLeaveDays: leave,
      paidHolidaysDays: hol,
      daysPerYear: days,
    })
  }

  const handleResetRates = () => {
    const cfgDefaults = config?.totalCompDefaults
    updateTc({
      healthMonthlyRate: cfgDefaults?.healthMonthlyRate ?? DEFAULT_TOTAL_COMP_RATES.healthMonthlyRate,
      dentalMonthlyRate: cfgDefaults?.dentalMonthlyRate ?? DEFAULT_TOTAL_COMP_RATES.dentalMonthlyRate,
      lifeInsurancePremiumAnnual: cfgDefaults?.lifeInsurancePremiumAnnual ?? DEFAULT_TOTAL_COMP_RATES.lifeInsurancePremiumAnnual,
      peraRate: cfgDefaults?.peraRate ?? DEFAULT_TOTAL_COMP_RATES.peraRate,
      medicareRate: cfgDefaults?.medicareRate ?? DEFAULT_TOTAL_COMP_RATES.medicareRate,
      hoursPerDay: cfgDefaults?.defaultHoursPerDay ?? DEFAULT_TOTAL_COMP_RATES.defaultHoursPerDay,
      daysPerYear:
        comp.classification === '12-Month Classified'
          ? (cfgDefaults?.defaultDays12Month ?? DEFAULT_TOTAL_COMP_RATES.defaultDays12Month)
          : (cfgDefaults?.defaultDays9Month ?? DEFAULT_TOTAL_COMP_RATES.defaultDays9Month),
    })
  }

  return (
    <div className="space-y-6">
      {/* Live Investment Summary Header */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 text-white rounded-xl p-4 shadow-lg border border-slate-700">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-indigo-300 flex items-center gap-1.5">
            <Calculator className="w-4 h-4" /> Total Compensation Model
          </span>
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/30 text-indigo-200 border border-indigo-400/30 font-medium">
            +{comp.benefitsPercentage.toFixed(1)}% District Benefit Boost
          </span>
        </div>
        <div className="flex items-baseline justify-between">
          <div>
            <div className="text-xs text-slate-400">Estimated Total Annual Value</div>
            <div className="text-2xl font-bold font-mono text-emerald-300">
              {formatCurrency(comp.grandTotal)}
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-slate-400">Direct Cash Pay</div>
            <div className="text-sm font-semibold font-mono text-slate-200">
              {comp.formattedDirectPayTotal}
            </div>
          </div>
        </div>
      </div>

      {/* Employee & Position Quick Context (Synced bi-directionally with Letter) */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs space-y-3">
        <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 flex items-center gap-1.5">
          <UserCheck className="w-3.5 h-3.5 text-indigo-600" />
          Employee &amp; Position Context
        </label>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">First Name</label>
            <input
              type="text"
              value={letter.recipientFirstName}
              onChange={(e) => onChange({ ...letter, recipientFirstName: e.target.value })}
              className="w-full text-xs px-3 py-1.5 rounded-lg border border-gray-300 bg-white focus:ring-2 focus:ring-indigo-500"
              placeholder="e.g. Jane"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Last Name</label>
            <input
              type="text"
              value={letter.recipientLastName}
              onChange={(e) => onChange({ ...letter, recipientLastName: e.target.value })}
              className="w-full text-xs px-3 py-1.5 rounded-lg border border-gray-300 bg-white focus:ring-2 focus:ring-indigo-500"
              placeholder="e.g. Doe"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Position Title</label>
            <input
              type="text"
              value={letter.positionTitle}
              onChange={(e) => onChange({ ...letter, positionTitle: e.target.value })}
              className="w-full text-xs px-3 py-1.5 rounded-lg border border-gray-300 bg-white focus:ring-2 focus:ring-indigo-500"
              placeholder="e.g. Lead Counselor"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Letter Date</label>
            <input
              type="text"
              value={letter.letterDate}
              onChange={(e) => onChange({ ...letter, letterDate: e.target.value })}
              className="w-full text-xs px-3 py-1.5 rounded-lg border border-gray-300 bg-white focus:ring-2 focus:ring-indigo-500"
              placeholder="e.g. August 24, 2026"
            />
          </div>
        </div>
      </div>

      {/* 1. Classification & FTE Allocation */}
      <div className="space-y-3 bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
        <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
          Job Classification &amp; Full-Time Equivalency (FTE)
        </label>
        <div className="grid grid-cols-3 gap-2">
          {(['Licensed', '9-Month Classified', '12-Month Classified'] as JobClassificationType[]).map(
            (cls) => {
              const active = comp.classification === cls
              return (
                <button
                  key={cls}
                  type="button"
                  onClick={() => handleClassificationChange(cls)}
                  className={`py-2 px-2 text-xs font-semibold rounded-lg border transition-all text-center cursor-pointer ${
                    active
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs ring-2 ring-indigo-300'
                      : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {cls}
                </button>
              )
            }
          )}
        </div>

        {/* FTE Selector Row */}
        <div className="pt-2 border-t border-gray-100">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-medium text-gray-700 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-indigo-600" />
              Position FTE:
            </span>
            <div className="flex items-center gap-1">
              {[1.0, 0.8, 0.75, 0.5, 0.4].map((fteOption) => (
                <button
                  key={fteOption}
                  type="button"
                  onClick={() => handleFteChange(fteOption)}
                  className={`text-[11px] px-2 py-0.5 rounded font-medium border transition cursor-pointer ${
                    comp.fte === fteOption
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                      : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  {fteOption === 1.0 ? '1.0 Full-Time' : `${fteOption} FTE`}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <label className="text-[11px] text-gray-500">Custom FTE:</label>
              <input
                type="number"
                step="0.05"
                min="0.1"
                max="1.5"
                value={comp.fte}
                onChange={(e) => handleFteChange(parseFloat(e.target.value) || 0)}
                className="w-20 text-xs font-mono px-2 py-1 rounded border border-gray-300 focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            {/* Live FTE Insurance Eligibility Badge */}
            <div className="flex-1">
              {comp.isBenefitEligible ? (
                <div className="px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] flex items-center gap-1.5 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>
                    <strong>Eligible for Full Package (≥ 0.5 FTE)</strong> — Full district health, dental &amp; life.
                  </span>
                </div>
              ) : (
                <div className="px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-[11px] flex items-center gap-1.5 font-medium">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>
                    <strong>Ineligible for Insurance (&lt; 0.5 FTE)</strong> — Insurance benefits resolve to $0.00.
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 2. Direct Cash Pay Settings */}
      <div className="space-y-4 pt-1 bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 flex items-center gap-1.5">
            <DollarSign className="w-3.5 h-3.5 text-indigo-600" />
            Direct Cash Compensation
          </label>
          <p className="text-[11px] text-gray-500 italic mt-0.5">
            Note: Direct cash pay represents gross earnings prior to employee PERA contributions, federal &amp; state taxes, and Medicare.
          </p>
        </div>

        {comp.classification !== 'Licensed' ? (
          <div className="space-y-3 bg-gray-50/80 p-3 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-gray-700">Wage Calculation Mode:</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => updateTc({ isHourly: true })}
                  className={`text-xs px-2.5 py-1 rounded font-medium border cursor-pointer ${
                    tc.isHourly ?? true
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-white text-gray-600 border-gray-300'
                  }`}
                >
                  Hourly Rate
                </button>
                <button
                  type="button"
                  onClick={() => updateTc({ isHourly: false })}
                  className={`text-xs px-2.5 py-1 rounded font-medium border cursor-pointer ${
                    tc.isHourly === false
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-white text-gray-600 border-gray-300'
                  }`}
                >
                  Annual Salary
                </button>
              </div>
            </div>

            {tc.isHourly ?? true ? (
              <div className="grid grid-cols-3 gap-2 pt-1">
                <div>
                  <label className="block text-[11px] font-medium text-gray-600 mb-1">
                    Hourly Wage ($)
                  </label>
                  <input
                    type="text"
                    value={
                      tc.hourlyRate !== undefined
                        ? tc.hourlyRate
                        : letter.classified?.baseWage || '$19.67'
                    }
                    onChange={(e) => handleHourlyRateChange(e.target.value)}
                    className="w-full text-xs font-mono px-2.5 py-1.5 rounded border border-gray-300 bg-white focus:ring-1 focus:ring-indigo-500"
                    placeholder="$19.67"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-gray-600 mb-1">
                    Hours / Day
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={tc.hoursPerDay ?? config?.totalCompDefaults?.defaultHoursPerDay ?? 8}
                    onChange={(e) => updateTc({ hoursPerDay: parseFloat(e.target.value) || 0 })}
                    className="w-full text-xs font-mono px-2.5 py-1.5 rounded border border-gray-300 bg-white focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-gray-600 mb-1">
                    Annual Days
                  </label>
                  <input
                    type="number"
                    value={
                      tc.daysPerYear ??
                      (comp.classification === '12-Month Classified'
                        ? (config?.totalCompDefaults?.defaultDays12Month ?? 260)
                        : (config?.totalCompDefaults?.defaultDays9Month ?? 176))
                    }
                    onChange={(e) => updateTc({ daysPerYear: parseInt(e.target.value, 10) || 0 })}
                    className="w-full text-xs font-mono px-2.5 py-1.5 rounded border border-gray-300 bg-white focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-[11px] font-medium text-gray-600 mb-1">
                  Base Annual Salary
                </label>
                <input
                  type="text"
                  value={tc.baseAnnualSalary ?? comp.formattedBasePay}
                  onChange={(e) => handleBaseAnnualSalaryChange(e.target.value)}
                  className="w-full text-xs font-mono px-2.5 py-1.5 rounded border border-gray-300 bg-white focus:ring-1 focus:ring-indigo-500"
                  placeholder="$45,000.00"
                />
              </div>
            )}
          </div>
        ) : (
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Base Annual Salary
            </label>
            <input
              type="text"
              value={tc.baseAnnualSalary ?? letter.certified?.baseSalary ?? '$52,400.00'}
              onChange={(e) => handleBaseAnnualSalaryChange(e.target.value)}
              className="w-full text-xs font-mono px-3 py-2 rounded-lg border border-gray-300 bg-white focus:ring-2 focus:ring-indigo-500"
              placeholder="$52,400.00"
            />
          </div>
        )}

        {/* Stipends */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Stipend Amount ($)
            </label>
            <input
              type="text"
              value={tc.stipendAmount ?? (comp.stipend > 0 ? comp.formattedStipend : '')}
              onChange={(e) => handleStipendChange(e.target.value)}
              className="w-full text-xs font-mono px-3 py-1.5 rounded-lg border border-gray-300 bg-white focus:ring-2 focus:ring-indigo-500"
              placeholder="$0.00 or $2,000.00"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Stipend Type / Description
            </label>
            <input
              type="text"
              value={tc.stipendDescription ?? 'Hard-to-Fill / Center-Based'}
              onChange={(e) => handleStipendChange(tc.stipendAmount || '', e.target.value)}
              className="w-full text-xs px-3 py-1.5 rounded-lg border border-gray-300 bg-white focus:ring-2 focus:ring-indigo-500"
              placeholder="e.g. Center-Based"
            />
          </div>
        </div>

        {/* Live Direct Cash Total Breakdown Badge */}
        <div className="bg-slate-900 text-slate-100 rounded-xl p-3 border border-slate-800 shadow-inner">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1 font-sans">
            <span className="font-semibold uppercase tracking-wider text-indigo-300">
              Live Direct Cash Calculation
            </span>
            <span className="font-mono font-bold text-emerald-400 text-sm">
              {comp.formattedDirectPayTotal} / yr
            </span>
          </div>
          <div className="text-xs font-mono text-slate-200">
            {comp.classification !== 'Licensed' && (tc.isHourly ?? true) ? (
              <div>
                {formatCurrency(comp.hourlyRate, { includeCents: true })}/hr × {comp.hoursPerDay} hrs/day × {comp.daysPerYear} days ={' '}
                <span className="text-white font-semibold">{formatCurrency(comp.basePay)}</span>
                {comp.stipend > 0 && (
                  <span>
                    {' '}
                    + <span className="text-amber-300">{formatCurrency(comp.stipend)}</span> (stipend) ={' '}
                    <span className="text-emerald-300 font-bold">{comp.formattedDirectPayTotal}</span>
                  </span>
                )}
              </div>
            ) : (
              <div>
                Base Salary: <span className="text-white font-semibold">{formatCurrency(comp.basePay)}</span>
                {comp.stipend > 0 && (
                  <span>
                    {' '}
                    + <span className="text-amber-300">{formatCurrency(comp.stipend)}</span> (stipend) ={' '}
                    <span className="text-emerald-300 font-bold">{comp.formattedDirectPayTotal}</span>
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 3. Leave & Holiday Allocations */}
      <div className="space-y-3 pt-1 bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
        <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 flex items-center gap-1.5">
          <CalendarCheck className="w-3.5 h-3.5 text-indigo-600" />
          Paid Time Off &amp; Holiday Allocations
        </label>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Annual Leave Days
            </label>
            <input
              type="number"
              value={comp.leaveDays}
              onChange={(e) => updateTc({ paidLeaveDays: parseInt(e.target.value, 10) || 0 })}
              className="w-full text-xs font-mono px-3 py-1.5 rounded-lg border border-gray-300 bg-white focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Paid District Holidays
            </label>
            <input
              type="number"
              value={comp.holidaysDays}
              onChange={(e) => updateTc({ paidHolidaysDays: parseInt(e.target.value, 10) || 0 })}
              className="w-full text-xs font-mono px-3 py-1.5 rounded-lg border border-gray-300 bg-white focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Additional Protected Leaves Note
          </label>
          <input
            type="text"
            value={comp.additionalLeavesText}
            onChange={(e) => updateTc({ additionalLeavesText: e.target.value })}
            className="w-full text-xs px-3 py-1.5 rounded-lg border border-gray-300 bg-white focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* 4. District Insurance & Statutory Contribution Rates (Accordion) */}
      <div className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-xs">
        <button
          type="button"
          onClick={() => setShowAdvancedBenefits(!showAdvancedBenefits)}
          className="w-full px-4 py-3 bg-gray-50 flex items-center justify-between text-xs font-semibold text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
        >
          <span className="flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-indigo-600" />
            District Benefit &amp; Statutory Rates Configuration
          </span>
          {showAdvancedBenefits ? (
            <ChevronUp className="w-4 h-4 text-gray-500" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-500" />
          )}
        </button>

        {showAdvancedBenefits && (
          <div className="p-4 space-y-3 bg-white border-t border-gray-200 text-xs">
            {!comp.isBenefitEligible && (
              <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-xs font-medium flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  Employee is marked at <strong>{comp.fte} FTE (&lt; 0.5 FTE)</strong>. District insurance contributions are set to $0.00. To enable insurance, increase FTE to 0.5 or above.
                </span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-medium text-gray-600 mb-1">
                  Health Monthly Rate ($/mo)
                </label>
                <input
                  type="number"
                  step="0.1"
                  disabled={!comp.isBenefitEligible}
                  value={
                    comp.isBenefitEligible
                      ? comp.healthMonthlyRate
                      : tc.healthMonthlyRate ?? config?.totalCompDefaults?.healthMonthlyRate ?? DEFAULT_TOTAL_COMP_RATES.healthMonthlyRate
                  }
                  onChange={(e) =>
                    updateTc({ healthMonthlyRate: parseFloat(e.target.value) || 0 })
                  }
                  className="w-full font-mono px-2.5 py-1 rounded border border-gray-300 focus:ring-1 focus:ring-indigo-500 disabled:bg-gray-100 disabled:text-gray-400"
                />
                <span className="text-[10px] text-gray-400">
                  Annual: {formatCurrency(comp.healthAnnual)}
                </span>
              </div>
              <div>
                <label className="block font-medium text-gray-600 mb-1">
                  Dental Monthly Rate ($/mo)
                </label>
                <input
                  type="number"
                  step="0.1"
                  disabled={!comp.isBenefitEligible}
                  value={
                    comp.isBenefitEligible
                      ? comp.dentalMonthlyRate
                      : tc.dentalMonthlyRate ?? config?.totalCompDefaults?.dentalMonthlyRate ?? DEFAULT_TOTAL_COMP_RATES.dentalMonthlyRate
                  }
                  onChange={(e) =>
                    updateTc({ dentalMonthlyRate: parseFloat(e.target.value) || 0 })
                  }
                  className="w-full font-mono px-2.5 py-1 rounded border border-gray-300 focus:ring-1 focus:ring-indigo-500 disabled:bg-gray-100 disabled:text-gray-400"
                />
                <span className="text-[10px] text-gray-400">
                  Annual: {formatCurrency(comp.dentalAnnual)}
                </span>
              </div>
              <div>
                <label className="block font-medium text-gray-600 mb-1">
                  Life Premium Annual ($ - Optional)
                </label>
                <input
                  type="number"
                  step="0.1"
                  disabled={!comp.isBenefitEligible}
                  value={
                    comp.isBenefitEligible
                      ? comp.lifePremiumAnnual
                      : tc.lifeInsurancePremiumAnnual ?? config?.totalCompDefaults?.lifeInsurancePremiumAnnual ?? DEFAULT_TOTAL_COMP_RATES.lifeInsurancePremiumAnnual
                  }
                  onChange={(e) =>
                    updateTc({ lifeInsurancePremiumAnnual: parseFloat(e.target.value) || 0 })
                  }
                  className="w-full font-mono px-2.5 py-1 rounded border border-gray-300 focus:ring-1 focus:ring-indigo-500 disabled:bg-gray-100 disabled:text-gray-400"
                  placeholder="0.00"
                />
                <span className="text-[10px] text-gray-400">{comp.lifePremiumAnnual > 0 ? '$20,000 policy' : '$0 = Excluded from statement'}</span>
              </div>
              <div>
                <label className="block font-medium text-gray-600 mb-1">
                  PERA Retirement Rate (%)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={comp.peraRate * 100}
                  onChange={(e) =>
                    updateTc({ peraRate: (parseFloat(e.target.value) || 0) / 100 })
                  }
                  className="w-full font-mono px-2.5 py-1 rounded border border-gray-300 focus:ring-1 focus:ring-indigo-500"
                />
                <span className="text-[10px] text-gray-400">Cañon City PERA default: {(comp.peraRate * 100).toFixed(2)}%</span>
              </div>
              <div>
                <label className="block font-medium text-gray-600 mb-1">
                  Medicare Rate (%)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={comp.medicareRate * 100}
                  onChange={(e) =>
                    updateTc({ medicareRate: (parseFloat(e.target.value) || 0) / 100 })
                  }
                  className="w-full font-mono px-2.5 py-1 rounded border border-gray-300 focus:ring-1 focus:ring-indigo-500"
                />
                <span className="text-[10px] text-gray-400">Medicare default: {(comp.medicareRate * 100).toFixed(2)}%</span>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={handleResetRates}
                className="text-[11px] text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" /> Reset Rates to District Defaults
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
