import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Environment, Lightformer, useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { prefersReducedMotion } from '../../lib/motion'
import { phoneStage } from '../../lib/phoneStage'

/**
 * Le décor 3D de tout le site. Deux canvas fixes :
 * - `back` (derrière le contenu) : les grandes formes qui défilent avec les sections ;
 * - `front` (devant le contenu) : quelques petites formes rapides, et le téléphone 3D.
 * Chaque forme est « accrochée » à un élément de la page (`[data-anchor]`) : sa position et sa taille suivent cet élément.
 * La mise en page décide, la 3D suit.
 */

const BASE = '/media/3d/'
const COBALT = '#254dff'
const VERMILION = '#f05235'
const FOV = 32
const CAM_Z = 9
const PHONE_SCREEN = '/media/projets/fooder-v2-swipe-mobile.webp'

type KindName =
  | 'knot' | 'ring' | 'orb' | 'bubble' | 'slab'
  | 'form-cobalt' | 'form-vermilion' | 'form-chrome'
  | 'sat-red' | 'sat-chrome' | 'cube-chrome' | 'cube-cobalt'
  | 'star' | 'star-cobalt' | 'capsule' | 'top' | 'crystal' | 'torus' | 'mobius' | 'beads' | 'phone'

type GeoKey =
  | 'sculpture' | 'orb' | 'ring' | 'form' | 'slab' | 'sphereA' | 'sphereB' | 'cubeA' | 'cubeB'
  | 'star' | 'capsule' | 'top' | 'crystal' | 'torus' | 'mobius' | 'beads'
type MatKey = 'chrome' | 'alu' | 'iridescent' | 'bubble' | 'cobalt' | 'vermilion' | 'acid'

type Def = { geo?: GeoKey; mat?: MatKey; rot: [number, number, number]; spin: number; scroll: number }

const KINDS: Record<KindName, Def> = {
  knot: { geo: 'sculpture', mat: 'chrome', rot: [Math.PI / 2 - 0.15, 0.1, -0.5], spin: 0.28, scroll: 1.5 },
  ring: { geo: 'ring', mat: 'alu', rot: [1.1, 0.2, 0.5], spin: 0.5, scroll: 1.1 },
  orb: { geo: 'orb', mat: 'iridescent', rot: [0, 0, 0], spin: 0.3, scroll: 0.8 },
  bubble: { geo: 'orb', mat: 'bubble', rot: [0, 0, 0], spin: 0.2, scroll: 0.6 },
  slab: { geo: 'slab', mat: 'iridescent', rot: [0.1, 0.5, -0.12], spin: 0.18, scroll: 0.9 },
  'form-cobalt': { geo: 'form', mat: 'cobalt', rot: [0.3, 0.4, 0.1], spin: 0.22, scroll: 1.2 },
  'form-vermilion': { geo: 'form', mat: 'vermilion', rot: [-0.4, 1.2, 0.3], spin: 0.26, scroll: 1.2 },
  'form-chrome': { geo: 'form', mat: 'chrome', rot: [0.8, -0.6, 0.2], spin: 0.2, scroll: 1.3 },
  'sat-red': { geo: 'sphereA', mat: 'vermilion', rot: [0, 0, 0], spin: 0.4, scroll: 0.6 },
  'sat-chrome': { geo: 'sphereB', mat: 'chrome', rot: [0, 0, 0], spin: 0.4, scroll: 0.6 },
  'cube-chrome': { geo: 'cubeA', mat: 'chrome', rot: [0.5, 0.7, 0.2], spin: 0.6, scroll: 1.4 },
  'cube-cobalt': { geo: 'cubeB', mat: 'cobalt', rot: [0.4, 0.2, 0.6], spin: 0.5, scroll: 1.4 },
  star: { geo: 'star', mat: 'chrome', rot: [Math.PI / 2 - 0.1, 0.2, 0.2], spin: 0.32, scroll: 1.6 },
  'star-cobalt': { geo: 'star', mat: 'cobalt', rot: [Math.PI / 2 - 0.3, -0.2, 0.5], spin: 0.3, scroll: 1.6 },
  capsule: { geo: 'capsule', mat: 'chrome', rot: [0.2, 0, 0.9], spin: 0.35, scroll: 1.2 },
  top: { geo: 'top', mat: 'cobalt', rot: [0.2, 0, 0.5], spin: 0.9, scroll: 1.0 },
  crystal: { geo: 'crystal', mat: 'iridescent', rot: [0.5, 0, 0.4], spin: 0.4, scroll: 1.3 },
  torus: { geo: 'torus', mat: 'vermilion', rot: [1.0, 0.3, 0.2], spin: 0.4, scroll: 1.2 },
  mobius: { geo: 'mobius', mat: 'chrome', rot: [1.0, 0.2, 0.3], spin: 0.3, scroll: 1.4 },
  beads: { geo: 'beads', mat: 'chrome', rot: [0.1, 0.2, 0.3], spin: 0.2, scroll: 1.0 },
  phone: { rot: [0, 0, 0], spin: 0, scroll: 0.5 },
}

