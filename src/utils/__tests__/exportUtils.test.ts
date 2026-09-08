import { describe, it, expect, vi } from 'vitest'
import { copyLetterText } from '../exportUtils'
import { DEFAULT_DISTRICT_CONFIG, SAMPLE_PRESETS } from '../sampleData'

describe('exportUtils', () => {
  it('copyLetterText writes unified plain text to clipboard', async () => {
    let clipboardText = ''
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockImplementation((text: string) => {
          clipboardText = text
          return Promise.resolve()
        }),
      },
    })

    const letter = SAMPLE_PRESETS[0].letter // Certified sample
    await copyLetterText(letter, DEFAULT_DISTRICT_CONFIG)

    expect(navigator.clipboard.writeText).toHaveBeenCalled()
    expect(clipboardText).toContain(letter.letterDate)
    expect(clipboardText).toContain(letter.recipientFirstName)
    expect(clipboardText).toContain('On behalf of Cañon City Schools')
    expect(clipboardText).toContain('Sincerely,')
    expect(clipboardText).toContain('Cc: personnel file')
  })
})
