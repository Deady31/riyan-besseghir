import { useEffect, useRef } from 'react'
import { Mesh, Program, Renderer, Triangle, Vec2 } from 'ogl'
import { prefersReducedMotion } from '../../lib/motion'

/**
 * Fond du site, rendu en un seul triangle plein écran (OGL).
 * - Chaque section a sa teinte de papier et deux couleurs d'accent ; le passage de l'une à l'autre n'est plus une ligne
 *   mais un lavis d'encre : la couleur est calculée pour chaque pixel à partir de sa position dans la page, avec une
 *   frontière large et déformée par du bruit. Il n'y a donc aucun saut quand le défilement change de zone.
 * - Sous les blocs, de grands nuages de couleur dérivent lentement (parallaxe à 35 % du défilement), une grille de points
 *   apparaît par plaques, et un grain fin donne de la matière. Un liseré d'ambre très discret marque encore chaque seuil.
 * Aucune couleur hors palette (pas de violet, pas de néon). Mouvement réduit : image figée, redessinée seulement au défilement.
 */

const rgb = (hex: string): [number, number, number] => {
  const n = parseInt(hex.slice(1), 16)
  return [(n >> 16) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255]
}

type Zone = { tone: [number, number, number]; a: [number, number, number]; b: [number, number, number] }
const zone = (tone: string, a: string, b: string): Zone => ({ tone: rgb(tone), a: rgb(a), b: rgb(b) })

const COBALT = '#7f9bff' // cobalt éclairci : en nuage, le cobalt pur salit le papier
const VERMILION = '#f05235'
const ACID = '#d9f05a'
const CHROME = '#c3c8d0'

const ZONES: Record<string, Zone> = {
  default: zone('#f1ebdd', COBALT, ACID),
  top: zone('#f1ebdd', COBALT, ACID),
  morph: zone('#efe6d3', VERMILION, ACID),
  deck: zone('#e9dfc7', VERMILION, ACID),
  impact: zone('#f1ebdd', COBALT, ACID),
  'hauts-faits': zone('#e3e8f6', COBALT, CHROME),
  studio: zone('#eaefc9', ACID, COBALT),
  ia: zone('#dde0e5', COBALT, CHROME),
  lab: zone('#f1ebdd', VERMILION, ACID),
  about: zone('#e9dfc7', VERMILION, ACID),
  passions: zone('#f3dccd', VERMILION, ACID),
  contact: zone('#dde0e5', COBALT, CHROME),
}

const N = 12

const VERT = /* glsl */ `
attribute vec2 position;
attribute vec2 uv;
varying vec2 vUv;
void main() { vUv = uv; gl_Position = vec4(position, 0.0, 1.0); }`

const FRAG = /* glsl */ `
precision highp float;
#define N ${N}
uniform float uTime;
uniform float uScroll;
uniform vec2 uView;
uniform vec3 uTone[N];
uniform vec3 uA[N];
uniform vec3 uB[N];
uniform float uBound[N];
varying vec2 vUv;

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);
}
float fbm(vec2 p) {
  float v = 0.0, a = 0.5;
  for (int i = 0; i < 4; i++) { v += a * noise(p); p = p * 2.03 + 11.0; a *= 0.5; }
  return v;
}

void main() {
  vec2 p = vec2(vUv.x * uView.x, (1.0 - vUv.y) * uView.y);
  float docY = uScroll + p.y;
  float t = uTime;

  // Frontière organique : le bruit dépend de la position dans la page, jamais de l'écran, donc elle reste collée au contenu.
  float warp = (fbm(vec2(p.x * 0.0016 + 3.0, docY * 0.0011 - t * 0.03)) - 0.5) * 0.7 * uView.y;
  float hw = 0.34 * uView.y;

  vec3 tone = uTone[0];
  vec3 a = uA[0];
  vec3 b = uB[0];
  float seam = 0.0;
  for (int i = 0; i < N - 1; i++) {
    float d = docY + warp - uBound[i];
    float k = smoothstep(-hw, hw, d);
    float differ = step(0.012, length(uTone[i + 1] - uTone[i]));
    tone = mix(tone, uTone[i + 1], k);
    a = mix(a, uA[i + 1], k);
    b = mix(b, uB[i + 1], k);
    seam = max(seam, differ * exp(-d * d / (2.0 * 26.0 * 26.0)));
  }

  vec3 col = tone;

  // Grands nuages de couleur, deux champs de bruit qui dérivent et défilent à 35 % de la vitesse de la page.
  vec2 q = vec2(p.x / (0.8 * uView.x + 420.0), docY * 0.35 / (0.95 * uView.y + 300.0));
  float f1 = fbm(q * 1.5 + vec2(t * 0.018, -t * 0.012));
  float f2 = fbm(q * 1.5 + vec2(9.0 - t * 0.014, 4.0 + t * 0.01));
  col = mix(col, a, smoothstep(0.5, 0.82, f1) * 0.34);
  col = mix(col, b, smoothstep(0.54, 0.86, f2) * 0.26);

  // Grille de points, par plaques, façon calque de construction.
  vec2 g = vec2(p.x, docY * 0.7) / 26.0;
  float dotMask = smoothstep(0.52, 0.74, fbm(q * 2.2 + 21.0));
  float dotShape = smoothstep(0.17, 0.1, length(fract(g) - 0.5));
  col = mix(col, vec3(0.125, 0.13, 0.12), dotShape * dotMask * 0.2);

  // Liseré d'ambre très doux (ni rouge ni bleu : leur mélange tirerait vers le violet) sur chaque seuil.
  float flick = 0.7 + 0.3 * noise(vec2(p.x * 0.02, t * 1.2));
  col = mix(col, vec3(1.0, 0.62, 0.3), seam * 0.16 * flick);

  col += (hash(vUv * uView + fract(t)) - 0.5) * 0.02;
  gl_FragColor = vec4(col, 1.0);
}`

