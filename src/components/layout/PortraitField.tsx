import { useEffect, useRef } from 'react'
import { prefersReducedMotion } from '../../lib/motion'

const VERT = `attribute vec2 p; void main(){ gl_Position = vec4(p, 0.0, 1.0); }`

const FRAG = `
precision highp float;
uniform vec2 uRes;
uniform float uTime;
uniform vec2 uMouse;
uniform float uScroll;
uniform float uCell;
uniform vec4 uRect;
uniform float uReady;
uniform sampler2D uTex;
uniform sampler2D uText;
uniform vec4 uTextRect;
uniform float uMorph;
uniform float uMorphOn;

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1, 0)), u.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), u.x), u.y);
}

void main() {
  vec2 cell = floor(gl_FragCoord.xy / uCell);
  vec2 c = (cell + 0.5) * uCell;
  float h = hash(cell);

  vec2 d = c - uMouse;
  float r = 150.0 * (uCell / 8.0);
  float lens = exp(-dot(d, d) / (r * r));

  vec2 dir = vec2(hash(cell + 7.1) - 0.5, hash(cell + 3.3) - 0.5);
  vec2 sp = c - dir * uScroll * uRes.y * 0.9 - normalize(d + 0.001) * lens * 38.0;
  vec2 puv = (sp - uRect.xy) / uRect.zw;
  float inside = step(0.0, puv.x) * step(puv.x, 1.0) * step(0.0, puv.y) * step(puv.y, 1.0);
  vec4 tx = texture2D(uTex, vec2(puv.x, 1.0 - puv.y)) * inside * uReady;

  float breath = noise(c * 0.006 + uTime * 0.18);
  float portrait = tx.a * mix(0.12, 0.64, pow(tx.r, 0.85)) * (0.86 + 0.28 * breath) * (1.0 - uScroll);
  vec2 tsp = c - dir * (1.0 - uMorph) * uRes.y * 1.1 - normalize(d + 0.001) * lens * 30.0;
  vec2 tuv = (tsp - uTextRect.xy) / uTextRect.zw;
  float tin = step(0.0, tuv.x) * step(tuv.x, 1.0) * step(0.0, tuv.y) * step(tuv.y, 1.0);
  float glyph = texture2D(uText, vec2(tuv.x, 1.0 - tuv.y)).a * tin * uMorphOn;
  float text = glyph * (0.5 + 0.12 * breath) * smoothstep(0.0, 0.35, uMorph);
  portrait = max(portrait, text);

  float amb = smoothstep(0.6, 0.97, noise(c * 0.0032 + vec2(uTime * 0.035, -uTime * 0.025))) * 0.2;
  float size = max(portrait, amb);

  float radius = size * uCell;
  float dist = length(gl_FragCoord.xy - c);
  float dotMask = 1.0 - smoothstep(radius - 0.8, radius + 0.6, dist);

  vec3 white = vec3(1.0);
  vec3 violet = vec3(0.545, 0.361, 1.0);
  float isPortrait = step(0.001, portrait);
  float tint = clamp(lens * 1.3 + step(0.988, h) * 0.9 * (1.0 - isPortrait) + step(0.001, text) * step(0.82, h), 0.0, 1.0);
  vec3 dotCol = mix(white, violet, tint);
  float bright = mix(0.28 + lens * 0.5, 0.92, isPortrait);

  vec3 col = vec3(0.0196) + dotCol * dotMask * bright;
  gl_FragColor = vec4(col, 1.0);
}
`

function compile(gl: WebGLRenderingContext, type: number, src: string) {
  const s = gl.createShader(type)!
  gl.shaderSource(s, src)
  gl.compileShader(s)
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) ?? 'shader')
  return s
}

const RATIO = 900 / 1059

