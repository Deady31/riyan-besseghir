import { describe, expect, it } from 'vitest'
import { maskSensitive, route } from '../src/lib/bankDemo'

describe('démo bancaire : garde-fou', () => {
  it('masque un IBAN et le signale', () => {
    const r = maskSensitive('Mon IBAN est FR76 3000 6000 0112 3456 7890 189 merci')
    expect(r.found).toContain('IBAN')
    expect(r.text).not.toMatch(/FR76/)
    expect(r.text).toContain('[IBAN MASQUÉ]')
  })
  it('masque un numéro de carte, un code et un e-mail', () => {
    const r = maskSensitive('carte 4970 1234 5678 9012, mon code est 1234, a@b.fr')
    expect(r.found).toEqual(expect.arrayContaining(['carte', 'code', 'e-mail']))
    expect(r.text).not.toMatch(/4970|1234|a@b\.fr/)
  })
  it('laisse intact un message sans donnée sensible', () => {
    const r = maskSensitive('J’ai perdu ma carte hier soir')
    expect(r.found).toEqual([])
    expect(r.text).toBe('J’ai perdu ma carte hier soir')
  })
})

describe('démo bancaire : routage', () => {
  it.each([
    ['J’ai perdu ma carte', 'lost'],
    ['on m’a volé mon portefeuille', 'lost'],
    ['Quels sont les frais sur ma carte ?', 'fees'],
    ['je veux faire une réclamation', 'claim'],
    ['j’ai oublié mon code', 'code'],
    ['je veux parler à un conseiller', 'human'],
    ['I lost my card', 'lost'],
    ['What are the fees on my card?', 'fees'],
    ['I want to file a complaint', 'claim'],
    ['I forgot my code', 'code'],
    ['Talk to an advisor', 'human'],
    ['quelle est la météo demain', 'unknown'],
  ])('%s → %s', (text, intent) => {
    expect(route(text)).toBe(intent)
  })
})
