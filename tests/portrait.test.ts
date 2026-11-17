import { existsSync, statSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

describe('portrait du hero', () => {
  it('la version « naturel » existe et reste légère', () => {
    const file = 'public/media/portrait/naturel.webp'
    expect(existsSync(file)).toBe(true)
    expect(statSync(file).size).toBeLessThan(200 * 1024)
  })
})