const FILES: Record<GeoKey, [string, string?]> = {
  sculpture: ['master-sculpture.glb'],
  orb: ['glass-orb.glb'],
  ring: ['brushed-ring.glb'],
  form: ['cobalt-form.glb'],
  slab: ['glass-slab.glb'],
  sphereA: ['satellites.glb', 'SatSphereA'],
  sphereB: ['satellites.glb', 'SatSphereB'],
  cubeA: ['satellites.glb', 'SatCubeA'],
  cubeB: ['satellites.glb', 'SatCubeB'],
  star: ['star.glb'],
  capsule: ['capsule.glb'],
  top: ['top.glb'],
  crystal: ['crystal.glb'],
  torus: ['fat-torus.glb'],
  mobius: ['mobius.glb'],
  beads: ['beads.glb'],
}

const PHONE_H = 2.05

type Shared = {
  geos: Record<GeoKey, { geometry: THREE.BufferGeometry; size: number }>
  mats: Record<MatKey, THREE.Material>
  pointer: React.RefObject<{ x: number; y: number }>
  reduced: boolean
}
const SharedCtx = createContext<Shared | null>(null)

/** Dôme dégradé : fond de studio sombre en bas, clair en haut, pour que le chrome ait de vrais dégradés. */
const DOME_VERT = `varying vec3 vDir; void main() { vDir = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`
const DOME_FRAG = `varying vec3 vDir;
void main() {
  float h = vDir.y;
  vec3 floorC = vec3(0.012, 0.012, 0.014);
  vec3 midC = vec3(0.16, 0.165, 0.18);
  vec3 topC = vec3(0.78, 0.79, 0.82);
  vec3 c = mix(floorC, midC, smoothstep(-0.7, 0.05, h));
  c = mix(c, topC, smoothstep(0.05, 0.95, h));
  gl_FragColor = vec4(c, 1.0);
}`

function Studio() {
  return (
    <Environment resolution={256} frames={1}>
      <mesh scale={60}>
        <sphereGeometry args={[1, 48, 24]} />
        <shaderMaterial side={THREE.BackSide} vertexShader={DOME_VERT} fragmentShader={DOME_FRAG} depthWrite={false} />
      </mesh>
      <Lightformer form="rect" intensity={11} position={[-5, 4, 3]} scale={[7, 3.4, 1]} rotation={[0, 0.5, 0]} color="#fff4e4" />
      <Lightformer form="rect" intensity={5} position={[0, 6, -1]} scale={[10, 2, 1]} rotation={[Math.PI / 2, 0, 0]} color="#ffffff" />
      <Lightformer form="rect" intensity={3.2} position={[6, 0.5, 2]} scale={[1.6, 7, 1]} rotation={[0, -1.2, 0]} color="#f4f1ff" />
      <Lightformer form="rect" intensity={4.5} position={[-3, -1, 8]} scale={[8, 5, 1]} color="#fff8ee" />
      <Lightformer form="rect" intensity={2.2} position={[0, -6, 0]} scale={[16, 16, 1]} rotation={[-Math.PI / 2, 0, 0]} color="#f1ebdd" />
      <Lightformer form="circle" intensity={2.4} position={[3, -1.5, 4]} scale={1.6} color={COBALT} />
    </Environment>
  )
}

function useGeometry(key: GeoKey) {
  const [file, name] = FILES[key]
  const { scene } = useGLTF(BASE + file)
  return useMemo(() => {
    let found: THREE.Mesh | null = null
    scene.traverse((o) => {
      if (o instanceof THREE.Mesh && (!name || o.name === name) && !found) found = o
    })
    const geometry = (found as THREE.Mesh | null)!.geometry.clone()
    geometry.center()
    geometry.computeBoundingBox()
    const s = new THREE.Vector3()
    geometry.boundingBox!.getSize(s)
    return { geometry, size: Math.max(s.x, s.y, s.z) }
  }, [scene, name])
}

