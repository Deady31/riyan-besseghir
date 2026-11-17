// Perf mobile simulée (CPU ×4, 4G) : premier affichage, plus gros élément (sans défilement), tâches longues, images/s au défilement, poids.
// Usage : node tools/qa/perf.mjs [--url=https://riyan-besseghir.vercel.app/] [--cpu=4]
import { launch, parseArgs, serve } from './lib.mjs'

const { flags } = parseArgs()
const cpu = Number(flags.cpu ?? 4)
const { url, stop } = await serve(flags.url)
const b = await launch()
const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true })
const p = await ctx.newPage()
const cdp = await ctx.newCDPSession(p)
await cdp.send('Emulation.setCPUThrottlingRate', { rate: cpu })
await cdp.send('Network.enable')
await cdp.send('Network.emulateNetworkConditions', { offline: false, latency: 150, downloadThroughput: (1.6 * 1024 * 1024) / 8, uploadThroughput: (750 * 1024) / 8 })
let bytes = 0
p.on('response', (r) => {
  const h = r.headers()['content-length']
  if (h) bytes += Number(h)
})
await p.addInitScript(() => {
  window.__m = { fcp: [], lcp: 0, lcpEl: '', lt: 0, ltMs: 0 }
  new PerformanceObserver((l) => l.getEntries().forEach((e) => window.__m.fcp.push(Math.round(e.startTime)))).observe({ type: 'paint', buffered: true })
  new PerformanceObserver((l) => l.getEntries().forEach((e) => { window.__m.lcp = Math.round(e.startTime); window.__m.lcpEl = (e.element?.tagName ?? '') + ' ' + (e.url?.split('/').pop() ?? '') })).observe({ type: 'largest-contentful-paint', buffered: true })
  new PerformanceObserver((l) => l.getEntries().forEach((e) => { window.__m.lt++; window.__m.ltMs += e.duration })).observe({ type: 'longtask', buffered: true })
})
await p.goto(url, { waitUntil: 'load' })
await p.waitForTimeout(5000)
const first = await p.evaluate(() => ({ ...window.__m, ltMs: Math.round(window.__m.ltMs) })) // lu AVANT tout défilement
const scroll = await p.evaluate(async () => {
  const frames = []
  let last = performance.now()
  let run = true
  const tick = (t) => { frames.push(t - last); last = t; if (run) requestAnimationFrame(tick) }
  requestAnimationFrame(tick)
  const H = document.documentElement.scrollHeight
  for (let y = 0; y < H - innerHeight; y += 420) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 90)) }
  run = false
  const f = frames.slice(5).sort((a, b) => a - b)
  const avg = f.reduce((a, c) => a + c, 0) / f.length
  return { fps: +(1000 / avg).toFixed(1), p95Ms: +f[Math.floor(f.length * 0.95)].toFixed(1), over50ms: f.filter((x) => x > 50).length, pageHeight: H }
})
console.log(JSON.stringify({ cpu, kb: Math.round(bytes / 1024), ...first, ...scroll }))
await b.close()
stop()
