/**
 * Safe localStorage abstraction with error resilience, schema versioning,
 * backup import/export, and shared HR workstation privacy controls.
 */

export const STORAGE_KEYS = {
  CONFIG: 'ccs_district_config',
  ACTIVE_LETTER: 'ccs_active_letter',
  SAVED_LETTERS: 'ccs_saved_letters',
  BATCH_LETTERS: 'ccs_batch_letters',
  SCHEMA_VERSION: 'ccs_schema_version',
} as const

export const CURRENT_SCHEMA_VERSION = 1

export interface DistrictBackupFile {
  app: 'Cañon City Schools — Board Letter Generator'
  version: number
  exportedAt: string
  payload: Record<string, unknown>
}

/**
 * Safe wrapper around browser localStorage to prevent crashes from
 * corrupted JSON, disabled cookies/storage, or quota issues.
 */
export const safeStorage = {
  getItem<T>(key: string, fallback: T): T {
    if (typeof window === 'undefined' || !window.localStorage) {
      return fallback
    }
    try {
      const raw = localStorage.getItem(key)
      if (raw === null || raw === undefined || raw === '') {
        return fallback
      }
      return JSON.parse(raw) as T
    } catch (err) {
      console.warn(`[safeStorage] Failed to read/parse key "${key}" from localStorage. Falling back to default.`, err)
      return fallback
    }
  },

  setItem<T>(key: string, value: T): boolean {
    if (typeof window === 'undefined' || !window.localStorage) {
      return false
    }
    try {
      localStorage.setItem(key, JSON.stringify(value))
      return true
    } catch (err) {
      console.error(`[safeStorage] Failed to persist key "${key}" to localStorage.`, err)
      return false
    }
  },

  removeItem(key: string): void {
    if (typeof window === 'undefined' || !window.localStorage) {
      return
    }
    try {
      localStorage.removeItem(key)
    } catch (err) {
      console.error(`[safeStorage] Failed to remove key "${key}" from localStorage.`, err)
    }
  },
}

/**
 * Bundles all district configurations, drafts, and batch letters into a JSON backup object.
 */
export function createDistrictBackup(): DistrictBackupFile {
  const payload: Record<string, unknown> = {}

  if (typeof window !== 'undefined' && window.localStorage) {
    // Collect all ccs_ keys
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith('ccs_')) {
        try {
          const raw = localStorage.getItem(key)
          if (raw !== null) {
            payload[key] = JSON.parse(raw)
          }
        } catch {
          payload[key] = localStorage.getItem(key)
        }
      }
    }
  }

  return {
    app: 'Cañon City Schools — Board Letter Generator',
    version: CURRENT_SCHEMA_VERSION,
    exportedAt: new Date().toISOString(),
    payload,
  }
}

/**
 * Triggers a browser download of the district configuration and data backup file.
 */
export function downloadBackupFile(): void {
  const backup = createDistrictBackup()
  const jsonString = JSON.stringify(backup, null, 2)
  const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8;' })
  const dateStamp = new Date().toISOString().slice(0, 10)
  const filename = `ccs_board_letters_backup_${dateStamp}.json`

  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', filename)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * Validates and restores data from a JSON backup file.
 */
export function restoreDistrictBackup(
  backupData: unknown
): { success: boolean; message: string; restoredKeys: string[] } {
  if (!backupData || typeof backupData !== 'object') {
    return { success: false, message: 'Invalid backup file: file is not a valid JSON object.', restoredKeys: [] }
  }

  const file = backupData as Partial<DistrictBackupFile>

  if (!file.payload || typeof file.payload !== 'object') {
    return { success: false, message: 'Invalid backup file: missing backup payload.', restoredKeys: [] }
  }

  const restoredKeys: string[] = []

  try {
    for (const [key, value] of Object.entries(file.payload)) {
      if (key.startsWith('ccs_')) {
        safeStorage.setItem(key, value)
        restoredKeys.push(key)
      }
    }

    return {
      success: true,
      message: `Successfully restored ${restoredKeys.length} settings and data record(s).`,
      restoredKeys,
    }
  } catch (err) {
    return {
      success: false,
      message: `Failed to restore backup: ${err instanceof Error ? err.message : String(err)}`,
      restoredKeys,
    }
  }
}

/**
 * Privacy control for shared HR workstations:
 * Clears saved draft letters, batch rosters, and active letter data without touching
 * district configuration or letterhead settings.
 */
export function clearPersonnelData(): void {
  safeStorage.removeItem(STORAGE_KEYS.ACTIVE_LETTER)
  safeStorage.removeItem(STORAGE_KEYS.SAVED_LETTERS)
  safeStorage.removeItem(STORAGE_KEYS.BATCH_LETTERS)
}

/**
 * Factory reset: wipes all ccs_ keys from browser storage.
 */
export function clearAllDistrictStorage(): void {
  if (typeof window === 'undefined' || !window.localStorage) return
  const keysToRemove: string[] = []
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key && key.startsWith('ccs_')) {
      keysToRemove.push(key)
    }
  }
  for (const k of keysToRemove) {
    localStorage.removeItem(k)
  }
}
