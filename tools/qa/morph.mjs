// Mesure l'opacité du chiffre 39 et de sa légende pendant la sortie (la légende doit rester tant que le chiffre est visible).
import { launch, parseArgs, serve, viewport } from './lib.mjs'
const { flags } = parseArgs()
const { url, stop } = await serve(flags.url)
const b = await launch()
const p = await (await b.newContext({ viewport: viewport(false) })).newPage()
await p.goto(url, { waitUntil: 'domcontentloaded' })
await p.waitForTimeout(5000)
const rows = await p.evaluate(async () => {
  const s = document.getElementById('morph')
  const end = s.getBoundingClientRect().bottom + scrollY
  const out = []
  for (let k = 1.9; k >= 0.9; k -= 0.1) {
    scrollTo(0, end - innerHeight * k)
    await new Promise((r) => setTimeout(r, 500))
    const o = (q) => Number(getComputedStyle(document.querySelector(q)).opacity).toFixed(2)
    out.push(`bas à ${(k * 100).toFixed(0)}% écran → chiffre ${o('[data-big]')} | légende ${o('[data-caption]')}`)
  }
  return out
})
console.log(rows.join('\n'))
await b.close()
await stop?.()
