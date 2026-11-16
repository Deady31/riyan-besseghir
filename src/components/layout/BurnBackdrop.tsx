import { useEffect, useRef } from 'react'
import { Mesh, Program, Renderer, Texture, Triangle, Vec2 } from 'ogl'
import { prefersReducedMotion } from '../../lib/motion'

/**
 * Fond du site : un monde par chapitre, rendu en un seul triangle plein écran (OGL).
 *
 * Cinq mondes :
 *  - papier   : ivoire, nuages de couleur qui dérivent, grille de points par plaques ;
 *  - liquide  : cobalt liquide à reflets de chrome ;
 *  - nuit     : noir d'encre, étoiles à parallaxe, brumes ;
 *  - trame    : papier + grosse trame d'imprimerie à 45° ;
 *  - scène    : une estampe (image WebP + carte des plaques de couleur), en parallaxe lente.
 *
 * Entre deux chapitres :
 *  - clair ↔ sombre : le monde brûle (front de braise irrégulier, roussi, carbonisé, étincelles) ;
 *  - quand une scène est concernée : l'estampe s'IMPRIME plaque par plaque. La carte des plaques donne à chaque pixel sa
 *    plaque (papier, indigo, vermillon, encre…) ; chaque plaque apparaît à son tour, avec un bord irrégulier et une
 *    pointe d'encre fraîche. À la sortie, les plaques se décollent dans l'ordre inverse ;
 *  - sinon : lavis large, sans coupure.
 *
 * Ressources : les scènes ne sont chargées que lorsque leur chapitre est proche (au plus 3 en mémoire), dans la version
 * paysage ou portrait selon l'écran, et libérées quand on s'en éloigne. La résolution du rendu s'abaisse d'elle-même
 * si la machine peine (jamais tant qu'elle suit), et le rendu passe à 30 images/s quand rien ne défile.
 *
 * Le thème (`html[data-theme]`) suit le monde sous la barre de navigation. Les sections sombres portent `theme-dark`.
 */

const rgb = (hex: string): [number, number, number] => {
  const n = parseInt(hex.slice(1), 16)
  return [(n >> 16) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255]
}

const PAPER = 0
const LIQUID = 1
const NIGHT = 2
const HALFTONE = 3
const SCENE = 4

type SceneDef = { key: string; veil: number; flip?: boolean }
type Zone = {
  /** Transition à l'ENTRÉE de ce chapitre : 'plates' (impression par plaques, par défaut) ou 'glass' (verre cannelé). */
  enter?: 'plates' | 'glass'
  kind: number
  dark: boolean
  tone: [number, number, number]
  a: [number, number, number]
  b: [number, number, number]
  scene?: SceneDef
}
const zone = (kind: number, tone: string, a: string, b: string, dark = false, scene?: SceneDef, enter?: Zone['enter']): Zone => ({
  kind, dark, tone: rgb(tone), a: rgb(a), b: rgb(b), scene, enter,
})

const COBALT_SOFT = '#7f9bff'
const COBALT = '#254dff'
const VERMILION = '#f05235'
const ACID = '#d9f05a'
const CHROME = '#c3c8d0'
const IVORY = '#f1ebdd'

// `scene` : estampe affichée quand elle est chargée ; en attendant, le monde `kind` sert de repli. Le voile calme
// l'image sous le texte (0 = image pure, 1 = papier uni).
const ZONES: Record<string, Zone> = {
  default: zone(PAPER, IVORY, COBALT_SOFT, ACID),
  top: zone(PAPER, IVORY, COBALT_SOFT, ACID, false, { key: 'intro', veil: 0.68 }),
  morph: zone(LIQUID, '#050a3a', COBALT, IVORY, true),
  deck: zone(HALFTONE, '#e9dfc7', VERMILION, ACID, false, { key: 'deck', veil: 0.5 }),
  impact: zone(PAPER, IVORY, COBALT_SOFT, ACID, false, { key: 'impact', veil: 0.58 }, 'glass'),
  'hauts-faits': zone(PAPER, '#e3e8f6', COBALT_SOFT, CHROME, false, { key: 'hauts-faits', veil: 0.55 }),
  studio: zone(PAPER, '#eaefc9', ACID, COBALT_SOFT, false, { key: 'studio', veil: 0.55 }, 'glass'),
  ia: zone(NIGHT, '#08090e', COBALT, VERMILION, true, { key: 'nuit', veil: 0.3 }),
  lab: zone(PAPER, IVORY, VERMILION, ACID, false, { key: 'lab', veil: 0.58 }),
  about: zone(HALFTONE, '#e9dfc7', COBALT, ACID, false, { key: 'about', veil: 0.62 }),
  passions: zone(HALFTONE, '#f3dccd', VERMILION, ACID, false, { key: 'passions', veil: 0.56 }, 'glass'),
  contact: zone(NIGHT, '#08090e', COBALT, VERMILION, true, { key: 'contact', veil: 0.25 }),
}