export function PortraitField() {
  const canvas = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const el = canvas.current!
    const gl = el.getContext('webgl', { antialias: false, alpha: false, powerPreference: 'low-power' })
    if (!gl) return

    const prog = gl.createProgram()!
    gl.attachShader(prog, compile(gl, gl.VERTEX_SHADER, VERT))
    gl.attachShader(prog, compile(gl, gl.FRAGMENT_SHADER, FRAG))
    gl.linkProgram(prog)
    gl.useProgram(prog)

    const buf = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buf)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
    const loc = gl.getAttribLocation(prog, 'p')
    gl.enableVertexAttribArray(loc)
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0)

    const u = (n: string) => gl.getUniformLocation(prog, n)
    const U = {
      res: u('uRes'), time: u('uTime'), mouse: u('uMouse'), scroll: u('uScroll'),
      cell: u('uCell'), rect: u('uRect'), ready: u('uReady'), tex: u('uTex'),
      text: u('uText'), textRect: u('uTextRect'), morph: u('uMorph'), morphOn: u('uMorphOn'),
    }

    const tex = gl.createTexture()
    gl.bindTexture(gl.TEXTURE_2D, tex)
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 0, 0]))
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
    gl.uniform1i(U.tex, 0)
    gl.uniform1f(U.ready, 0)

    const img = new Image()
    img.onload = () => {
      gl.bindTexture(gl.TEXTURE_2D, tex)
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img)
      gl.uniform1f(U.ready, 1)
    }
    img.src = '/media/portrait-mask.png'

    const textTex = gl.createTexture()
    gl.activeTexture(gl.TEXTURE1)
    gl.bindTexture(gl.TEXTURE_2D, textTex)
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 0, 0]))
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
    gl.uniform1i(U.text, 1)
    gl.uniform1f(U.morphOn, 0)
    gl.activeTexture(gl.TEXTURE0)
    let textAspect = 2.4

    const drawText = () => {
      const c2 = document.createElement('canvas')
      const ctx = c2.getContext('2d')!
      const font = '500 420px "Neue Montreal", "Inter Tight", sans-serif'
      ctx.font = font
      const label = '−56%'
      const w = Math.ceil(ctx.measureText(label).width) + 40
      c2.width = w
      c2.height = 440
      ctx.font = font
      ctx.fillStyle = '#fff'
      ctx.textBaseline = 'middle'
      ctx.fillText(label, 20, 230)
      textAspect = c2.width / c2.height
      gl.activeTexture(gl.TEXTURE1)
      gl.bindTexture(gl.TEXTURE_2D, textTex)
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, c2)
      gl.activeTexture(gl.TEXTURE0)
      gl.uniform1f(U.morphOn, 1)
      resize()
    }
    document.fonts.load('500 100px "Neue Montreal"').catch(() => {}).finally(() =>
      document.fonts.load('500 100px "Inter Tight"').catch(() => {}).finally(drawText),
    )

    const mobile = window.matchMedia('(max-width: 767px)').matches
    const scale = Math.min(window.devicePixelRatio || 1, mobile ? 2 : 1.5)

    const resize = () => {
      const vw = window.innerWidth
      const vh = window.innerHeight
      el.width = Math.round(vw * scale)
      el.height = Math.round(vh * scale)
      gl.viewport(0, 0, el.width, el.height)
      gl.uniform2f(U.res, el.width, el.height)
      gl.uniform1f(U.cell, (mobile ? 5.5 : 7) * scale)
      const ph = Math.min((mobile ? 0.34 : 0.9) * vh, mobile ? (vw * 1.05) / RATIO : Infinity)
      const pw = ph * RATIO
      const px = mobile ? (vw - pw) / 2 + vw * 0.08 : vw - pw - vw * 0.04
      const py = mobile ? vh * 0.45 : 0
      gl.uniform4f(U.rect, px * scale, py * scale, pw * scale, ph * scale)
      const tw = Math.min(vw * (mobile ? 0.94 : 0.74), vh * 0.5 * textAspect)
      const th = tw / textAspect
      gl.uniform4f(U.textRect, ((vw - tw) / 2) * scale, ((vh - th) / 2 + vh * 0.03) * scale, tw * scale, th * scale)
    }
    resize()
    window.addEventListener('resize', resize)

    const target = { x: -9999, y: -9999, scroll: 0, morph: 0 }
    const cur = { ...target }
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return
      target.x = e.clientX * scale
      target.y = (window.innerHeight - e.clientY) * scale
    }
    const onLeave = () => {
      target.x = -9999
      target.y = -9999
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    document.documentElement.addEventListener('pointerleave', onLeave)
    const smooth = (a: number, b: number, x: number) => {
      const t = Math.min(Math.max((x - a) / (b - a), 0), 1)
      return t * t * (3 - 2 * t)
    }
    const morphEl = () => document.getElementById('morph')
    const onScroll = () => {
      const vh = window.innerHeight
      target.scroll = Math.min(window.scrollY / (vh * 0.9), 1)
      const m = morphEl()?.getBoundingClientRect()
      if (!m) return
      const enter = Math.min(Math.max(1 - m.top / vh, 0), 1)
      const local = Math.min(Math.max(-m.top / Math.max(m.height - vh, 1), 0), 1)
      target.morph = m.top > 0 ? smooth(0.35, 1, enter) : 1 - smooth(0.5, 1, local)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })

    const reduced = prefersReducedMotion()
    let raf = 0
    let running = true
    const start = performance.now()
    const frame = (now: number) => {
      const jump = Math.abs(cur.x - target.x) > 4000
      cur.x = jump ? target.x : cur.x + (target.x - cur.x) * 0.12
      cur.y = jump ? target.y : cur.y + (target.y - cur.y) * 0.12
      cur.scroll += (target.scroll - cur.scroll) * (reduced ? 1 : 0.1)
      cur.morph += (target.morph - cur.morph) * (reduced ? 1 : 0.08)
      gl.uniform1f(U.morph, cur.morph)
      gl.uniform1f(U.time, reduced ? 4 : (now - start) / 1000)
      gl.uniform2f(U.mouse, cur.x, cur.y)
      gl.uniform1f(U.scroll, cur.scroll)
      gl.drawArrays(gl.TRIANGLES, 0, 3)
      if (running) raf = requestAnimationFrame(frame)
    }
    raf = requestAnimationFrame(frame)

    const onVisibility = () => {
      running = document.visibilityState === 'visible'
      cancelAnimationFrame(raf)
      if (running) raf = requestAnimationFrame(frame)
    }
    document.addEventListener('visibilitychange', onVisibility)

    return () => {
      running = false
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
      window.removeEventListener('pointermove', onMove)
      document.documentElement.removeEventListener('pointerleave', onLeave)
      window.removeEventListener('scroll', onScroll)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [])

  return <canvas ref={canvas} className="fixed inset-0 -z-10 size-full" aria-hidden="true" />
}
