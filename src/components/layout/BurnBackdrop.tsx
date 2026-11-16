import { useEffect, useRef } from 'react'
import { Mesh, Program, Renderer, Triangle, Vec2, Vec3 } from 'ogl'
import { prefersReducedMotion } from '../../lib/motion'

/**
 * Fond du site : chaque zone a sa teinte de papier, et le passage de l'une à l'autre se fait par une ligne de braise
 * qui ronge l'ancien fond (bord carbonisé, liseré incandescent, étincelles). La ligne suit le haut de la section qui arrive.
 * Un seul triangle plein écran en OGL ; rien n'est rendu tant qu'aucune frontière n'est à l'écran.
 */

const TONES = {
  ivory: [0.945, 0.922, 0.867],
  sand: [0.89, 0.859, 0.78],
  chrome: [0.851, 0.863, 0.878],
} as const
type Tone = keyof typeof TONES

/** Teinte de fond par section (identifiant) ; les autres restent ivoire. */
const ZONES: Record<string, Tone> = { deck: 'sand', ia: 'chrome', about: 'sand', contact: 'chrome' }

const VERT = /* glsl */ `
attribute vec2 position;
attribute vec2 uv;
varying vec2 vUv;
void main() { vUv = uv; gl_Position = vec4(position, 0.0, 1.0); }`

const FRAG = /* glsl */ `
precision highp float;
uniform float uTime;
uniform float uEdge;
uniform vec2 uRes;
uniform vec3 uA;
uniform vec3 uB;
varying vec2 vUv;

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1, 0)), f.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), f.x), f.y);
}
float fbm(vec2 p) {
  float v = 0.0, a = 0.5;
  for (int i = 0; i < 5; i++) { v += a * noise(p); p = p * 2.07 + 11.0; a *= 0.5; }
  return v;
}

void main() {
  float aspect = uRes.x / uRes.y;
  vec2 p = vec2(vUv.x * aspect, 1.0 - vUv.y);
  // Front de combustion : grande ondulation lente + dentelure fine qui frémit.
  float wave = (fbm(vec2(p.x * 1.6, uTime * 0.07)) - 0.5) * 0.3;
  float tooth = (fbm(vec2(p.x * 9.0, p.y * 6.0 - uTime * 0.25)) - 0.5) * 0.085;
  float d = p.y - (uEdge + wave + tooth);

  vec3 col = d > 0.0 ? uB : uA;
  // Papier roussi au-dessus du front, puis carbonisé, puis braise au bord.
  float scorch = smoothstep(-0.2, -0.02, d) * step(d, 0.0);
  col = mix(col, uA * vec3(0.8, 0.7, 0.56), scorch * 0.75);
  float charBand = smoothstep(-0.05, -0.012, d) * step(d, 0.0);
  col = mix(col, vec3(0.125, 0.13, 0.12), charBand * 0.92);
  float flick = 0.75 + 0.25 * noise(vec2(p.x * 22.0, uTime * 3.0));
  float ember = smoothstep(-0.016, 0.0, d) * (1.0 - smoothstep(0.0, 0.012, d));
  col = mix(col, mix(vec3(0.941, 0.322, 0.208), vec3(1.0, 0.86, 0.42), ember * flick), ember);
  // Halo chaud sur le nouveau fond, juste sous la braise.
  col += vec3(0.941, 0.322, 0.208) * (1.0 - smoothstep(0.0, 0.07, d)) * step(0.0, d) * 0.16 * flick;

  // Étincelles qui montent du front.
  vec2 g = vec2(p.x * 26.0, (p.y + uTime * 0.11) * 26.0);
  vec2 cell = floor(g);
  float seed = hash(cell);
  vec2 o = vec2(hash(cell + 3.1), hash(cell + 7.7)) * 0.7 + 0.15;
  float spark = smoothstep(0.11, 0.0, length(fract(g) - o));
  float zone = smoothstep(-0.34, -0.03, d) * step(d, -0.02);
  col = mix(col, vec3(1.0, 0.62, 0.25), spark * step(0.93, seed) * zone * (0.5 + 0.5 * sin(uTime * 5.0 + seed * 40.0)));

  col += (hash(vUv * uRes + uTime) - 0.5) * 0.018;
  gl_FragColor = vec4(col, 1.0);
}`

type Boundary = { edge: number; a: Tone; b: Tone }

/** Frontière la plus proche du centre de l'écran, ou la teinte unie à afficher. */
function readBoundary(sections: HTMLElement[], vh: number): Boundary {
  let tone: Tone = 'ivory'
  let best: Boundary | null = null
  let prev: Tone = 'ivory'
  for (const s of sections) {
    const t = ZONES[s.id] ?? 'ivory'
    const top = s.getBoundingClientRect().top
    if (top <= vh * 0.5) tone = t
    if (t !== prev && top > -vh * 0.45 && top < vh * 1.45) {
      const edge = top / vh
      if (!best || Math.abs(edge - 0.5) < Math.abs(best.edge - 0.5)) best = { edge, a: prev, b: t }
    }
    prev = t
  }
  return best ?? { edge: -9, a: tone, b: tone }
}

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
      return // pas de WebGL : le fond ivoire uni du CSS reste en place
    }
    const gl = renderer.gl
    el.appendChild(gl.canvas)
    gl.canvas.style.cssText = 'width:100%;height:100%;display:block'
    const program = new Program(gl, {
      vertex: VERT,
      fragment: FRAG,
      uniforms: {
        uTime: { value: 0 },
        uEdge: { value: -9 },
        uRes: { value: new Vec2(1, 1) },
        uA: { value: new Vec3(...TONES.ivory) },
        uB: { value: new Vec3(...TONES.ivory) },
      },
    })
    const mesh = new Mesh(gl, { geometry: new Triangle(gl), program })

    let sections: HTMLElement[] = []
    const scan = () => {
      sections = [...document.querySelectorAll<HTMLElement>('main > section')]
    }
    scan()
    const scanTimer = window.setInterval(scan, 1200)

    let dirty = true
    const resize = () => {
      renderer.setSize(window.innerWidth, window.innerHeight)
      program.uniforms.uRes.value.set(gl.canvas.width, gl.canvas.height)
      dirty = true
    }
    resize()
    window.addEventListener('resize', resize)

    let raf = 0
    let last = ''
    const frame = (t: number) => {
      const b = readBoundary(sections, window.innerHeight)
      const active = b.a !== b.b
      const key = `${b.a}${b.b}${active ? b.edge.toFixed(4) : ''}`
      // On ne redessine que si la frontière bouge, ou en continu quand la braise est visible.
      if (dirty || key !== last || (active && !reduced)) {
        program.uniforms.uA.value.set(...TONES[b.a])
        program.uniforms.uB.value.set(...TONES[b.b])
        program.uniforms.uEdge.value = b.edge
        program.uniforms.uTime.value = reduced ? 4 : t * 0.001
        renderer.render({ scene: mesh })
        last = key
        dirty = false
      }
      raf = requestAnimationFrame(frame)
    }
    raf = requestAnimationFrame(frame)

    return () => {
      cancelAnimationFrame(raf)
      window.clearInterval(scanTimer)
      window.removeEventListener('resize', resize)
      gl.getExtension('WEBGL_lose_context')?.loseContext()
      gl.canvas.remove()
    }
  }, [deps])

  return <div ref={host} className="pointer-events-none fixed inset-0 -z-[5]" aria-hidden="true" />
}