const N = 12
const SLOTS = 3
const BASE_DPR = 1.25

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
uniform float uTrans[N];
uniform float uBound[N];
uniform float uSlot[N];
uniform float uVeil[N];
uniform float uFlip[N];
uniform float uTop[N];
uniform float uBot[N];
uniform sampler2D uTex0;
uniform sampler2D uTex1;
uniform sampler2D uTex2;
uniform sampler2D uPl0;
uniform sampler2D uPl1;
uniform sampler2D uPl2;
uniform vec2 uSize0;
uniform vec2 uSize1;
uniform vec2 uSize2;
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
  vec2 g = vec2(p.x, p.y + uScroll * 0.6);
  g = vec2(g.x + g.y, g.y - g.x) * 0.7071 / 30.0;
  float d = length(fract(g) - 0.5);
  float r = smoothstep(0.42, 0.88, field) * 0.3;
  float dotM = smoothstep(r, r - 0.09, d) * step(0.02, r);
  return mix(col, a, dotM * 0.4);
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

// ---------------------------------------------------------------- scène (estampe)
vec4 texPick(float s, vec2 uv) {
  if (s < 0.5) return texture2D(uTex0, uv);
  if (s < 1.5) return texture2D(uTex1, uv);
  return texture2D(uTex2, uv);
}
float plateAt(float s, vec2 uv) {
  float v;
  if (s < 0.5) v = texture2D(uPl0, uv).r;
  else if (s < 1.5) v = texture2D(uPl1, uv).r;
  else v = texture2D(uPl2, uv).r;
  return floor(v * 255.0 + 0.5);
}
vec2 sizePick(float s) {
  if (s < 0.5) return uSize0;
  if (s < 1.5) return uSize1;
  return uSize2;
}
// Image « cover » plein écran, légèrement agrandie, qui glisse doucement avec la page.
vec2 sceneUv(float slot, vec2 p, float top, float bot, float flip) {
  vec2 sz = max(sizePick(slot), vec2(1.0));
  float sc = max(uView.x / sz.x, uView.y / sz.y) * 1.14;
  float prog = clamp((uScroll + 0.5 * uView.y - top) / max(bot - top, 1.0), 0.0, 1.0);
  vec2 c = (p - 0.5 * uView) / sc;
  c.y += (0.5 - prog) * sz.y * 0.07;
  vec2 uv = c / sz + 0.5;
  if (flip > 0.5) uv.x = 1.0 - uv.x;
  return uv;
}
vec3 sceneW(float slot, vec2 p, float top, float bot, float flip, float veil, vec3 tone) {
  vec3 c = texPick(slot, sceneUv(slot, p, top, bot, flip)).rgb;
  return mix(c, tone, veil);
}

vec3 world(float kind, vec2 p, float docY, float t, vec3 tone, vec3 a, vec3 b, float slot, float top, float bot, float flip, float veil) {
  if (kind < 0.5) return paperW(p, docY, t, tone, a, b);
  if (kind < 1.5) return liquidW(p, docY, t, tone, a, b);
  if (kind < 2.5) return nightW(p, docY, t, tone, a, b);
  if (kind < 3.5) return halftoneW(p, docY, t, tone, a, b);
  return sceneW(slot, p, top, bot, flip, veil, tone);
}

