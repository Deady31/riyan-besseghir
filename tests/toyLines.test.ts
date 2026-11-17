import { describe, expect, it } from 'vitest'
import { GENERIC_LINES, TOY_LINES, pickLine, type Ev } from '../src/data/toyLines'

const EVENTS: Ev[] = ['grab', 'tap', 'throw']

describe('répliques des objets', () => {
  it('chaque objet a au moins une réplique par événement, en français et en anglais', () => {
    for (const [kind, lines] of Object.entries(TOY_LINES)) {
      for (const ev of EVENTS) {
        const l = lines.filter((x) => x[0] === ev)
        expect(l.length, `${kind}/${ev}`).toBeGreaterThanOrEqual(2)
        expect(l.every((x) => x[1].length > 1 && x[2].length > 1), `${kind}/${ev}`).toBe(true)
      }
    }
    for (const ev of EVENTS) expect(GENERIC_LINES.some((x) => x[0] === ev)).toBe(true)
  })
  it('ne répète jamais la réplique précédente quand il y a le choix', () => {
    for (const lang of ['fr', 'en'] as const) {
      const first = pickLine('cat', 'tap', lang, undefined, () => 0)
      for (let i = 0; i < 30; i++) expect(pickLine('cat', 'tap', lang, first, () => i / 30)).not.toBe(first)
    }
  })
  it('un objet inconnu retombe sur les répliques génériques', () => {
    expect(pickLine('truc-inconnu', 'throw', 'fr')).toBeTruthy()
    expect(pickLine(undefined, 'grab', 'en')).toBeTruthy()
  })
  it('les répliques d’un objet lui sont propres (le chat miaule, la manette joue)', () => {
    expect(JSON.stringify(TOY_LINES.cat).toLowerCase()).toContain('miaou')
    expect(JSON.stringify(TOY_LINES.gamepad)).toContain('Start')
  })
})
