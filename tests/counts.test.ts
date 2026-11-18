import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { PROJECTS } from '../src/data/projects'
import { UI_TEXT } from '../src/i18n/ui'

describe('nombre de projets cité dans les textes', () => {
  const n = PROJECTS.length
  it('les textes suivent le vrai nombre de projets', () => {
    expect(UI_TEXT.fr.morph.sr).toContain(String(n))
    expect(UI_TEXT.en.morph.sr).toContain(String(n))
    expect(UI_TEXT.fr.hero.statement).toContain(String(n))
  })
  it('la méta description de index.html cite le bon nombre', () => {
    expect(readFileSync('index.html', 'utf8')).toContain(`${n} projets construits`)
  })
})
