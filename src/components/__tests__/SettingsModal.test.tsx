import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { SettingsModal } from '../SettingsModal'
import { DEFAULT_DISTRICT_CONFIG } from '../../utils/sampleData'
import { safeStorage, STORAGE_KEYS } from '../../utils/storageUtils'

describe('SettingsModal - Backup & Privacy tab', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.restoreAllMocks()
  })

  it('renders the Backup & Privacy tab and elements', () => {
    render(
      <SettingsModal
        config={DEFAULT_DISTRICT_CONFIG}
        onSave={vi.fn()}
        onClose={vi.fn()}
      />
    )

    const backupTabBtn = screen.getByRole('button', { name: /Backup & Privacy/i })
    expect(backupTabBtn).toBeInTheDocument()

    fireEvent.click(backupTabBtn)

    expect(screen.getByText('Export District Backup')).toBeInTheDocument()
    expect(screen.getByText('Restore from Backup File')).toBeInTheDocument()
    expect(screen.getByText('Workstation Privacy & Data Cleanup')).toBeInTheDocument()
  })

  it('clears drafts and rosters when confirmed', () => {
    const onDataCleared = vi.fn()
    vi.spyOn(window, 'confirm').mockReturnValue(true)

    safeStorage.setItem(STORAGE_KEYS.ACTIVE_LETTER, { id: 'letter-1' })
    safeStorage.setItem(STORAGE_KEYS.SAVED_LETTERS, [{ id: 'draft-1' }])

    render(
      <SettingsModal
        config={DEFAULT_DISTRICT_CONFIG}
        onSave={vi.fn()}
        onClose={vi.fn()}
        onDataCleared={onDataCleared}
      />
    )

    fireEvent.click(screen.getByRole('button', { name: /Backup & Privacy/i }))

    const clearDraftsBtn = screen.getByRole('button', { name: /Clear Drafts & Rosters/i })
    fireEvent.click(clearDraftsBtn)

    expect(window.confirm).toHaveBeenCalled()
    expect(onDataCleared).toHaveBeenCalled()
    expect(localStorage.getItem(STORAGE_KEYS.ACTIVE_LETTER)).toBeNull()
    expect(localStorage.getItem(STORAGE_KEYS.SAVED_LETTERS)).toBeNull()
    expect(screen.getByText(/All saved draft letters and batch rosters have been purged/i)).toBeInTheDocument()
  })

  it('performs factory reset when confirmed', () => {
    const onDataCleared = vi.fn()
    vi.spyOn(window, 'confirm').mockReturnValue(true)

    safeStorage.setItem(STORAGE_KEYS.CONFIG, { districtName: 'Custom Name' })
    safeStorage.setItem(STORAGE_KEYS.SAVED_LETTERS, [{ id: 'draft-1' }])

    render(
      <SettingsModal
        config={DEFAULT_DISTRICT_CONFIG}
        onSave={vi.fn()}
        onClose={vi.fn()}
        onDataCleared={onDataCleared}
      />
    )

    fireEvent.click(screen.getByRole('button', { name: /Backup & Privacy/i }))

    const resetBtn = screen.getByRole('button', { name: /Factory Reset \(Clear All\)/i })
    fireEvent.click(resetBtn)

    expect(window.confirm).toHaveBeenCalled()
    expect(onDataCleared).toHaveBeenCalled()
    expect(localStorage.getItem(STORAGE_KEYS.CONFIG)).toBeNull()
    expect(screen.getByText(/Factory reset complete/i)).toBeInTheDocument()
  })
})
