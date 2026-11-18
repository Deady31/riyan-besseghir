// Parcours de la version recruteur : choix, accueil, pages (projets, fiche, parcours…), retour à tout moment.
// Usage : node tools/qa/recruiter.mjs [--url=https://…]
import { OUT, launch, parseArgs, serve, viewport } from './lib.mjs'

const { flags } = parseArgs()
const { url, stop } = await serve(flags.url)
const b = await launch()
const base = url.replace(/\/$/, '')
const path = (p) => new URL(p.url()).pathname
for (const mobile of [false, true]) {
  const tag = mobile ? 'm' : 'd'
  const ctx = await b.newContext({ viewport: viewport(mobile), isMobile: mobile, hasTouch: mobile, fresh: true })
  const p = await ctx.newPage()
  const errors = []
  p.on('pageerror', (e) => errors.push(e.message))
  await p.goto(`${base}/`, { waitUntil: 'networkidle' })
  await p.getByRole('button', { name: /version recruteur/i }).click()
  await p.waitForURL('**/recruteur')
  await p.waitForTimeout(600)
  await p.screenshot({ path: `${OUT}rec-${tag}-page.png` })
  await p.getByRole('link', { name: /voir mes projets/i }).first().click()
  await p.waitForURL('**/recruteur/projets')
  await p.waitForTimeout(1200)
  await p.screenshot({ path: `${OUT}rec-${tag}-projets.png` })
  const imgs = await p.evaluate(() => [...document.images].filter((i) => i.complete && i.naturalWidth > 0).length)
  console.log(tag, 'images chargées dans la liste:', imgs)
  await p.getByRole('link', { name: /fooder/i }).first().click()
  await p.waitForURL('**/recruteur/projets/fooder')
  await p.waitForTimeout(800)
  await p.screenshot({ path: `${OUT}rec-${tag}-fiche.png` })
  await p.getByRole('link', { name: /^retour$/i }).click()
  console.log(tag, 'retour fiche →', path(p))
  await p.goBack()
  await p.waitForTimeout(300)
  console.log(tag, 'retour navigateur →', path(p))
  for (const r of ['parcours', 'competences', 'contact', 'agent']) {
    await p.goto(`${base}/recruteur/${r}`, { waitUntil: 'networkidle' })
    await p.screenshot({ path: `${OUT}rec-${tag}-${r}.png` })
  }
  const overflow = await p.evaluate(() => document.documentElement.scrollWidth > innerWidth)
  console.log(tag, 'erreurs:', errors.length, errors.join(' | '), '| scroll horizontal:', overflow)
  await ctx.close()
}
await b.close()
await stop?.()
