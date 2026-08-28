import React from 'react'
import type {
  LetterData,
  LetterType,
  TemplatePreset,
  DistrictConfig,
  RetirementFields,
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
    onChange({
      ...letter,
      certified: {
        ...(letter.certified || {
          lane: 'BA',
          step: '1',
          baseSalary: '$45,000.00',
          startDate: 'August 20, 2026',
        }),
        [key]: value,
      },
    })
  }

  const updateClassified = (key: string, value: string | undefined) => {
    onChange({
      ...letter,
      classified: {
        ...(letter.classified || {
          classification: 'P5',
          level: 'A',
          baseWage: '$18.00',
          startDate: 'August 20, 2026',
        }),
        [key]: value,
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

  const updateRetirement = (field: keyof RetirementFields, value: unknown) => {
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
    <div className="space-y-6 text-gray-800">
      {/* Letter Type Tabs */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
          1. Select Letter Type
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
          <button
            type="button"
            onClick={() => handleTypeChange('certified')}
            className={`flex flex-col items-center justify-center py-3 px-2 rounded-xl border text-center transition-all duration-200 cursor-pointer ${
              letter.type === 'certified'
                ? 'bg-blue-50/80 border-blue-600 text-blue-900 ring-2 ring-blue-500/20 shadow-xs font-semibold'
                : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/70 text-slate-700'
            }`}
          >
            <GraduationCap className={`w-4 h-4 mb-1.5 ${letter.type === 'certified' ? 'text-blue-600' : 'text-slate-500'}`} />
            <span className="text-xs font-semibold">Certified</span>
          </button>

          <button
            type="button"
            onClick={() => handleTypeChange('classified')}
            className={`flex flex-col items-center justify-center py-3 px-2 rounded-xl border text-center transition-all duration-200 cursor-pointer ${
              letter.type === 'classified'
                ? 'bg-emerald-50/80 border-emerald-600 text-emerald-900 ring-2 ring-emerald-500/20 shadow-xs font-semibold'
                : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/70 text-slate-700'
            }`}
          >
            <Briefcase className={`w-4 h-4 mb-1.5 ${letter.type === 'classified' ? 'text-emerald-600' : 'text-slate-500'}`} />
            <span className="text-xs font-semibold">Classified</span>
          </button>

          <button
            type="button"
            onClick={() => handleTypeChange('transfer')}
            className={`flex flex-col items-center justify-center py-3 px-2 rounded-xl border text-center transition-all duration-200 cursor-pointer ${
              letter.type === 'transfer'
                ? 'bg-purple-50/80 border-purple-600 text-purple-900 ring-2 ring-purple-500/20 shadow-xs font-semibold'
                : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/70 text-slate-700'
            }`}
          >
            <ArrowRightLeft className={`w-4 h-4 mb-1.5 ${letter.type === 'transfer' ? 'text-purple-600' : 'text-slate-500'}`} />
            <span className="text-xs font-semibold">Transfer</span>
          </button>

          <button
            type="button"
            onClick={() => handleTypeChange('resignation')}
            className={`flex flex-col items-center justify-center py-3 px-2 rounded-xl border text-center transition-all duration-200 cursor-pointer ${
              letter.type === 'resignation'
                ? 'bg-amber-50/80 border-amber-600 text-amber-900 ring-2 ring-amber-500/20 shadow-xs font-semibold'
                : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/70 text-slate-700'
            }`}
          >
            <UserMinus className={`w-4 h-4 mb-1.5 ${letter.type === 'resignation' ? 'text-amber-600' : 'text-slate-500'}`} />
            <span className="text-xs font-semibold">Resignation</span>
          </button>

          <button
            type="button"
            onClick={() => handleTypeChange('retirement')}
            className={`flex flex-col items-center justify-center py-3 px-2 rounded-xl border text-center transition-all duration-200 cursor-pointer ${
              letter.type === 'retirement'
                ? 'bg-teal-50/80 border-teal-600 text-teal-900 ring-2 ring-teal-500/20 shadow-xs font-semibold'
                : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/70 text-slate-700'
            }`}
          >
            <Award className={`w-4 h-4 mb-1.5 ${letter.type === 'retirement' ? 'text-teal-600' : 'text-slate-500'}`} />
            <span className="text-xs font-semibold">Retirement</span>
          </button>
        </div>

        {/* Quick Reference Presets */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center gap-1.5">
          <span className="text-xs font-medium text-slate-500 flex items-center gap-1 mr-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            Quick Presets:
          </span>
          {presets.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => onSelectPreset(preset)}
              className="text-xs px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition-colors cursor-pointer"
            >
              {preset.name}
            </button>
          ))}
        </div>
      </div>

      {/* Dates & School Year Section */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-slate-500" />
            2. Dates & School Year
          </label>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Letter Date</label>
            <input
              type="text"
              value={letter.letterDate}
              onChange={(e) => updateField('letterDate', e.target.value)}
              placeholder="e.g. August 24, 2026"
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Board Meeting Date
            </label>
            <input
              type="text"
              value={letter.boardMeetingDate}
              onChange={(e) => updateField('boardMeetingDate', e.target.value)}
              placeholder="e.g. August 24, 2026"
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">School Year</label>
            <input
              type="text"
              value={letter.schoolYear}
              onChange={(e) => updateField('schoolYear', e.target.value)}
              placeholder="e.g. 2026-2027"
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition"
            />
          </div>
        </div>
      </div>

      {/* Recipient Information Section */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
          <UserCheck className="w-4 h-4 text-slate-500" />
          3. Recipient Information
        </label>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">First Name *</label>
            <input
              type="text"
              value={letter.recipientFirstName}
              onChange={(e) => updateField('recipientFirstName', e.target.value)}
              placeholder="e.g. Stacy"
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Last Name *</label>
            <input
              type="text"
              value={letter.recipientLastName}
              onChange={(e) => updateField('recipientLastName', e.target.value)}
              placeholder="e.g. Andrews"
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">Street Address</label>
          <input
            type="text"
            value={letter.streetAddress}
            onChange={(e) => updateField('streetAddress', e.target.value)}
            placeholder="e.g. 1431 Lombard Street"
            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition"
          />
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="col-span-1">
            <label className="block text-xs font-medium text-slate-700 mb-1">City</label>
            <input
              type="text"
              value={letter.city}
              onChange={(e) => updateField('city', e.target.value)}
              placeholder="Cañon City"
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">State</label>
            <input
              type="text"
              value={letter.state}
              onChange={(e) => updateField('state', e.target.value)}
              placeholder="CO"
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">ZIP</label>
            <input
              type="text"
              value={letter.zip}
              onChange={(e) => updateField('zip', e.target.value)}
              placeholder="81212"
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">
            Custom Salutation (Optional)
          </label>
          <input
            type="text"
            value={letter.customSalutation || ''}
            onChange={(e) => updateField('customSalutation', e.target.value)}
            placeholder={`Default: Dear ${letter.recipientFirstName || '[First Name]'},`}
            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition"
          />
        </div>
      </div>

      {/* Position & Type-Specific Details */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
          <Building className="w-4 h-4 text-slate-500" />
          4. {letter.type.toUpperCase()} Placement & Details
        </label>

        {/* Certified Form Fields */}
        {letter.type === 'certified' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Position / Role Title *
                </label>
                <input
                  type="text"
                  value={letter.positionTitle}
                  onChange={(e) => updateField('positionTitle', e.target.value)}
                  placeholder="e.g. Part-time Lead Counselor or 3rd Grade Teacher"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Location / Department *
                </label>
                <input
                  type="text"
                  list="district-locations-list"
                  value={letter.location}
                  onChange={(e) => updateField('location', e.target.value)}
                  placeholder="e.g. District-wide or Cañon City High School"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition"
                />
              </div>
            </div>

            <div className="bg-blue-50/40 p-4 rounded-xl border border-blue-100 space-y-3">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-blue-950 mb-1">
                    Salary Lane
                  </label>
                  <input
                    type="text"
                    list="certified-lanes-list"
                    value={letter.certified?.lane || ''}
                    onChange={(e) => updateCertified('lane', e.target.value)}
                    placeholder="e.g. MA+48 or BA"
                    className="w-full px-3 py-2 text-sm rounded-lg bg-white border border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-blue-950 mb-1">
                    Salary Step
                  </label>
                  <input
                    type="text"
                    value={letter.certified?.step || ''}
                    onChange={(e) => updateCertified('step', e.target.value)}
                    placeholder="e.g. 23 or 5"
                    className="w-full px-3 py-2 text-sm rounded-lg bg-white border border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-blue-950 mb-1">
                    Base Salary ($)
                  </label>
                  <input
                    type="text"
                    value={letter.certified?.baseSalary || ''}
                    onChange={(e) => updateCertified('baseSalary', e.target.value)}
                    placeholder="e.g. $21,031.50"
                    className="w-full px-3 py-2 text-sm rounded-lg bg-white border border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-blue-950 mb-1">
                    Start Date
                  </label>
                  <input
                    type="text"
                    value={letter.certified?.startDate || ''}
                    onChange={(e) => updateCertified('startDate', e.target.value)}
                    placeholder="e.g. September 1, 2026"
                    className="w-full px-3 py-2 text-sm rounded-lg bg-white border border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition font-medium"
                  />
                </div>
              </div>

              {/* Quick-Select Lane Pills */}
              {(config.certifiedLanes || []).length > 0 && (
                <div className="pt-1">
                  <span className="text-[11px] font-semibold text-blue-900 block mb-1.5">
                    Quick Select Standard Lane:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {(config.certifiedLanes || []).map((lane) => (
                      <button
                        key={lane}
                        type="button"
                        onClick={() => updateCertified('lane', lane)}
                        className={`px-2.5 py-1 text-xs font-bold rounded-lg cursor-pointer transition ${
                          letter.certified?.lane === lane
                            ? 'bg-blue-600 text-white shadow-2xs'
                            : 'bg-white text-blue-900 border border-blue-200/80 hover:bg-blue-100/70'
                        }`}
                      >
                        {lane}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Classified Form Fields */}
        {letter.type === 'classified' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Position / Role Title *
                </label>
                <input
                  type="text"
                  value={letter.positionTitle}
                  onChange={(e) => updateField('positionTitle', e.target.value)}
                  placeholder="e.g. School Health Technician or SSN Paraprofessional"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none transition"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  School / Location *
                </label>
                <input
                  type="text"
                  list="district-locations-list"
                  value={letter.location}
                  onChange={(e) => updateField('location', e.target.value)}
                  placeholder="e.g. Cañon City High School or CCMS"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none transition"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-emerald-50/40 p-4 rounded-xl border border-emerald-100">
              <div>
                <label className="block text-xs font-semibold text-emerald-950 mb-1">
                  Classification
                </label>
                <input
                  type="text"
                  value={letter.classified?.classification || ''}
                  onChange={(e) => updateClassified('classification', e.target.value)}
                  placeholder="e.g. P6 or P5"
                  className="w-full px-3 py-2 text-sm rounded-lg bg-white border border-emerald-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none transition font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-emerald-950 mb-1">Level</label>
                <input
                  type="text"
                  value={letter.classified?.level || ''}
                  onChange={(e) => updateClassified('level', e.target.value)}
                  placeholder="e.g. E or D"
                  className="w-full px-3 py-2 text-sm rounded-lg bg-white border border-emerald-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none transition font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-emerald-950 mb-1">
                  Base Wage
                </label>
                <input
                  type="text"
                  value={letter.classified?.baseWage || ''}
                  onChange={(e) => updateClassified('baseWage', e.target.value)}
                  placeholder="e.g. $19.67"
                  className="w-full px-3 py-2 text-sm rounded-lg bg-white border border-emerald-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none transition font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-emerald-950 mb-1">
                  Start Date
                </label>
                <input
                  type="text"
                  value={letter.classified?.startDate || ''}
                  onChange={(e) => updateClassified('startDate', e.target.value)}
                  placeholder="e.g. August 20, 2026"
                  className="w-full px-3 py-2 text-sm rounded-lg bg-white border border-emerald-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none transition font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Stipend Text (Optional)
              </label>
              <input
                type="text"
                value={letter.classified?.stipendText || ''}
                onChange={(e) => updateClassified('stipendText', e.target.value)}
                placeholder="e.g. Plus a center-based stipend of $2,000"
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none transition"
              />
            </div>
          </div>
        )}

        {/* Transfer Form Fields */}
        {letter.type === 'transfer' && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Transfer Full Description Wording *
              </label>
              <textarea
                rows={3}
                value={
                  letter.transfer?.transferDescription ||
                  `your transfer in position and hours back to ${letter.positionTitle || 'Crossing Guard / Noon Aide'} at ${letter.location || 'Washington Elementary School'}`
                }
                onChange={(e) => updateTransfer('transferDescription', e.target.value)}
                placeholder="e.g. your transfer in position and hours back to Crossing Guard / Noon Aide at Washington Elementary School"
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-100 outline-none transition font-sans"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Wording follows: &ldquo;The Board took action to approve{' '}
                <strong>[Description]</strong> effective [Date] for the [School Year] School
                Year.&rdquo;
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-purple-50/40 p-4 rounded-xl border border-purple-100">
              <div>
                <label className="block text-xs font-semibold text-purple-950 mb-1">
                  Effective Date
                </label>
                <input
                  type="text"
                  value={letter.transfer?.effectiveDate || ''}
                  onChange={(e) => updateTransfer('effectiveDate', e.target.value)}
                  placeholder="e.g. August 12, 2026"
                  className="w-full px-3 py-2 text-sm rounded-lg bg-white border border-purple-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-100 outline-none transition font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-purple-950 mb-1">
                  New Position / Location Reference
                </label>
                <input
                  type="text"
                  list="district-locations-list"
                  value={letter.positionTitle || ''}
                  onChange={(e) => updateField('positionTitle', e.target.value)}
                  placeholder="e.g. Crossing Guard / Noon Aide"
                  className="w-full px-3 py-2 text-sm rounded-lg bg-white border border-purple-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-100 outline-none transition font-medium"
                />
              </div>
            </div>
          </div>
        )}

        {/* Resignation Form Fields */}
        {letter.type === 'resignation' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Position Resigning From *
                </label>
                <input
                  type="text"
                  value={letter.resignation?.position || letter.positionTitle || ''}
                  onChange={(e) => {
                    updateResignation('position', e.target.value)
                    updateField('positionTitle', e.target.value)
                  }}
                  placeholder="e.g. 4th Grade Teacher"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-100 outline-none transition"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  School / Department *
                </label>
                <input
                  type="text"
                  list="district-locations-list"
                  value={letter.resignation?.location || letter.location || ''}
                  onChange={(e) => {
                    updateResignation('location', e.target.value)
                    updateField('location', e.target.value)
                  }}
                  placeholder="e.g. Harrison Elementary School"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-100 outline-none transition"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-amber-50/40 p-4 rounded-xl border border-amber-100">
              <div>
                <label className="block text-xs font-semibold text-amber-950 mb-1">
                  Effective Date of Resignation
                </label>
                <input
                  type="text"
                  value={letter.resignation?.effectiveDate || ''}
                  onChange={(e) => updateResignation('effectiveDate', e.target.value)}
                  placeholder="e.g. August 15, 2026 or End of School Year"
                  className="w-full px-3 py-2 text-sm rounded-lg bg-white border border-amber-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-100 outline-none transition font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Custom Appreciation Message (Optional)
              </label>
              <textarea
                rows={2}
                value={
                  letter.resignation?.customAppreciation ||
                  'Thank you for your dedicated service and commitment to the students and families of Cañon City Schools. We wish you the very best in all of your future personal and professional endeavors.'
                }
                onChange={(e) => updateResignation('customAppreciation', e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-100 outline-none transition font-sans"
              />
            </div>
          </div>
        )}

        {/* Retirement Form Fields */}
        {letter.type === 'retirement' && (
          <div className="space-y-4">
            {/* Position & Location */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Retiring Position Title *
                </label>
                <input
                  type="text"
                  value={letter.positionTitle || letter.retirement?.position || ''}
                  onChange={(e) => {
                    updateRetirement('position', e.target.value)
                    updateField('positionTitle', e.target.value)
                  }}
                  placeholder="e.g. Elementary Teacher"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 outline-none transition"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  School / Department *
                </label>
                <input
                  type="text"
                  list="district-locations-list"
                  value={letter.location || letter.retirement?.location || ''}
                  onChange={(e) => {
                    updateRetirement('location', e.target.value)
                    updateField('location', e.target.value)
                  }}
                  placeholder="e.g. Washington Elementary School"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 outline-none transition"
                />
              </div>
            </div>

            {/* Effective Date & Years of Service */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-teal-50/40 p-4 rounded-xl border border-teal-100">
              <div>
                <label className="block text-xs font-semibold text-teal-950 mb-1">
                  Effective Date of Retirement *
                </label>
                <input
                  type="text"
                  value={letter.retirement?.effectiveDate || ''}
                  onChange={(e) => updateRetirement('effectiveDate', e.target.value)}
                  placeholder="e.g. June 5, 2026 or May 29, 2026"
                  className="w-full px-3 py-2 text-sm rounded-lg bg-white border border-teal-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 outline-none transition font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-teal-950 mb-1">
                  Years of Service with District
                </label>
                <input
                  type="text"
                  value={letter.retirement?.yearsOfService || ''}
                  onChange={(e) => updateRetirement('yearsOfService', e.target.value)}
                  placeholder="e.g. 25 or 18 or XX"
                  className="w-full px-3 py-2 text-sm rounded-lg bg-white border border-teal-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 outline-none transition font-medium"
                />
                <span className="text-[10.5px] text-teal-700 mt-1 block">
                  Renders as: &ldquo;Your {letter.retirement?.yearsOfService || 'XX'} Years of service with the District...&rdquo;
                </span>
              </div>
            </div>

            {/* Remainder of School Year Toggle */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={letter.retirement?.includeRemainderOfYear || false}
                  onChange={(e) => updateRetirement('includeRemainderOfYear', e.target.checked)}
                  className="rounded text-teal-600 focus:ring-teal-500 w-4 h-4"
                />
                <span className="text-xs font-semibold text-slate-800">
                  Include &ldquo;for the remainder of the school year&rdquo; clause
                </span>
              </label>

              {letter.retirement?.includeRemainderOfYear && (
                <div className="pt-1">
                  <input
                    type="text"
                    value={
                      letter.retirement?.remainderYearText ??
                      `for the remainder of the ${letter.schoolYear} School Year.`
                    }
                    onChange={(e) => updateRetirement('remainderYearText', e.target.value)}
                    placeholder="e.g. for the remainder of the 2025/2026 School Year."
                    className="w-full px-3 py-1.5 text-xs rounded-lg bg-white border border-slate-200 focus:border-teal-500 outline-none"
                  />
                </div>
              )}
            </div>

            {/* Retiree Celebration Details */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-800">
                  Retiree Celebration Details Paragraph
                </label>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() =>
                      updateRetirement(
                        'celebrationText',
                        'We will be holding a celebration for retirees in April, 2027. Please watch for more detailed information to be shared closer to the event.'
                      )
                    }
                    className="text-[10.5px] px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded font-medium transition cursor-pointer"
                  >
                    Preset: April, 2027
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      updateRetirement(
                        'celebrationText',
                        'We will be holding a celebration for retirees from 5:00 pm to 7:30 pm on Tuesday, May 5th, 2026. Please watch for more detailed information to be shared closer to the event.'
                      )
                    }
                    className="text-[10.5px] px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded font-medium transition cursor-pointer"
                  >
                    Preset: May 5th Event
                  </button>
                </div>
              </div>
              <textarea
                rows={2}
                value={
                  letter.retirement?.celebrationText ||
                  'We will be holding a celebration for retirees in April, 2027. Please watch for more detailed information to be shared closer to the event.'
                }
                onChange={(e) => updateRetirement('celebrationText', e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 outline-none transition font-sans"
              />
            </div>
          </div>
        )}
      </div>

      {/* Signature & Closing Customization */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
          <FileSignature className="w-4 h-4 text-slate-500" />
          5. Signer & Footer Notations
        </label>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Signer Name</label>
            <input
              type="text"
              value={letter.signerName || ''}
              onChange={(e) => updateField('signerName', e.target.value)}
              placeholder="Jamie Davis"
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Signer Title</label>
            <input
              type="text"
              value={letter.signerTitle || ''}
              onChange={(e) => updateField('signerTitle', e.target.value)}
              placeholder="Director of Human Resources"
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Typist Initials</label>
            <input
              type="text"
              value={letter.typistInitials || ''}
              onChange={(e) => updateField('typistInitials', e.target.value)}
              placeholder="/ks"
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Cc: Line</label>
            <input
              type="text"
              value={letter.ccLine || ''}
              onChange={(e) => updateField('ccLine', e.target.value)}
              placeholder="Cc: personnel file"
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition"
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
