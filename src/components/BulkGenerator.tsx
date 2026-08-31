import React, { useState, useEffect, useRef } from 'react'
import type { LetterData, LetterType, DistrictConfig } from '../types/letter'
import { LetterPreview } from './LetterPreview'
import {
  Upload,
  FileSpreadsheet,
  Printer,
  ChevronLeft,
  ChevronRight,
  Trash2,
  Plus,
  Download,
  CheckCircle,
  FileText,
  Bookmark,
} from 'lucide-react'
import { formatCertifiedSalary, formatClassifiedWage } from '../utils/formatUtils'

interface BulkGeneratorProps {
  config: DistrictConfig
  onClose: () => void
  onLoadSingle: (letter: LetterData, allBatch?: LetterData[]) => void
  onSaveBatchAsDrafts?: (letters: LetterData[]) => void
}

export const BulkGenerator: React.FC<BulkGeneratorProps> = ({
  config,
  onClose,
  onLoadSingle,
  onSaveBatchAsDrafts,
}) => {
  const [activeType, setActiveType] = useState<LetterType>('certified')
  const [boardMeetingDate] = useState(config.defaultBoardMeetingDate || 'August 24, 2026')
  const [letterDate] = useState(config.defaultBoardMeetingDate || 'August 24, 2026')
  const [schoolYear] = useState(config.defaultSchoolYear || '2026-2027')
  
  const [batchLetters, setBatchLetters] = useState<LetterData[]>(() => {
    const saved = localStorage.getItem('ccs_batch_letters')
    return saved ? JSON.parse(saved) : []
  })
  const [selectedIndex, setSelectedIndex] = useState<number>(0)
  const [isConfirmingClearBatch, setIsConfirmingClearBatch] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Persist batch letters so closing/reopening or editing single retains batch roster
  useEffect(() => {
    localStorage.setItem('ccs_batch_letters', JSON.stringify(batchLetters))
  }, [batchLetters])

  // Pre-fill sample batch
  const handleLoadSampleBatch = (type: LetterType) => {
    setActiveType(type)
    if (type === 'certified') {
      setBatchLetters([
        {
          id: 'batch-1',
          type: 'certified',
          letterDate,
          boardMeetingDate,
          schoolYear,
          recipientFirstName: 'Stacy',
          recipientLastName: 'Andrews',
          streetAddress: '1431 Lombard Street',
          city: 'Cañon City',
          state: 'CO',
          zip: '81212',
          positionTitle: 'Part-time Lead Counselor',
          location: 'District-wide',
          certified: {
            lane: 'MA+48',
            step: '23',
            baseSalary: '$21,032',
            startDate: 'September 1, 2026',
          },
        },
        {
          id: 'batch-2',
          type: 'certified',
          letterDate,
          boardMeetingDate,
          schoolYear,
          recipientFirstName: 'Marcus',
          recipientLastName: 'Vance',
          streetAddress: '420 Orchard Ave',
          city: 'Cañon City',
          state: 'CO',
          zip: '81212',
          positionTitle: 'High School Mathematics Teacher',
          location: 'Cañon City High School',
          certified: {
            lane: 'BA+24',
            step: '5',
            baseSalary: '$51,800',
            startDate: 'August 18, 2026',
          },
        },
        {
          id: 'batch-3',
          type: 'certified',
          letterDate,
          boardMeetingDate,
          schoolYear,
          recipientFirstName: 'Elena',
          recipientLastName: 'Rostova',
          streetAddress: '883 Greenwood Ave',
          city: 'Cañon City',
          state: 'CO',
          zip: '81212',
          positionTitle: 'Speech Language Pathologist',
          location: 'District-wide',
          certified: {
            lane: 'MA+36',
            step: '8',
            baseSalary: '$58,450',
            startDate: 'August 18, 2026',
          },
        },
      ])
    } else if (type === 'classified') {
      setBatchLetters([
        {
          id: 'batch-c1',
          type: 'classified',
          letterDate,
          boardMeetingDate,
          schoolYear,
          recipientFirstName: 'Sharla',
          recipientLastName: 'McGuire',
          streetAddress: '804 Harding Avenue',
          city: 'Cañon City',
          state: 'CO',
          zip: '81212',
          positionTitle: 'School Health Technician',
          location: 'Cañon City High School',
          classified: {
            classification: 'P6',
            level: 'E',
            baseWage: '$19.67',
            startDate: 'August 20, 2026',
          },
        },
        {
          id: 'batch-c2',
          type: 'classified',
          letterDate,
          boardMeetingDate,
          schoolYear,
          recipientFirstName: 'Kari',
          recipientLastName: 'Smith',
          streetAddress: '614 S Broadway, Unit A',
          city: 'Penrose',
          state: 'CO',
          zip: '81240',
          positionTitle: 'Significant Needs (SSN) Special Education Paraprofessional',
          location: 'Cañon City Middle School',
          classified: {
            classification: 'P5',
            level: 'D',
            baseWage: '$18.56',
            stipendText: 'Plus a center-based stipend of $2,000',
            startDate: 'August 17, 2026',
          },
        },
        {
          id: 'batch-c3',
          type: 'classified',
          letterDate,
          boardMeetingDate,
          schoolYear,
          recipientFirstName: 'Michelle',
          recipientLastName: 'Krug',
          streetAddress: '1626 G Path',
          city: 'Cotopaxi',
          state: 'CO',
          zip: '82223',
          positionTitle: 'Center-Based Special Education Paraprofessional',
          location: 'Lincoln School of Science and Technology',
          classified: {
            classification: 'P5',
            level: 'C',
            baseWage: '$18.57',
            stipendText: 'Plus a center-based stipend of $2,000',
            startDate: 'August 12, 2026',
          },
        },
      ])
    } else if (type === 'retirement') {
      setBatchLetters([
        {
          id: 'batch-r1',
          type: 'retirement',
          letterDate,
          boardMeetingDate,
          schoolYear,
          recipientFirstName: 'Margaret',
          recipientLastName: 'Holloway',
          streetAddress: '412 Main Street',
          city: 'Cañon City',
          state: 'CO',
          zip: '81212',
          positionTitle: 'Elementary Teacher',
          location: 'Washington Elementary School',
          retirement: {
            position: 'Elementary Teacher',
            location: 'Washington Elementary School',
            effectiveDate: 'June 5, 2026',
            actionType: 'approved_request',
            includeRemainderOfYear: false,
            yearsOfService: '25',
            celebrationText:
              'We will be holding a celebration for retirees in April, 2027. Please watch for more detailed information to be shared closer to the event.',
          },
        },
        {
          id: 'batch-r2',
          type: 'retirement',
          letterDate,
          boardMeetingDate,
          schoolYear: '2025/2026',
          recipientFirstName: 'Robert',
          recipientLastName: 'Vance',
          streetAddress: '1209 Elm Avenue',
          city: 'Cañon City',
          state: 'CO',
          zip: '81212',
          positionTitle: 'High School Counselor',
          location: 'Cañon City High School',
          retirement: {
            position: 'High School Counselor',
            location: 'Cañon City High School',
            effectiveDate: 'May 29, 2026',
            actionType: 'approved_request',
            includeRemainderOfYear: true,
            remainderYearText: 'for the remainder of the 2025/2026 School Year.',
            yearsOfService: '20',
            celebrationText:
              'We will be holding a celebration for retirees from 5:00 pm to 7:30 pm on Tuesday, May 5th, 2026. Please watch for more detailed information to be shared closer to the event.',
          },
        },
      ])
    }
    setSelectedIndex(0)
  }

  // Parse CSV
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const text = event.target?.result as string
      if (!text) return

      const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0)
      if (lines.length <= 1) return

      const headers = lines[0].split(',').map((h) => h.trim().toLowerCase().replace(/["']/g, ''))
      
      const parsed: LetterData[] = []
      for (let i = 1; i < lines.length; i++) {
        const row = lines[i].match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || lines[i].split(',')
        const cleanRow = row.map((val) => val.trim().replace(/^"|"$/g, ''))

        const getVal = (colName: string) => {
          const idx = headers.findIndex((h) => h.includes(colName.toLowerCase()))
          return idx >= 0 && cleanRow[idx] ? cleanRow[idx] : ''
        }

        const firstName = getVal('first') || cleanRow[0] || 'First'
        const lastName = getVal('last') || cleanRow[1] || 'Last'
        const address = getVal('address') || getVal('street') || cleanRow[2] || ''
        const city = getVal('city') || 'Cañon City'
        const state = getVal('state') || 'CO'
        const zip = getVal('zip') || '81212'
        const position = getVal('position') || getVal('role') || getVal('title') || 'Staff Member'
        const location = getVal('location') || getVal('school') || 'District-wide'
        
        const item: LetterData = {
          id: `batch-${Date.now()}-${i}`,
          type: activeType,
          letterDate,
          boardMeetingDate,
          schoolYear,
          recipientFirstName: firstName,
          recipientLastName: lastName,
          streetAddress: address,
          city,
          state,
          zip,
          positionTitle: position,
          location,
          signerName: config.defaultSignerName,
          signerTitle: config.defaultSignerTitle,
          typistInitials: config.defaultTypistInitials,
          ccLine: config.defaultCc,
          signatureType: 'authentic',
        }

        if (activeType === 'certified') {
          item.certified = {
            lane: getVal('lane') || 'BA',
            step: getVal('step') || '1',
            baseSalary: formatCertifiedSalary(getVal('salary') || '$45,000'),
            startDate: getVal('start') || 'August 20, 2026',
          }
        } else if (activeType === 'classified') {
          item.classified = {
            classification: getVal('class') || 'P5',
            level: getVal('level') || 'A',
            baseWage: formatClassifiedWage(getVal('wage') || '$18.00'),
            stipendText: getVal('stipend') || '',
            startDate: getVal('start') || 'August 20, 2026',
          }
        } else if (activeType === 'transfer') {
          item.transfer = {
            newPosition: position,
            newLocation: location,
            transferDescription:
              getVal('description') ||
              `your transfer in position and hours to ${position} at ${location}`,
            effectiveDate: getVal('effective') || getVal('start') || 'August 12, 2026',
          }
        } else if (activeType === 'resignation') {
          item.resignation = {
            position,
            location,
            effectiveDate: getVal('effective') || 'June 30, 2026',
            customAppreciation: getVal('appreciation') || '',
          }
        }

        parsed.push(item)
      }

      if (parsed.length > 0) {
        setBatchLetters(parsed)
        setSelectedIndex(0)
      }
    }

    reader.readAsText(file)
  }

  // Download Sample CSV
  const handleDownloadSampleCsv = () => {
    let csvHeader = ''
    let csvRow = ''

    if (activeType === 'certified') {
      csvHeader = 'FirstName,LastName,StreetAddress,City,State,Zip,Position,Location,Lane,Step,Salary,StartDate'
      csvRow = 'Stacy,Andrews,"1431 Lombard Street",Cañon City,CO,81212,"Part-time Lead Counselor",District-wide,MA+48,23,"$21,032","September 1, 2026"'
    } else if (activeType === 'classified') {
      csvHeader = 'FirstName,LastName,StreetAddress,City,State,Zip,Position,Location,Classification,Level,BaseWage,Stipend,StartDate'
      csvRow = 'Sharla,McGuire,"804 Harding Avenue",Cañon City,CO,81212,"School Health Technician","Cañon City High School",P6,E,"$19.67","","August 20, 2026"'
    } else if (activeType === 'transfer') {
      csvHeader = 'FirstName,LastName,StreetAddress,City,State,Zip,Position,Location,Description,EffectiveDate'
      csvRow = 'Cecelia,Cash,"1030 High Street",Cañon City,CO,81212,"Crossing Guard / Noon Aide","Washington Elementary School","your transfer in position and hours back to Crossing Guard / Noon Aide at Washington Elementary School","August 12, 2026"'
    } else {
      csvHeader = 'FirstName,LastName,StreetAddress,City,State,Zip,Position,Location,EffectiveDate'
      csvRow = 'Sarah,Jenkins,"522 Greenwood Ave",Cañon City,CO,81212,"4th Grade Teacher","Harrison Elementary School","August 15, 2026"'
    }

    const blob = new Blob([`${csvHeader}\n${csvRow}\n`], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', `sample_${activeType}_board_letters.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Batch Print All Letters
  const handleBatchPrint = () => {
    window.print()
  }

  const currentLetter = batchLetters[selectedIndex]

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex flex-col p-4 md:p-6 overflow-y-auto">
      <div className="bg-slate-100 rounded-3xl shadow-2xl border border-slate-300 w-full max-w-7xl mx-auto flex flex-col max-h-[95vh] overflow-hidden">
        {/* Header Bar */}
        <div className="px-6 py-4 bg-white border-b border-slate-200 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-md">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Bulk Board Letter Batch Generator
              </h2>
              <p className="text-xs text-slate-500">
                Upload a board agenda roster CSV or populate multiple letters for 1-click batch printing.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {batchLetters.length > 0 && (
              <>
                <button
                  type="button"
                  onClick={() => {
                    if (onSaveBatchAsDrafts) {
                      onSaveBatchAsDrafts(batchLetters)
                    }
                  }}
                  className="px-3.5 py-2 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
                  title="Save all batch letters to your Drafts list"
                >
                  <Bookmark className="w-4 h-4 text-amber-600" />
                  Save All as Drafts ({batchLetters.length})
                </button>

                <button
                  type="button"
                  onClick={handleBatchPrint}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-xs transition cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  Print All {batchLetters.length} Letters
                </button>
              </>
            )}
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition cursor-pointer"
            >
              Close Batch Mode
            </button>
          </div>
        </div>

        {/* Control Bar */}
        <div className="px-6 py-3 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <label className="text-xs font-bold text-slate-600">Batch Type:</label>
            <div className="inline-flex rounded-xl bg-slate-200 p-1">
              {(['certified', 'classified', 'transfer', 'resignation', 'retirement'] as LetterType[]).map(
                (type) => (
                  <button
                    key={type}
                    onClick={() => setActiveType(type)}
                    className={`px-3 py-1 text-xs rounded-lg font-semibold capitalize transition cursor-pointer ${
                      activeType === type
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {type}
                  </button>
                )
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleLoadSampleBatch(activeType)}
              className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-medium text-slate-700 transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <CheckCircle className="w-3.5 h-3.5 text-blue-600" />
              Load Sample Batch
            </button>

            <button
              type="button"
              onClick={handleDownloadSampleCsv}
              className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-medium text-slate-700 transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              CSV Template
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Upload className="w-3.5 h-3.5" />
              Upload CSV
            </button>
          </div>
        </div>

        {/* Content Body: Sidebar list + Live Letter Preview */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 p-6 overflow-hidden">
          {/* Left Column: Letter Roster List */}
          <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 p-4 flex flex-col overflow-hidden shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Batch Recipients ({batchLetters.length})
              </span>
              <div className="flex items-center gap-2">
                {batchLetters.length > 0 && (
                  <>
                    {isConfirmingClearBatch ? (
                      <div className="flex items-center gap-1 bg-red-50 px-2 py-0.5 rounded-lg border border-red-200">
                        <span className="text-[10px] font-semibold text-red-700">Clear?</span>
                        <button
                          type="button"
                          onClick={() => {
                            setBatchLetters([])
                            setIsConfirmingClearBatch(false)
                            localStorage.removeItem('ccs_batch_letters')
                          }}
                          className="text-[10px] bg-red-600 hover:bg-red-700 text-white px-1.5 py-0.5 rounded font-bold transition cursor-pointer"
                        >
                          Yes
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsConfirmingClearBatch(false)}
                          className="text-[10px] text-slate-500 hover:text-slate-700 px-1 py-0.5 font-medium cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setIsConfirmingClearBatch(true)}
                        className="text-xs text-slate-400 hover:text-red-600 font-medium cursor-pointer"
                        title="Clear batch list"
                      >
                        Clear
                      </button>
                    )}
                  </>
                )}
                <button
                  type="button"
                  onClick={() => {
                    const newRec: LetterData = {
                      id: `batch-${Date.now()}`,
                      type: activeType,
                      letterDate,
                      boardMeetingDate,
                      schoolYear,
                      recipientFirstName: 'New',
                      recipientLastName: 'Employee',
                      streetAddress: '101 Main St',
                      city: 'Cañon City',
                      state: 'CO',
                      zip: '81212',
                      positionTitle: 'Position Title',
                      location: 'Cañon City High School',
                    }
                    setBatchLetters([...batchLetters, newRec])
                    setSelectedIndex(batchLetters.length)
                  }}
                  className="text-xs text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Staff
                </button>
              </div>
            </div>

            {batchLetters.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-slate-400">
                <FileSpreadsheet className="w-12 h-12 stroke-[1.5] mb-2 text-slate-300" />
                <p className="text-sm font-medium text-slate-600">No batch letters loaded</p>
                <p className="text-xs text-slate-400 mt-1 max-w-xs">
                  Click &ldquo;Load Sample Batch&rdquo; or upload a CSV containing staff info to preview and batch generate.
                </p>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                {batchLetters.map((item, idx) => (
                  <div
                    key={item.id}
                    onClick={() => setSelectedIndex(idx)}
                    className={`p-3 rounded-xl border transition cursor-pointer flex items-center justify-between ${
                      selectedIndex === idx
                        ? 'border-blue-500 bg-blue-50/70 shadow-xs ring-1 ring-blue-500/30'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="overflow-hidden">
                      <div className="text-sm font-bold text-slate-900 truncate">
                        {item.recipientFirstName} {item.recipientLastName}
                      </div>
                      <div className="text-xs text-slate-500 truncate">
                        {item.positionTitle} &bull; {item.location}
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          onLoadSingle(item, batchLetters)
                          onClose()
                        }}
                        title="Edit as single in main generator (saves all batch to drafts)"
                        className="text-slate-400 hover:text-blue-600 p-1.5 rounded-lg hover:bg-blue-50 transition"
                      >
                        <FileText className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          const updated = batchLetters.filter((_, i) => i !== idx)
                          setBatchLetters(updated)
                          if (selectedIndex >= updated.length) {
                            setSelectedIndex(Math.max(0, updated.length - 1))
                          }
                        }}
                        title="Remove from batch"
                        className="text-slate-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Active Preview */}
          <div className="lg:col-span-8 bg-slate-200/80 rounded-2xl border border-slate-300 p-4 flex flex-col items-center overflow-y-auto max-h-[70vh]">
            {currentLetter ? (
              <div className="w-full flex flex-col items-center">
                {/* Navigation pills */}
                <div className="bg-white px-4 py-1.5 rounded-full shadow-xs border border-slate-200 mb-4 flex items-center gap-4 text-xs font-semibold text-slate-700">
                  <button
                    disabled={selectedIndex <= 0}
                    onClick={() => setSelectedIndex((prev) => Math.max(0, prev - 1))}
                    className="disabled:opacity-30 hover:text-blue-600 cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span>
                    Letter {selectedIndex + 1} of {batchLetters.length}
                  </span>
                  <button
                    disabled={selectedIndex >= batchLetters.length - 1}
                    onClick={() => setSelectedIndex((prev) => Math.min(batchLetters.length - 1, prev + 1))}
                    className="disabled:opacity-30 hover:text-blue-600 cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                {/* Printable scale preview */}
                <div className="transform scale-90 origin-top">
                  <LetterPreview letter={currentLetter} config={config} />
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 text-sm">
                Select or load a batch to view the letter preview
              </div>
            )}
          </div>
        </div>

        {/* Hidden Printable Batch Container for Native window.print() */}
        <div id="printable-batch-container" className="hidden print:block">
          {batchLetters.map((bLetter, idx) => (
            <div
              key={bLetter.id}
              className="page-break-after-always print:w-[8.5in] print:h-[11in] print:p-0 print:m-0"
              style={{ pageBreakAfter: idx < batchLetters.length - 1 ? 'always' : 'auto' }}
            >
              <LetterPreview letter={bLetter} config={config} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
