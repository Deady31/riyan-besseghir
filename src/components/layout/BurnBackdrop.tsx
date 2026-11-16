import { useEffect, useRef } from 'react'
import { Mesh, Program, Renderer, Triangle, Vec2 } from 'ogl'
import { prefersReducedMotion } from '../../lib/motion'

/**
 * Fond du site : un monde par chapitre, rendu en un seul triangle plein écran (OGL).
 *
 * Quatre mondes procéduraux :
 *  - papier   : ivoire, nuages de couleur qui dérivent, grille de points par plaques ;
 *  - liquide  : cobalt liquide à reflets de chrome (domaine déformé, normale approchée) ;
 *  - nuit     : noir d'encre, trois couches d'étoiles à parallaxe, brumes cobalt et vermillon ;
 *  - trame    : papier + grosse trame d'imprimerie (points de taille variable) à 45°.
 *
 * Entre deux chapitres :
 *  - clair → sombre (ou l'inverse) : le monde brûle. Le front est une ligne de braise irrégulière qui ronge l'ancien fond
 *    (roussi, carbonisé, liseré incandescent, étincelles) et révèle le suivant ;
 *  - deux mondes clairs : lavis large, sans coupure.
 * La page se voit à travers la même position de défilement (uScroll) : les fronts restent collés au contenu.
 *
 * Le thème (`html[data-theme]`) suit le monde sous la barre de navigation, pour que le menu change de couleur avec le fond.
 * Les sections sombres portent la classe `theme-dark` (voir index.css) : ce fichier doit rester d'accord avec elles.
 */

const rgb = (hex: string): [number, number, number] => {
  const n = parseInt(hex.slice(1), 16)
  return [(n >> 16) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255]
}

const PAPER = 0
const LIQUID = 1
const NIGHT = 2
const HALFTONE = 3

type Zone = { kind: number; dark: boolean; tone: [number, number, number]; a: [number, number, number]; b: [number, number, number] }
const zone = (kind: number, tone: string, a: string, b: string, dark = false): Zone => ({ kind, dark, tone: rgb(tone), a: rgb(a), b: rgb(b) })

const COBALT_SOFT = '#7f9bff'
const COBALT = '#254dff'
const VERMILION = '#f05235'
const ACID = '#d9f05a'
const CHROME = '#c3c8d0'
const IVORY = '#f1ebdd'