void main() {
  vec2 p = vec2(vUv.x * uView.x, (1.0 - vUv.y) * uView.y);
  float docY = uScroll + p.y;
  float t = uTime;
  float H = uView.y;
  float S = H / 900.0;

  float warp = (fbm(vec2(p.x * 0.0016 + 3.0, docY * 0.0011 - t * 0.03)) - 0.5) * 0.7 * H;
  float hw = 0.34 * H;
  float frontOff = (fbm(vec2(p.x * 0.0017, docY * 0.0009 + t * 0.06)) - 0.5) * 0.2 * H
                 + (fbm(vec2(p.x * 0.011, docY * 0.007 - t * 0.22)) - 0.5) * 0.07 * H;
  float scorchReach = 0.24 * H;
  float glowReach = 0.09 * H;

  float jf = 0.0;
  float kk = 0.0;
  float tg = 0.0;
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
      else if (d > -hw) { kk = smoothstep(-hw, hw, d); tg = uTrans[i]; }
    }
  }

  vec3 t0 = uTone[0], a0 = uA[0], b0 = uB[0];
  vec3 t1 = uTone[0], a1 = uA[0], b1 = uB[0];
  float k0 = uKind[0], k1 = uKind[0];
  float s0 = uSlot[0], s1 = uSlot[0], top0 = uTop[0], top1 = uTop[0], bot0 = uBot[0], bot1 = uBot[0];
  float f0 = uFlip[0], f1 = uFlip[0], v0 = uVeil[0], v1 = uVeil[0];
  for (int i = 0; i < N; i++) {
    float fi = float(i);
    if (abs(fi - jf) < 0.5) {
      t0 = uTone[i]; a0 = uA[i]; b0 = uB[i]; k0 = uKind[i]; s0 = uSlot[i]; top0 = uTop[i]; bot0 = uBot[i]; f0 = uFlip[i]; v0 = uVeil[i];
      t1 = t0; a1 = a0; b1 = b0; k1 = k0; s1 = s0; top1 = top0; bot1 = bot0; f1 = f0; v1 = v0;
    }
  }
  for (int i = 0; i < N; i++) {
    float fi = float(i);
    if (abs(fi - jf - 1.0) < 0.5) {
      t1 = uTone[i]; a1 = uA[i]; b1 = uB[i]; k1 = uKind[i]; s1 = uSlot[i]; top1 = uTop[i]; bot1 = uBot[i]; f1 = uFlip[i]; v1 = uVeil[i];
    }
  }

  // Verre cannelé : l'image est vue à travers des cannelures verticales qui la déforment de plus en plus au cœur de la
  // transition ; chaque cannelure bascule à son propre moment (le passage se fait en vagues), avec reflets sur les arêtes.
  vec2 pw = p;
  float flute = 0.0;
  float glassAmp = 0.0;
  float flutes = 0.0;
  if (kk > 0.002 && tg > 0.5) {
    float stripW = max(14.0, uView.x / 46.0);
    float cell = floor(p.x / stripW);
    flute = fract(p.x / stripW) - 0.5;
    glassAmp = sin(clamp(kk, 0.0, 1.0) * 3.14159265);
    pw.x = p.x + flute * stripW * 1.9 * glassAmp;
    flutes = hash(vec2(cell, 3.7));
  }
  vec3 col = world(k0, pw, docY, t, t0, a0, b0, s0, top0, bot0, f0, v0);
  if (kk > 0.002) {
    vec3 col1 = world(k1, pw, docY, t, t1, a1, b1, s1, top1, bot1, f1, v1);
    bool newScene = k1 > 3.5;
    bool oldScene = k0 > 3.5;
    if (tg > 0.5) {
      float m = smoothstep(0.28 + flutes * 0.22, 0.58 + flutes * 0.22, kk);
      col = mix(col, col1, m);
      float lens = 1.0 - flute * flute * 4.0;
      col *= 1.0 + 0.1 * glassAmp * (lens - 0.5);
      col = mix(col, vec3(1.0), 0.2 * smoothstep(0.43, 0.5, abs(flute)) * glassAmp);
    } else if (newScene || oldScene) {
      // L'estampe s'imprime plaque par plaque (ou se décolle dans l'ordre inverse), avec un bord irrégulier et de l'encre fraîche.
      float slot = newScene ? s1 : s0;
      vec2 uv = newScene ? sceneUv(s1, p, top1, bot1, f1) : sceneUv(s0, p, top0, bot0, f0);
      float rank = clamp(plateAt(slot, uv) / 9.0, 0.0, 1.0);
      float order = newScene ? rank : 1.0 - rank;
      float jitter = (fbm(p * 0.006 + 7.0) - 0.5) * 0.24 + (noise(p * 0.05) - 0.5) * 0.05;
      float th = 0.06 + order * 0.6 + jitter;
      float shown = smoothstep(th, th + 0.05, kk);
      float edge = shown * (1.0 - shown) * 4.0;
      col = mix(col, col1, shown);
      col = mix(col, vec3(0.09, 0.09, 0.11), edge * 0.32);
    } else {
      col = mix(col, col1, kk);
    }
  }

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

