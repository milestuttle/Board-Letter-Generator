import React from 'react'
import type { LetterData } from '../../types/letter'

interface RetirementFieldsSectionProps {
  letter: LetterData
  updateField: (field: keyof LetterData, value: any) => void
  updateRetirement: (key: string, value: any) => void
}

export const RetirementFieldsSection: React.FC<RetirementFieldsSectionProps> = ({
  letter,
  updateField,
  updateRetirement,
}) => {
  return (
    <div className="space-y-4">
      {/* Position & Location */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-ink-soft mb-1">
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
            className="w-full px-3 py-2 text-sm rounded-lg border border-rule focus:border-teal-500 focus:ring-2 focus:ring-teal-100 outline-none transition"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-ink-soft mb-1">
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
            className="w-full px-3 py-2 text-sm rounded-lg border border-rule focus:border-teal-500 focus:ring-2 focus:ring-teal-100 outline-none transition"
          />
        </div>
      </div>

      {/* Effective Date & Years of Service */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-teal-50/40 p-4 rounded-md border border-teal-100">
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
      <div className="p-3 bg-paper-dim rounded-md border border-rule space-y-2">
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={letter.retirement?.includeRemainderOfYear || false}
            onChange={(e) => updateRetirement('includeRemainderOfYear', e.target.checked)}
            className="rounded text-teal-600 focus:ring-teal-500 w-4 h-4"
          />
          <span className="text-xs font-semibold text-ink">
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
              className="w-full px-3 py-1.5 text-xs rounded-lg bg-white border border-rule focus:border-teal-500 outline-none"
            />
          </div>
        )}
      </div>

      {/* Retiree Celebration Details */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="block text-xs font-semibold text-ink">
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
              className="text-[10.5px] px-2 py-0.5 bg-paper-dim hover:bg-paper-dim text-muted rounded font-medium transition cursor-pointer"
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
              className="text-[10.5px] px-2 py-0.5 bg-paper-dim hover:bg-paper-dim text-muted rounded font-medium transition cursor-pointer"
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
          className="w-full px-3 py-2 text-sm rounded-lg border border-rule focus:border-teal-500 focus:ring-2 focus:ring-teal-100 outline-none transition font-sans"
        />
      </div>
    </div>
  )
}
