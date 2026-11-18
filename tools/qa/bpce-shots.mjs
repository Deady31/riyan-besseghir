// Captures du front de l'assistant BPCE (dépôt privé, récupéré en local) : node tools/qa/bpce-shots.mjs <dossier front>
import { pathToFileURL } from 'node:url'
import { OUT, launch } from './lib.mjs'
const front = process.argv[2]
const b = await launch()
const d = await (await b.newContext({ viewport: { width: 1440, height: 900 } })).newPage()
await d.goto(pathToFileURL(`${front}/index.html`).href)
await d.waitForTimeout(2500)
await d.screenshot({ path: `${OUT}bpce-desktop.png` })
const m = await (await b.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true })).newPage()
await m.goto(pathToFileURL(`${front}/mobile.html`).href)
await m.waitForTimeout(2500)
await m.screenshot({ path: `${OUT}bpce-mobile.png` })
console.log(await d.title(), '|', await m.title())
await b.close()
