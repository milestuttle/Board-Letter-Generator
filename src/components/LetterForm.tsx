import React from 'react'
import type {
  LetterData,
  LetterType,
  TemplatePreset,
  DistrictConfig,
} from '../types/letter'
import {
  GraduationCap,
  Briefcase,
  ArrowRightLeft,
  UserMinus,
  Award,
  Sparkles,
  UserCheck,
  Building,
  Calendar,
  FileSignature,
} from 'lucide-react'
import { getDefaultLetterDate } from '../utils/dateUtils'
import { CertifiedFieldsSection } from './forms/CertifiedFieldsSection'
import { ClassifiedFieldsSection } from './forms/ClassifiedFieldsSection'
import { TransferFieldsSection } from './forms/TransferFieldsSection'
import { ResignationFieldsSection } from './forms/ResignationFieldsSection'
import { RetirementFieldsSection } from './forms/RetirementFieldsSection'

interface LetterFormProps {
  letter: LetterData
  onChange: (updated: LetterData) => void
  presets: TemplatePreset[]
  onSelectPreset: (preset: TemplatePreset) => void
  onResetType: (type: LetterType) => void
  config: DistrictConfig
}

export const LetterForm: React.FC<LetterFormProps> = ({
  letter,
  onChange,
  presets,
  onSelectPreset,
  onResetType,
  config,
}) => {
  const handleTypeChange = (newType: LetterType) => {
    if (newType === letter.type) return
    onResetType(newType)
  }

  const updateField = (field: keyof LetterData, value: unknown) => {
    onChange({
      ...letter,
      [field]: value,
    })
  }

  const updateCertified = (key: string, value: string | boolean | undefined) => {
    const newCertified = {
      ...(letter.certified || {
        lane: 'BA',
        step: '1',
        baseSalary: '$45,000.00',
        startDate: getDefaultLetterDate(config.defaultBoardMeetingDate),
      }),
      [key]: value,
    }
    const tcUpdates: Record<string, unknown> = {}
    if (key === 'baseSalary' && (typeof value === 'string' || typeof value === 'number')) {
      tcUpdates.baseAnnualSalary = value
    }
    if (key === 'isPartTime') {
      tcUpdates.fte = value ? 0.5 : 1.0
    }
    onChange({
      ...letter,
      certified: newCertified,
      totalComp: {
        ...(letter.totalComp || {}),
        ...tcUpdates,
      },
    })
  }

  const updateClassified = (key: string, value: string | undefined) => {
    const newClassified = {
      ...(letter.classified || {
        classification: 'P5',
        level: 'A',
        baseWage: '$18.00',
        startDate: getDefaultLetterDate(config.defaultBoardMeetingDate),
      }),
      [key]: value,
    }
    const tcUpdates: Record<string, unknown> = {}
    if (key === 'baseWage' && typeof value === 'string') {
      if (newClassified.wageUnit === 'year') {
        tcUpdates.baseAnnualSalary = value
      } else {
        tcUpdates.hourlyRate = value
      }
    }
    if (key === 'wageUnit') {
      tcUpdates.isHourly = value !== 'year'
    }
    if (key === 'stipendText' && typeof value === 'string') {
      const match = value.match(/\$([0-9,]+(\.[0-9]{2})?)/)
      if (match) {
        tcUpdates.stipendAmount = `$${match[1]}`
      } else if (!value.trim()) {
        tcUpdates.stipendAmount = '$0.00'
      }
    }
    onChange({
      ...letter,
      classified: newClassified,
      totalComp: {
        ...(letter.totalComp || {}),
        ...tcUpdates,
      },
    })
  }

  const updateTransfer = (key: string, value: string | undefined) => {
    onChange({
      ...letter,
      transfer: {
        ...(letter.transfer || {
          newPosition: letter.positionTitle,
          newLocation: letter.location,
          transferDescription: '',
          effectiveDate: 'August 12, 2026',
        }),
        [key]: value,
      },
    })
  }

  const updateResignation = (key: string, value: string | undefined) => {
    onChange({
      ...letter,
      resignation: {
        ...(letter.resignation || {
          position: letter.positionTitle,
          location: letter.location,
          effectiveDate: 'June 30, 2026',
          customAppreciation: '',
        }),
        [key]: value,
      },
    })
  }

  const updateRetirement = (field: string, value: unknown) => {
    onChange({
      ...letter,
      retirement: {
        position: letter.positionTitle || '',
        location: letter.location || '',
        effectiveDate: '',
        actionType: 'approved_request',
        includeRemainderOfYear: false,
        remainderYearText: `for the remainder of the ${letter.schoolYear} School Year.`,
        yearsOfService: '',
        celebrationText:
          'We will be holding a celebration for retirees in April, 2027. Please watch for more detailed information to be shared closer to the event.',
        ...letter.retirement,
        [field]: value,
      },
    })
  }

  return (
    <div className="space-y-6 text-ink">
      {/* Letter Type Tabs */}
      <div className="bg-white p-4 rounded-lg border border-rule/80">
        <label className="block text-xs font-bold text-muted mb-3">
          1. Select Letter Type
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
          <button
            type="button"
            onClick={() => handleTypeChange('certified')}
            className={`flex flex-col items-center justify-center py-3 px-2 rounded-md border text-center transition-all duration-200 cursor-pointer ${
              letter.type === 'certified'
                ? 'bg-accent-soft border-accent text-accent-dark ring-2 ring-accent/25 font-semibold'
                : 'border-rule hover:border-rule hover:bg-paper-dim/70 text-ink-soft'
            }`}
          >
            <GraduationCap className={`w-4 h-4 mb-1.5 ${letter.type === 'certified' ? 'text-accent-dark' : 'text-muted'}`} />
            <span className="text-xs font-semibold">Certified</span>
          </button>

          <button
            type="button"
            onClick={() => handleTypeChange('classified')}
            className={`flex flex-col items-center justify-center py-3 px-2 rounded-md border text-center transition-all duration-200 cursor-pointer ${
              letter.type === 'classified'
                ? 'bg-emerald-50/80 border-emerald-600 text-emerald-900 ring-2 ring-emerald-500/20 font-semibold'
                : 'border-rule hover:border-rule hover:bg-paper-dim/70 text-ink-soft'
            }`}
          >
            <Briefcase className={`w-4 h-4 mb-1.5 ${letter.type === 'classified' ? 'text-emerald-600' : 'text-muted'}`} />
            <span className="text-xs font-semibold">Classified</span>
          </button>

          <button
            type="button"
            onClick={() => handleTypeChange('transfer')}
            className={`flex flex-col items-center justify-center py-3 px-2 rounded-md border text-center transition-all duration-200 cursor-pointer ${
              letter.type === 'transfer'
                ? 'bg-purple-50/80 border-purple-600 text-purple-900 ring-2 ring-purple-500/20 font-semibold'
                : 'border-rule hover:border-rule hover:bg-paper-dim/70 text-ink-soft'
            }`}
          >
            <ArrowRightLeft className={`w-4 h-4 mb-1.5 ${letter.type === 'transfer' ? 'text-purple-600' : 'text-muted'}`} />
            <span className="text-xs font-semibold">Transfer</span>
          </button>

          <button
            type="button"
            onClick={() => handleTypeChange('resignation')}
            className={`flex flex-col items-center justify-center py-3 px-2 rounded-md border text-center transition-all duration-200 cursor-pointer ${
              letter.type === 'resignation'
                ? 'bg-amber-50/80 border-amber-600 text-amber-900 ring-2 ring-amber-500/20 font-semibold'
                : 'border-rule hover:border-rule hover:bg-paper-dim/70 text-ink-soft'
            }`}
          >
            <UserMinus className={`w-4 h-4 mb-1.5 ${letter.type === 'resignation' ? 'text-amber-600' : 'text-muted'}`} />
            <span className="text-xs font-semibold">Resignation</span>
          </button>

          <button
            type="button"
            onClick={() => handleTypeChange('retirement')}
            className={`flex flex-col items-center justify-center py-3 px-2 rounded-md border text-center transition-all duration-200 cursor-pointer ${
              letter.type === 'retirement'
                ? 'bg-teal-50/80 border-teal-600 text-teal-900 ring-2 ring-teal-500/20 font-semibold'
                : 'border-rule hover:border-rule hover:bg-paper-dim/70 text-ink-soft'
            }`}
          >
            <Award className={`w-4 h-4 mb-1.5 ${letter.type === 'retirement' ? 'text-teal-600' : 'text-muted'}`} />
            <span className="text-xs font-semibold">Retirement</span>
          </button>
        </div>

        {/* Quick Reference Presets */}
        <div className="mt-4 pt-3 border-t border-rule flex flex-wrap items-center gap-1.5">
          <span className="text-xs font-medium text-muted flex items-center gap-1 mr-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            Quick Presets:
          </span>
          {presets.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => onSelectPreset(preset)}
              className="text-xs px-2.5 py-1 rounded-lg bg-paper-dim hover:bg-paper-dim text-ink-soft font-medium transition-colors cursor-pointer"
            >
              {preset.name}
            </button>
          ))}
        </div>
      </div>

      {/* Dates & School Year Section */}
      <div className="bg-white p-5 rounded-lg border border-rule/80 space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-muted flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-muted" />
            2. Dates & School Year
          </label>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-medium text-ink-soft mb-1">Letter Date</label>
            <input
              type="text"
              value={letter.letterDate}
              onChange={(e) => updateField('letterDate', e.target.value)}
              placeholder="e.g. August 24, 2026"
              className="w-full px-3 py-2 text-sm rounded-lg border border-rule focus:border-accent focus:ring-2 focus:ring-accent outline-none transition"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-ink-soft mb-1">
              Board Meeting Date
            </label>
            <input
              type="text"
              value={letter.boardMeetingDate}
              onChange={(e) => updateField('boardMeetingDate', e.target.value)}
              placeholder="e.g. August 24, 2026"
              className="w-full px-3 py-2 text-sm rounded-lg border border-rule focus:border-accent focus:ring-2 focus:ring-accent outline-none transition"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-ink-soft mb-1">School Year</label>
            <input
              type="text"
              value={letter.schoolYear}
              onChange={(e) => updateField('schoolYear', e.target.value)}
              placeholder="e.g. 2026-2027"
              className="w-full px-3 py-2 text-sm rounded-lg border border-rule focus:border-accent focus:ring-2 focus:ring-accent outline-none transition"
            />
          </div>
        </div>
      </div>

      {/* Recipient Information Section */}
      <div className="bg-white p-5 rounded-lg border border-rule/80 space-y-4">
        <label className="text-xs font-bold text-muted flex items-center gap-1.5">
          <UserCheck className="w-4 h-4 text-muted" />
          3. Recipient Information
        </label>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-ink-soft mb-1">First Name *</label>
            <input
              type="text"
              value={letter.recipientFirstName}
              onChange={(e) => updateField('recipientFirstName', e.target.value)}
              placeholder="e.g. Stacy"
              className="w-full px-3 py-2 text-sm rounded-lg border border-rule focus:border-accent focus:ring-2 focus:ring-accent outline-none transition"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-ink-soft mb-1">Last Name *</label>
            <input
              type="text"
              value={letter.recipientLastName}
              onChange={(e) => updateField('recipientLastName', e.target.value)}
              placeholder="e.g. Andrews"
              className="w-full px-3 py-2 text-sm rounded-lg border border-rule focus:border-accent focus:ring-2 focus:ring-accent outline-none transition"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-ink-soft mb-1">Street Address</label>
          <input
            type="text"
            value={letter.streetAddress}
            onChange={(e) => updateField('streetAddress', e.target.value)}
            placeholder="e.g. 1431 Lombard Street"
            className="w-full px-3 py-2 text-sm rounded-lg border border-rule focus:border-accent focus:ring-2 focus:ring-accent outline-none transition"
          />
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="col-span-1">
            <label className="block text-xs font-medium text-ink-soft mb-1">City</label>
            <input
              type="text"
              value={letter.city}
              onChange={(e) => updateField('city', e.target.value)}
              placeholder="Cañon City"
              className="w-full px-3 py-2 text-sm rounded-lg border border-rule focus:border-accent focus:ring-2 focus:ring-accent outline-none transition"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-ink-soft mb-1">State</label>
            <input
              type="text"
              value={letter.state}
              onChange={(e) => updateField('state', e.target.value)}
              placeholder="CO"
              className="w-full px-3 py-2 text-sm rounded-lg border border-rule focus:border-accent focus:ring-2 focus:ring-accent outline-none transition"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-ink-soft mb-1">ZIP</label>
            <input
              type="text"
              value={letter.zip}
              onChange={(e) => updateField('zip', e.target.value)}
              placeholder="81212"
              className="w-full px-3 py-2 text-sm rounded-lg border border-rule focus:border-accent focus:ring-2 focus:ring-accent outline-none transition"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-ink-soft mb-1">
            Custom Salutation (Optional)
          </label>
          <input
            type="text"
            value={letter.customSalutation || ''}
            onChange={(e) => updateField('customSalutation', e.target.value)}
            placeholder={`Default: Dear ${letter.recipientFirstName || '[First Name]'},`}
            className="w-full px-3 py-2 text-sm rounded-lg border border-rule focus:border-accent focus:ring-2 focus:ring-accent outline-none transition"
          />
        </div>
      </div>

      {/* Position & Type-Specific Details */}
      <div className="bg-white p-5 rounded-lg border border-rule/80 space-y-4">
        <label className="text-xs font-bold text-muted flex items-center gap-1.5">
          <Building className="w-4 h-4 text-muted" />
          4. {letter.type.toUpperCase()} Placement & Details
        </label>

        {letter.type === 'certified' && (
          <CertifiedFieldsSection
            letter={letter}
            config={config}
            updateField={updateField}
            updateCertified={updateCertified}
          />
        )}

        {letter.type === 'classified' && (
          <ClassifiedFieldsSection
            letter={letter}
            updateField={updateField}
            updateClassified={updateClassified}
          />
        )}

        {letter.type === 'transfer' && (
          <TransferFieldsSection
            letter={letter}
            updateField={updateField}
            updateTransfer={updateTransfer}
          />
        )}

        {letter.type === 'resignation' && (
          <ResignationFieldsSection
            letter={letter}
            updateField={updateField}
            updateResignation={updateResignation}
          />
        )}

        {letter.type === 'retirement' && (
          <RetirementFieldsSection
            letter={letter}
            updateField={updateField}
            updateRetirement={updateRetirement}
          />
        )}
      </div>

      {/* Signature & Closing Customization */}
      <div className="bg-white p-5 rounded-lg border border-rule/80 space-y-4">
        <label className="text-xs font-bold text-muted flex items-center gap-1.5">
          <FileSignature className="w-4 h-4 text-muted" />
          5. Signer & Footer Notations
        </label>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-ink-soft mb-1">Signer Name</label>
            <input
              type="text"
              value={letter.signerName || ''}
              onChange={(e) => updateField('signerName', e.target.value)}
              placeholder="Jamie Davis"
              className="w-full px-3 py-2 text-sm rounded-lg border border-rule focus:border-accent focus:ring-2 focus:ring-accent outline-none transition"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-ink-soft mb-1">Signer Title</label>
            <input
              type="text"
              value={letter.signerTitle || ''}
              onChange={(e) => updateField('signerTitle', e.target.value)}
              placeholder="Director of Human Resources"
              className="w-full px-3 py-2 text-sm rounded-lg border border-rule focus:border-accent focus:ring-2 focus:ring-accent outline-none transition"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-ink-soft mb-1">Typist Initials</label>
            <input
              type="text"
              value={letter.typistInitials || ''}
              onChange={(e) => updateField('typistInitials', e.target.value)}
              placeholder="/ks"
              className="w-full px-3 py-2 text-sm rounded-lg border border-rule focus:border-accent focus:ring-2 focus:ring-accent outline-none transition"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-ink-soft mb-1">Cc: Line</label>
            <input
              type="text"
              value={letter.ccLine || ''}
              onChange={(e) => updateField('ccLine', e.target.value)}
              placeholder="Cc: personnel file"
              className="w-full px-3 py-2 text-sm rounded-lg border border-rule focus:border-accent focus:ring-2 focus:ring-accent outline-none transition"
            />
          </div>
        </div>
      </div>

      {/* Pre-configured District Datalists for Quick Suggestions */}
      <datalist id="district-locations-list">
        {(config.districtLocations || []).map((loc, idx) => (
          <option key={idx} value={loc} />
        ))}
      </datalist>

      <datalist id="certified-lanes-list">
        {(config.certifiedLanes || []).map((lane, idx) => (
          <option key={idx} value={lane} />
        ))}
      </datalist>
    </div>
  )
}
