// Après `vite build` : une page HTML par projet (titre, description, Open Graph, texte lisible sans JavaScript),
// plus sitemap.xml et robots.txt. Les données viennent des mêmes fichiers que le site (Node lit le TypeScript directement).
import { readFileSync, writeFileSync, mkdirSync, readdirSync } from 'node:fs'
import { PROJECTS } from '../src/data/projects.ts'
import { STORIES } from '../src/data/stories.ts'

const SITE = 'https://riyan-besseghir.vercel.app'
const dist = new URL('../dist/', import.meta.url)
const assets = readdirSync(new URL('assets/', dist))

// Les deux polices du texte sont demandées dès le HTML (sinon le navigateur ne les découvre qu'après le CSS, puis le premier rendu attend).
const fontLinks = ['rubik-latin-wght-normal', 'space-grotesk-latin-wght-normal']
  .map((n) => assets.find((f) => f.startsWith(n) && f.endsWith('.woff2')))
  .filter(Boolean)
  .map((f) => `<link rel="preload" as="font" type="font/woff2" href="/assets/${f}" crossorigin />`)
  .join('\n    ')
// Fichiers de la page recruteur (chargée à la demande) : demandés en parallèle du script principal par le script d'index.html.
const recruiterChunk = assets.find((f) => /^Recruiter-.*\.js$/.test(f))
const recruiterFiles = recruiterChunk
  ? [
      recruiterChunk,
      ...new Set(
        [...readFileSync(new URL(`assets/${recruiterChunk}`, dist), 'utf8').matchAll(/from"\.\/([^"]+\.js)"/g)]
          .map((m) => m[1])
          .filter((f) => !/^(index|jsx-runtime)-/.test(f)),
      ),
    ].map((f) => `/assets/${f}`)
  : []
const baseHtml = readFileSync(new URL('index.html', dist), 'utf8').replace('var RC = []', `var RC = ${JSON.stringify(recruiterFiles)}`)
const template = fontLinks ? baseHtml.replace('</head>', `    ${fontLinks}\n  </head>`) : baseHtml
writeFileSync(new URL('index.html', dist), template)
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

for (const p of PROJECTS) {
  const story = STORIES[p.id]?.fr
  const title = `${p.title} · Riyan Besseghir`
  const desc = (story?.why ?? p.tagline).slice(0, 158)
  const url = `${SITE}/projets/${p.id}`
  const image = `${SITE}/og/${p.id}.png`
  const body = [
    `<h1>${esc(p.title)}</h1>`,
    `<p>${esc(p.tagline)}</p>`,
    story ? `<h2>Pourquoi je l’ai créé</h2><p>${esc(story.why)}</p>` : '',
    story?.how?.length ? `<h2>Comment ça marche</h2><ol>${story.how.map((h) => `<li>${esc(h)}</li>`).join('')}</ol>` : '',
    story?.decisions?.length ? `<h2>Ce que j’ai décidé</h2><ul>${story.decisions.map((d) => `<li>${esc(d)}</li>`).join('')}</ul>` : '',
    `<p><a href="/">Riyan Besseghir, AI Product Manager</a></p>`,
  ].join('')
  const html = template
    .replace(/<title>.*?<\/title>/s, `<title>${esc(title)}</title>`)
    .replace(/<meta name="description"[^>]*>/, `<meta name="description" content="${esc(desc)}" />`)
    .replace(/<meta property="og:title"[^>]*>/, `<meta property="og:title" content="${esc(title)}" />`)
    .replace(/<meta property="og:description"[^>]*>/, `<meta property="og:description" content="${esc(desc)}" />`)
    .replace(/<link rel="canonical"[^>]*>/, `<link rel="canonical" href="${url}" />`)
    .replace(/<meta property="og:url"[^>]*>/, `<meta property="og:url" content="${url}" />`)
    .replace(/<meta property="og:image" [^>]*>/, `<meta property="og:image" content="${image}" />`)
    .replace(/<meta property="og:image:alt"[^>]*>/, `<meta property="og:image:alt" content="${esc(`${p.title} : ${p.tagline}`)}" />`)
    .replace(/<meta name="twitter:title"[^>]*>/, `<meta name="twitter:title" content="${esc(title)}" />`)
    .replace(/<meta name="twitter:description"[^>]*>/, `<meta name="twitter:description" content="${esc(desc)}" />`)
    .replace(/<meta name="twitter:image"[^>]*>/, `<meta name="twitter:image" content="${image}" />`)
    .replace('<div id="root"></div>', `<div id="root"></div>\n<noscript>${body}</noscript>`)
  mkdirSync(new URL(`projets/${p.id}/`, dist), { recursive: true })
  writeFileSync(new URL(`projets/${p.id}/index.html`, dist), html)
}

// Version recruteur : page prérendue (titre, description et texte pour les aperçus de lien et les robots).
{
  const title = 'Version recruteur · Riyan Besseghir'
  const desc = 'Riyan Besseghir, AI Product Manager. Ouvert aux opportunités, CDI ou freelance. Toulouse, Paris, remote. Chiffres, expériences, projets et un agent qui répond aux questions des recruteurs.'
  const url = `${SITE}/recruteur`
  const body = `<h1>Riyan Besseghir</h1><p>AI Product Manager. Ouvert aux opportunités · CDI ou freelance. Toulouse · Paris · Remote.</p><p><a href="mailto:riyan.besseghir@gmail.com">riyan.besseghir@gmail.com</a> · <a href="https://www.linkedin.com/in/riyan-besseghir-8514a425b/">LinkedIn</a> · <a href="https://github.com/Deady31">GitHub</a></p><ul>${PROJECTS.slice(0, 6).map((p) => `<li>${esc(p.title)} : ${esc(p.tagline)}</li>`).join('')}</ul><p><a href="/">Portfolio complet</a></p>`
  const html = template
    .replace(/<title>.*?<\/title>/s, `<title>${esc(title)}</title>`)
    .replace(/<meta name="description"[^>]*>/, `<meta name="description" content="${esc(desc)}" />`)
    .replace(/<meta property="og:title"[^>]*>/, `<meta property="og:title" content="${esc(title)}" />`)
    .replace(/<meta property="og:description"[^>]*>/, `<meta property="og:description" content="${esc(desc)}" />`)
    .replace(/<link rel="canonical"[^>]*>/, `<link rel="canonical" href="${url}" />`)
    .replace(/<meta property="og:url"[^>]*>/, `<meta property="og:url" content="${url}" />`)
    .replace('<div id="root"></div>', `<div id="root"></div>\n<noscript>${body}</noscript>`)
  mkdirSync(new URL('recruteur/', dist), { recursive: true })
  writeFileSync(new URL('recruteur/index.html', dist), html)
}

const today = new Date().toISOString().slice(0, 10)
const urls = ['/', '/recruteur', ...PROJECTS.map((p) => `/projets/${p.id}`)]
writeFileSync(
  new URL('sitemap.xml', dist),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls
    .map((u) => `  <url><loc>${SITE}${u}</loc><lastmod>${today}</lastmod></url>`)
    .join('\n')}\n</urlset>\n`,
)
writeFileSync(new URL('robots.txt', dist), `User-agent: *\nAllow: /\n\nSitemap: ${SITE}/sitemap.xml\n`)
console.log(`postbuild : ${PROJECTS.length} pages projet, sitemap.xml, robots.txt`)
