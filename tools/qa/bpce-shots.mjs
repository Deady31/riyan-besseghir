// Captures du vrai front de l'assistant BPCE (dépôt privé, récupéré en local) : node tools/qa/bpce-shots.mjs <dossier front>
// Le front tourne hors ligne (scénarios de démo) : rien n'est envoyé nulle part.
import { pathToFileURL } from 'node:url'
import { OUT, launch } from './lib.mjs'
const front = process.argv[2]
const b = await launch()
const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 })
const p = await ctx.newPage()
const errors = []
p.on('pageerror', (e) => errors.push(e.message))
await p.goto(pathToFileURL(`${front}/index.html`).href)
await p.waitForTimeout(2000)
await p.getByRole('button', { name: /une question/i }).first().click()
await p.waitForTimeout(1500)
await p.screenshot({ path: `${OUT}bpce-1-ouvert.png` })
await p.getByRole('button', { name: /^faire une réclamation$/i }).click()
await p.waitForTimeout(2500)
await p.screenshot({ path: `${OUT}bpce-2-reclamation.png` })
await p.getByRole('button', { name: /réglages d.accessibilité/i }).click()
await p.waitForTimeout(1200)
await p.screenshot({ path: `${OUT}bpce-3-accessibilite.png` })
await p.getByRole('button', { name: /réinitialiser la démo/i }).click()
await p.waitForTimeout(800)
await p.getByRole('button', { name: /voir en mobile/i }).click()
await p.waitForTimeout(2500)
await p.screenshot({ path: `${OUT}bpce-4-mobile.png` })
console.log('erreurs', errors.length, errors.join(' | '))
await b.close()
