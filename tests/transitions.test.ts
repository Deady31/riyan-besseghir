import { describe, expect, it } from 'vitest'
import { PRESETS } from '../src/components/backgrounds/ChapterBg'
import { UI_TEXT } from '../src/i18n/ui'

describe('transitions plein écran', () => {
  it('chaque chapitre a son fond, sans citron', () => {
    const kinds = Object.keys(PRESETS)
    for (const k of ['top', 'morph', 'deck', 'feats', 'studio', 'demo', 'ia', 'lab', 'about', 'passions', 'contact', 'onair']) expect(kinds).toContain(k)
    expect(JSON.stringify(PRESETS).toUpperCase()).not.toContain('#FFD83D')
  })
  it('le mot du glitch existe en FR et en EN', () => {
    for (const l of ['fr', 'en'] as const) {
      expect(UI_TEXT[l].night.word.length).toBeGreaterThan(0)
      expect(UI_TEXT[l].night.aria.length).toBeGreaterThan(0)
    }
  })
})
