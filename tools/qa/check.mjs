// Contrôle fonctionnel en une commande : erreurs console, débordement horizontal, menu au survol, ancre « Passions »,
// retour en haut par le logo, démo FOODER (téléphone + appli), sections présentes. Sortie : un objet JSON court.
// Usage : node tools/qa/check.mjs [--url=…]
import { launch, parseArgs, serve } from './lib.mjs'

const { flags } = parseArgs()
const { url, stop } = await serve(flags.url)
const b = await launch()
const out = { errors: [] }

async function page(vp, mobile = false) {
  const p = await (await b.newContext({ viewport: vp, isMobile: mobile, hasTouch: mobile })).newPage()
  p.on('pageerror', (e) => out.errors.push(String(e).slice(0, 120)))
  p.on('console', (m) => m.type() === 'error' && !/frame-ancestors|ERR_BLOCKED/.test(m.text()) && out.errors.push(m.text().slice(0, 120)))
  return p
}

// Bureau
{
  const p = await page({ width: 1440, height: 900 })
  await p.route('https://fooder-tawny.vercel.app/**', async (route) => {
    const r = await route.fetch()
    const h = { ...r.headers() }
    // la CSP de FOODER n'autorise que le site en ligne : on autorise l'origine de test
    h['content-security-policy'] = (h['content-security-policy'] || '').replace(/frame-ancestors[^;]*/i, `frame-ancestors 'self' ${new URL(url).origin}`)
    await route.fulfill({ response: r, headers: h })
  })
  await p.goto(url, { waitUntil: 'domcontentloaded' })
  await p.waitForTimeout(6000)
  out.sections = await p.evaluate(() => document.querySelectorAll('main section').length)
  out.debordementBureau = await p.evaluate(() => document.documentElement.scrollWidth - innerWidth)
  const mb = await p.getByRole('button', { name: 'Menu' }).boundingBox()
  await p.mouse.move(mb.x + mb.width / 2, mb.y + mb.height / 2)
  await p.waitForTimeout(500)
  out.menuAuSurvol = await p.evaluate(() => document.querySelectorAll('#chapter-menu li').length)
  await p.getByRole('button', { name: /passions/i }).first().click()
  await p.waitForTimeout(5000)
  out.ancrePassionsTop = await p.evaluate(() => Math.round(document.getElementById('passions').getBoundingClientRect().top))
  await p.getByRole('link', { name: /retour en haut|back to top/i }).click()
  await p.waitForTimeout(4500)
  out.logoRetourScrollY = await p.evaluate(() => Math.round(scrollY))
  await p.evaluate(async () => { const d = document.getElementById('demo'); window.scrollTo(0, d.getBoundingClientRect().top + scrollY + 40); await new Promise((r) => setTimeout(r, 3000)) })
  out.telephone3D = await p.evaluate(() => getComputedStyle(document.querySelector('[data-phone-mock]')).opacity === '0')
  await p.getByRole('button', { name: /tester dans le téléphone/i }).first().click()
  await p.waitForTimeout(5000)
  let txt = ''
  for (const fr of p.frames()) if (fr !== p.mainFrame()) txt = (await fr.evaluate(() => document.body?.innerText?.slice(0, 40)).catch(() => '')) || txt
  out.appliFooder = txt || 'vide'
}
// Mobile
{
  const p = await page({ width: 390, height: 844 }, true)
  await p.goto(url, { waitUntil: 'domcontentloaded' })
  await p.waitForTimeout(6000)
  out.debordementMobile = await p.evaluate(() => document.documentElement.scrollWidth - innerWidth)
}
out.errors = [...new Set(out.errors)].slice(0, 5)
console.log(JSON.stringify(out))
await b.close()
stop()
