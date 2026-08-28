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
import { BulkGenerator } from './components/BulkGenerator'
import { SettingsModal } from './components/SettingsModal'
import { exportToPdf, exportToDocx, copyLetterText } from './utils/exportUtils'
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
    const newL = DEFAULT_NEW_LETTER(type)
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
        { ...activeLetter, updatedAt: new Date().toLocaleTimeString() },
        ...savedLetters,
      ]
    }
    setSavedLetters(updated)
    confetti({ particleCount: 40, spread: 60, origin: { y: 0.8 } })
    showToast('Letter saved to Drafts!')
  }

  // Actions
  const handlePrint = () => {
    window.print()
  }

  const handleExportPdf = async () => {
    try {
      setIsExporting(true)
      const cleanLast = (activeLetter.recipientLastName || 'Board').trim().replace(/\s+/g, '_')
      const filename = `${cleanLast}_${activeLetter.type}_Letter.pdf`
      await exportToPdf('letter-preview-sheet', filename)
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
      const filename = `${activeLetter.recipientLastName || 'Board'}_${activeLetter.type}_Letter.docx`
      await exportToDocx(activeLetter, config, filename)
      showToast('Word document (.docx) downloaded!')
    } catch (err) {
      console.error(err)
      showToast('Error exporting Word document')
    } finally {
      setIsExporting(false)
    }
  }

  const handleCopyText = async () => {
    await copyLetterText(activeLetter, config)
    showToast('Formatted letter text copied to clipboard!')
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
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse" />
              Letter Information & Configuration
            </h2>
            <button
              type="button"
              onClick={() => handleResetType(activeLetter.type)}
              className="text-xs text-slate-500 hover:text-blue-600 font-semibold flex items-center gap-1 transition cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5" /> Start Clean Letter
            </button>
          </div>

          <LetterForm
            letter={activeLetter}
            onChange={setActiveLetter}
            presets={SAMPLE_PRESETS}
            onSelectPreset={handleSelectPreset}
            onResetType={handleResetType}
            config={config}
          />
        </div>

        {/* Right Column: High-Fidelity Paper Preview */}
        <div className="xl:col-span-6 flex flex-col items-center print:block print:w-full">
          {/* Zoom & View Toolbar */}
          <div className="w-full flex items-center justify-between bg-white px-4 py-2.5 rounded-2xl border border-slate-200/90 shadow-xs mb-4 print:hidden">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Live Document Preview
              </span>
              <span className="text-[11px] px-2 py-0.5 bg-slate-100 text-slate-600 font-medium rounded-md">
                8.5&quot; &times; 11&quot; US Letter
              </span>
            </div>

            <div className="flex items-center gap-1.5">
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
            <LetterPreview
              ref={letterRef}
              letter={activeLetter}
              config={config}
              scale={zoomScale}
            />
          </div>
        </div>
      </main>

      {/* Full-Screen Document Reviewer Modal */}
      {showFullscreenModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex flex-col p-4 md:p-6 overflow-hidden">
          {/* Top Review Bar */}
          <div className="max-w-5xl w-full mx-auto bg-slate-900 text-white px-5 py-3 rounded-2xl border border-slate-800 flex items-center justify-between shadow-2xl mb-4">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-400">
                Full-Screen Document Review
              </span>
              <span className="text-xs text-slate-400 hidden sm:inline">
                {activeLetter.recipientFirstName} {activeLetter.recipientLastName} ({activeLetter.type.toUpperCase()})
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
              <LetterPreview
                letter={activeLetter}
                config={config}
                scale={1}
              />
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
            <button
              onClick={() => setShowHistoryDrawer(false)}
              className="text-xs text-slate-400 hover:text-slate-700 font-semibold"
            >
              Close
            </button>
          </div>

          {savedLetters.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center text-slate-400 p-4">
              <Bookmark className="w-10 h-10 text-slate-300 stroke-1 mb-2" />
              <p className="text-xs">No saved drafts yet. Click &ldquo;Save Draft&rdquo; in the top bar.</p>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {savedLetters.map((draft) => (
                <div
                  key={draft.id}
                  onClick={() => {
                    setActiveLetter(draft)
                    setShowHistoryDrawer(false)
                    showToast(`Loaded draft for ${draft.recipientFirstName}`)
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
                      className="hover:text-red-600"
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
          onLoadSingle={(letter) => {
            setActiveLetter(letter)
            showToast(`Loaded ${letter.recipientFirstName} ${letter.recipientLastName}`)
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
