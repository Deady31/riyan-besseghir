// Outils communs des scripts de vérification (captures, perf, contrôle fonctionnel).
// Aucun téléchargement : Playwright doit déjà exister (paquet `playwright`, variable PLAYWRIGHT_PATH, ou chemin local connu).
import { spawn, execFileSync } from 'node:child_process'
import { mkdirSync } from 'node:fs'
import { fileURLToPath, pathToFileURL } from 'node:url'

export const PORT = 5195
export const OUT = fileURLToPath(new URL('./out/', import.meta.url))
mkdirSync(OUT, { recursive: true })

export async function loadPlaywright() {
  const tries = [
    () => import('playwright'),
    () => (process.env.PLAYWRIGHT_PATH ? import(pathToFileURL(process.env.PLAYWRIGHT_PATH).href) : Promise.reject(new Error('pas de PLAYWRIGHT_PATH'))),
    () => import('file:///C:/Users/RIYAN/Desktop/QG%20IA%20JOB/Projet%20ANTIGRAVITY/Projet%20TEST%20FOODER/node_modules/playwright/index.mjs'),
  ]
  for (const t of tries) {
    try {
      return await t()
    } catch {
      /* suivant */
    }
  }
  throw new Error('Playwright introuvable : `npm i -D playwright` (puis `npx playwright install chromium`) ou PLAYWRIGHT_PATH=…/playwright/index.mjs')
}

/** Arguments Chromium : vrai GPU sous Windows, rendu logiciel ailleurs (CI, cloud). */
export const gpuArgs = () =>
  process.platform === 'win32'
    ? ['--use-angle=d3d11', '--enable-gpu', '--ignore-gpu-blocklist']
    : ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist']

export async function launch(extra = []) {
  const { chromium } = await loadPlaywright()
  return chromium.launch({ headless: true, args: [...gpuArgs(), ...extra] })
}

/** Sert `dist/` avec `vite preview` et renvoie { url, stop }. Si --url est donné, ne lance rien. */
export async function serve(urlArg) {
  if (urlArg) return { url: urlArg, stop: () => {} }
  const url = `http://localhost:${PORT}/`
  const child = spawn('npx', ['vite', 'preview', '--port', String(PORT), '--strictPort'], { shell: true, stdio: 'ignore' })
  for (let i = 0; i < 80; i++) {
    try {
      if ((await fetch(url)).ok) break
    } catch {
      /* pas encore prêt */
    }
    await new Promise((r) => setTimeout(r, 250))
  }
  let stopped = false
  const stop = () => {
    if (stopped) return
    stopped = true
    try {
      if (process.platform === 'win32') execFileSync('taskkill', ['/pid', String(child.pid), '/T', '/F'], { stdio: 'ignore' })
      else child.kill('SIGTERM')
    } catch {
      /* déjà arrêté */
    }
  }
  process.on('exit', stop)
  return { url, stop }
}

/** Options `--mobile`, `--url=…`, `--name=…`, plus les arguments positionnels. */
export function parseArgs(argv = process.argv.slice(2)) {
  const flags = {}
  const pos = []
  for (const a of argv) {
    if (a.startsWith('--')) {
      const [k, v] = a.slice(2).split('=')
      flags[k] = v ?? true
    } else pos.push(a)
  }
  return { flags, pos }
}

export const viewport = (mobile) => (mobile ? { width: 390, height: 844 } : { width: 1440, height: 900 })
