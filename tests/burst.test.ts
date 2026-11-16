import { beforeEach, describe, expect, it, vi } from 'vitest'

type Mod = typeof import('../src/lib/burst')
let m: Mod

beforeEach(async () => {
  vi.resetModules()
  m = await import('../src/lib/burst')
})

describe('burst', () => {
  it('crée le nombre demandé de particules (14 par défaut)', () => {
    m.burst(0, 0)
    expect(m.stepBurst(0)).toBe(14)
    m.burst(0, 0, { count: 3 })
    expect(m.stepBurst(0)).toBe(17)
  })

  it('plafonne à 160 particules', () => {
    m.burst(0, 0, { count: 500 })
    expect(m.stepBurst(0)).toBe(160)
    m.burst(0, 0, { count: 100 })
    expect(m.stepBurst(0)).toBe(160)
  })

  it('les particules meurent après leur durée de vie (< 1,3 s)', () => {
    m.burst(0, 0, { count: 20 })
    expect(m.stepBurst(0.1)).toBe(20)
    expect(m.stepBurst(2)).toBe(0)
    expect(m.stepBurst(0.1)).toBe(0)
  })

  it('setBurstEnabled(false) ne crée aucune particule, puis reprend', () => {
    m.setBurstEnabled(false)
    m.burst(0, 0, { count: 50 })
    expect(m.stepBurst(0)).toBe(0)
    m.setBurstEnabled(true)
    m.burst(0, 0, { count: 5 })
    expect(m.stepBurst(0)).toBe(5)
  })

  it('réveille le canvas à chaque explosion, sauf si désactivé', () => {
    const wake = vi.fn()
    m.onBurstWake(wake)
    m.burst(0, 0)
    expect(wake).toHaveBeenCalledTimes(1)
    m.setBurstEnabled(false)
    m.burst(0, 0)
    expect(wake).toHaveBeenCalledTimes(1)
  })

  it('count: 0 ne crée rien', () => {
    m.burst(0, 0, { count: 0 })
    expect(m.stepBurst(0)).toBe(0)
  })
})