type Loaded = { key: string; tex: Texture; plates: Texture; w: number; h: number }

export function BurnBackdrop({ deps }: { deps: string }) {
  const host = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = host.current
    if (!el) return
    const reduced = prefersReducedMotion()
    let renderer: Renderer
    try {
      renderer = new Renderer({ alpha: false, antialias: false, dpr: Math.min(window.devicePixelRatio || 1, BASE_DPR) })
    } catch {
      return // pas de WebGL : le fond CSS (PaperBackground) reste en place
    }
    const gl = renderer.gl
    el.appendChild(gl.canvas)
    gl.canvas.style.cssText = 'width:100%;height:100%;display:block'

    const dummy = new Texture(gl, { image: new Uint8Array([0, 0, 0, 255]), width: 1, height: 1, generateMipmaps: false })
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
        uTrans: { value: new Array(N).fill(0) },
        uBound: { value: new Array(N).fill(1e9) },
        uSlot: { value: new Array(N).fill(-1) },
        uVeil: { value: new Array(N).fill(0.5) },
        uFlip: { value: new Array(N).fill(0) },
        uTop: { value: new Array(N).fill(0) },
        uBot: { value: new Array(N).fill(1) },
        uTex0: { value: dummy }, uTex1: { value: dummy }, uTex2: { value: dummy },
        uPl0: { value: dummy }, uPl1: { value: dummy }, uPl2: { value: dummy },
        uSize0: { value: new Vec2(1, 1) }, uSize1: { value: new Vec2(1, 1) }, uSize2: { value: new Vec2(1, 1) },
      },
    })
    const mesh = new Mesh(gl, { geometry: new Triangle(gl), program })

    // ---- Scènes : chargement à la demande, 3 emplacements, libération quand on s'éloigne.
    const orient = () => (window.innerWidth < window.innerHeight ? 'port' : 'land')
    let currentOrient = orient()
    const cache = new Map<string, Loaded | 'loading'>()
    const slotOf: (Loaded | null)[] = [null, null, null]
    let disposed = false
    let dirty = true
    let scanSoon = false
    let lastSlotScroll = -1e9

    const load = (scene: string) => {
      const id = `${scene}_${currentOrient}`
      if (cache.has(id)) return
      cache.set(id, 'loading')
      const img = new Image()
      const plates = new Image()
      img.decoding = 'async'
      plates.decoding = 'async'
      img.src = `/media/scenes/${id}.webp`
      plates.src = `/media/scenes/${id}_plates.png`
      Promise.all([img.decode(), plates.decode()])
        .then(() => {
          if (disposed || currentOrient !== id.split('_')[1]) {
            cache.delete(id)
            return
          }
          const tex = new Texture(gl, { image: img, generateMipmaps: true, minFilter: gl.LINEAR_MIPMAP_LINEAR, magFilter: gl.LINEAR, wrapS: gl.CLAMP_TO_EDGE, wrapT: gl.CLAMP_TO_EDGE, flipY: false })
          const pl = new Texture(gl, { image: plates, generateMipmaps: false, minFilter: gl.NEAREST, magFilter: gl.NEAREST, wrapS: gl.CLAMP_TO_EDGE, wrapT: gl.CLAMP_TO_EDGE, flipY: false })
          cache.set(id, { key: scene, tex, plates: pl, w: img.naturalWidth, h: img.naturalHeight })
          dirty = true
          scanSoon = true
        })
        .catch(() => cache.delete(id))
    }
    const release = (id: string) => {
      const l = cache.get(id)
      if (l && l !== 'loading') {
        gl.deleteTexture(l.tex.texture)
        gl.deleteTexture(l.plates.texture)
      }
      cache.delete(id)
    }

    let sections: HTMLElement[] = []
    let sectionZones: Zone[] = []

    // Choisit les (au plus 3) scènes proches de l'écran, les charge, libère les lointaines, et renseigne les emplacements.
    const updateScenes = () => {
      const H = window.innerHeight
      const y = window.scrollY
      const want: { idx: number; dist: number }[] = []
      sections.forEach((s, i) => {
        if (!sectionZones[i].scene) return
        const top = s.getBoundingClientRect().top + y
        const bottom = top + s.offsetHeight
        const dist = Math.max(top - (y + H), y - bottom, 0) // 0 = visible
        if (dist < 2.2 * H) want.push({ idx: i, dist })
      })
      want.sort((a, b) => a.dist - b.dist)
      const chosen = want.slice(0, SLOTS)
      const keep = new Set(chosen.map((w) => `${sectionZones[w.idx].scene!.key}_${currentOrient}`))
      chosen.forEach((w) => load(sectionZones[w.idx].scene!.key))
      for (const id of [...cache.keys()]) {
        if (!keep.has(id) && cache.get(id) !== 'loading') release(id)
      }
      for (let s = 0; s < SLOTS; s++) {
        const l = slotOf[s]
        if (l && !keep.has(`${l.key}_${currentOrient}`)) slotOf[s] = null
      }
      keep.forEach((id) => {
        const l = cache.get(id)
        if (!l || l === 'loading' || slotOf.includes(l)) return
        const free = slotOf.indexOf(null)
        if (free >= 0) slotOf[free] = l
      })
      const u = program.uniforms
      for (let s = 0; s < SLOTS; s++) {
        const l = slotOf[s]
        u[`uTex${s}`].value = l ? l.tex : dummy
        u[`uPl${s}`].value = l ? l.plates : dummy
        u[`uSize${s}`].value.set(l ? l.w : 1, l ? l.h : 1)
      }
      const kinds = new Array(N).fill(0)
      const slots = new Array(N).fill(-1)
      sectionZones.forEach((z, i) => {
        kinds[i] = z.kind
        if (!z.scene) return
        const at = slotOf.findIndex((l) => l && l.key === z.scene!.key)
        if (at >= 0) {
          kinds[i] = SCENE
          slots[i] = at
        }
      })
      u.uKind.value = kinds
      u.uSlot.value = slots
      lastSlotScroll = y
      dirty = true
    }

    // Les seuils sont des positions dans la page : on les relit quand le DOM ou la taille changent, pas à chaque image.
    const scan = () => {
      sections = [...document.querySelectorAll<HTMLElement>('main > section')].slice(0, N)
      if (sections.length === 0) return
      sectionZones = sections.map((s) => ZONES[s.id] ?? ZONES.default)
      const bounds = new Array(N).fill(1e9)
      const burn = new Array(N).fill(0)
      const trans = new Array(N).fill(0)
      const tops = new Array(N).fill(0)
      const bots = new Array(N).fill(1)
      const veil = new Array(N).fill(0.5)
      const flip = new Array(N).fill(0)
      const y = window.scrollY
      sections.forEach((s, i) => {
        const top = s.getBoundingClientRect().top + y
        tops[i] = top
        bots[i] = top + s.offsetHeight
        if (i > 0) {
          bounds[i - 1] = top
          burn[i - 1] = sectionZones[i - 1].dark !== sectionZones[i].dark ? 1 : 0
          trans[i - 1] = sectionZones[i].enter === 'glass' ? 1 : 0
        }
        veil[i] = sectionZones[i].scene?.veil ?? 0.5
        flip[i] = sectionZones[i].scene?.flip ? 1 : 0
      })
      const u = program.uniforms
      u.uTone.value = flat((z) => z.tone, sectionZones)
      u.uA.value = flat((z) => z.a, sectionZones)
      u.uB.value = flat((z) => z.b, sectionZones)
      u.uBurn.value = burn
      u.uTrans.value = trans
      u.uBound.value = bounds
      u.uTop.value = tops
      u.uBot.value = bots
      u.uVeil.value = veil
      u.uFlip.value = flip
      updateScenes()
    }

    // Thème du menu : celui du monde qui passe sous la barre.
    const syncTheme = () => {
      let dark = false
      for (let i = 0; i < sections.length; i++) {
        const r = sections[i].getBoundingClientRect()
        if (r.top <= 60 && r.bottom > 60) dark = sectionZones[i].dark
      }
      const next = dark ? 'dark' : 'light'
      if (document.documentElement.dataset.theme !== next) document.documentElement.dataset.theme = next
    }

    // ---- Résolution adaptative : on n'abaisse que si la machine ne suit pas, jamais tant qu'elle suit.
    let dprScale = 1
    const applySize = () => {
      renderer.dpr = Math.min(window.devicePixelRatio || 1, BASE_DPR) * dprScale
      renderer.setSize(window.innerWidth, window.innerHeight)
      program.uniforms.uView.value.set(window.innerWidth, window.innerHeight)
      dirty = true
    }
    const resize = () => {
      const o = orient()
      if (o !== currentOrient) {
        currentOrient = o
        for (const id of [...cache.keys()]) release(id)
        slotOf.fill(null)
      }
      applySize()
      scan()
    }
    resize()
    const scanTimer = window.setInterval(scan, 800)
    window.addEventListener('resize', resize)
    const ro = new ResizeObserver(scan)
    ro.observe(document.body)

    let raf = 0
    let lastScroll = -1
    let lastMove = 0
    let lastNow = 0
    let frameNo = 0
    let ema = 16
    let slowSince = 0
    let fastSince = 0
    const frame = (now: number) => {
      raf = requestAnimationFrame(frame)
      const y = window.scrollY
      const moving = y !== lastScroll
      if (moving) lastMove = now
      const active = now - lastMove < 300
      frameNo++
      // Au repos (rien ne défile), l'animation lente du fond n'a pas besoin de 60 images/s : 30 suffisent.
      if (!active && !dirty && !moving && frameNo % 2 === 1 && !reduced) return
      if (scanSoon || Math.abs(y - lastSlotScroll) > 0.2 * window.innerHeight) {
        scanSoon = false
        updateScenes()
      }
      if (dirty || moving || !reduced) {
        program.uniforms.uScroll.value = y
        program.uniforms.uTime.value = reduced ? 4 : now * 0.001
        renderer.render({ scene: mesh })
        if (moving || dirty) syncTheme()
        lastScroll = y
        dirty = false
      }
      // Gouverneur : intervalle entre images pendant qu'on défile (là où le fond doit tenir 60 images/s).
      if (active && lastNow) {
        ema = ema * 0.92 + (now - lastNow) * 0.08
        if (ema > 27 && dprScale > 0.5) {
          slowSince = slowSince || now
          if (now - slowSince > 1200) {
            dprScale = Math.max(0.5, dprScale - 0.15)
            applySize()
            slowSince = 0
            fastSince = 0
            ema = 16
          }
        } else {
          slowSince = 0
          if (ema < 17.5 && dprScale < 1) {
            fastSince = fastSince || now
            if (now - fastSince > 6000) {
              dprScale = Math.min(1, dprScale + 0.1)
              applySize()
              fastSince = 0
            }
          } else fastSince = 0
        }
      }
      lastNow = active ? now : 0
    }
    raf = requestAnimationFrame(frame)

    return () => {
      disposed = true
      cancelAnimationFrame(raf)
      window.clearInterval(scanTimer)
      window.removeEventListener('resize', resize)
      ro.disconnect()
      for (const id of [...cache.keys()]) release(id)
      gl.getExtension('WEBGL_lose_context')?.loseContext()
      gl.canvas.remove()
      delete document.documentElement.dataset.theme
    }
  }, [deps])

  return <div ref={host} className="pointer-events-none fixed inset-0 -z-[5]" aria-hidden="true" />
}
