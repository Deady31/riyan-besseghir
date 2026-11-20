// Compare le premier affichage de la version recruteur (mode mémorisé « recruiter ») et de l'accueil complet, médiane de 5 passes, mobile simulé (CPU x4, 4G).
// Usage : node tools/qa/perf-recruiter.mjs [--url=https://riyan-besseghir.vercel.app/]
import { launch, parseArgs, serve } from './lib.mjs'
const { flags } = parseArgs()
const { url, stop } = await serve(flags.url)
const b = await launch()
const run = async (path, mode) => {
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true })
  await ctx.addInitScript((m) => { try { localStorage.setItem('riyan-mode', m) } catch {} }, mode)
  const p = await ctx.newPage()
  const cdp = await ctx.newCDPSession(p)
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 })
  await cdp.send('Network.enable')
  await cdp.send('Network.emulateNetworkConditions', { offline: false, latency: 150, downloadThroughput: (1.6 * 1024 * 1024) / 8, uploadThroughput: (750 * 1024) / 8 })
  await p.addInitScript(() => { window.__lcp = 0; new PerformanceObserver((l) => l.getEntries().forEach((e) => { window.__lcp = Math.round(e.startTime) })).observe({ type: 'largest-contentful-paint', buffered: true }) })
  await p.goto(url.replace(/\/$/, '') + path, { waitUntil: 'load' })
  await p.waitForTimeout(4000)
  const r = await p.evaluate(() => ({ fp: Math.round(performance.getEntriesByType('paint')[0]?.startTime), fcp: Math.round(performance.getEntriesByName('first-contentful-paint')[0]?.startTime), lcp: window.__lcp, portrait: performance.getEntriesByType('resource').some((e) => e.name.includes('naturel.webp')) }))
  await ctx.close()
  return r
}
const res = []
for (let i = 0; i < 5; i++) res.push(await run('/recruteur', 'recruiter'))
const med = (k) => res.map((r) => r[k]).sort((a, b) => a - b)[2]
console.log('recruteur  FP', med('fp'), 'FCP', med('fcp'), 'LCP', med('lcp'), 'portrait chargé:', res[0].portrait)
const home = await run('/', 'full')
console.log('accueil    FP', home.fp, 'FCP', home.fcp, 'LCP', home.lcp, 'portrait chargé:', home.portrait)
await b.close(); await stop()
