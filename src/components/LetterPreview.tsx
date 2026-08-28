import { forwardRef } from 'react'
import type { DistrictConfig, LetterData } from '../types/letter'
import { DistrictHeader } from './DistrictHeader'
import { Signature } from './Signature'
import { formatCertifiedSalary, formatClassifiedWage } from '../utils/formatUtils'

interface LetterPreviewProps {
  letter: LetterData
  config: DistrictConfig
  scale?: number
}

export const LetterPreview = forwardRef<HTMLDivElement, LetterPreviewProps>(
  ({ letter, config, scale = 1 }, ref) => {
    const salutation =
      letter.customSalutation ||
      (letter.type === 'transfer'
        ? `Dear ${letter.recipientFirstName || 'Employee'}:`
        : `Dear ${letter.recipientFirstName || 'Employee'},`)

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
          {letter.letterDate || 'August 24, 2026'}
        </div>

        {/* Recipient Address Block */}
        <div className="mb-3.5 text-[10.5pt] text-gray-900 leading-tight space-y-0.5">
          <div className="font-semibold text-gray-950">
            {letter.recipientFirstName} {letter.recipientLastName}
          </div>
          {letter.streetAddress && <div>{letter.streetAddress}</div>}
          {(letter.city || letter.state || letter.zip) && (
            <div>
              {letter.city}
              {letter.city && letter.state ? ', ' : ''}
              {letter.state} {letter.zip}
            </div>
          )}
        </div>

        {/* Salutation */}
        <div className="mb-2.5 text-[10.5pt] font-normal">{salutation}</div>

        {/* Dynamic Letter Body Content Based on Type */}
        <div className="space-y-2.5 text-[10.2pt] text-gray-900 text-justify leading-[1.38]">
          {/* ================= CERTIFIED ================= */}
          {letter.type === 'certified' && (
            <>
              <p>
                On behalf of Cañon City Schools, we are pleased to inform you that the Board of
                Education at its regular meeting on{' '}
                <span className="font-medium">{letter.boardMeetingDate}</span> has officially
                approved your employment in a new role as a{' '}
                <span className="font-semibold">{letter.positionTitle || '[Position]'}</span>,{' '}
                <span className="font-medium">{letter.location || 'District-wide'}</span>, for
                the <span className="font-medium">{letter.schoolYear}</span> school year.
              </p>

              <p>
                We are excited to welcome you to our team and look forward to the contributions you
                will make to support our students, staff, and community. While this letter serves
                as formal notification of your board-approved employment, an official contract will
                be issued through your online employee portal.
              </p>

              <div className="pt-0.5 pb-0.5">
                <p className="font-normal mb-1">
                  Your initial placement on the certified salary schedule is as follows:
                </p>
                <ul className="list-disc pl-7 space-y-0.5 text-[10.2pt]">
                  <li>
                    <strong className="font-semibold">Lane:</strong>{' '}
                    {letter.certified?.lane || '[Lane]'}
                  </li>
                  <li>
                    <strong className="font-semibold">Step:</strong>{' '}
                    {letter.certified?.step || '[Step]'}
                  </li>
                  <li>
                    <strong className="font-semibold">Base Salary:</strong>{' '}
                    {formatCertifiedSalary(letter.certified?.baseSalary) || '[Base Salary]'}
                  </li>
                  <li>
                    <strong className="font-semibold">Start Date:</strong>{' '}
                    {letter.certified?.startDate || '[Start Date]'}
                  </li>
                </ul>
              </div>

              <p>
                If you have any questions or need additional information, please don’t hesitate to
                contact our Human Resources Department at{' '}
                <a
                  href={`mailto:${config.hrEmail}`}
                  className="text-gray-900 underline"
                >
                  {config.hrEmail}
                </a>{' '}
                or {config.hrPhone}.
              </p>

              <p>
                Again, congratulations and welcome to Cañon City Schools! The District’s mission is,{' '}
                <span className="italic">{config.missionStatement}</span> and we are confident your
                passion, skills, and dedication will make a meaningful impact on our students and community.
                Welcome aboard!
              </p>
            </>
          )}

          {/* ================= CLASSIFIED ================= */}
          {letter.type === 'classified' && (
            <>
              <p>
                On behalf of Cañon City Schools, we are pleased to inform you that the Board of
                Education at its regular meeting on{' '}
                <span className="font-medium">{letter.boardMeetingDate}</span> has officially
                approved your employment as a{' '}
                <span className="font-semibold">{letter.positionTitle || '[Position]'}</span> at{' '}
                <span className="font-medium">{letter.location || '[Location]'}</span> for the{' '}
                <span className="font-medium">{letter.schoolYear}</span> school year.
              </p>

              <p>
                We are excited to welcome you to our team and look forward to the contributions you
                will make to support our students, staff, and community. While this letter serves
                as formal notification of your board-approved employment, your work agreement will
                be issued at a later date through our online employee portal.
              </p>

              <div className="pt-0.5 pb-0.5">
                <p className="font-normal mb-1">
                  Your initial placement on the classified salary schedule is as follows:
                </p>
                <ul className="list-disc pl-7 space-y-0.5 text-[10.2pt]">
                  <li>
                    <strong className="font-semibold">Classification:</strong>{' '}
                    {letter.classified?.classification || '[Classification]'}
                  </li>
                  <li>
                    <strong className="font-semibold">Level:</strong>{' '}
                    {letter.classified?.level || '[Level]'}
                  </li>
                  <li>
                    <strong className="font-semibold">Base Wage:</strong>{' '}
                    {formatClassifiedWage(letter.classified?.baseWage) || '[Base Wage]'}
                    {letter.classified?.stipendText ? ` (${letter.classified.stipendText})` : ''}
                  </li>
                  <li>
                    <strong className="font-semibold">Start Date:</strong>{' '}
                    {letter.classified?.startDate || '[Start Date]'}
                  </li>
                </ul>
              </div>

              <p>
                If you have any questions or need additional information, please don’t hesitate to
                contact our Human Resources Department at{' '}
                <a
                  href={`mailto:${config.hrEmail}`}
                  className="text-gray-900 underline"
                >
                  {config.hrEmail}
                </a>{' '}
                or {config.hrPhone}.
              </p>

              <p>
                Again, congratulations and welcome to Cañon City Schools! The District’s mission is,{' '}
                <span className="italic">{config.missionStatement}</span> and we are confident your
                passion, skills, and dedication will make a meaningful impact on our students and community.
                Welcome aboard!
              </p>
            </>
          )}

          {/* ================= TRANSFER ================= */}
          {letter.type === 'transfer' && (
            <div className="space-y-3.5 pt-1">
              <p>
                The Board of Education, at its regular meeting on{' '}
                <span className="font-medium">{letter.boardMeetingDate}</span>, took action to
                approve{' '}
                <span>
                  {letter.transfer?.transferDescription ||
                    `your transfer in position and hours to ${letter.positionTitle || letter.transfer?.newPosition || '[Position]'} at ${letter.location || letter.transfer?.newLocation || '[Location]'}`}
                </span>{' '}
                effective{' '}
                <span className="font-medium">
                  {letter.transfer?.effectiveDate || 'August 12, 2026'}
                </span>{' '}
                for the <span className="font-medium">{letter.schoolYear}</span> School Year.
              </p>

              <p className="pt-1">
                Congratulations on your previous success and good luck in this position!
              </p>
            </div>
          )}

          {/* ================= RESIGNATION ================= */}
          {letter.type === 'resignation' && (
            <div className="space-y-3.5 pt-1">
              <p>
                The Board of Education, at its regular meeting on{' '}
                <span className="font-medium">{letter.boardMeetingDate}</span>, officially took
                action to accept your resignation from your position as{' '}
                <span className="font-semibold">
                  {letter.resignation?.position || letter.positionTitle || '[Position]'}
                </span>{' '}
                at{' '}
                <span className="font-medium">
                  {letter.resignation?.location || letter.location || '[Location]'}
                </span>
                , effective{' '}
                <span className="font-medium">
                  {letter.resignation?.effectiveDate || 'June 30, 2026'}
                </span>{' '}
                for the <span className="font-medium">{letter.schoolYear}</span> school year.
              </p>

              <p>
                {letter.resignation?.customAppreciation ||
                  'Thank you for your dedicated service and commitment to the students, staff, and families of Cañon City Schools. We wish you the very best in all of your future personal and professional endeavors.'}
              </p>

              <p className="text-[10pt]">
                If you have any questions regarding end-of-service documentation or benefits
                transitions, please contact our Human Resources Department at {config.hrEmail} or{' '}
                {config.hrPhone}.
              </p>
            </div>
          )}

          {/* ================= RETIREMENT ================= */}
          {letter.type === 'retirement' && (
            <div className="space-y-3.5 pt-1">
              <p>
                The Board of Education, at their regular meeting on{' '}
                <span className="font-medium">{letter.boardMeetingDate}</span>, approved your
                request for retirement as{' '}
                <span className="font-semibold">
                  {letter.positionTitle || letter.retirement?.position || '[POSITION]'}
                </span>{' '}
                at{' '}
                <span className="font-medium">
                  {letter.location || letter.retirement?.location || '[LOCATION]'}
                </span>{' '}
                effective{' '}
                <span className="font-medium">
                  {letter.retirement?.effectiveDate || '[DATE]'}
                </span>
                {letter.retirement?.includeRemainderOfYear ? (
                  <span>
                    {' '}
                    {letter.retirement.remainderYearText ||
                      `for the remainder of the ${letter.schoolYear} School Year.`}
                  </span>
                ) : (
                  '.'
                )}
              </p>

              <p>
                {letter.retirement?.celebrationText ||
                  'We will be holding a celebration for retirees in April, 2027. Please watch for more detailed information to be shared closer to the event.'}
              </p>

              <p>
                Thank you for your service to the Cañon City School District. Your{' '}
                <span className="font-semibold">
                  {letter.retirement?.yearsOfService
                    ? `${letter.retirement.yearsOfService} Years`
                    : 'XX Years'}
                </span>{' '}
                of service with the District are very much appreciated. We wish you the best in
                your future endeavors!
              </p>
            </div>
          )}
        </div>

        {/* Sign-off Block */}
        <div className="mt-4 text-[10.5pt] leading-tight space-y-0.5 font-serif text-gray-950">
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
          <div className="text-gray-800 text-[10pt]">
            {letter.signerTitle || config.defaultSignerTitle}
          </div>
          <div className="text-gray-800 text-[10pt]">Cañon City Schools</div>

          {/* Footer Initials & Cc */}
          <div className="pt-2 text-[9.5pt] text-gray-700 space-y-0.5">
            <div>{letter.typistInitials || config.defaultTypistInitials}</div>
            <div>{letter.ccLine || config.defaultCc}</div>
          </div>
        </div>
      </div>
    )
  }
)

LetterPreview.displayName = 'LetterPreview'
