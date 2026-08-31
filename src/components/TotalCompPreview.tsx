import { forwardRef } from 'react'
import type { DistrictConfig, LetterData } from '../types/letter'
import { DistrictHeader } from './DistrictHeader'
import { Signature } from './Signature'
import { computeTotalComp, formatCurrency } from '../utils/totalCompUtils'

interface TotalCompPreviewProps {
  letter: LetterData
  config: DistrictConfig
  scale?: number
}

export const TotalCompPreview = forwardRef<HTMLDivElement, TotalCompPreviewProps>(
  ({ letter, config, scale = 1 }, ref) => {
    const comp = computeTotalComp(letter)

    const recipientName =
      `${letter.recipientFirstName || ''} ${letter.recipientLastName || ''}`.trim() ||
      'Employee Name'

    return (
      <div
        ref={ref}
        id="total-comp-sheet"
        className="letter-sheet bg-white text-gray-900 mx-auto shadow-2xl relative select-text origin-top print:shadow-none print:m-0 print:border-none"
        style={{
          width: '8.5in',
          height: '11in',
          maxHeight: '11in',
          padding: '0.4in 0.75in 0.35in 0.75in',
          boxSizing: 'border-box',
          fontFamily: "'Lora', Georgia, 'Times New Roman', serif",
          fontSize: '9.8pt',
          lineHeight: '1.32',
          transform: scale !== 1 ? `scale(${scale})` : undefined,
          transformOrigin: 'top center',
          overflow: 'hidden',
        }}
      >
        {/* District Official Header */}
        <DistrictHeader config={config} />

        {/* Statement Title */}
        <div className="text-center my-2">
          <h2 className="text-[12pt] font-bold uppercase tracking-wider text-gray-950 border-b border-gray-900 pb-1 inline-block px-4">
            Offer &amp; Total Compensation Statement
          </h2>
        </div>

        {/* Metadata Header Block */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-1 mb-2.5 text-[9.5pt] bg-white p-2.5 rounded border border-gray-300">
          <div>
            <span className="font-semibold text-gray-900">Date:</span>{' '}
            <span>{letter.letterDate || 'August 24, 2026'}</span>
          </div>
          <div>
            <span className="font-semibold text-gray-900">Position Title:</span>{' '}
            <span className="font-medium text-gray-950">{letter.positionTitle || '[Position Title]'}</span>
          </div>
          <div>
            <span className="font-semibold text-gray-900">Employee Name:</span>{' '}
            <span className="font-bold text-gray-950">{recipientName}</span>
          </div>
          <div>
            <span className="font-semibold text-gray-900">Job Classification:</span>{' '}
            <span className="font-medium text-gray-950">{comp.classification}</span>
          </div>
        </div>

        {/* Salutation & Welcome */}
        <div className="mb-2 text-[9.8pt]">
          <p className="font-medium mb-1">Dear {letter.recipientFirstName || recipientName},</p>
          <p className="text-[9.4pt] text-gray-800 leading-snug">
            Welcome to <span className="font-semibold">{config.districtName || 'Cañon City Schools'}</span>!
            We are excited to offer you the position of{' '}
            <span className="font-medium text-gray-950">
              {letter.positionTitle || '[Position Title]'}
            </span>
            . Beyond your base salary, the district invests heavily in your health, retirement, and
            time off. This statement highlights the total value of your complete compensation package.
          </p>
        </div>

        {/* Breakdown Sections */}
        <div className="space-y-2 text-[9.3pt] text-gray-900">
          {/* 1. DIRECT CASH COMPENSATION */}
          <div className="border border-gray-300 rounded p-2 bg-white">
            <div className="font-bold text-[9.6pt] text-gray-950 uppercase tracking-wide mb-1 flex items-center justify-between border-b border-gray-200 pb-0.5">
              <span>1. Direct Cash Compensation</span>
            </div>
            <div className="space-y-0.5 pt-0.5">
              <div className="flex justify-between items-baseline">
                <span className="text-gray-700">
                  • {comp.isHourlyClassified ? 'Baseline Hourly Rate / Schedule' : 'Base Annual Salary'}:
                </span>
                <span className="font-mono font-medium text-gray-950">
                  {comp.formattedBasePay}
                </span>
              </div>
              {comp.stipend > 0 && (
                <div className="flex justify-between items-baseline">
                  <span className="text-gray-700">
                    • Stipends (Hard-to-Fill / Center-Based, if applicable):
                  </span>
                  <span className="font-mono font-medium text-gray-950">
                    {comp.formattedStipend}
                  </span>
                </div>
              )}
              <div className="border-t border-dashed border-gray-300 pt-0.5 mt-0.5 flex justify-between font-bold text-gray-950">
                <span>TOTAL DIRECT CASH PAY:</span>
                <span className="font-mono text-gray-950">{comp.formattedDirectPayTotal}</span>
              </div>
              <div className="text-[7.8pt] italic text-gray-500 pt-0.5">
                *Gross cash pay before employee PERA contributions, state and federal taxes, and Medicare withholdings.
              </div>
            </div>
          </div>

          {/* 2. DISTRICT-PAID INSURANCE BENEFITS */}
          <div className="border border-gray-300 rounded p-2 bg-white">
            <div className="font-bold text-[9.6pt] text-gray-950 uppercase tracking-wide mb-1 flex items-center justify-between border-b border-gray-200 pb-0.5">
              <span>2. District-Paid Insurance Benefits</span>
            </div>
            <div className="space-y-0.5 pt-0.5">
              {comp.healthAnnual > 0 && (
                <div className="flex justify-between items-baseline">
                  <span className="text-gray-700">
                    • Health Insurance Contribution ({formatCurrency(comp.healthMonthlyRate)}/month):
                  </span>
                  <span className="font-mono font-medium text-gray-950">
                    {formatCurrency(comp.healthAnnual)}
                  </span>
                </div>
              )}
              {comp.dentalAnnual > 0 && (
                <div className="flex justify-between items-baseline">
                  <span className="text-gray-700">
                    • Dental Insurance Contribution ({formatCurrency(comp.dentalMonthlyRate)}/month):
                  </span>
                  <span className="font-mono font-medium text-gray-950">
                    {formatCurrency(comp.dentalAnnual)}
                  </span>
                </div>
              )}
              {comp.lifePremiumAnnual > 0 && (
                <div className="flex justify-between items-baseline">
                  <span className="text-gray-700">
                    • Basic Life Insurance Premium ($20,000 Coverage Policy):
                  </span>
                  <span className="font-mono font-medium text-gray-950">
                    {formatCurrency(comp.lifePremiumAnnual)}
                  </span>
                </div>
              )}
              <div className="border-t border-dashed border-gray-300 pt-0.5 mt-0.5 flex justify-between font-bold text-gray-950">
                <span>TOTAL INSURANCE CONTRIBUTIONS:</span>
                <span className="font-mono text-gray-950">{formatCurrency(comp.insuranceTotal)}</span>
              </div>
            </div>
          </div>

          {/* 3. RETIREMENT & MANDATORY STATUTORY CONTRIBUTIONS */}
          <div className="border border-gray-300 rounded p-2 bg-white">
            <div className="font-bold text-[9.6pt] text-gray-950 uppercase tracking-wide mb-1 flex items-center justify-between border-b border-gray-200 pb-0.5">
              <span>3. Retirement &amp; Mandatory Statutory Contributions</span>
            </div>
            <div className="space-y-0.5 pt-0.5">
              <div className="flex justify-between items-baseline">
                <span className="text-gray-700">
                  • Employer PERA Retirement Contribution ({(comp.peraRate * 100).toFixed(2)}%):
                </span>
                <span className="font-mono font-medium text-gray-950">
                  {formatCurrency(comp.peraContribution)}
                </span>
              </div>
              <div className="flex justify-between items-baseline">
                <span className="text-gray-700">
                  • Employer Medicare Contribution ({(comp.medicareRate * 100).toFixed(2)}%):
                </span>
                <span className="font-mono font-medium text-gray-950">
                  {formatCurrency(comp.medicareContribution)}
                </span>
              </div>
              <div className="border-t border-dashed border-gray-300 pt-0.5 mt-0.5 flex justify-between font-bold text-gray-950">
                <span>TOTAL RETIREMENT &amp; STATUTORY CONTRIBUTIONS:</span>
                <span className="font-mono text-gray-950">{formatCurrency(comp.statutoryTotal)}</span>
              </div>
            </div>
          </div>

          {/* 4. PAID TIME OFF & HOLIDAYS ALLOCATION */}
          <div className="border border-gray-300 rounded p-2 bg-white">
            <div className="font-bold text-[9.6pt] text-gray-950 uppercase tracking-wide mb-1 flex items-center justify-between border-b border-gray-200 pb-0.5">
              <span>4. Paid Time Off &amp; Holidays Allocation</span>
            </div>
            <div className="space-y-0.5 pt-0.5">
              {comp.leaveDays > 0 && (
                <div className="flex justify-between items-baseline">
                  <span className="text-gray-700">• Allocated Annual Paid Leave Days:</span>
                  <span className="font-semibold text-gray-950">{comp.leaveDays} Days</span>
                </div>
              )}
              {comp.holidaysDays > 0 && (
                <div className="flex justify-between items-baseline">
                  <span className="text-gray-700">• Paid District Holidays:</span>
                  <span className="font-semibold text-gray-950">
                    {comp.holidaysDays} Days
                  </span>
                </div>
              )}
              {comp.additionalLeavesText && (
                <div className="flex justify-between items-baseline text-[8.8pt] text-gray-600">
                  <span>• Additional Protected Leaves:</span>
                  <span>{comp.additionalLeavesText}</span>
                </div>
              )}
            </div>
          </div>

          {/* GRAND TOTAL CALLOUT BOX (Clean Black on White) */}
          <div className="rounded border-2 border-gray-950 bg-white text-gray-950 p-2.5 flex justify-between items-center">
            <div>
              <div className="text-[10pt] font-bold tracking-wider uppercase text-gray-950">
                Estimated Total Annual Investment
              </div>
              <div className="text-[8.2pt] text-gray-600">
                Direct Pay ({formatCurrency(comp.directPayTotal, { includeCents: false })}) + Benefits &amp; Statutory (
                {formatCurrency(comp.benefitsAndStatutoryTotal, { includeCents: false })})
              </div>
            </div>
            <div className="text-[13.5pt] font-bold font-mono text-gray-950">
              {formatCurrency(comp.grandTotal)}
            </div>
          </div>
        </div>

        {/* Note */}
        <p className="mt-2 text-[8.2pt] italic text-gray-600 leading-snug">
          *Note: Overtime, elective extra-duty stipends (e.g., coaching), and variable sub coverage pay
          are not included in initial hire statements but add further to earned annual pay.*
        </p>

        {/* Sign-off Block */}
        <div className="mt-2 text-[9.5pt] leading-tight space-y-0.5 font-serif text-gray-950">
          <div>Sincerely,</div>

          <div className="py-0.5">
            <Signature
              signerName={letter.signerName || config.defaultSignerName}
              signatureType={letter.signatureType || 'authentic'}
              customSignatureData={letter.customSignatureData}
            />
          </div>

          <div className="font-semibold text-gray-950">
            {letter.signerName || config.defaultSignerName}
          </div>
          <div className="text-gray-700 text-[9pt]">
            {config.districtName || 'Cañon City Schools'} Human Resources
          </div>
        </div>
      </div>
    )
  }
)

TotalCompPreview.displayName = 'TotalCompPreview'
