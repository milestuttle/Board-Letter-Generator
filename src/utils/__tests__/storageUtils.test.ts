import { describe, it, expect, beforeEach } from 'vitest'
import {
  safeStorage,
  STORAGE_KEYS,
  createDistrictBackup,
  restoreDistrictBackup,
  clearPersonnelData,
  clearAllDistrictStorage,
} from '../storageUtils'

describe('storageUtils', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  describe('safeStorage', () => {
    it('returns fallback when key does not exist', () => {
      const result = safeStorage.getItem('nonexistent_key', { fallback: true })
      expect(result).toEqual({ fallback: true })
    })

    it('returns fallback and does not crash when value is corrupted JSON', () => {
      localStorage.setItem('corrupted_key', '{ bad json, missing quote: 123')
      const result = safeStorage.getItem('corrupted_key', { safe: true })
      expect(result).toEqual({ safe: true })
    })

    it('safely sets and retrieves valid JSON objects', () => {
      const data = { district: 'Cañon City', id: 101 }
      const success = safeStorage.setItem('test_key', data)
      expect(success).toBe(true)

      const retrieved = safeStorage.getItem('test_key', null)
      expect(retrieved).toEqual(data)
    })

    it('removes keys safely', () => {
      safeStorage.setItem('temp_key', 'value')
      safeStorage.removeItem('temp_key')
      expect(localStorage.getItem('temp_key')).toBeNull()
    })
  })

  describe('backup and restore', () => {
    it('creates a structured backup of all ccs_ keys', () => {
      safeStorage.setItem(STORAGE_KEYS.CONFIG, { name: 'CCS RE-1' })
      safeStorage.setItem(STORAGE_KEYS.ACTIVE_LETTER, { id: 'letter-1' })
      localStorage.setItem('other_app_key', 'should not be in ccs backup')

      const backup = createDistrictBackup()
      expect(backup.app).toBe('Cañon City Schools — Board Letter Generator')
      expect(backup.version).toBe(1)
      expect(backup.payload[STORAGE_KEYS.CONFIG]).toEqual({ name: 'CCS RE-1' })
      expect(backup.payload[STORAGE_KEYS.ACTIVE_LETTER]).toEqual({ id: 'letter-1' })
      expect(backup.payload['other_app_key']).toBeUndefined()
    })

    it('restores valid backup data into storage', () => {
      const mockBackup = {
        app: 'Cañon City Schools — Board Letter Generator',
        version: 1,
        exportedAt: new Date().toISOString(),
        payload: {
          [STORAGE_KEYS.CONFIG]: { name: 'Restored District' },
          [STORAGE_KEYS.SAVED_LETTERS]: [{ id: 'restored-1' }],
        },
      }

      const result = restoreDistrictBackup(mockBackup)
      expect(result.success).toBe(true)
      expect(result.restoredKeys).toContain(STORAGE_KEYS.CONFIG)
      expect(result.restoredKeys).toContain(STORAGE_KEYS.SAVED_LETTERS)

      expect(safeStorage.getItem(STORAGE_KEYS.CONFIG, null)).toEqual({ name: 'Restored District' })
    })

    it('rejects malformed or invalid backup payloads', () => {
      const invalidResult = restoreDistrictBackup(null)
      expect(invalidResult.success).toBe(false)

      const emptyResult = restoreDistrictBackup({})
      expect(emptyResult.success).toBe(false)
    })
  })

  describe('privacy and cleanup controls', () => {
    it('clearPersonnelData removes drafts and rosters but keeps district config', () => {
      safeStorage.setItem(STORAGE_KEYS.CONFIG, { districtName: 'Keep This' })
      safeStorage.setItem(STORAGE_KEYS.ACTIVE_LETTER, { name: 'Clear This' })
      safeStorage.setItem(STORAGE_KEYS.SAVED_LETTERS, [{ name: 'Clear Draft' }])
      safeStorage.setItem(STORAGE_KEYS.BATCH_LETTERS, [{ name: 'Clear Batch' }])

      clearPersonnelData()

      expect(safeStorage.getItem(STORAGE_KEYS.CONFIG, null)).toEqual({ districtName: 'Keep This' })
      expect(localStorage.getItem(STORAGE_KEYS.ACTIVE_LETTER)).toBeNull()
      expect(localStorage.getItem(STORAGE_KEYS.SAVED_LETTERS)).toBeNull()
      expect(localStorage.getItem(STORAGE_KEYS.BATCH_LETTERS)).toBeNull()
    })

    it('clearAllDistrictStorage removes all ccs_ keys', () => {
      safeStorage.setItem(STORAGE_KEYS.CONFIG, { a: 1 })
      safeStorage.setItem('ccs_custom_key', { b: 2 })
      localStorage.setItem('keep_other_app', 'stays')

      clearAllDistrictStorage()

      expect(localStorage.getItem(STORAGE_KEYS.CONFIG)).toBeNull()
      expect(localStorage.getItem('ccs_custom_key')).toBeNull()
      expect(localStorage.getItem('keep_other_app')).toBe('stays')
    })
  })
})
