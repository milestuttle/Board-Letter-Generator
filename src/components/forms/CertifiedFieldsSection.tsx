import React from 'react'
import type { LetterData, DistrictConfig } from '../../types/letter'
import { formatCertifiedSalary } from '../../utils/formatUtils'

interface CertifiedFieldsSectionProps {
  letter: LetterData
  config: DistrictConfig
  updateField: (field: keyof LetterData, value: any) => void
  updateCertified: (key: string, value: any) => void
}

export const CertifiedFieldsSection: React.FC<CertifiedFieldsSectionProps> = ({
  letter,
  config,
  updateField,
  updateCertified,
}) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-ink-soft mb-1">
            Position / Role Title *
          </label>
          <input
            type="text"
            value={letter.positionTitle}
            onChange={(e) => updateField('positionTitle', e.target.value)}
            placeholder="e.g. Part-time Lead Counselor or 3rd Grade Teacher"
            className="w-full px-3 py-2 text-sm rounded-lg border border-rule focus:border-accent focus:ring-2 focus:ring-accent outline-none transition"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-ink-soft mb-1">
            Location / Department *
          </label>
          <input
            type="text"
            list="district-locations-list"
            value={letter.location}
            onChange={(e) => updateField('location', e.target.value)}
            placeholder="e.g. District-wide or Cañon City High School"
            className="w-full px-3 py-2 text-sm rounded-lg border border-rule focus:border-accent focus:ring-2 focus:ring-accent outline-none transition"
          />
        </div>
      </div>

      <div className="bg-accent-soft p-4 rounded-md border border-accent space-y-3">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div>
            <label className="block text-xs font-semibold text-accent-dark mb-1">
              Salary Lane
            </label>
            <input
              type="text"
              list="certified-lanes-list"
              value={letter.certified?.lane || ''}
              onChange={(e) => updateCertified('lane', e.target.value)}
              placeholder="e.g. MA+48 or BA"
              className="w-full px-3 py-2 text-sm rounded-lg bg-white border border-accent focus:border-accent focus:ring-2 focus:ring-accent outline-none transition font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-accent-dark mb-1">
              Salary Step
            </label>
            <input
              type="text"
              value={letter.certified?.step || ''}
              onChange={(e) => updateCertified('step', e.target.value)}
              placeholder="e.g. 23 or 5"
              className="w-full px-3 py-2 text-sm rounded-lg bg-white border border-accent focus:border-accent focus:ring-2 focus:ring-accent outline-none transition font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-accent-dark mb-1">
              Base Salary ($)
            </label>
            <input
              type="text"
              value={letter.certified?.baseSalary || ''}
              onChange={(e) => {
                const raw = e.target.value
                if (!raw) {
                  updateCertified('baseSalary', '')
                  return
                }
                updateCertified('baseSalary', formatCertifiedSalary(raw))
              }}
              onBlur={(e) => {
                if (e.target.value) {
                  updateCertified('baseSalary', formatCertifiedSalary(e.target.value))
                }
              }}
              placeholder="e.g. $52,400"
              className="w-full px-3 py-2 text-sm rounded-lg bg-white border border-accent focus:border-accent focus:ring-2 focus:ring-accent outline-none transition font-medium"
            />
            <span className="text-[10px] text-accent-dark mt-0.5 block">
              Auto-formats as $X,XXX (no cents)
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-accent-dark mb-1">
              Start Date
            </label>
            <input
              type="text"
              value={letter.certified?.startDate || ''}
              onChange={(e) => updateCertified('startDate', e.target.value)}
              placeholder="e.g. September 1, 2026"
              className="w-full px-3 py-2 text-sm rounded-lg bg-white border border-accent focus:border-accent focus:ring-2 focus:ring-accent outline-none transition font-medium"
            />
          </div>
        </div>

        {/* Quick-Select Lane Pills */}
        {(config.certifiedLanes || []).length > 0 && (
          <div className="pt-1">
            <span className="text-[11px] font-semibold text-accent-dark block mb-1.5">
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
                      ? 'bg-accent text-white shadow-2xs'
                      : 'bg-white text-accent-dark border border-accent/40 hover:bg-accent-soft'
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
  )
}
