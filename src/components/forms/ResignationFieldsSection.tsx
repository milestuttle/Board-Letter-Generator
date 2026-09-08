import React from 'react'
import type { LetterData } from '../../types/letter'

interface ResignationFieldsSectionProps {
  letter: LetterData
  updateField: (field: keyof LetterData, value: any) => void
  updateResignation: (key: string, value: any) => void
}

export const ResignationFieldsSection: React.FC<ResignationFieldsSectionProps> = ({
  letter,
  updateField,
  updateResignation,
}) => {
  return (
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
  )
}
