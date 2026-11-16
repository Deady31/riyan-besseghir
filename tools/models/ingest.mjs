/**
 * Prépare des modèles 3D fournis (Sketchfab, Blender…) pour le site.
 *
 * Usage :
 *   1. déposer les fichiers .glb dans `tools/models/inbox/`
 *   2. npm run models
 *   3. ouvrir http://localhost:5173/model-preview pour les voir un par un (page de développement)
 *
 * Pour chaque modèle : recentrage au pivot, compression des maillages (meshopt), textures en WebP (1024 px max),
 * puis export dans `public/media/3d/user/<nom>.glb` et mise à jour de `public/media/3d/user/index.json`.
 * Les matières et textures d'origine sont conservées. Un avertissement s'affiche au-delà de 50 000 triangles ou de 2 Mo.
 */
import { execFileSync } from 'node:child_process'
import { mkdirSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs'
import { basename, extname, join, resolve } from 'node:path'
import { NodeIO } from '@gltf-transform/core'
import { ALL_EXTENSIONS } from '@gltf-transform/extensions'

const root = resolve(import.meta.dirname, '..', '..')
const inbox = join(root, 'tools', 'models', 'inbox')
const out = join(root, 'public', 'media', '3d', 'user')
const MAX_BYTES = 2 * 1024 * 1024
const MAX_TRIS = 50_000
/** Au-delà de ce nombre de triangles, le maillage est simplifié jusqu'à cette cible (un jouet 3D n'a pas besoin de plus). */
const TARGET_TRIS = 28_000

mkdirSync(inbox, { recursive: true })
mkdirSync(out, { recursive: true })

const slug = (name) =>
  name
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

// Sans shell : les chemins avec des espaces (dossier « QG IA JOB ») passent tels quels.
const cli = join(root, 'node_modules', '@gltf-transform', 'cli', 'bin', 'cli.js')
const gt = (...args) => execFileSync(process.execPath, [cli, ...args], { stdio: 'pipe', encoding: 'utf8' })

/** Triangles du fichier d'origine : indices / 3 par primitive (ou sommets / 3 sans indices). */
async function countTriangles(path) {
  const doc = await new NodeIO().registerExtensions(ALL_EXTENSIONS).read(path)
  let n = 0
  for (const mesh of doc.getRoot().listMeshes()) {
    for (const prim of mesh.listPrimitives()) {
      const idx = prim.getIndices()
      const pos = prim.getAttribute('POSITION')
      n += Math.floor((idx ? idx.getCount() : (pos?.getCount() ?? 0)) / 3)
    }
  }
  return n || null
}

const files = readdirSync(inbox).filter((f) => ['.glb', '.gltf'].includes(extname(f).toLowerCase()))
if (files.length === 0) {
  console.log(`Aucun modèle dans ${inbox}. Dépose des .glb puis relance.`)
  process.exit(0)
}

const index = []
for (const file of files) {
  const name = slug(basename(file, extname(file)))
  const src = join(inbox, file)
  const dst = join(out, `${name}.glb`)
  process.stdout.write(`• ${file} → ${name}.glb … `)
  try {
    // Le recentrage se fait avant la compression : l'inverse décompresserait les maillages.
    const tmp = join(out, `${name}.centered.glb`)
    const tris = await countTriangles(src)
    gt('center', src, tmp, '--pivot', 'center')
    let from = tmp
    if (tris && tris > TARGET_TRIS) {
      const slim = join(out, `${name}.slim.glb`)
      gt('simplify', tmp, slim, '--ratio', String((TARGET_TRIS / tris).toFixed(3)), '--error', '0.01')
      from = slim
    }
    gt('optimize', from, dst, '--compress', 'meshopt', '--texture-compress', 'webp', '--texture-size', '1024')
    rmSync(tmp, { force: true })
    rmSync(join(out, `${name}.slim.glb`), { force: true })
    const bytes = statSync(dst).size
    const warn = []
    if (bytes > MAX_BYTES) warn.push(`${(bytes / 1048576).toFixed(1)} Mo (> 2 Mo)`)
    if (tris && tris > MAX_TRIS) warn.push(`${tris} triangles simplifiés vers ${TARGET_TRIS}`)
    console.log(`${(bytes / 1024).toFixed(0)} Ko${tris ? `, ${tris} triangles` : ''}${warn.length ? `  ⚠ ${warn.join(', ')}` : '  ✓'}`)
    index.push({ name, file: `${name}.glb`, kb: Math.round(bytes / 1024), triangles: tris })
  } catch (e) {
    console.log('ÉCHEC')
    console.error(String(e.stderr || e.message).split('\n').slice(0, 6).join('\n'))
  }
}
writeFileSync(join(out, 'index.json'), JSON.stringify(index, null, 2) + '\n')
console.log(`\n${index.length} modèle(s) prêt(s) dans public/media/3d/user/ (index.json mis à jour).`)
