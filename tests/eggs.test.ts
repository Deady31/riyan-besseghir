// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { eggsFound, markFound } from '../src/lib/eggs'

beforeEach(() => localStorage.clear())
afterEach(() => vi.restoreAllMocks())

describe('eggsFound', () => {
  it('renvoie [] si le stockage est vide', () => {
    expect(eggsFound()).toEqual([])
  })

  it('renvoie [] si le JSON est corrompu', () => {
    localStorage.setItem('eggs-found', '{pas du json')
    expect(eggsFound()).toEqual([])
  })

  it('renvoie [] si la valeur est un objet et non un tableau', () => {
    localStorage.setItem('eggs-found', '{"a":1}')
    expect(eggsFound()).toEqual([])
  })

  it('ignore les entrées qui ne sont pas des chaînes', () => {
    localStorage.setItem('eggs-found', JSON.stringify(['a', 3, null, 'b', {}]))
    expect(eggsFound()).toEqual(['a', 'b'])
  })

  it('renvoie [] si le stockage lève une erreur', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('SecurityError')
    })
    expect(eggsFound()).toEqual([])
  })
})

describe('markFound', () => {
  it('renvoie true une seule fois par id et persiste', () => {
    expect(markFound('x', 3)).toBe(true)
    expect(markFound('x', 3)).toBe(false)
    expect(markFound('y', 3)).toBe(true)
    expect(eggsFound()).toEqual(['x', 'y'])
  })

  it('émet egg-found avec le compte et le total, une seule fois par œuf', () => {
    const seen: unknown[] = []
    const on = (e: Event) => seen.push((e as CustomEvent).detail)
    window.addEventListener('egg-found', on)
    markFound('x', 5)
    markFound('x', 5)
    markFound('y', 5)
    window.removeEventListener('egg-found', on)
    expect(seen).toEqual([
      { count: 1, total: 5 },
      { count: 2, total: 5 },
    ])
  })

  it('renvoie true et émet quand même si l\'écriture échoue', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceeded')
    })
    const on = vi.fn()
    window.addEventListener('egg-found', on)
    expect(markFound('x', 2)).toBe(true)
    window.removeEventListener('egg-found', on)
    expect(on).toHaveBeenCalledTimes(1)
  })

  it('repart d\'une liste corrompue sans planter', () => {
    localStorage.setItem('eggs-found', 'zzz')
    expect(markFound('x', 1)).toBe(true)
    expect(eggsFound()).toEqual(['x'])
  })
})