function useMaterials(): Record<MatKey, THREE.Material> {
  return useMemo(
    () => ({
      chrome: new THREE.MeshStandardMaterial({ color: '#eceef2', metalness: 1, roughness: 0.07, envMapIntensity: 1.2, side: THREE.DoubleSide }),
      alu: new THREE.MeshStandardMaterial({ color: '#c9ccd3', metalness: 1, roughness: 0.34, envMapIntensity: 1 }),
      iridescent: new THREE.MeshPhysicalMaterial({
        color: '#9fb3ff', transparent: true, opacity: 0.5, roughness: 0.05, clearcoat: 1, clearcoatRoughness: 0.04,
        iridescence: 1, iridescenceIOR: 1.35, iridescenceThicknessRange: [120, 620], envMapIntensity: 1.5, depthWrite: false,
      }),
      bubble: new THREE.MeshPhysicalMaterial({
        color: '#ffffff', transparent: true, opacity: 0.22, roughness: 0.02, clearcoat: 1, clearcoatRoughness: 0.02,
        iridescence: 1, iridescenceIOR: 1.6, iridescenceThicknessRange: [200, 900], envMapIntensity: 2, depthWrite: false,
      }),
      cobalt: new THREE.MeshPhysicalMaterial({ color: COBALT, roughness: 0.14, clearcoat: 1, clearcoatRoughness: 0.03, envMapIntensity: 1.1 }),
      vermilion: new THREE.MeshPhysicalMaterial({ color: VERMILION, roughness: 0.18, clearcoat: 1, clearcoatRoughness: 0.05 }),
      acid: new THREE.MeshPhysicalMaterial({ color: '#d9f05a', roughness: 0.2, clearcoat: 1, clearcoatRoughness: 0.05 }),
    }),
    [],
  )
}

const easeOutBack = (x: number) => {
  const c1 = 1.9
  const c3 = c1 + 1
  return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2)
}

/** Le téléphone : châssis titane, lunette, écran texturé avec une capture de l'appli, îlot et bloc caméra. */
function PhoneModel({ screen }: { screen: string }) {
  const { scene } = useGLTF(BASE + 'phone.glb')
  // Texture chargée à la main : `useTexture` suspend le rendu, ce qui faisait perdre son contexte WebGL au canvas (testé).
  const [tex, setTex] = useState<THREE.Texture | null>(null)
  useEffect(() => {
    let alive = true
    new THREE.TextureLoader().load(screen, (t) => {
      if (!alive) return
      t.colorSpace = THREE.SRGBColorSpace
      t.flipY = false
      t.anisotropy = 8
      setTex(t)
    })
    return () => {
      alive = false
    }
  }, [screen])
  const parts = useMemo(() => {
    const out: Record<string, THREE.BufferGeometry> = {}
    scene.traverse((o) => {
      if (o instanceof THREE.Mesh) out[o.name] = o.geometry
    })
    return out
  }, [scene])
  const center = useMemo(() => {
    const g = parts.PhoneBody
    g.computeBoundingBox()
    const c = new THREE.Vector3()
    g.boundingBox!.getCenter(c)
    return c.negate()
  }, [parts])
  const titanium = useMemo(() => new THREE.MeshStandardMaterial({ color: '#b9bcc4', metalness: 1, roughness: 0.28, envMapIntensity: 1.1 }), [])
  const black = useMemo(() => new THREE.MeshPhysicalMaterial({ color: '#0b0b0c', roughness: 0.25, clearcoat: 1 }), [])
  return (
    <group position={center}>
      <mesh geometry={parts.PhoneBody} material={titanium} />
      <mesh geometry={parts.PhoneBezel} material={black} />
      <mesh geometry={parts.PhoneScreen}>
        {/* La clé force la recompilation du matériau quand la texture arrive (le chargement ne suspend pas : voir ci-dessous). */}
        <meshBasicMaterial key={tex ? 'textured' : 'blank'} map={tex} color={tex ? '#ffffff' : '#fdf3df'} toneMapped={false} />
      </mesh>
      <mesh geometry={parts.PhoneIsland} material={black} />
      <mesh geometry={parts.PhoneCamera} material={black} />
    </group>
  )
}

