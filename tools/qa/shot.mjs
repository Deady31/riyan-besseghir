// Captures par chapitre, en une commande, avec une planche récapitulative légère (une seule image à regarder).
// Usage : node tools/qa/shot.mjs deck:0.1,contact:0.1 [--mobile] [--url=https://…] [--name=v38]
//   chapitre:fraction → défile jusqu'au haut du chapitre (fraction = part de la hauteur d'écran, 0 = haut de la section).
// Sortie : tools/qa/out/<name>-<chapitre>.png et tools/qa/out/<name>-planche.png (affichée en petit).
import { writeFileSync } from 'node:fs'
import { OUT, launch, parseArgs, serve, viewport } from './lib.mjs'

const { flags, pos } = parseArgs()
const specs = (pos[0] ?? 'top:0').split(',').map((s) => s.split(':'))
const mobile = !!flags.mobile
const name = flags.name ?? (mobile ? 'm' : 'd')
const { url, stop } = await serve(flags.url)
const b = await launch()
const p = await (await b.newContext({ viewport: viewport(mobile), isMobile: mobile, hasTouch: mobile })).newPage()
await p.goto(url, { waitUntil: 'domcontentloaded' })
await p.waitForTimeout(6000)
const files = []
for (const [id, frac = '0'] of specs) {
  await p.evaluate(
    async ([id, frac]) => {
      const s = document.getElementById(id)
      if (!s) return
      window.scrollTo(0, s.getBoundingClientRect().top + scrollY + innerHeight * Number(frac))
      await new Promise((r) => setTimeout(r, 2600))
    },
    [id, frac],
  )
  const f = `${OUT}${name}-${id}.png`
  await p.screenshot({ path: f })
  files.push(f)
}
// Planche : toutes les captures en petit sur une seule image (le moins de tokens possible à relire).
const cols = Math.min(4, files.length)
const w = mobile ? 140 : 480
const h = mobile ? 300 : 300
const { readFileSync } = await import('node:fs')
const imgs = files.map((f) => `<img src="data:image/png;base64,${readFileSync(f).toString('base64')}" style="width:${w}px;height:${h}px;object-fit:cover;object-position:top">`).join('')
const g = await b.newPage({ viewport: { width: cols * (w + 8), height: Math.ceil(files.length / cols) * (h + 8) } })
await g.setContent(`<body style="margin:0;background:#1e1e1e;display:grid;grid-template-columns:repeat(${cols},${w}px);gap:8px">${imgs}</body>`)
await g.waitForTimeout(400)
const planche = `${OUT}${name}-planche.png`
writeFileSync(planche, await g.screenshot())
await b.close()
stop()
console.log(planche)
