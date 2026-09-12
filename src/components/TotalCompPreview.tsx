import { forwardRef } from 'react'
import type { DistrictConfig, LetterData } from '../types/letter'
import { DistrictHeader } from './DistrictHeader'
import { Signature } from './Signature'
import { computeTotalComp } from '../utils/totalCompUtils'
import { generateTotalCompDocument } from '../utils/totalCompContent'

interface TotalCompPreviewProps {
  letter: LetterData
  config: DistrictConfig
  scale?: number
}

export const TotalCompPreview = forwardRef<HTMLDivElement, TotalCompPreviewProps>(
  ({ letter, config, scale = 1 }, ref) => {
    const comp = computeTotalComp(letter, config)
    const doc = generateTotalCompDocument(letter, config)
    const [cashSection, insuranceSection, statutorySection, ptoSection] = doc.sections

    return (
      <div
        ref={ref}
        id="total-comp-sheet"
        className="letter-sheet bg-white text-gray-900 mx-auto shadow-2xl relative select-text origin-top print:shadow-none print:m-0 print:border-none shrink-0"
        style={{
          width: '8.5in',
          minWidth: '8.5in',
          maxWidth: '8.5in',
          height: '11in',
          minHeight: '11in',
          maxHeight: '11in',
          padding: '0.35in 0.65in 0.35in 0.65in',
          boxSizing: 'border-box',
          fontFamily: "'Lora', Georgia, 'Times New Roman', serif",
          fontSize: '9pt',
          lineHeight: '1.28',
          transform: scale !== 1 ? `scale(${scale})` : undefined,
          transformOrigin: 'top center',
          overflow: 'hidden',
        }}
      >
        {/* District Official Header */}
        <DistrictHeader config={config} compact={true} />

        {/* Statement Title */}
        <div className="text-center my-1">
          <h2 className="text-[11pt] font-bold uppercase tracking-wider text-gray-950 border-b border-gray-900 pb-0.5 inline-block px-3">
            Offer &amp; Total Compensation Statement
          </h2>
        </div>

        {/* Metadata Header Block */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-0.5 mb-1.5 text-[8.8pt] bg-white p-2 rounded border border-gray-300">
          <div>
            <span className="font-semibold text-gray-900">Date:</span>{' '}
            <span>{doc.date}</span>
          </div>
          <div>
            <span className="font-semibold text-gray-900">Position Title:</span>{' '}
            <span className="font-medium text-gray-950">{doc.positionTitle}</span>
          </div>
          <div>
            <span className="font-semibold text-gray-900">Employee Name:</span>{' '}
            <span className="font-bold text-gray-950">{doc.employeeName}</span>
          </div>
          <div>
            <span className="font-semibold text-gray-900">Job Classification:</span>{' '}
            <span className="font-medium text-gray-950">{doc.classificationText}</span>
          </div>
        </div>

        {/* Salutation & Welcome */}
        <div className="mb-1.5 text-[8.8pt] leading-snug">
          <p className="font-medium mb-0.5">{doc.salutation}</p>
          <p className="text-[8.6pt] text-gray-800 leading-snug">{doc.welcomeParagraph}</p>
        </div>

        {/* Breakdown Sections */}
        <div className="space-y-1.5 text-[8.8pt] text-gray-900">
          {/* 1. DIRECT CASH COMPENSATION */}
          <div className="border border-gray-300 rounded p-1.5 bg-white">
            <div className="font-bold text-[9pt] text-gray-950 uppercase tracking-wide mb-0.5 flex items-center justify-between border-b border-gray-200 pb-0.5">
              <span>{cashSection.heading}</span>
            </div>
            <div className="space-y-0.5 pt-0.5">
              {cashSection.items.map((item, idx) => (
                <div key={idx} className="flex justify-between items-baseline">
                  <span className="text-gray-700">• {item.label}:</span>
                  <span className="font-mono font-medium text-gray-950">{item.value}</span>
                </div>
              ))}
              <div className="border-t border-dashed border-gray-300 pt-0.5 mt-0.5 flex justify-between font-bold text-gray-950 text-[8.8pt]">
                <span>{cashSection.totalLabel}:</span>
                <span className="font-mono text-gray-950">{cashSection.totalValue}</span>
              </div>
              {cashSection.footnote && (
                <div className="text-[7.2pt] italic text-gray-500 pt-0.5">*{cashSection.footnote}</div>
              )}
            </div>
          </div>

          {/* 2. DISTRICT-PAID INSURANCE BENEFITS */}
          <div className="border border-gray-300 rounded p-1.5 bg-white">
            <div className="font-bold text-[9pt] text-gray-950 uppercase tracking-wide mb-0.5 flex items-center justify-between border-b border-gray-200 pb-0.5">
              <span>{insuranceSection.heading}</span>
              {comp.fte < 1.0 && (
                <span className="text-[7.5pt] text-gray-600 font-normal italic">
                  {comp.benefitEligibilityNote}
                </span>
              )}
            </div>
            <div className="space-y-0.5 pt-0.5">
              {insuranceSection.items.map((item, idx) => (
                <div key={idx} className="flex justify-between items-baseline">
                  <span className="text-gray-700">• {item.label}:</span>
                  <span className="font-mono font-medium text-gray-950">{item.value}</span>
                </div>
              ))}
              {insuranceSection.footnote && (
                <div className="text-[7.4pt] italic text-gray-500 pt-0.5">*{insuranceSection.footnote}</div>
              )}
              <div className="border-t border-dashed border-gray-300 pt-0.5 mt-0.5 flex justify-between font-bold text-gray-950 text-[8.8pt]">
                <span>{insuranceSection.totalLabel}:</span>
                <span className="font-mono text-gray-950">{insuranceSection.totalValue}</span>
              </div>
            </div>
          </div>

          {/* 3. RETIREMENT & MANDATORY STATUTORY CONTRIBUTIONS */}
          <div className="border border-gray-300 rounded p-1.5 bg-white">
            <div className="font-bold text-[9pt] text-gray-950 uppercase tracking-wide mb-0.5 flex items-center justify-between border-b border-gray-200 pb-0.5">
              <span>{statutorySection.heading}</span>
            </div>
            <div className="space-y-0.5 pt-0.5">
              {statutorySection.items.map((item, idx) => (
                <div key={idx} className="flex justify-between items-baseline">
                  <span className="text-gray-700">• {item.label}:</span>
                  <span className="font-mono font-medium text-gray-950">{item.value}</span>
                </div>
              ))}
              <div className="border-t border-dashed border-gray-300 pt-0.5 mt-0.5 flex justify-between font-bold text-gray-950 text-[8.8pt]">
                <span>{statutorySection.totalLabel}:</span>
                <span className="font-mono text-gray-950">{statutorySection.totalValue}</span>
              </div>
            </div>
          </div>

          {/* 4. PAID TIME OFF & HOLIDAYS ALLOCATION */}
          <div className="border border-gray-300 rounded p-1.5 bg-white">
            <div className="font-bold text-[9pt] text-gray-950 uppercase tracking-wide mb-0.5 flex items-center justify-between border-b border-gray-200 pb-0.5">
              <span>{ptoSection.heading}</span>
            </div>
            <div className="space-y-0.5 pt-0.5">
              {ptoSection.items.map((item, idx) => (
                <div key={idx} className="flex justify-between items-baseline">
                  <span className="text-gray-700">• {item.label}:</span>
                  <span className="font-semibold text-gray-950">{item.value}</span>
                </div>
              ))}
              {ptoSection.footnote && (
                <div className="text-[7.2pt] italic text-gray-500 pt-0.5">{ptoSection.footnote}</div>
              )}
            </div>
          </div>

          {/* GRAND TOTAL CALLOUT BOX (Clean Black on White) */}
          <div className="rounded border-2 border-gray-950 bg-white text-gray-950 px-2.5 py-1.5 flex justify-between items-center">
            <div>
              <div className="text-[9.5pt] font-bold tracking-wider uppercase text-gray-950">
                {doc.grandTotalLabel}
              </div>
              <div className="text-[7.8pt] text-gray-600">{doc.grandTotalSubtext}</div>
            </div>
            <div className="text-[12.5pt] font-bold font-mono text-gray-950">{doc.grandTotalValue}</div>
          </div>
        </div>

        {/* Note */}
        <p className="mt-1 text-[7.5pt] italic text-gray-600 leading-tight">*Note: {doc.disclaimerNote}*</p>

        {/* Sign-off Block */}
        <div className="mt-1 text-[8.8pt] leading-tight space-y-0 font-serif text-gray-950">
          <div>{doc.signOff}</div>

          <div className="py-0">
            <Signature
              signerName={doc.signerName}
              signatureType={letter.signatureType || 'authentic'}
              customSignatureData={letter.customSignatureData}
              className="!h-8 !py-0"
            />
          </div>

          <div className="font-semibold text-gray-950 text-[9pt] mt-0.5">{doc.signerName}</div>
          <div className="text-gray-700 text-[8.5pt]">{doc.signerOrg}</div>
        </div>
      </div>
    )
  }
)

TotalCompPreview.displayName = 'TotalCompPreview'