/** Une forme accrochée à un élément du DOM. */
function Piece({ el, kind, seed }: { el: HTMLElement; kind: KindName; seed: number }) {
  const shared = useContext(SharedCtx)!
  const def = KINDS[kind]
  const geo = def.geo ? shared.geos[def.geo] : null
  const size = geo ? geo.size : PHONE_H
  const group = useRef<THREE.Group>(null)
  const born = useRef<number | null>(null)
  const stageT = useRef(0)
  const par = Number(el.dataset.par ?? 0.12)
  const tilt = Number(el.dataset.tilt ?? 1)
  const isPhone = kind === 'phone'

  useFrame((state, dt) => {
    const g = group.current
    if (!g) return
    const vw = state.size.width
    const vh = state.size.height
    let r = el.getBoundingClientRect()
    const on = r.width > 4 && r.bottom > -260 && r.top < vh + 260
    const reduced = shared.reduced

    // Téléphone : transition vers la scène plein écran (cible = élément #phone-stage).
    let stageBlend = 0
    if (isPhone) {
      const target = phoneStage.state.open ? 1 : 0
      stageT.current = THREE.MathUtils.damp(stageT.current, target, reduced ? 40 : 5.2, dt)
      if (Math.abs(stageT.current - target) < 0.002) stageT.current = target
      phoneStage.state.t = stageT.current
      stageBlend = stageT.current
      const stageEl = document.getElementById('phone-stage')
      if (stageBlend > 0 && stageEl) {
        const s = stageEl.getBoundingClientRect()
        const k = stageBlend
        r = new DOMRect(
          THREE.MathUtils.lerp(r.left, s.left, k),
          THREE.MathUtils.lerp(r.top, s.top, k),
          THREE.MathUtils.lerp(r.width, s.width, k),
          THREE.MathUtils.lerp(r.height, s.height, k),
        )
      }
    }
    g.visible = on || stageBlend > 0
    if (!g.visible) {
      born.current = null
      return
    }
    const t = state.clock.elapsedTime
    if (born.current === null) born.current = t
    const upp = (2 * Math.tan(THREE.MathUtils.degToRad(FOV / 2)) * CAM_Z) / vh
    const cx = r.left + r.width / 2
    const cy = r.top + r.height / 2
    const off = (cy - vh / 2) / vh
    const px = reduced ? 0 : shared.pointer.current!.x
    const py = reduced ? 0 : shared.pointer.current!.y
    const bob = reduced ? 0 : Math.sin(t * (0.7 + seed * 0.13) + seed) * 0.08 * (1 - stageBlend)
    const free = 1 - stageBlend

    g.position.set(
      (cx - vw / 2) * upp + px * 0.22 * (1 + seed * 0.1) * free,
      -(cy - vh / 2) * upp - off * vh * par * upp * free + bob - py * 0.14 * free,
      0,
    )
    const pop = reduced ? 1 : easeOutBack(Math.min((t - born.current) / 1.15, 1))
    g.scale.setScalar(Math.max((r.width * upp) / size, 0.0001) * pop)

    if (isPhone) {
      // Au repos le téléphone se balance doucement pour montrer ses reflets ; en scène il vient de face.
      const sway = reduced ? 0 : Math.sin(t * 0.55 + seed) * 0.42
      g.rotation.y = (sway + off * 0.9 + px * 0.2) * free
      g.rotation.x = (off * 0.4 - py * 0.1 + 0.06) * free
      g.rotation.z = (reduced ? 0 : Math.sin(t * 0.4 + seed) * 0.05) * free
    } else {
      g.rotation.y = (reduced ? 0 : t * def.spin * (seed % 2 ? 1 : -1)) + off * def.scroll * 2.2 * tilt + px * 0.25
      g.rotation.x = off * 0.6 * tilt - py * 0.15
    }
  })

  return (
    <group ref={group} visible={false}>
      {isPhone ? (
        <PhoneModel screen={el.dataset.screen || PHONE_SCREEN} />
      ) : (
        <mesh geometry={geo!.geometry} material={shared.mats[def.mat!]} rotation={def.rot} />
      )}
    </group>
  )
}

type AnchorRef = { el: HTMLElement; kind: KindName }

