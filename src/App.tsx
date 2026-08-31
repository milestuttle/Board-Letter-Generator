import { useState, useEffect, useRef } from 'react'
import type {
  LetterData,
  LetterType,
  DistrictConfig,
  TemplatePreset,
} from './types/letter'
import {
  DEFAULT_DISTRICT_CONFIG,
  SAMPLE_PRESETS,
  DEFAULT_NEW_LETTER,
} from './utils/sampleData'
import { LetterForm } from './components/LetterForm'
import { LetterPreview } from './components/LetterPreview'
import { TotalCompPreview } from './components/TotalCompPreview'
import { TotalCompForm } from './components/TotalCompForm'
import { BulkGenerator } from './components/BulkGenerator'
import { SettingsModal } from './components/SettingsModal'
import {
  exportToPdf,
  exportToDocx,
  copyLetterText,
  exportTotalCompToDocx,
  copyTotalCompText,
} from './utils/exportUtils'
import {
  Printer,
  FileDown,
  FileText,
  Copy,
  Layers,
  Settings,
  PlusCircle,
  ZoomIn,
  ZoomOut,
  Maximize2,
  RotateCcw,
  X,
  Check,
  Bookmark,
  History,
  Trash2,
  Calculator,
} from 'lucide-react'
import confetti from 'canvas-confetti'