export function BurnBackdrop({ deps }: { deps: string }) {
  const host = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = host.current
    if (!el) return
    const reduced = prefersReducedMotion()
    let renderer: Renderer
    try {
      renderer = new Renderer({ alpha: false, antialias: false, dpr: Math.min(window.devicePixelRatio || 1, 1.25) })
    } catch {
      return // pas de WebGL : le fond CSS (PaperBackground) reste en place
    }
    const gl = renderer.gl
    el.appendChild(gl.canvas)
    gl.canvas.style.cssText = 'width:100%;height:100%;display:block'

    const flat = (pick: (z: Zone) => [number, number, number], zones: Zone[]) => {
      const out: number[] = []
      for (let i = 0; i < N; i++) out.push(...pick(zones[Math.min(i, zones.length - 1)]))
      return out
    }
    const program = new Program(gl, {
      vertex: VERT,
      fragment: FRAG,
      uniforms: {
        uTime: { value: 0 },
        uScroll: { value: 0 },
        uView: { value: new Vec2(1, 1) },
        uTone: { value: flat((z) => z.tone, [ZONES.default]) },
        uA: { value: flat((z) => z.a, [ZONES.default]) },
        uB: { value: flat((z) => z.b, [ZONES.default]) },
        uBound: { value: new Array(N).fill(1e9) },
      },
    })
    const mesh = new Mesh(gl, { geometry: new Triangle(gl), program })

    // Les seuils sont des positions dans la page : on les relit quand le DOM ou la taille changent, pas à chaque image.
    const scan = () => {
      const sections = [...document.querySelectorAll<HTMLElement>('main > section')].slice(0, N)
      if (sections.length === 0) return
      const zones = sections.map((s) => ZONES[s.id] ?? ZONES.default)
      const bounds = new Array(N).fill(1e9)
      sections.forEach((s, i) => {
        if (i > 0) bounds[i - 1] = s.getBoundingClientRect().top + window.scrollY
      })
      program.uniforms.uTone.value = flat((z) => z.tone, zones)
      program.uniforms.uA.value = flat((z) => z.a, zones)
      program.uniforms.uB.value = flat((z) => z.b, zones)
      program.uniforms.uBound.value = bounds
      dirty = true
    }

    let dirty = true
    const resize = () => {
      renderer.setSize(window.innerWidth, window.innerHeight)
      program.uniforms.uView.value.set(window.innerWidth, window.innerHeight)
      scan()
    }
    resize()
    const scanTimer = window.setInterval(scan, 800)
    window.addEventListener('resize', resize)
    const ro = new ResizeObserver(scan)
    ro.observe(document.body)

    let raf = 0
    let lastScroll = -1
    const frame = (now: number) => {
      const y = window.scrollY
      if (dirty || y !== lastScroll || !reduced) {
        program.uniforms.uScroll.value = y
        program.uniforms.uTime.value = reduced ? 4 : now * 0.001
        renderer.render({ scene: mesh })
        lastScroll = y
        dirty = false
      }
      raf = requestAnimationFrame(frame)
    }
    raf = requestAnimationFrame(frame)

    return () => {
      cancelAnimationFrame(raf)
      window.clearInterval(scanTimer)
      window.removeEventListener('resize', resize)
      ro.disconnect()
      gl.getExtension('WEBGL_lose_context')?.loseContext()
      gl.canvas.remove()
    }
  }, [deps])

  return <div ref={host} className="pointer-events-none fixed inset-0 -z-[5]" aria-hidden="true" />
}
