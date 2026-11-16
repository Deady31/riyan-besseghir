// Petites vignettes des captures de projets pour l'effet « champ de profondeur » (chapitre 39 projets).
// Usage : node scripts/make-depth-thumbs.mjs   (à relancer quand des captures changent)
// Sorties : public/media/depth/<id>.webp (≈ 10 à 25 Ko chacune) et src/data/depth.json (liste des vignettes et leurs tailles).
import { mkdirSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'
import { PROJECTS } from '../src/data/projects.ts'

const root = fileURLToPath(new URL('../', import.meta.url))
const out = `${root}public/media/depth/`
mkdirSync(out, { recursive: true })

const manifest = []
for (const p of PROJECTS) {
  const shot = p.shots.find((s) => s.frame === 'mobile') ?? p.shots[0]
  if (!shot) continue
  const [w, h] = shot.frame === 'mobile' ? [220, 330] : [360, 225]
  try {
    await sharp(`${root}public${shot.src}`).resize(w, h, { fit: 'cover', position: 'top' }).webp({ quality: 76 }).toFile(`${out}${p.id}.webp`)
    manifest.push({ id: p.id, w, h })
  } catch (e) {
    console.warn(`  ignoré : ${p.id} (${shot.src}) ${e.message}`)
  }
}
writeFileSync(`${root}src/data/depth.json`, JSON.stringify(manifest) + '\n')
console.log(`${manifest.length} vignettes dans public/media/depth/ ; manifeste src/data/depth.json`)
