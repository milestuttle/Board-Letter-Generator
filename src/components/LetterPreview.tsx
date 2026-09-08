import { forwardRef } from 'react'
import type { DistrictConfig, LetterData } from '../types/letter'
import { DistrictHeader } from './DistrictHeader'
import { Signature } from './Signature'
import { generateLetterDocument } from '../utils/letterContent'

interface LetterPreviewProps {
  letter: LetterData
  config: DistrictConfig
  scale?: number
}

export const LetterPreview = forwardRef<HTMLDivElement, LetterPreviewProps>(
  ({ letter, config, scale = 1 }, ref) => {
    const doc = generateLetterDocument(letter, config)

    return (
      <div
        ref={ref}
        id="letter-preview-sheet"
        className="letter-sheet bg-white text-gray-900 mx-auto shadow-2xl relative select-text origin-top print:shadow-none print:m-0 print:border-none"
        style={{
          width: '8.5in',
          height: '11in',
          maxHeight: '11in',
          padding: '0.45in 0.75in 0.4in 0.75in',
          boxSizing: 'border-box',
          fontFamily: "'Lora', Georgia, 'Times New Roman', serif",
          fontSize: '10.5pt',
          lineHeight: '1.38',
          transform: scale !== 1 ? `scale(${scale})` : undefined,
          transformOrigin: 'top center',
          overflow: 'hidden',
        }}
      >
        {/* District Official Header */}
        <DistrictHeader config={config} />

        {/* Letter Date */}
        <div className="mb-3.5 text-[10.5pt] text-gray-900 font-medium">
          {doc.letterDate}
        </div>

        {/* Recipient Address Block */}
        <div className="mb-3.5 text-[10.5pt] text-gray-900 leading-tight space-y-0.5">
          <div className="font-semibold text-gray-950">{doc.recipient.fullName}</div>
          {doc.recipient.streetAddress && <div>{doc.recipient.streetAddress}</div>}
          {doc.recipient.cityStateZip && <div>{doc.recipient.cityStateZip}</div>}
        </div>

        {/* Salutation */}
        <div className="mb-2.5 text-[10.5pt] font-normal">{doc.salutation}</div>

        {/* Dynamic Letter Body Blocks */}
        <div className="space-y-2.5 text-[10.2pt] text-gray-900 text-left leading-[1.38]">
          {doc.blocks.map((block, idx) => {
            if (block.type === 'paragraph') {
              return (
                <p key={idx}>
                  {block.spans.map((span, sIdx) => {
                    if (span.link) {
                      return (
                        <a key={sIdx} href={span.link} className="text-gray-900 underline">
                          {span.text}
                        </a>
                      )
                    }
                    return (
                      <span
                        key={sIdx}
                        className={`${span.bold ? 'font-semibold ' : ''}${
                          span.italic ? 'italic ' : ''
                        }${span.underline ? 'underline ' : ''}`}
                      >
                        {span.text}
                      </span>
                    )
                  })}
                </p>
              )
            }
            if (block.type === 'list') {
              return (
                <div key={idx} className="pt-0.5 pb-0.5">
                  <p className="font-normal mb-1">{block.lead}</p>
                  <ul className="list-disc pl-7 space-y-0.5 text-[10.2pt]">
                    {block.items.map((item, itemIdx) => (
                      <li key={itemIdx}>
                        <strong className="font-semibold">{item.label}</strong> {item.value}
                        {item.extra && ` ${item.extra}`}
                      </li>
                    ))}
                  </ul>
                </div>
              )
            }
            return null
          })}
        </div>

        {/* Sign-off Block */}
        <div className="mt-4 text-[10.5pt] leading-tight space-y-0.5 font-serif text-gray-950">
          <div>{doc.closing.signOff}</div>

          <div className="py-0.5">
            <Signature
              signerName={doc.closing.signerName}
              signatureType={letter.signatureType || 'authentic'}
              customSignatureData={letter.customSignatureData}
            />
          </div>

          <div className="font-semibold text-gray-950">{doc.closing.signerName}</div>
          <div className="text-gray-800 text-[10pt]">{doc.closing.signerTitle}</div>
          <div className="text-gray-800 text-[10pt]">{doc.closing.organization}</div>

          {/* Footer Initials & Cc */}
          <div className="pt-2 text-[9.5pt] text-gray-700 space-y-0.5">
            <div>{doc.closing.typistInitials}</div>
            <div>{doc.closing.ccLine}</div>
          </div>
        </div>
      </div>
    )
  }
)

LetterPreview.displayName = 'LetterPreview'
