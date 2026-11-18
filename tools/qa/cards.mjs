// Mesure l'uniformité des cartes : grille du lab (accueil), liste recruteur. node tools/qa/cards.mjs [--url=…]
import { launch, parseArgs, serve, viewport } from './lib.mjs'
const { flags } = parseArgs()
const { url, stop } = await serve(flags.url)
const base = url.replace(/\/$/, '')
const b = await launch()
const sizes = (els) => els.map((e) => `${Math.round(e.getBoundingClientRect().width)}x${Math.round(e.getBoundingClientRect().height)}`)
for (const mobile of [false, true]) {
  const tag = mobile ? 'mobile' : 'bureau'
  const ctx = await b.newContext({ viewport: viewport(mobile), isMobile: mobile, hasTouch: mobile })
  const p = await ctx.newPage()
  await p.goto(`${base}/`, { waitUntil: 'domcontentloaded' })
  await p.waitForTimeout(4000)
  await p.evaluate(() => document.getElementById('lab')?.scrollIntoView())
  await p.waitForTimeout(3500)
  const lab = await p.evaluate(() => [...document.querySelectorAll('[data-card] > div, [data-card] button')].slice(0, 0).length)
  const grid = await p.evaluate(() => {
    const out = [...document.querySelectorAll('[data-card]')].map((e) => Math.round(e.getBoundingClientRect().height))
    return { n: out.length, uniques: [...new Set(out)] }
  })
  console.log(tag, 'accueil, hauteur des cartes du lab:', JSON.stringify(grid))
  await p.goto(`${base}/recruteur`, { waitUntil: 'domcontentloaded' })
  await p.goto(`${base}/recruteur/projets`, { waitUntil: 'networkidle' })
  const rec = await p.evaluate(() => {
    const out = [...document.querySelectorAll('main ul li > a')].map((e) => Math.round(e.getBoundingClientRect().height))
    return { n: out.length, uniques: [...new Set(out)] }
  })
  console.log(tag, 'recruteur, hauteur des cartes:', JSON.stringify(rec))
  await ctx.close()
}
await b.close()
await stop?.()
