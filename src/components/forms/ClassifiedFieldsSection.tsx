import React from 'react'
import type { LetterData } from '../../types/letter'
import { formatClassifiedWage } from '../../utils/formatUtils'

interface ClassifiedFieldsSectionProps {
  letter: LetterData
  updateField: (field: keyof LetterData, value: any) => void
  updateClassified: (key: string, value: any) => void
}

export const ClassifiedFieldsSection: React.FC<ClassifiedFieldsSectionProps> = ({
  letter,
  updateField,
  updateClassified,
}) => {
  return (
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
            onBlur={(e) => {
              if (e.target.value) {
                updateClassified('baseWage', formatClassifiedWage(e.target.value))
              }
            }}
            placeholder="e.g. $19.67"
            className="w-full px-3 py-2 text-sm rounded-lg bg-white border border-emerald-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none transition font-medium"
          />
          <span className="text-[10px] text-emerald-700/80 mt-0.5 block">
            Auto-formats as $XX.XX (dollars &amp; cents)
          </span>
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
  )
}