/** Cherche les ancres du calque et les re-cherche quand le DOM change (route, langue). */
function useAnchors(layer: 'back' | 'front', phoneOnly: boolean) {
  const [anchors, setAnchors] = useState<AnchorRef[]>([])
  useEffect(() => {
    const scan = () => {
      const next = [...document.querySelectorAll<HTMLElement>('[data-anchor]')]
        .filter((el) => (el.dataset.anchor as KindName) in KINDS && (el.dataset.layer ?? 'back') === layer)
        .filter((el) => !phoneOnly || el.dataset.anchor === 'phone')
        .map((el) => ({ el, kind: el.dataset.anchor as KindName }))
      setAnchors((prev) => (prev.length === next.length && prev.every((p, i) => p.el === next[i].el) ? prev : next))
    }
    scan()
    let timer = 0
    const mo = new MutationObserver(() => {
      window.clearTimeout(timer)
      timer = window.setTimeout(scan, 160)
    })
    mo.observe(document.body, { childList: true, subtree: true })
    return () => {
      mo.disconnect()
      window.clearTimeout(timer)
    }
  }, [layer, phoneOnly])
  return anchors
}

function Scene({ reduced, layer, phoneOnly }: { reduced: boolean; layer: 'back' | 'front'; phoneOnly: boolean }) {
  const anchors = useAnchors(layer, phoneOnly)
  const { invalidate } = useThree()
  const pointer = useRef({ x: 0, y: 0 })
  const geos = {
    sculpture: useGeometry('sculpture'), orb: useGeometry('orb'), ring: useGeometry('ring'), form: useGeometry('form'),
    slab: useGeometry('slab'), sphereA: useGeometry('sphereA'), sphereB: useGeometry('sphereB'), cubeA: useGeometry('cubeA'),
    cubeB: useGeometry('cubeB'), star: useGeometry('star'), capsule: useGeometry('capsule'), top: useGeometry('top'),
    crystal: useGeometry('crystal'), torus: useGeometry('torus'), mobius: useGeometry('mobius'), beads: useGeometry('beads'),
  }
  const mats = useMaterials()

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return
      pointer.current.x = (e.clientX / window.innerWidth - 0.5) * 2
      pointer.current.y = (e.clientY / window.innerHeight - 0.5) * 2
    }
    const onScroll = () => invalidate()
    if (!reduced) window.addEventListener('pointermove', onMove, { passive: true })
    else window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('scroll', onScroll)
    }
  }, [reduced, invalidate])

  const shared = useMemo<Shared>(() => ({ geos, mats, pointer, reduced }), [geos.sculpture, mats, reduced]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <SharedCtx.Provider value={shared}>
      <Studio />
      {anchors.map((a, i) => (
        <Piece key={`${i}-${a.kind}`} el={a.el} kind={a.kind} seed={i + (layer === 'front' ? 5 : 0)} />
      ))}
    </SharedCtx.Provider>
  )
}

export default function SiteScene({ layer = 'back' }: { layer?: 'back' | 'front' }) {
  const reduced = useMemo(() => prefersReducedMotion(), [])
  const mobile = typeof window !== 'undefined' && window.matchMedia('(max-width: 767px)').matches
  return (
    <div className={layer === 'front' ? 'pointer-events-none fixed inset-0 z-[40]' : 'pointer-events-none fixed inset-0 z-[15]'} aria-hidden="true">
      <Canvas
        flat
        dpr={[1, mobile ? 1.25 : 1.6]}
        frameloop={reduced ? 'demand' : 'always'}
        gl={{ alpha: true, antialias: true, powerPreference: 'high-performance' }}
        camera={{ fov: FOV, near: 0.1, far: 60, position: [0, 0, CAM_Z] }}
        style={{ pointerEvents: 'none' }}
        onCreated={({ gl }) => {
          // Si le navigateur reprend le contexte WebGL (économie d'énergie, onglet en arrière-plan), on le laisse se rétablir.
          gl.domElement.addEventListener('webglcontextlost', (e) => e.preventDefault())
        }}
      >
        <Scene reduced={reduced} layer={layer} phoneOnly={layer === 'front' && mobile} />
      </Canvas>
    </div>
  )
}

Object.values(FILES).forEach(([f]) => useGLTF.preload(BASE + f))
useGLTF.preload(BASE + 'phone.glb')
