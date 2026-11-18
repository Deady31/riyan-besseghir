// Capture d'une section en entier (bureau ou mobile), en tranches d'écran : node tools/qa/sec.mjs <id> [--mobile] [--name=x] [--url=…]
import { OUT, launch, parseArgs, serve, viewport } from './lib.mjs'
const { flags, pos } = parseArgs()
const id = pos[0]
const mobile = !!flags.mobile
const { url, stop } = await serve(flags.url)
const b = await launch()
const p = await (await b.newContext({ viewport: viewport(mobile), isMobile: mobile, hasTouch: mobile })).newPage()
await p.goto(url, { waitUntil: 'domcontentloaded' })
await p.waitForTimeout(4500)
await p.evaluate(() => scrollTo(0, 2500))
await p.waitForTimeout(3500)
const r = await p.evaluate((id) => {
  const s = document.getElementById(id)
  const rect = s.getBoundingClientRect()
  return { top: rect.top + scrollY, h: rect.height, vh: innerHeight }
}, id)
console.log(id, 'hauteur', Math.round(r.h), 'px pour un écran de', r.vh)
const n = Math.min(6, Math.ceil(r.h / r.vh))
for (let i = 0; i < n; i++) {
  await p.evaluate((y) => scrollTo(0, y), r.top + i * r.vh * 0.92)
  await p.waitForTimeout(2200)
  await p.screenshot({ path: `${OUT}${flags.name ?? id}-${mobile ? 'm' : 'd'}-${i + 1}.png` })
}
await b.close()
await stop?.()
