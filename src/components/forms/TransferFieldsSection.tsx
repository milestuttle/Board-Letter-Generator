import React from 'react'
import type { LetterData } from '../../types/letter'

interface TransferFieldsSectionProps {
  letter: LetterData
  updateField: (field: keyof LetterData, value: any) => void
  updateTransfer: (key: string, value: any) => void
}

export const TransferFieldsSection: React.FC<TransferFieldsSectionProps> = ({
  letter,
  updateField,
  updateTransfer,
}) => {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-medium text-ink-soft mb-1">
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
          className="w-full px-3 py-2 text-sm rounded-lg border border-rule focus:border-purple-500 focus:ring-2 focus:ring-purple-100 outline-none transition font-sans"
        />
        <p className="text-[11px] text-muted mt-1">
          Wording follows: &ldquo;The Board took action to approve{' '}
          <strong>[Description]</strong> effective [Date] for the [School Year] School
          Year.&rdquo;
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-purple-50/40 p-4 rounded-md border border-purple-100">
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
  )
}
