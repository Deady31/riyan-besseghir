import { useEffect, useRef } from 'react'
import { Mesh, Program, Renderer, Triangle, Vec2 } from 'ogl'
import { prefersReducedMotion } from '../../lib/motion'

/**
 * Fond liquide en OGL : un chrome fondu teinté violet, avec un reflet rose sur les bords, avec des filets de lumière qui suivent le curseur.
 * Un seul triangle plein écran et un fragment shader ; le rendu s'arrête quand le bloc quitte l'écran.
 */

const VERT = /* glsl */ `
attribute vec2 position;
attribute vec2 uv;
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 0.0, 1.0);
}`

const FRAG = /* glsl */ `
precision highp float;
uniform float uTime;
uniform vec2 uRes;
uniform vec2 uMouse;
varying vec2 vUv;

vec3 cobalt = vec3(0.424, 0.169, 1.0);   // violet de la charte #6C2BFF
vec3 deep = vec3(0.13, 0.03, 0.38);      // violet profond
vec3 ivory = vec3(1.0, 0.965, 0.898);    // crème #FFF6E5
vec3 pink = vec3(1.0, 0.494, 0.784);     // rose #FF7EC8

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1, 0)), f.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), f.x), f.y);
}
float fbm(vec2 p) {
  float v = 0.0, a = 0.5;
  for (int i = 0; i < 5; i++) { v += a * noise(p); p = p * 2.03 + 17.0; a *= 0.5; }
  return v;
}

void main() {
  vec2 uv = vUv;
  vec2 p = (uv - 0.5) * vec2(uRes.x / uRes.y, 1.0) * 2.2;
  vec2 m = (uMouse - 0.5) * vec2(uRes.x / uRes.y, 1.0) * 2.2;
  float t = uTime * 0.07;

  // domaine déformé deux fois : donne l'aspect métal liquide
  vec2 q = vec2(fbm(p + t), fbm(p + vec2(5.2, 1.3) - t));
  vec2 r = vec2(fbm(p + 3.0 * q + vec2(1.7, 9.2) + t * 1.4), fbm(p + 3.0 * q + vec2(8.3, 2.8) - t));
  float f = fbm(p + 3.2 * r);

  // l'onde qui suit le curseur
  float d = length(p - m);
  f += 0.35 * exp(-d * 2.2) * sin(d * 9.0 - uTime * 1.6);

  // normale approchée, pour des reflets de type chrome
  float e = 0.012;
  float fx = fbm(p + vec2(e, 0.0) + 3.2 * r) - f;
  float fy = fbm(p + vec2(0.0, e) + 3.2 * r) - f;
  vec3 n = normalize(vec3(-fx / e * 0.35, -fy / e * 0.35, 1.0));
  vec3 l = normalize(vec3(-0.5, 0.65, 0.6));
  float spec = pow(max(dot(reflect(-l, n), vec3(0.0, 0.0, 1.0)), 0.0), 38.0);
  float rim = pow(1.0 - n.z, 2.0);

  vec3 col = mix(deep, cobalt, smoothstep(0.15, 0.85, f));
  col = mix(col, mix(cobalt * 1.35, pink, 0.55), rim * 0.6);
  col += ivory * spec * 0.85;
  col += ivory * smoothstep(0.62, 0.9, f) * 0.1;

  float vig = smoothstep(1.5, 0.35, length(uv - 0.5) * 1.6);
  col *= mix(0.78, 1.0, vig);
  gl_FragColor = vec4(col, 1.0);
}`

export default function ChromeFlow({ className }: { className?: string }) {
  const host = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = host.current
    if (!el) return
    const reduced = prefersReducedMotion()
    const renderer = new Renderer({ alpha: false, antialias: false, dpr: Math.min(window.devicePixelRatio || 1, 1.5) })
    const gl = renderer.gl
    el.appendChild(gl.canvas)
    gl.canvas.style.cssText = 'width:100%;height:100%;display:block'

    const mouse = new Vec2(0.5, 0.5)
    const target = new Vec2(0.5, 0.5)
    const program = new Program(gl, {
      vertex: VERT,
      fragment: FRAG,
      uniforms: { uTime: { value: 0 }, uRes: { value: new Vec2(1, 1) }, uMouse: { value: mouse } },
    })
    const mesh = new Mesh(gl, { geometry: new Triangle(gl), program })

    const resize = () => {
      renderer.setSize(el.clientWidth, el.clientHeight)
      program.uniforms.uRes.value.set(gl.canvas.width, gl.canvas.height)
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(el)

    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect()
      target.set((e.clientX - r.left) / r.width, 1 - (e.clientY - r.top) / r.height)
    }
    if (!reduced) window.addEventListener('pointermove', onMove, { passive: true })

    let raf = 0
    let visible = false
    const frame = (t: number) => {
      mouse.x += (target.x - mouse.x) * 0.06
      mouse.y += (target.y - mouse.y) * 0.06
      program.uniforms.uTime.value = reduced ? 8 : t * 0.001
      renderer.render({ scene: mesh })
      if (visible && !reduced) raf = requestAnimationFrame(frame)
    }
    const io = new IntersectionObserver(([entry]) => {
      const was = visible
      visible = entry.isIntersecting
      if (visible && !was) raf = requestAnimationFrame(frame)
    })
    io.observe(el)
    raf = requestAnimationFrame(frame)

    return () => {
      visible = false
      cancelAnimationFrame(raf)
      io.disconnect()
      ro.disconnect()
      window.removeEventListener('pointermove', onMove)
      gl.getExtension('WEBGL_lose_context')?.loseContext()
      gl.canvas.remove()
    }
  }, [])

  return <div ref={host} className={className} aria-hidden="true" />
}
