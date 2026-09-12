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
import { safeStorage, STORAGE_KEYS, clearPersonnelData } from './utils/storageUtils'

export function App() {
  // District Config
  const [config, setConfig] = useState<DistrictConfig>(() =>
    safeStorage.getItem(STORAGE_KEYS.CONFIG, DEFAULT_DISTRICT_CONFIG)
  )

  // Active Working Letter
  const [activeLetter, setActiveLetter] = useState<LetterData>(() =>
    safeStorage.getItem(STORAGE_KEYS.ACTIVE_LETTER, SAMPLE_PRESETS[0].letter)
  )

  // Active Document Tab ('board_letter' | 'total_comp')
  const [activeDocumentTab, setActiveDocumentTab] = useState<'board_letter' | 'total_comp'>('board_letter')

  // Saved Drafts & History
  const [savedLetters, setSavedLetters] = useState<LetterData[]>(() =>
    safeStorage.getItem(STORAGE_KEYS.SAVED_LETTERS, [])
  )

  // Modals & UI Controls
  const [showBulkModal, setShowBulkModal] = useState<boolean>(false)
  const [showSettingsModal, setShowSettingsModal] = useState<boolean>(false)
  const [showHistoryDrawer, setShowHistoryDrawer] = useState<boolean>(false)
  const [isConfirmingClearDrafts, setIsConfirmingClearDrafts] = useState<boolean>(false)
  const [showFullscreenModal, setShowFullscreenModal] = useState<boolean>(false)
  const [zoomScale, setZoomScale] = useState<number>(0.92)
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [isExporting, setIsExporting] = useState<boolean>(false)

  const letterRef = useRef<HTMLDivElement>(null)

  // Persist State
  useEffect(() => {
    safeStorage.setItem(STORAGE_KEYS.CONFIG, config)
  }, [config])

  useEffect(() => {
    safeStorage.setItem(STORAGE_KEYS.ACTIVE_LETTER, activeLetter)
  }, [activeLetter])

  useEffect(() => {
    safeStorage.setItem(STORAGE_KEYS.SAVED_LETTERS, savedLetters)
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
      showToast(`Saved all ${letters.length} letters to Drafts!`)
    }
  }

  // Actions
  const handlePrint = () => {
    showToast("Tip: In print dialog, choose 'Save as PDF' to save a searchable vector document.")
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
    <div className="min-h-screen bg-paper text-ink flex flex-col font-sans selection:bg-accent-soft selection:text-ink">
      {/* Top Application Header */}
      <header className="bg-ink text-paper sticky top-0 z-40 border-b border-black/20 print:hidden">
        <div className="max-w-[1720px] mx-auto px-4 lg:px-6 h-16 flex items-center justify-between gap-4">
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-md border border-white/25 flex items-center justify-center font-semibold text-paper text-xs tracking-wide">
              CCS
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-semibold font-serif text-paper m-0">
                  Board Letter Generator
                </h1>
                <span className="px-2 py-0.5 text-[10px] font-medium text-paper/70 border border-white/20 rounded">
                  {config.districtName}
                </span>
              </div>
              <p className="text-xs text-paper/60">
                Official personnel letters for Human Resources
              </p>
            </div>
          </div>

          {/* Action Center */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowBulkModal(true)}
              className="px-3.5 py-2 bg-transparent hover:bg-white/10 text-paper/90 border border-white/20 rounded-md text-xs font-medium flex items-center gap-1.5 transition cursor-pointer"
              title="Upload CSV or batch generate multiple letters"
            >
              <Layers className="w-4 h-4" />
              <span className="hidden sm:inline">Bulk Batch</span> Mode
            </button>

            <button
              type="button"
              onClick={handleSaveToHistory}
              className="px-3 py-2 bg-transparent hover:bg-white/10 text-paper/90 border border-white/20 rounded-md text-xs font-medium flex items-center gap-1.5 transition cursor-pointer"
              title="Save draft"
            >
              <Bookmark className="w-4 h-4" />
              <span className="hidden md:inline">Save Draft</span>
            </button>

            <button
              type="button"
              onClick={() => setShowHistoryDrawer(!showHistoryDrawer)}
              className="px-3 py-2 bg-transparent hover:bg-white/10 text-paper/90 border border-white/20 rounded-md text-xs font-medium flex items-center gap-1.5 transition cursor-pointer relative"
              title="View saved drafts"
            >
              <History className="w-4 h-4" />
              {savedLetters.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 min-w-4 h-4 px-1 bg-accent text-ink rounded-full text-[9px] flex items-center justify-center font-semibold">
                  {savedLetters.length}
                </span>
              )}
            </button>

            <div className="h-6 w-px bg-white/20 mx-1 hidden sm:block" />

            <button
              type="button"
              onClick={handleCopyText}
              className="px-3 py-2 bg-transparent hover:bg-white/10 text-paper/90 border border-white/20 rounded-md text-xs font-medium flex items-center gap-1.5 transition cursor-pointer"
              title="Copy text to clipboard"
            >
              <Copy className="w-4 h-4" />
              <span className="hidden lg:inline">Copy Text</span>
            </button>

            <button
              type="button"
              onClick={handleExportDocx}
              disabled={isExporting}
              className="px-3 py-2 bg-transparent hover:bg-white/10 text-paper/90 border border-white/20 rounded-md text-xs font-medium flex items-center gap-1.5 transition cursor-pointer"
              title="Export as Word (.docx)"
            >
              <FileText className="w-4 h-4" />
              <span className="hidden lg:inline">Word</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="px-4 py-2 bg-accent hover:bg-accent-dark text-ink font-semibold rounded-md text-xs flex items-center gap-1.5 transition cursor-pointer"
              title="Print letter or select 'Save as PDF' for a searchable vector PDF (Cmd+P)"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Save Vector PDF</span>
            </button>

            <button
              type="button"
              onClick={handleExportPdf}
              disabled={isExporting}
              className="px-3 py-2 bg-transparent hover:bg-white/10 text-paper/90 border border-white/20 rounded-md text-xs font-medium flex items-center gap-1.5 transition cursor-pointer"
              title="Quick 1-click direct file download (.pdf)"
            >
              <FileDown className="w-4 h-4" />
              <span className="hidden sm:inline">Direct PDF</span>
            </button>

            <button
              type="button"
              onClick={() => setShowSettingsModal(true)}
              className="p-2 bg-transparent hover:bg-white/10 text-paper/90 border border-white/20 rounded-md transition cursor-pointer ml-1"
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
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-lg border border-rule">
            <div className="flex items-center gap-1 bg-paper-dim p-1 rounded-md border border-rule">
              <button
                type="button"
                onClick={() => setActiveDocumentTab('board_letter')}
                className={`px-3 py-1.5 rounded text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                  activeDocumentTab === 'board_letter'
                    ? 'bg-white text-ink ring-1 ring-rule'
                    : 'text-muted hover:text-ink'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                Board Letter Editor
              </button>
              <button
                type="button"
                onClick={() => setActiveDocumentTab('total_comp')}
                className={`px-3 py-1.5 rounded text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                  activeDocumentTab === 'total_comp'
                    ? 'bg-white text-ink ring-1 ring-rule'
                    : 'text-muted hover:text-ink'
                }`}
              >
                <Calculator className="w-3.5 h-3.5" />
                Total Comp Editor
              </button>
            </div>

            <button
              type="button"
              onClick={() => handleResetType(activeLetter.type)}
              className="text-xs text-muted hover:text-accent-dark font-medium flex items-center gap-1 transition cursor-pointer"
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
          <div className="w-full flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white px-4 py-2.5 rounded-lg border border-rule mb-4 print:hidden">
            {/* Document Switcher Tabs */}
            <div className="flex items-center gap-1 bg-paper-dim p-1 rounded-md border border-rule">
              <button
                type="button"
                onClick={() => setActiveDocumentTab('board_letter')}
                className={`px-3 py-1.5 rounded text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                  activeDocumentTab === 'board_letter'
                    ? 'bg-ink text-paper'
                    : 'text-muted hover:text-ink'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                Board Letter
              </button>
              <button
                type="button"
                onClick={() => setActiveDocumentTab('total_comp')}
                className={`px-3 py-1.5 rounded text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                  activeDocumentTab === 'total_comp'
                    ? 'bg-ink text-paper'
                    : 'text-muted hover:text-ink'
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
                className="p-1.5 rounded text-muted hover:bg-paper-dim transition cursor-pointer"
                title="Zoom out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <span className="text-xs font-semibold text-muted min-w-[3rem] text-center">
                {Math.round(zoomScale * 100)}%
              </span>
              <button
                type="button"
                onClick={() => setZoomScale((z) => Math.min(1.3, Number((z + 0.05).toFixed(2))))}
                className="p-1.5 rounded text-muted hover:bg-paper-dim transition cursor-pointer"
                title="Zoom in"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setZoomScale(0.92)}
                className="p-1.5 rounded text-muted hover:bg-paper-dim transition cursor-pointer"
                title="Reset zoom to 92%"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setShowFullscreenModal(true)}
                className="p-1.5 rounded text-ink bg-paper-dim hover:bg-rule/60 transition cursor-pointer ml-1"
                title="Open full screen preview"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Letter Canvas Container */}
          <div className="w-full flex justify-center overflow-x-auto p-2 bg-paper-dim rounded-lg border border-rule print:p-0 print:bg-white print:border-none print:shadow-none print:block print:overflow-visible">
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
        <div className="fixed inset-0 z-50 bg-ink/85 backdrop-blur-sm flex flex-col p-4 md:p-6 overflow-hidden">
          {/* Top Review Bar */}
          <div className="max-w-5xl w-full mx-auto bg-ink text-paper px-5 py-3 rounded-lg border border-white/15 flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 bg-white/10 p-1 rounded-md border border-white/15">
                <button
                  type="button"
                  onClick={() => setActiveDocumentTab('board_letter')}
                  className={`px-3 py-1 rounded text-xs font-semibold transition cursor-pointer ${
                    activeDocumentTab === 'board_letter'
                      ? 'bg-accent text-ink'
                      : 'text-paper/60 hover:text-paper'
                  }`}
                >
                  Board Letter
                </button>
                <button
                  type="button"
                  onClick={() => setActiveDocumentTab('total_comp')}
                  className={`px-3 py-1 rounded text-xs font-semibold transition cursor-pointer ${
                    activeDocumentTab === 'total_comp'
                      ? 'bg-accent text-ink'
                      : 'text-paper/60 hover:text-paper'
                  }`}
                >
                  Total Comp Statement
                </button>
              </div>

              <span className="text-xs text-paper/60 hidden sm:inline">
                {activeLetter.recipientFirstName} {activeLetter.recipientLastName}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePrint}
                className="px-3 py-1.5 bg-accent hover:bg-accent-dark text-ink rounded-md text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                title="Print or select 'Save as PDF' for a searchable vector document"
              >
                <Printer className="w-3.5 h-3.5" /> Print / Vector PDF
              </button>
              <button
                type="button"
                onClick={handleExportPdf}
                disabled={isExporting}
                className="px-3 py-1.5 bg-transparent hover:bg-white/10 text-paper/90 border border-white/20 rounded-md text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                title="1-Click direct file download (.pdf)"
              >
                <FileDown className="w-3.5 h-3.5" /> Direct PDF
              </button>
              <button
                type="button"
                onClick={() => setShowFullscreenModal(false)}
                className="p-1.5 bg-transparent hover:bg-white/10 text-paper/60 hover:text-paper rounded-md transition cursor-pointer ml-2"
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
        <div className="fixed inset-y-0 right-0 z-50 w-80 bg-white border-l border-rule shadow-2xl p-4 flex flex-col print:hidden">
          <div className="flex items-center justify-between pb-3 border-b border-rule mb-3">
            <h3 className="text-sm font-semibold text-ink flex items-center gap-2">
              <History className="w-4 h-4 text-muted" />
              Saved Drafts ({savedLetters.length})
            </h3>
            <div className="flex items-center gap-2">
              {savedLetters.length > 0 && (
                <>
                  {isConfirmingClearDrafts ? (
                    <div className="flex items-center gap-1 bg-danger-soft px-2 py-1 rounded border border-danger/30">
                      <span className="text-[10px] font-semibold text-danger">Clear all?</span>
                      <button
                        type="button"
                        onClick={() => {
                          setSavedLetters([])
                          setIsConfirmingClearDrafts(false)
                          showToast('All drafts cleared')
                        }}
                        className="text-[10px] bg-danger hover:bg-danger/85 text-paper px-1.5 py-0.5 rounded font-semibold transition cursor-pointer"
                      >
                        Yes
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsConfirmingClearDrafts(false)}
                        className="text-[10px] text-muted hover:text-ink px-1 py-0.5 font-medium cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setIsConfirmingClearDrafts(true)}
                      className="text-xs text-muted hover:text-danger font-medium cursor-pointer"
                    >
                      Clear All
                    </button>
                  )}
                </>
              )}
              <button
                onClick={() => {
                  setShowHistoryDrawer(false)
                  setIsConfirmingClearDrafts(false)
                }}
                className="text-xs text-muted hover:text-ink font-semibold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>

          {savedLetters.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center text-muted p-4">
              <Bookmark className="w-10 h-10 text-rule stroke-1 mb-2" />
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
                  className="p-3 rounded-md border border-rule hover:border-accent hover:bg-accent-soft/40 transition cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-ink">
                      {draft.recipientFirstName} {draft.recipientLastName}
                    </span>
                    <span className="text-[10px] font-semibold px-1.5 py-0.5 bg-paper-dim rounded text-muted">
                      {draft.type}
                    </span>
                  </div>
                  <div className="text-[11px] text-muted mt-1 truncate">
                    {draft.positionTitle || 'Untitled Position'}
                  </div>
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-rule text-[10px] text-muted">
                    <span>{draft.letterDate}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setSavedLetters(savedLetters.filter((l) => l.id !== draft.id))
                      }}
                      className="hover:text-danger cursor-pointer"
                      title="Delete draft"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Shared HR Terminal Privacy Purge Control */}
          <div className="pt-3 mt-auto border-t border-rule">
            <button
              type="button"
              onClick={() => {
                if (
                  window.confirm(
                    'Clear all cached drafts and employee letters from this shared terminal? (District configuration and letterhead will be preserved).'
                  )
                ) {
                  clearPersonnelData()
                  setSavedLetters([])
                  setActiveLetter(SAMPLE_PRESETS[0].letter)
                  showToast('Personnel drafts purged for privacy')
                }
              }}
              className="w-full text-center text-xs text-muted hover:text-danger py-2 px-3 rounded-md bg-paper-dim hover:bg-danger-soft border border-rule transition font-medium cursor-pointer"
            >
              Shared Terminal: Purge Cached Drafts
            </button>
          </div>
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
          onDataRestored={() => {
            setConfig(safeStorage.getItem(STORAGE_KEYS.CONFIG, DEFAULT_DISTRICT_CONFIG))
            setActiveLetter(safeStorage.getItem(STORAGE_KEYS.ACTIVE_LETTER, SAMPLE_PRESETS[0].letter))
            setSavedLetters(safeStorage.getItem(STORAGE_KEYS.SAVED_LETTERS, []))
            showToast('Backup restored successfully!')
          }}
          onDataCleared={() => {
            setConfig(safeStorage.getItem(STORAGE_KEYS.CONFIG, DEFAULT_DISTRICT_CONFIG))
            setActiveLetter(SAMPLE_PRESETS[0].letter)
            setSavedLetters([])
            showToast('Personnel storage purged.')
          }}
        />
      )}

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-ink text-paper px-4 py-2.5 rounded-md border border-white/10 flex items-center gap-2 text-xs font-medium animate-[toast-in_0.2s_ease-out]">
          <Check className="w-4 h-4 text-accent" />
          {toastMessage}
        </div>
      )}
    </div>
  )
}
export default App
