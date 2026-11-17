import { describe, expect, it } from 'vitest'
import { makeTiles, mulberry } from '../src/components/fx/HeroMosaic'
import { makeBlobs, makeDrips } from '../src/components/fx/PaintSplash'
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
  it('les coulures restent dans l’écran et de longueurs variées', () => {
    const d = makeDrips(22)
    expect(d.length).toBeGreaterThan(8)
    expect(d.every((x) => x.left < 101 && x.length > 0)).toBe(true)
    expect(new Set(d.map((x) => Math.round(x.length))).size).toBeGreaterThan(4)
    expect(makeBlobs(14).every((b) => b.color.toUpperCase() !== '#FFD83D')).toBe(true)
  })
  it('le mot du glitch existe en FR et en EN', () => {
    for (const l of ['fr', 'en'] as const) {
      expect(UI_TEXT[l].night.word.length).toBeGreaterThan(0)
      expect(UI_TEXT[l].night.aria.length).toBeGreaterThan(0)
    }
  })
})
