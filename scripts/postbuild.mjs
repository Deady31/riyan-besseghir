// Après `vite build` : une page HTML par projet (titre, description, Open Graph, texte lisible sans JavaScript),
// plus sitemap.xml et robots.txt. Les données viennent des mêmes fichiers que le site (Node lit le TypeScript directement).
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { PROJECTS } from '../src/data/projects.ts'
import { STORIES } from '../src/data/stories.ts'

const SITE = 'https://riyan-besseghir.vercel.app'
const dist = new URL('../dist/', import.meta.url)
const template = readFileSync(new URL('index.html', dist), 'utf8')
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

for (const p of PROJECTS) {
  const story = STORIES[p.id]?.fr
  const title = `${p.title} · Riyan Besseghir`
  const desc = (story?.why ?? p.tagline).slice(0, 158)
  const url = `${SITE}/projets/${p.id}`
  const body = [
    `<h1>${esc(p.title)}</h1>`,
    `<p>${esc(p.tagline)}</p>`,
    story ? `<h2>Pourquoi je l’ai créé</h2><p>${esc(story.why)}</p>` : '',
    story?.how?.length ? `<h2>Comment ça marche</h2><ol>${story.how.map((h) => `<li>${esc(h)}</li>`).join('')}</ol>` : '',
    story?.decisions?.length ? `<h2>Ce que j’ai décidé</h2><ul>${story.decisions.map((d) => `<li>${esc(d)}</li>`).join('')}</ul>` : '',
    `<p><a href="/">Riyan Besseghir, AI Product Manager</a></p>`,
  ].join('')
  let html = template
    .replace(/<title>.*?<\/title>/s, `<title>${esc(title)}</title>`)
    .replace(/<meta name="description"[^>]*>/, `<meta name="description" content="${esc(desc)}" />`)
    .replace(/<meta property="og:title"[^>]*>/, `<meta property="og:title" content="${esc(title)}" />`)
    .replace(/<meta property="og:description"[^>]*>/, `<meta property="og:description" content="${esc(desc)}" />`)
    .replace('</head>', `<link rel="canonical" href="${url}" />\n<meta property="og:url" content="${url}" />\n</head>`)
    .replace('<div id="root"></div>', `<div id="root"></div>\n<noscript>${body}</noscript>`)
  mkdirSync(new URL(`projets/${p.id}/`, dist), { recursive: true })
  writeFileSync(new URL(`projets/${p.id}/index.html`, dist), html)
}

const today = new Date().toISOString().slice(0, 10)
const urls = ['/', ...PROJECTS.map((p) => `/projets/${p.id}`)]
writeFileSync(
  new URL('sitemap.xml', dist),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls
    .map((u) => `  <url><loc>${SITE}${u}</loc><lastmod>${today}</lastmod></url>`)
    .join('\n')}\n</urlset>\n`,
)
writeFileSync(new URL('robots.txt', dist), `User-agent: *\nAllow: /\n\nSitemap: ${SITE}/sitemap.xml\n`)
console.log(`postbuild : ${PROJECTS.length} pages projet, sitemap.xml, robots.txt`)
