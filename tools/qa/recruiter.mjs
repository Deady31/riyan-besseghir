// Captures de la version recruteur : écran de choix, page recruteur (bureau + mobile), choix mémorisé.
// Usage : node tools/qa/recruiter.mjs [--url=https://…]
import { OUT, launch, parseArgs, serve, viewport } from './lib.mjs'

const { flags } = parseArgs()
const { url, stop } = await serve(flags.url)
const b = await launch()
const base = url.replace(/\/$/, '')
for (const mobile of [false, true]) {
  const tag = mobile ? 'm' : 'd'
  const ctx = await b.newContext({ viewport: viewport(mobile), isMobile: mobile, hasTouch: mobile })
  const p = await ctx.newPage()
  const errors = []
  p.on('pageerror', (e) => errors.push(e.message))
  await p.goto(`${base}/`, { waitUntil: 'networkidle' })
  await p.screenshot({ path: `${OUT}rec-${tag}-gate.png` })
  await p.getByRole('button', { name: /version recruteur/i }).click()
  await p.waitForURL('**/recruteur')
  await p.waitForTimeout(800)
  await p.screenshot({ path: `${OUT}rec-${tag}-page.png`, fullPage: true })
  await p.goto(`${base}/`, { waitUntil: 'networkidle' })
  console.log(tag, 'retour à / →', new URL(p.url()).pathname, '| erreurs:', errors.length, errors.join(' | '))
  const overflow = await p.evaluate(() => document.documentElement.scrollWidth > innerWidth)
  console.log(tag, 'scroll horizontal:', overflow)
  await ctx.close()
}
await b.close()
await stop?.()
