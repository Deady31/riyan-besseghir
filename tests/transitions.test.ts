import { describe, expect, it } from 'vitest'
import { WAVE_TONES } from '../src/components/backgrounds/WaveField'
import { UI_TEXT } from '../src/i18n/ui'

describe('transitions plein écran', () => {
  it('un seul fond : la vague, claire sur le crème et sombre sur les nuits, sans citron', () => {
    expect(Object.keys(WAVE_TONES).sort()).toEqual(['dark', 'light'])
    expect(WAVE_TONES.dark.color[2]).toBeGreaterThan(WAVE_TONES.light.color[0])
    expect(JSON.stringify(WAVE_TONES)).not.toContain('FFD83D')
  })
})
