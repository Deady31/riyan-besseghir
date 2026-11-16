import { existsSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import depth from '../src/data/depth.json'
import { PROJECTS } from '../src/data/projects'

describe('vignettes du champ de profondeur', () => {
  it('chaque entrée correspond à un projet et à un fichier existant', () => {
    const ids = new Set(PROJECTS.map((p) => p.id))
    for (const d of depth) {
      expect(ids.has(d.id), `projet inconnu : ${d.id}`).toBe(true)
      expect(existsSync(`public/media/depth/${d.id}.webp`), `fichier manquant : ${d.id}`).toBe(true)
    }
  })
  it('identifiants uniques et tailles valides', () => {
    expect(new Set(depth.map((d) => d.id)).size).toBe(depth.length)
    for (const d of depth) {
      expect(d.w).toBeGreaterThan(0)
      expect(d.h).toBeGreaterThan(0)
    }
  })
  it('assez de vignettes pour remplir le champ sur ordinateur (26 cartes)', () => {
    expect(depth.length).toBeGreaterThanOrEqual(26)
  })
})
