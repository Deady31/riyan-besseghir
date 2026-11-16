// Génère les images de partage (Open Graph, 1200×630) : une par projet + l'accueil, dans public/og/.
// À relancer quand un titre, un slogan ou une catégorie change :  node tools/og/build_og.mjs
// Nécessite Playwright (déjà installé dans l'environnement de dev) ; les données viennent de src/data/projects.ts.
import { createRequire } from 'node:module'
import { execSync } from 'node:child_process'
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { CATEGORIES, PROJECTS } from '../../src/data/projects.ts'

const require = createRequire(import.meta.url)
let chromium
try {
  ;({ chromium } = require('playwright'))
} catch {
  ;({ chromium } = require(require.resolve('playwright', { paths: [execSync('npm root -g').toString().trim()] })))
}

const out = fileURLToPath(new URL('../../public/og/', import.meta.url))
mkdirSync(out, { recursive: true })
const font = readFileSync(fileURLToPath(new URL('../../node_modules/@fontsource-variable/sora/files/sora-latin-wght-normal.woff2', import.meta.url))).toString('base64')

// Même langage que le site : ivoire, encre, cobalt, vermillon, jaune acide, chrome.
const TONES = {
  ia: { bg: '#254dff', fg: '#f1ebdd' },
  consumer: { bg: '#f05235', fg: '#20211f' },
  outils: { bg: '#d9dce0', fg: '#20211f' },
  jeux: { bg: '#d9f05a', fg: '#20211f' },
  pm: { bg: '#20211f', fg: '#f1ebdd' },
  clients: { bg: '#d9dce0', fg: '#20211f' },
}
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

const page = ({ bg, fg, kicker, title, sub, pill }) => `<!doctype html><meta charset="utf-8"><style>
@font-face{font-family:Sora;src:url(data:font/woff2;base64,${font}) format('woff2');font-weight:100 800}
*{box-sizing:border-box;margin:0}
body{width:1200px;height:630px;background:#f1ebdd;font-family:Sora,sans-serif;color:#20211f;position:relative;overflow:hidden}
.card{position:absolute;inset:32px;border-radius:72px;background:${bg};color:${fg};padding:56px 64px;display:flex;flex-direction:column}
.row{display:flex;gap:12px;align-items:center}
.pill{font-size:20px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;padding:10px 22px;border-radius:99px;border:2px solid currentColor}
.pill.solid{background:#f1ebdd;color:#20211f;border-color:#f1ebdd}
h1{margin-top:auto;padding-top:28px;font-weight:700;text-transform:uppercase;letter-spacing:-.05em;line-height:.9;max-width:900px;overflow-wrap:anywhere}
p.sub{margin-top:22px;font-size:32px;line-height:1.25;font-weight:500;max-width:860px;opacity:.92}
.foot{margin-top:34px;display:flex;justify-content:space-between;font-size:22px;font-weight:600;letter-spacing:.04em}
.dot{display:inline-block;width:14px;height:14px;border-radius:50%;background:${bg === '#f05235' ? '#20211f' : '#f05235'};margin-left:10px}
.orb{position:absolute;right:-70px;top:-70px;width:330px;height:330px;border-radius:50%;background:radial-gradient(circle at 32% 28%,#fff,#d9dce0 38%,#8a8f98 100%);opacity:.9}
</style><body><div class="card"><div class="orb"></div><div class="row" style="position:relative"><span class="pill solid">${esc(pill)}</span><span class="pill">${esc(kicker)}</span></div>
<h1 id="t" style="position:relative;font-size:170px">${esc(title)}</h1>
<p class="sub" style="position:relative">${esc(sub)}</p>
<div class="foot" style="position:relative"><span>riyan.world<i class="dot"></i></span><span>Riyan Besseghir · AI Product Manager</span></div></div>
</body>`

const cards = [
  { file: 'home', bg: '#254dff', fg: '#f1ebdd', kicker: 'Toulouse · Paris · Remote', title: 'Riyan Besseghir', sub: `AI Product Manager. Je fais passer l’IA du slide à la prod. ${PROJECTS.length} projets construits.`, pill: 'Portfolio' },
  ...PROJECTS.map((p) => {
    const tone = TONES[p.category] ?? TONES.pm
    const cat = CATEGORIES.find((c) => c.id === p.category)?.label ?? ''
    return { file: p.id, ...tone, kicker: cat, title: p.title, sub: p.tagline, pill: p.status }
  }),
]

const browser = await chromium.launch()
const ctx = await browser.newContext({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 })
const pg = await ctx.newPage()
for (const c of cards) {
  await pg.setContent(page(c))
  await pg.evaluate(async () => {
    await document.fonts.load('700 100px Sora')
    await document.fonts.ready
    // Le titre prend la plus grande taille qui tient en 900 px de large et 230 px de haut, sans couper de mot.
    const h = document.getElementById('t')
    let s = 170
    h.style.overflowWrap = 'normal'
    while ((h.scrollWidth > 900 || h.offsetHeight > 230) && s > 40) {
      s -= 3
      h.style.fontSize = s + 'px'
    }
  })
  await pg.screenshot({ path: `${out}${c.file}.png` })
}
await browser.close()
writeFileSync(`${out}.gitkeep`, '')
console.log(`og : ${cards.length} images dans public/og/`)
