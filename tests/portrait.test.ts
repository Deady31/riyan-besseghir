import { existsSync, statSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

describe('portrait estampe du hero', () => {
  for (const layer of ['fill', 'dots', 'ink']) {
    it(`la plaque « ${layer} » existe et reste légère`, () => {
      const file = `public/media/portrait/${layer}.webp`
      expect(existsSync(file)).toBe(true)
      expect(statSync(file).size).toBeLessThan(220 * 1024)
    })
  }
})
