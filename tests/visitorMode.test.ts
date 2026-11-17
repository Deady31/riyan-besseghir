import { describe, expect, it } from 'vitest'
import { UI_TEXT } from '../src/i18n/ui'
const { fr, en } = UI_TEXT

describe('version recruteur : textes', () => {
  it('FR et EN exposent les mêmes clés pour le choix et la page recruteur', () => {
    expect(Object.keys(en.gate).sort()).toEqual(Object.keys(fr.gate).sort())
    expect(Object.keys(en.recruiter).sort()).toEqual(Object.keys(fr.recruiter).sort())
    expect(en.nav.recruiter).toBeTruthy()
    expect(fr.nav.recruiter).toBeTruthy()
  })
})