const ZONES: Record<string, Zone> = {
  default: zone(PAPER, IVORY, COBALT_SOFT, ACID),
  top: zone(PAPER, IVORY, COBALT_SOFT, ACID),
  morph: zone(LIQUID, '#050a3a', COBALT, IVORY, true),
  deck: zone(HALFTONE, '#e9dfc7', VERMILION, ACID),
  impact: zone(PAPER, IVORY, COBALT_SOFT, ACID),
  'hauts-faits': zone(PAPER, '#e3e8f6', COBALT_SOFT, CHROME),
  studio: zone(PAPER, '#eaefc9', ACID, COBALT_SOFT),
  ia: zone(NIGHT, '#08090e', COBALT, VERMILION, true),
  lab: zone(PAPER, IVORY, VERMILION, ACID),
  about: zone(HALFTONE, '#e9dfc7', COBALT, ACID),
  passions: zone(HALFTONE, '#f3dccd', VERMILION, ACID),
  contact: zone(NIGHT, '#08090e', COBALT, VERMILION, true),
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
uniform float uKind[N];
uniform float uBurn[N];
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

// ---------------------------------------------------------------- papier
vec3 paperW(vec2 p, float docY, float t, vec3 tone, vec3 a, vec3 b) {
  vec3 col = tone;
  vec2 q = vec2(p.x / (0.8 * uView.x + 420.0), docY * 0.35 / (0.95 * uView.y + 300.0));
  float f1 = fbm(q * 1.5 + vec2(t * 0.018, -t * 0.012));
  float f2 = fbm(q * 1.5 + vec2(9.0 - t * 0.014, 4.0 + t * 0.01));
  col = mix(col, a, smoothstep(0.5, 0.82, f1) * 0.34);
  col = mix(col, b, smoothstep(0.54, 0.86, f2) * 0.26);
  vec2 g = vec2(p.x, p.y + uScroll * 0.7) / 26.0;
  float dotMask = smoothstep(0.52, 0.74, fbm(q * 2.2 + 21.0));
  float dotShape = smoothstep(0.17, 0.1, length(fract(g) - 0.5));
  col = mix(col, vec3(0.125, 0.13, 0.12), dotShape * dotMask * 0.2);
  return col;
}

// ---------------------------------------------------------------- trame d'imprimerie
vec3 halftoneW(vec2 p, float docY, float t, vec3 tone, vec3 a, vec3 b) {
  vec3 col = paperW(p, docY, t, tone, a, b);
  vec2 q = vec2(p.x / (0.9 * uView.x + 300.0), docY * 0.3 / (0.9 * uView.y + 300.0));
  float field = fbm(q * 1.2 + vec2(t * 0.012, 3.0));
  // grille à 45°, qui défile à 60 % de la page : la trame glisse sous les blocs
  vec2 g = vec2(p.x + (docY + p.y - p.y) * 0.0, p.y + uScroll * 0.6);
  g = vec2(g.x + g.y, g.y - g.x) * 0.7071 / 24.0;
  float d = length(fract(g) - 0.5);
  float r = smoothstep(0.34, 0.82, field) * 0.42;
  float dotM = smoothstep(r, r - 0.09, d) * step(0.02, r);
  return mix(col, a, dotM * 0.62);
}

// ---------------------------------------------------------------- cobalt liquide
vec3 liquidW(vec2 p, float docY, float t, vec3 deep, vec3 cobalt, vec3 ivory) {
  vec2 q = vec2(p.x / (0.9 * uView.x), docY * 0.26 / (1.1 * uView.y)) * 2.3;
  vec2 w1 = vec2(fbm(q + t * 0.05), fbm(q + vec2(5.2, 1.3) - t * 0.04));
  vec2 w2 = vec2(fbm(q + 3.0 * w1 + vec2(1.7, 9.2) + t * 0.06), fbm(q + 3.0 * w1 + vec2(8.3, 2.8) - t * 0.05));
  vec2 r = q + 3.2 * w2;
  float f = fbm(r);
  float e = 0.02;
  float fx = fbm(r + vec2(e, 0.0)) - f;
  float fy = fbm(r + vec2(0.0, e)) - f;
  vec3 n = normalize(vec3(-fx / e * 0.32, -fy / e * 0.32, 1.0));
  vec3 l = normalize(vec3(-0.5, 0.65, 0.6));
  float spec = pow(max(dot(reflect(-l, n), vec3(0.0, 0.0, 1.0)), 0.0), 38.0);
  float rim = pow(1.0 - n.z, 2.0);
  vec3 col = mix(deep, cobalt, smoothstep(0.15, 0.85, f));
  col = mix(col, cobalt * 1.3, rim * 0.5);
  col += ivory * spec * 0.8;
  col += ivory * smoothstep(0.64, 0.9, f) * 0.08;
  return col;
}

// ---------------------------------------------------------------- nuit étoilée
float starLayer(vec2 p, float docY, float cell, float par, float t, float thresh) {
  vec2 g = vec2(p.x, p.y + docY * par) / cell;
  vec2 id = floor(g);
  float h = hash(id);
  vec2 o = vec2(hash(id + 3.1), hash(id + 7.7)) * 0.7 + 0.15;
  float d = length(fract(g) - o);
  float size = 0.05 + 0.1 * hash(id + 1.9);
  float tw = 0.65 + 0.35 * sin(t * (1.0 + 3.0 * hash(id + 5.0)) + h * 40.0);
  float core = smoothstep(size, 0.0, d);
  // petite croix de lumière sur les plus grosses
  vec2 c = abs(fract(g) - o);
  float cross = smoothstep(0.012, 0.0, min(c.x, c.y)) * smoothstep(0.34, 0.0, max(c.x, c.y)) * step(0.97, h);
  return (core + cross * 0.9) * step(thresh, h) * tw;
}
vec3 nightW(vec2 p, float docY, float t, vec3 tone, vec3 a, vec3 b) {
  vec3 col = tone;
  vec2 q = vec2(p.x / (0.9 * uView.x + 300.0), docY * 0.14 / (0.9 * uView.y + 300.0));
  float n1 = fbm(q * 1.6 + vec2(t * 0.01, 4.0));
  float n2 = fbm(q * 1.5 + vec2(12.0 - t * 0.008, 1.0));
  col += a * smoothstep(0.5, 0.86, n1) * 0.34;
  col += b * smoothstep(0.58, 0.9, n2) * 0.17;
  vec3 starC = vec3(1.0, 0.96, 0.88);
  float s = starLayer(p, docY, 34.0, 0.08, t, 0.82) * 0.55
          + starLayer(p, docY, 58.0, 0.16, t, 0.86) * 0.85
          + starLayer(p, docY, 110.0, 0.3, t, 0.9) * 1.15;
  col += starC * s;
  return col;
}

vec3 world(float kind, vec2 p, float docY, float t, vec3 tone, vec3 a, vec3 b) {
  if (kind < 0.5) return paperW(p, docY, t, tone, a, b);
  if (kind < 1.5) return liquidW(p, docY, t, tone, a, b);
  if (kind < 2.5) return nightW(p, docY, t, tone, a, b);
  return halftoneW(p, docY, t, tone, a, b);
}

void main() {
  vec2 p = vec2(vUv.x * uView.x, (1.0 - vUv.y) * uView.y);
  float docY = uScroll + p.y;
  float t = uTime;
  float H = uView.y;
  float S = H / 900.0;

  // Déformation des fronts : toujours liée à la position dans la page, donc collée au contenu.
  float warp = (fbm(vec2(p.x * 0.0016 + 3.0, docY * 0.0011 - t * 0.03)) - 0.5) * 0.7 * H;
  float hw = 0.34 * H;
  float frontOff = (fbm(vec2(p.x * 0.0017, docY * 0.0009 + t * 0.06)) - 0.5) * 0.2 * H
                 + (fbm(vec2(p.x * 0.011, docY * 0.007 - t * 0.22)) - 0.5) * 0.07 * H;
  float scorchReach = 0.24 * H;
  float glowReach = 0.09 * H;

  float jf = 0.0;
  float kk = 0.0;
  float burn = 0.0;
  float dB = 0.0;
  for (int i = 0; i < N - 1; i++) {
    if (uBurn[i] > 0.5) {
      float d = docY + frontOff - uBound[i];
      if (d > 0.0) jf += 1.0;
      if (d > -scorchReach && d < glowReach) { burn = 1.0; dB = d; }
    } else {
      float d = docY + warp - uBound[i];
      if (d > hw) jf += 1.0;
      else if (d > -hw) kk = smoothstep(-hw, hw, d);
    }
  }

  vec3 t0 = uTone[0], a0 = uA[0], b0 = uB[0];
  vec3 t1 = uTone[0], a1 = uA[0], b1 = uB[0];
  float k0 = uKind[0], k1 = uKind[0];
  for (int i = 0; i < N; i++) {
    float fi = float(i);
    if (abs(fi - jf) < 0.5) { t0 = uTone[i]; a0 = uA[i]; b0 = uB[i]; k0 = uKind[i]; t1 = t0; a1 = a0; b1 = b0; k1 = k0; }
  }
  for (int i = 0; i < N; i++) {
    float fi = float(i);
    if (abs(fi - jf - 1.0) < 0.5) { t1 = uTone[i]; a1 = uA[i]; b1 = uB[i]; k1 = uKind[i]; }
  }

  vec3 col = world(k0, p, docY, t, t0, a0, b0);
  if (kk > 0.002) col = mix(col, world(k1, p, docY, t, t1, a1, b1), kk);

  // La braise : roussi, carbonisé, liseré incandescent, étincelles.
  if (burn > 0.5) {
    float flick = 0.72 + 0.28 * noise(vec2(p.x * 0.024, t * 3.0));
    float scorch = smoothstep(-scorchReach, -2.0 * S, dB) * step(dB, 0.0);
    col = mix(col, col * vec3(0.78, 0.66, 0.52), scorch * 0.7);
    float charBand = smoothstep(-0.06 * H, -0.012 * H, dB) * step(dB, 0.0);
    col = mix(col, vec3(0.06, 0.055, 0.05), charBand * 0.94);
    float ember = smoothstep(-0.018 * H, 0.0, dB) * (1.0 - smoothstep(0.0, 0.014 * H, dB));
    col = mix(col, mix(vec3(0.941, 0.322, 0.208), vec3(1.0, 0.86, 0.42), ember * flick), ember);
    col += vec3(0.941, 0.322, 0.208) * (1.0 - smoothstep(0.0, glowReach, dB)) * step(0.0, dB) * 0.2 * flick;
    vec2 g = vec2(p.x / (0.026 * H), (docY * 1.0 + t * 90.0 * S) / (0.026 * H));
    vec2 cell = floor(g);
    float seed = hash(cell);
    vec2 o = vec2(hash(cell + 3.1), hash(cell + 7.7)) * 0.7 + 0.15;
    float spark = smoothstep(0.11, 0.0, length(fract(g) - o));
    float zone = smoothstep(-0.34 * H, -0.03 * H, dB) * step(dB, -0.02 * H);
    col = mix(col, vec3(1.0, 0.62, 0.25), spark * step(0.93, seed) * zone * (0.5 + 0.5 * sin(t * 5.0 + seed * 40.0)));
  }

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

    const flat = (pick: (z: Zone) => number[], zones: Zone[]) => {
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
        uKind: { value: new Array(N).fill(0) },
        uBurn: { value: new Array(N).fill(0) },
        uBound: { value: new Array(N).fill(1e9) },
      },
    })
    const mesh = new Mesh(gl, { geometry: new Triangle(gl), program })

    let sections: HTMLElement[] = []
    let sectionZones: Zone[] = []
    let dirty = true

    // Les seuils sont des positions dans la page : on les relit quand le DOM ou la taille changent, pas à chaque image.
    const scan = () => {
      sections = [...document.querySelectorAll<HTMLElement>('main > section')].slice(0, N)
      if (sections.length === 0) return
      sectionZones = sections.map((s) => ZONES[s.id] ?? ZONES.default)
      const bounds = new Array(N).fill(1e9)
      const burn = new Array(N).fill(0)
      sections.forEach((s, i) => {
        if (i === 0) return
        bounds[i - 1] = s.getBoundingClientRect().top + window.scrollY
        burn[i - 1] = sectionZones[i - 1].dark !== sectionZones[i].dark ? 1 : 0
      })
      program.uniforms.uTone.value = flat((z) => z.tone, sectionZones)
      program.uniforms.uA.value = flat((z) => z.a, sectionZones)
      program.uniforms.uB.value = flat((z) => z.b, sectionZones)
      program.uniforms.uKind.value = flat((z) => [z.kind], sectionZones)
      program.uniforms.uBurn.value = burn
      program.uniforms.uBound.value = bounds
      dirty = true
    }

    // Thème du menu : celui du monde qui passe sous la barre. On regarde l'état du DOM (la classe `theme-dark` des sections).
    const syncTheme = () => {
      let dark = false
      for (let i = 0; i < sections.length; i++) {
        const r = sections[i].getBoundingClientRect()
        if (r.top <= 60 && r.bottom > 60) dark = sectionZones[i].dark
      }
      const next = dark ? 'dark' : 'light'
      if (document.documentElement.dataset.theme !== next) document.documentElement.dataset.theme = next
    }

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
        if (y !== lastScroll || dirty) syncTheme()
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
      delete document.documentElement.dataset.theme
    }
  }, [deps])

  return <div ref={host} className="pointer-events-none fixed inset-0 -z-[5]" aria-hidden="true" />
}