export function App() {
  // District Config
  const [config, setConfig] = useState<DistrictConfig>(() => {
    const saved = localStorage.getItem('ccs_district_config')
    return saved ? JSON.parse(saved) : DEFAULT_DISTRICT_CONFIG
  })

  // Active Working Letter
  const [activeLetter, setActiveLetter] = useState<LetterData>(() => {
    const saved = localStorage.getItem('ccs_active_letter')
    return saved ? JSON.parse(saved) : SAMPLE_PRESETS[0].letter
  })

  // Active Document Tab ('board_letter' | 'total_comp')
  const [activeDocumentTab, setActiveDocumentTab] = useState<'board_letter' | 'total_comp'>('board_letter')

  // Saved Drafts & History
  const [savedLetters, setSavedLetters] = useState<LetterData[]>(() => {
    const saved = localStorage.getItem('ccs_saved_letters')
    return saved ? JSON.parse(saved) : []
  })

  // Modals & UI Controls
  const [showBulkModal, setShowBulkModal] = useState<boolean>(false)
  const [showSettingsModal, setShowSettingsModal] = useState<boolean>(false)
  const [showHistoryDrawer, setShowHistoryDrawer] = useState<boolean>(false)
  const [showFullscreenModal, setShowFullscreenModal] = useState<boolean>(false)
  const [zoomScale, setZoomScale] = useState<number>(0.92)
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [isExporting, setIsExporting] = useState<boolean>(false)

  const letterRef = useRef<HTMLDivElement>(null)

  // Persist State
  useEffect(() => {
    localStorage.setItem('ccs_district_config', JSON.stringify(config))
  }, [config])

  useEffect(() => {
    localStorage.setItem('ccs_active_letter', JSON.stringify(activeLetter))
  }, [activeLetter])

  useEffect(() => {
    localStorage.setItem('ccs_saved_letters', JSON.stringify(savedLetters))
  }, [savedLetters])

  // Show Toast
  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => {
      setToastMessage(null)
    }, 3000)
  }

  // Preset Selection
  const handleSelectPreset = (preset: TemplatePreset) => {
    setActiveLetter({
      ...preset.letter,
      id: 'letter-' + Date.now(),
    })
    showToast(`Loaded "${preset.name}"`)
  }

  // Reset to clean letter of type
  const handleResetType = (type: LetterType) => {
    const newL = DEFAULT_NEW_LETTER(type, config)
    setActiveLetter(newL)
    showToast(`Switched to ${type.toUpperCase()} letter format`)
  }

  // Save current letter to history / drafts
  const handleSaveToHistory = () => {
    const exists = savedLetters.find((l) => l.id === activeLetter.id)
    let updated: LetterData[]
    if (exists) {
      updated = savedLetters.map((l) => (l.id === activeLetter.id ? activeLetter : l))
    } else {
      updated = [
        { ...activeLetter, updatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
        ...savedLetters,
      ]
    }
    setSavedLetters(updated)
    confetti({ particleCount: 40, spread: 60, origin: { y: 0.8 } })
    showToast('Letter saved to Drafts!')
  }

  // Save multiple batch letters to drafts
  const handleSaveBatchToDrafts = (letters: LetterData[], notify = true) => {
    if (!letters || letters.length === 0) return

    setSavedLetters((prev) => {
      const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      const existingIds = new Set(prev.map((l) => l.id))
      const updatedExisting = prev.map((l) => {
        const matching = letters.find((item) => item.id === l.id)
        return matching ? { ...matching, updatedAt: nowStr } : l
      })
      const newLetters = letters
        .filter((item) => !existingIds.has(item.id))
        .map((item) => ({ ...item, updatedAt: nowStr }))

      return [...newLetters, ...updatedExisting]
    })

    if (notify) {
      confetti({ particleCount: 40, spread: 60, origin: { y: 0.8 } })
      showToast(`Saved all ${letters.length} letters to Drafts!`)
    }
  }

  // Actions
  const handlePrint = () => {
    window.print()
  }

  const handleExportPdf = async () => {
    try {
      setIsExporting(true)
      const cleanLast = (activeLetter.recipientLastName || 'Employee').trim().replace(/\s+/g, '_')
      const targetId = activeDocumentTab === 'total_comp' ? 'total-comp-sheet' : 'letter-preview-sheet'
      const docType = activeDocumentTab === 'total_comp' ? 'Total_Comp_Statement' : `${activeLetter.type}_Letter`
      const filename = `${cleanLast}_${docType}.pdf`
      await exportToPdf(targetId, filename)
      showToast('PDF downloaded successfully!')
    } catch (err) {
      console.error('PDF export error:', err)
      showToast('Error exporting PDF')
    } finally {
      setIsExporting(false)
    }
  }

  const handleExportDocx = async () => {
    try {
      setIsExporting(true)
      const cleanLast = (activeLetter.recipientLastName || 'Employee').trim().replace(/\s+/g, '_')
      if (activeDocumentTab === 'total_comp') {
        const filename = `${cleanLast}_Total_Compensation_Statement.docx`
        await exportTotalCompToDocx(activeLetter, config, filename)
        showToast('Total Compensation Word (.docx) downloaded!')
      } else {
        const filename = `${cleanLast}_${activeLetter.type}_Letter.docx`
        await exportToDocx(activeLetter, config, filename)
        showToast('Board Letter Word (.docx) downloaded!')
      }
    } catch (err) {
      console.error(err)
      showToast('Error exporting Word document')
    } finally {
      setIsExporting(false)
    }
  }

  const handleCopyText = async () => {
    if (activeDocumentTab === 'total_comp') {
      await copyTotalCompText(activeLetter, config)
      showToast('Total Compensation Statement text copied!')
    } else {
      await copyLetterText(activeLetter, config)
      showToast('Formatted letter text copied to clipboard!')
    }
  }


  return (
    <div className="min-h-screen bg-slate-100/90 text-slate-800 flex flex-col font-sans selection:bg-blue-500 selection:text-white">
      {/* Top Application Header */}
      <header className="bg-slate-900 text-white sticky top-0 z-40 border-b border-slate-800 shadow-md print:hidden">
        <div className="max-w-[1720px] mx-auto px-4 lg:px-6 h-16 flex items-center justify-between gap-4">
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center font-bold text-white shadow-md text-sm tracking-wider">
              CCS
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold tracking-tight text-white m-0">
                  Board Letter Generator
                </h1>
                <span className="px-2 py-0.5 text-[10px] font-semibold bg-blue-500/20 text-blue-300 border border-blue-400/30 rounded-full">
                  Fremont RE-1
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Official Board-Approved Personnel Letters &bull; Human Resources
              </p>
            </div>
          </div>

          {/* Action Center */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowBulkModal(true)}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-xs"
              title="Upload CSV or batch generate multiple letters"
            >
              <Layers className="w-4 h-4 text-blue-400" />
              <span className="hidden sm:inline">Bulk Batch</span> Mode
            </button>

            <button
              type="button"
              onClick={handleSaveToHistory}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
              title="Save draft"
            >
              <Bookmark className="w-4 h-4 text-amber-400" />
              <span className="hidden md:inline">Save Draft</span>
            </button>

            <button
              type="button"
              onClick={() => setShowHistoryDrawer(!showHistoryDrawer)}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer relative"
              title="View saved drafts"
            >
              <History className="w-4 h-4 text-slate-300" />
              {savedLetters.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 text-white rounded-full text-[9px] flex items-center justify-center font-bold">
                  {savedLetters.length}
                </span>
              )}
            </button>

            <div className="h-6 w-px bg-slate-700 mx-1 hidden sm:block" />

            <button
              type="button"
              onClick={handleCopyText}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
              title="Copy text to clipboard"
            >
              <Copy className="w-4 h-4 text-emerald-400" />
              <span className="hidden lg:inline">Copy Text</span>
            </button>

            <button
              type="button"
              onClick={handleExportDocx}
              disabled={isExporting}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
              title="Export as Word (.docx)"
            >
              <FileText className="w-4 h-4 text-sky-400" />
              <span className="hidden lg:inline">Word</span>
            </button>

            <button
              type="button"
              onClick={handleExportPdf}
              disabled={isExporting}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
              title="Download PDF"
            >
              <FileDown className="w-4 h-4 text-indigo-400" />
              <span className="hidden sm:inline">PDF</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl text-xs flex items-center gap-1.5 shadow-md hover:shadow-blue-500/20 transition cursor-pointer"
              title="Print letter (Cmd+P)"
            >
              <Printer className="w-4 h-4" />
              <span>Print Letter</span>
            </button>

            <button
              type="button"
              onClick={() => setShowSettingsModal(true)}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-xl transition cursor-pointer ml-1"
              title="District stationery settings"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Studio Area */}
      <main className="flex-1 max-w-[1720px] w-full mx-auto p-4 lg:p-6 grid grid-cols-1 xl:grid-cols-12 gap-6 print:p-0 print:m-0 print:block">
        {/* Left Column: Interactive Form Controls */}
        <div className="xl:col-span-6 space-y-6 print:hidden">
          {/* Header & Mode Switcher */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                type="button"
                onClick={() => setActiveDocumentTab('board_letter')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                  activeDocumentTab === 'board_letter'
                    ? 'bg-white text-blue-700 shadow-xs ring-1 ring-slate-200'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                Board Letter Editor
              </button>
              <button
                type="button"
                onClick={() => setActiveDocumentTab('total_comp')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                  activeDocumentTab === 'total_comp'
                    ? 'bg-white text-indigo-700 shadow-xs ring-1 ring-slate-200'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Calculator className="w-3.5 h-3.5" />
                Total Comp Editor
              </button>
            </div>

            <button
              type="button"
              onClick={() => handleResetType(activeLetter.type)}
              className="text-xs text-slate-500 hover:text-blue-600 font-semibold flex items-center gap-1 transition cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5" /> Start Clean Letter
            </button>
          </div>

          {activeDocumentTab === 'board_letter' ? (
            <LetterForm
              letter={activeLetter}
              onChange={setActiveLetter}
              presets={SAMPLE_PRESETS}
              onSelectPreset={handleSelectPreset}
              onResetType={handleResetType}
              config={config}
            />
          ) : (
            <TotalCompForm
              letter={activeLetter}
              onChange={setActiveLetter}
              config={config}
            />
          )}
        </div>

        {/* Right Column: High-Fidelity Paper Preview */}
        <div className="xl:col-span-6 flex flex-col items-center print:block print:w-full">
          {/* Zoom & View Toolbar */}
          <div className="w-full flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white px-4 py-2.5 rounded-2xl border border-slate-200/90 shadow-xs mb-4 print:hidden">
            {/* Document Switcher Tabs */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                type="button"
                onClick={() => setActiveDocumentTab('board_letter')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                  activeDocumentTab === 'board_letter'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                Board Letter
              </button>
              <button
                type="button"
                onClick={() => setActiveDocumentTab('total_comp')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                  activeDocumentTab === 'total_comp'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Calculator className="w-3.5 h-3.5" />
                Total Compensation Statement
              </button>
            </div>

            {/* Zoom Controls */}
            <div className="flex items-center justify-end gap-1.5">
              <button
                type="button"
                onClick={() => setZoomScale((z) => Math.max(0.6, Number((z - 0.05).toFixed(2))))}
                className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                title="Zoom out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <span className="text-xs font-semibold text-slate-600 min-w-[3rem] text-center">
                {Math.round(zoomScale * 100)}%
              </span>
              <button
                type="button"
                onClick={() => setZoomScale((z) => Math.min(1.3, Number((z + 0.05).toFixed(2))))}
                className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                title="Zoom in"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setZoomScale(0.92)}
                className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                title="Reset zoom to 92%"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setShowFullscreenModal(true)}
                className="p-1.5 rounded-lg text-slate-700 bg-slate-100 hover:bg-slate-200 transition cursor-pointer ml-1"
                title="Open full screen preview"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Letter Canvas Container */}
          <div className="w-full flex justify-center overflow-x-auto p-2 bg-slate-200/70 rounded-3xl border border-slate-300 shadow-inner print:p-0 print:bg-white print:border-none print:shadow-none">
            {activeDocumentTab === 'board_letter' ? (
              <LetterPreview
                ref={letterRef}
                letter={activeLetter}
                config={config}
                scale={zoomScale}
              />
            ) : (
              <TotalCompPreview
                ref={letterRef}
                letter={activeLetter}
                config={config}
                scale={zoomScale}
              />
            )}
          </div>
        </div>
      </main>

      {/* Full-Screen Document Reviewer Modal */}
      {showFullscreenModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex flex-col p-4 md:p-6 overflow-hidden">
          {/* Top Review Bar */}
          <div className="max-w-5xl w-full mx-auto bg-slate-900 text-white px-5 py-3 rounded-2xl border border-slate-800 flex items-center justify-between shadow-2xl mb-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-xl border border-slate-700">
                <button
                  type="button"
                  onClick={() => setActiveDocumentTab('board_letter')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                    activeDocumentTab === 'board_letter'
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Board Letter
                </button>
                <button
                  type="button"
                  onClick={() => setActiveDocumentTab('total_comp')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                    activeDocumentTab === 'total_comp'
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Total Comp Statement
                </button>
              </div>

              <span className="text-xs text-slate-400 hidden sm:inline">
                {activeLetter.recipientFirstName} {activeLetter.recipientLastName}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePrint}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs transition cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" /> Print
              </button>
              <button
                type="button"
                onClick={handleExportPdf}
                disabled={isExporting}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
              >
                <FileDown className="w-3.5 h-3.5 text-indigo-400" /> PDF
              </button>
              <button
                type="button"
                onClick={() => setShowFullscreenModal(false)}
                className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-xl transition cursor-pointer ml-2"
                title="Close full-screen (ESC)"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Full-Screen Scrollable Document Sheet */}
          <div className="flex-1 overflow-y-auto overflow-x-auto flex justify-center items-start pb-8">
            <div className="transform origin-top scale-100 shadow-2xl rounded-sm">
              {activeDocumentTab === 'board_letter' ? (
                <LetterPreview
                  letter={activeLetter}
                  config={config}
                  scale={1}
                />
              ) : (
                <TotalCompPreview
                  letter={activeLetter}
                  config={config}
                  scale={1}
                />
              )}
            </div>
          </div>
        </div>
      )}

      {/* Saved Drafts / History Sidebar Drawer */}
      {showHistoryDrawer && (
        <div className="fixed inset-y-0 right-0 z-50 w-80 bg-white border-l border-slate-200 shadow-2xl p-4 flex flex-col print:hidden">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <History className="w-4 h-4 text-blue-600" />
              Saved Drafts ({savedLetters.length})
            </h3>
            <div className="flex items-center gap-2">
              {savedLetters.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    if (confirm('Clear all saved drafts?')) {
                      setSavedLetters([])
                      showToast('Drafts cleared')
                    }
                  }}
                  className="text-xs text-slate-400 hover:text-red-600 font-medium cursor-pointer"
                >
                  Clear All
                </button>
              )}
              <button
                onClick={() => setShowHistoryDrawer(false)}
                className="text-xs text-slate-400 hover:text-slate-700 font-semibold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>

          {savedLetters.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center text-slate-400 p-4">
              <Bookmark className="w-10 h-10 text-slate-300 stroke-1 mb-2" />
              <p className="text-xs">No saved drafts yet. Click &ldquo;Save Draft&rdquo; or batch save in Bulk Mode.</p>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {savedLetters.map((draft) => (
                <div
                  key={draft.id}
                  onClick={() => {
                    setActiveLetter(draft)
                    setShowHistoryDrawer(false)
                    showToast(`Loaded draft for ${draft.recipientFirstName} ${draft.recipientLastName}`)
                  }}
                  className="p-3 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 transition cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">
                      {draft.recipientFirstName} {draft.recipientLastName}
                    </span>
                    <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 bg-slate-100 rounded text-slate-600">
                      {draft.type}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1 truncate">
                    {draft.positionTitle || 'Untitled Position'}
                  </div>
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 text-[10px] text-slate-400">
                    <span>{draft.letterDate}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setSavedLetters(savedLetters.filter((l) => l.id !== draft.id))
                      }}
                      className="hover:text-red-600 cursor-pointer"
                      title="Delete draft"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Bulk Batch Generator Modal */}
      {showBulkModal && (
        <BulkGenerator
          config={config}
          onClose={() => setShowBulkModal(false)}
          onSaveBatchAsDrafts={handleSaveBatchToDrafts}
          onLoadSingle={(letter, allBatch) => {
            setActiveLetter(letter)
            if (allBatch && allBatch.length > 1) {
              handleSaveBatchToDrafts(allBatch, false)
              showToast(`Loaded ${letter.recipientFirstName} ${letter.recipientLastName} & saved ${allBatch.length} batch letters to Drafts!`)
            } else {
              showToast(`Loaded ${letter.recipientFirstName} ${letter.recipientLastName}`)
            }
          }}
        />
      )}

      {/* District Stationery Settings Modal */}
      {showSettingsModal && (
        <SettingsModal
          config={config}
          onSave={(newCfg) => {
            setConfig(newCfg)
            showToast('District settings saved!')
          }}
          onClose={() => setShowSettingsModal(false)}
        />
      )}

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-2xl shadow-xl border border-slate-700 flex items-center gap-2 text-xs font-semibold animate-bounce">
          <Check className="w-4 h-4 text-emerald-400" />
          {toastMessage}
        </div>
      )}
    </div>
  )
}
export default App
