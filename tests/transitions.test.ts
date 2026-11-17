import { describe, expect, it } from 'vitest'
import { makeTiles, mulberry } from '../src/components/fx/HeroMosaic'
import { PRESETS } from '../src/components/backgrounds/ChapterBg'
import { UI_TEXT } from '../src/i18n/ui'

describe('transitions plein écran', () => {
  it('le générateur est déterministe', () => {
    expect(mulberry(5)()).toBe(mulberry(5)())
  })
  it('la mosaïque couvre toute la grille, sans citron', () => {
    const tiles = makeTiles(5, 6)
    expect(tiles).toHaveLength(30)
    expect(tiles.every((t) => t.back.toUpperCase() !== '#FFD83D')).toBe(true)
    expect(makeTiles(5, 6)).toEqual(tiles)
  })
  it('chaque chapitre a son fond, sans citron', () => {
    const kinds = Object.keys(PRESETS)
    for (const k of ['top', 'morph', 'deck', 'feats', 'studio', 'demo', 'ia', 'lab', 'about', 'passions', 'contact', 'holo', 'onair']) expect(kinds).toContain(k)
    expect(JSON.stringify(PRESETS).toUpperCase()).not.toContain('#FFD83D')
  })
  it('le mot du glitch existe en FR et en EN', () => {
    for (const l of ['fr', 'en'] as const) {
      expect(UI_TEXT[l].night.word.length).toBeGreaterThan(0)
      expect(UI_TEXT[l].night.aria.length).toBeGreaterThan(0)
    }
  })
})
