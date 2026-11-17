import { Suspense, createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Environment, Lightformer, useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { prefersReducedMotion } from '../../lib/motion'
import { phoneStage } from '../../lib/phoneStage'
import { bodies, createBody, useToysInput, type Body } from '../../lib/toys'
import { CEL, OUTLINE, addOutlines, outlineUniforms, toToon, toon } from './cel'

/**
 * Le décor 3D de tout le site. Deux canvas fixes :
 * - `back` (derrière le contenu) : les grandes formes qui défilent avec les sections ;
 * - `front` (devant le contenu) : quelques petites formes rapides, et le téléphone 3D.
 * Chaque forme est « accrochée » à un élément de la page (`[data-anchor]`) : sa position et sa taille suivent cet élément.
 * La mise en page décide, la 3D suit.
 */

const BASE = '/media/3d/'
const COBALT = '#6C2BFF'
const VERMILION = '#FF7EC8'
const FOV = 32
const CAM_Z = 9
const PHONE_SCREEN = '/media/projets/fooder-v2-swipe-mobile.webp'

type KindName =
  | 'ring' | 'orb' | 'bubble' | 'slab'
  | 'form-cobalt' | 'form-vermilion' | 'form-chrome'
  | 'sat-red' | 'sat-chrome' | 'cube-chrome' | 'cube-cobalt'
  | 'star' | 'star-cobalt' | 'capsule' | 'top' | 'crystal' | 'torus' | 'mobius' | 'beads' | 'phone'
  | LifeKind | 'model'

/** Objets « ce que j'aime dans la vie » : modèles à plusieurs matières (tools/blender/build_life.py). */
const LIFE = ['robot', 'earphones', 'mp3', 'vinyl', 'walkman', 'camera', 'reel', 'gamepad', 'cat', 'dumbbell', 'stopwatch', 'puffy', 'psp'] as const
type LifeKind = (typeof LIFE)[number]
const LIFE_FILE: Record<LifeKind, string> = {
  robot: 'life-robot.glb', earphones: 'life-earphones.glb', mp3: 'life-mp3.glb', vinyl: 'life-vinyl.glb',
  walkman: 'life-walkman.glb', camera: 'life-camera.glb', reel: 'life-reel.glb', gamepad: 'user/ps2-controller.glb',
  // Chat, haltère, PSP et manette PS2 : modèles fournis par Riyan (public/media/3d/user, voir tools/models) ; matières d'origine conservées.
  cat: 'user/lucky-cat.glb', dumbbell: 'user/gym-dumbbell.glb', stopwatch: 'life-stopwatch.glb', puffy: 'life-star.glb',
  psp: 'user/sony-psp.glb',
}
/** Rotation de mise en pose des modèles fournis (leur orientation d'origine n'est pas celle de nos objets). */
const LIFE_ROT: Partial<Record<LifeKind, [number, number, number]>> = { dumbbell: [0, Math.PI / 2, 0] }
const isLife = (k: string): k is LifeKind => (LIFE as readonly string[]).includes(k)

type GeoKey =
  | 'orb' | 'ring' | 'form' | 'slab' | 'sphereA' | 'sphereB' | 'cubeA' | 'cubeB'
  | 'star' | 'capsule' | 'top' | 'crystal' | 'torus' | 'mobius' | 'beads'
type MatKey = 'chrome' | 'alu' | 'iridescent' | 'bubble' | 'cobalt' | 'vermilion' | 'acid'

type Def = { geo?: GeoKey; mat?: MatKey; rot: [number, number, number]; spin: number; scroll: number }

/** Les objets ont une face avant : ils se balancent autour d'une pose de trois quarts au lieu de tourner sur eux-mêmes. */
const LIFE_DEF: Def = { rot: [0.12, -0.45, 0.04], spin: 0.5, scroll: 0.5 }

const KINDS: Record<Exclude<KindName, LifeKind>, Def> & Partial<Record<LifeKind, Def>> = {
  ...Object.fromEntries(LIFE.map((k) => [k, LIFE_DEF])),
  model: LIFE_DEF,
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
  geos: Partial<Record<GeoKey, GeoData>>
  mats: Record<MatKey, THREE.Material>
  life: Record<string, THREE.Material>
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

export function Studio() {
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
      <Lightformer form="rect" intensity={2.2} position={[0, -6, 0]} scale={[16, 16, 1]} rotation={[-Math.PI / 2, 0, 0]} color="#FFF6E5" />
      <Lightformer form="circle" intensity={2.4} position={[3, -1.5, 4]} scale={1.6} color={COBALT} />
    </Environment>
  )
}

type GeoData = { geometry: THREE.BufferGeometry; size: number }

function useGeometry(key: GeoKey): GeoData {
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

/**
 * Charge une forme de base et la remet à la scène. Une forme n'est téléchargée que si la page courante a une ancre qui
 * l'utilise : l'accueil n'a besoin que de quelques-unes des quinze, pas des 800 Ko de toutes.
 */
function GeoLoader({ gkey, onReady }: { gkey: GeoKey; onReady: (k: GeoKey, g: GeoData) => void }) {
  const g = useGeometry(gkey)
  useEffect(() => {
    onReady(gkey, g)
  }, [gkey, g, onReady])
  return null
}

/** Matières des formes : aplats toon aux couleurs de la charte (plus de chrome ni de verre irisé). */
function useMaterials(): Record<MatKey, THREE.Material> {
  return useMemo(
    () => ({
      chrome: toon(CEL.lilac, { side: THREE.DoubleSide }),
      alu: toon(CEL.lilacMid),
      iridescent: toon(CEL.violetSoft),
      bubble: toon(CEL.cream),
      cobalt: toon(COBALT),
      vermilion: toon(VERMILION),
      acid: toon(CEL.lemon),
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

/** Matières de studio des objets, indexées par le nom de matière écrit dans les GLB. */
function useLifeMaterials(base: Record<MatKey, THREE.Material>): Record<string, THREE.Material> {
  // Le citron reste réservé aux petites pièces (or, ambre) ; les grandes surfaces sont crème, lilas, violet ou rose.
  return useMemo(
    () => ({
      chrome: base.chrome,
      alu: base.alu,
      cobalt: base.cobalt,
      red: base.vermilion,
      ivory: toon(CEL.cream),
      orange: toon(CEL.lemon), // boutons de la manette et du chrono : petites pièces
      clay: toon(CEL.pinkDeep),
      black: toon(CEL.plum),
      gold: toon(CEL.lemon),
      amber: toon(CEL.pink), // disque de la bobine : grande surface, donc pas de citron
      blueglass: toon(CEL.violetSoft),
      orangeglass: toon(CEL.pink),
    }),
    [base],
  )
}

/** Un objet à plusieurs matières : la scène du GLB est clonée, recentrée, et ses matières remplacées par celles du studio. */
function LifeModel({ kind }: { kind: LifeKind }) {
  const shared = useContext(SharedCtx)!
  const { scene } = useGLTF(BASE + LIFE_FILE[kind])
  const { object, scale } = useMemo(() => {
    const clone = scene.clone(true)
    clone.traverse((o) => {
      if (!(o instanceof THREE.Mesh)) return
      const name = (o.material as THREE.Material).name
      // Matière connue : la couleur de la charte ; modèle fourni : sa propre couleur et sa texture, passées en toon.
      o.material = shared.life[name] ?? toToon(o.material as THREE.Material)
    })
    const box = new THREE.Box3().setFromObject(clone)
    addOutlines(clone)
    const size = box.getSize(new THREE.Vector3())
    clone.position.sub(box.getCenter(new THREE.Vector3()))
    return { object: clone, scale: 1 / Math.max(size.x, size.y, size.z) }
  }, [scene, shared.life])
  return (
    <group scale={scale} rotation={LIFE_ROT[kind]}>
      <primitive object={object} />
    </group>
  )
}

/** Un modèle fourni (GLB) : matières et textures d'origine conservées, recentré et mis à l'échelle de l'ancre. */
function ModelAsset({ url }: { url: string }) {
  const { scene } = useGLTF(url)
  const { object, scale } = useMemo(() => {
    const clone = scene.clone(true)
    clone.traverse((o) => {
      if (o instanceof THREE.Mesh) o.material = toToon(o.material as THREE.Material)
    })
    const box = new THREE.Box3().setFromObject(clone)
    const size = box.getSize(new THREE.Vector3())
    clone.position.sub(box.getCenter(new THREE.Vector3()))
    addOutlines(clone)
    return { object: clone, scale: 1 / Math.max(size.x, size.y, size.z, 0.0001) }
  }, [scene])
  return (
    <group scale={scale}>
      <primitive object={object} />
    </group>
  )
}

/** Une forme accrochée à un élément du DOM, avec un corps physique : on peut l'attraper, la lancer, la pousser (lib/toys.ts). */
function Piece({ el, kind, seed, front }: { el: HTMLElement; kind: KindName; seed: number; front: boolean }) {
  const shared = useContext(SharedCtx)!
  const def = KINDS[kind]!
  const geo = def.geo ? (shared.geos[def.geo] ?? null) : null
  const life = isLife(kind) || kind === 'model'
  const size = geo ? geo.size : life || def.geo ? 1 : PHONE_H
  const group = useRef<THREE.Group>(null)
  const born = useRef<number | null>(null)
  const stageT = useRef(0)
  const body = useRef<Body | null>(null)
  // Un objet n'existe (modèle chargé, maillage monté) que lorsque sa place est à moins d'un écran du cadre.
  const [near, setNear] = useState(false)
  const nearRef = useRef(false)
  const par = Number(el.dataset.par ?? 0.12)
  const tilt = Number(el.dataset.tilt ?? 1)
  const isPhone = kind === 'phone'

  useEffect(() => {
    if (isPhone || shared.reduced) return
    const b = createBody(front, seed)
    b.tag = el.dataset.egg
    body.current = b
    bodies.add(b)
    return () => {
      bodies.delete(b)
      body.current = null
    }
  }, [isPhone, front, seed, shared.reduced, el])

  useEffect(() => {
    const io = new IntersectionObserver(
      ([e]) => {
        nearRef.current = e.isIntersecting
        setNear(e.isIntersecting)
      },
      { rootMargin: '100% 0px 100% 0px' },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [el])

  useFrame((state, dt) => {
    const g = group.current
    if (!g) return
    const b = body.current
    // Loin du cadre (et au repos) : aucune mesure de mise en page, rien à dessiner.
    const stageIdle = !isPhone || (stageT.current === 0 && !phoneStage.state.open)
    if (stageIdle && !nearRef.current && !(b && (b.held || Math.abs(b.dx) > 20 || Math.abs(b.dy) > 20))) {
      g.visible = false
      if (b) b.visible = false
      born.current = null
      return
    }
    const vw = state.size.width
    const vh = state.size.height
    let r = el.getBoundingClientRect()
    let on = r.width > 4 && r.bottom > -260 && r.top < vh + 260
    // Un objet lancé reste visible même si sa place d'origine est sortie de l'écran.
    if (!on && b && r.width > 4 && (Math.abs(b.dx) > 20 || Math.abs(b.dy) > 20)) {
      const sx = r.left + r.width / 2 + b.dx
      const sy = r.top + r.height / 2 + b.dy
      on = sx > -r.width && sx < vw + r.width && sy > -r.width && sy < vh + r.width
    }
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
    if (b) b.visible = g.visible
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
    // Rien ne dépend du curseur : un objet ne bouge que si on le touche, l'attrape ou défile la page.
    const px = 0
    const py = 0
    const bob = reduced ? 0 : Math.sin(t * (0.3 + seed * 0.02) + seed) * 0.06 * (1 - stageBlend)
    const free = 1 - stageBlend

    // Corps physique : dérive libre, ressort de retour, rebonds sur les bords, répulsion entre objets, écrasement.
    let dispX = 0
    let dispY = 0
    if (b) {
      const k = Math.min(dt, 0.033)
      const wx = Math.sin(t * 0.12 + seed * 2.1) * r.width * 0.07
      const wy = Math.cos(t * 0.1 + seed * 1.3) * r.width * 0.06
      const parX = (px * 0.22 * (1 + seed * 0.1)) / upp
      const parY = off * vh * par + (py * 0.14) / upp
      if (b.held) {
        const f = Math.min(1, k * 26)
        b.dx += (b.tx - cx - wx - parX - b.dx) * f
        b.dy += (b.ty - cy - wy - parY - b.dy) * f
        b.vx = 0
        b.vy = 0
        b.idle = 0
      } else {
        b.idle += k
        const home = b.idle > 1.6
        const spring = home ? 0.3 : 0
        const damp = home ? 1.5 : 0.95
        b.vx += (-b.dx * spring - b.vx * damp) * k
        b.vy += (-b.dy * spring - b.vy * damp) * k
        b.dx += b.vx * k
        b.dy += b.vy * k
      }
      let sx = cx + b.dx + wx + parX
      let sy = cy + b.dy + wy + parY
      if (!b.held) {
        const m = b.r * 0.7
        if (sx < m) {
          b.dx += m - sx
          sx = m
          b.vx = Math.abs(b.vx) * 0.6
        } else if (sx > vw - m) {
          b.dx -= sx - (vw - m)
          sx = vw - m
          b.vx = -Math.abs(b.vx) * 0.6
        }
        if (cy > -vh * 0.1 && cy < vh * 1.1) {
          if (sy < m) {
            b.dy += m - sy
            sy = m
            b.vy = Math.abs(b.vy) * 0.6
          } else if (sy > vh - m) {
            b.dy -= sy - (vh - m)
            sy = vh - m
            b.vy = -Math.abs(b.vy) * 0.6
          }
        }
        for (const o of bodies) {
          if (o === b || !o.visible) continue
          const ddx = sx - o.x
          const ddy = sy - o.y
          const dist = Math.hypot(ddx, ddy)
          const min = (b.r + o.r) * 0.9
          if (dist < min && dist > 0.5) {
            const push = (min - dist) / min
            b.vx += (ddx / dist) * push * 1100 * k
            b.vy += (ddy / dist) * push * 1100 * k
          }
        }
      }
      b.sqv += (-95 * b.sq - 11 * b.sqv) * k
      b.sq += b.sqv * k
      b.spinY += b.vsy * k
      b.spinX += b.vsx * k
      const decay = Math.exp(-k * 1.7)
      b.vsy *= decay
      b.vsx *= decay
      b.spinY -= b.spinY * k * 0.35
      b.spinX -= b.spinX * k * 0.35
      dispX = b.dx + wx
      dispY = b.dy + wy
      b.x = cx + dispX + parX
      b.y = cy + dispY + parY
      b.r = Math.max(r.width * 0.46, 12)
    }

    g.position.set(
      (cx + dispX - vw / 2) * upp + (isPhone ? 0 : px * 0.22 * (1 + seed * 0.1) * free),
      -(cy + dispY - vh / 2) * upp - off * vh * par * upp * free + bob - (isPhone ? 0 : py * 0.14 * free),
      0,
    )
    const pop = reduced ? 1 : easeOutBack(Math.min((t - born.current) / 1.15, 1))
    g.scale.setScalar(Math.max((r.width * upp) / size, 0.0001) * pop)
    if (b) g.scale.multiplyScalar(1 + b.sq * 0.8 + (b.held ? 0.07 : 0))

    const spinY = b ? b.spinY : 0
    const spinX = b ? b.spinX : 0
    if (isPhone) {
      // Au repos le téléphone se balance doucement pour montrer ses reflets ; en scène il vient de face.
      // Il ne réagit pas au curseur ; il se redresse seulement quand on l'ouvre (stageBlend).
      const calm = free
      const sway = reduced ? 0 : Math.sin(t * 0.55 + seed) * 0.3
      g.rotation.y = (sway + off * 0.7) * calm
      g.rotation.x = (off * 0.4 + 0.06) * calm
      g.rotation.z = (reduced ? 0 : Math.sin(t * 0.4 + seed) * 0.04) * calm
    } else if (life) {
      // Flottement lent : un léger balancement autour de la pose, rien qui tourne.
      g.rotation.y = def.rot[1] + (reduced ? 0 : Math.sin(t * 0.16 + seed * 1.7) * 0.14) + off * 0.12 * tilt + spinY
      g.rotation.x = def.rot[0] + (reduced ? 0 : Math.sin(t * 0.13 + seed) * 0.05) + spinX
      g.rotation.z = def.rot[2] + (reduced ? 0 : Math.sin(t * 0.1 + seed * 2.3) * 0.04)
    } else {
      g.rotation.y = (reduced ? 0 : Math.sin(t * 0.14 + seed) * 0.35 * (seed % 2 ? 1 : -1)) + off * 0.2 * tilt + spinY
      g.rotation.x = (reduced ? 0 : Math.sin(t * 0.11 + seed * 1.9) * 0.08) + spinX
    }
  })

  return (
    <group ref={group} visible={false}>
      {!near && !(isPhone && phoneStage.state.open) ? null : isPhone ? (
        <PhoneModel screen={el.dataset.screen || PHONE_SCREEN} />
      ) : kind === 'model' ? (
        <Suspense fallback={null}>
          <ModelAsset url={el.dataset.model ?? ''} />
        </Suspense>
      ) : life ? (
        <Suspense fallback={null}>
          <LifeModel kind={kind as LifeKind} />
        </Suspense>
      ) : (
        geo && (
          <mesh geometry={geo.geometry} material={shared.mats[def.mat!]} rotation={def.rot}>
            <mesh geometry={geo.geometry} material={OUTLINE} />
          </mesh>
        )
      )}
    </group>
  )
}

type AnchorRef = { el: HTMLElement; kind: KindName }

/** Cherche les ancres du calque et les re-cherche quand le DOM change (route, langue). */
function useAnchors(layer: 'back' | 'front', mobile: boolean) {
  const [anchors, setAnchors] = useState<AnchorRef[]>([])
  useEffect(() => {
    const scan = () => {
      const next = [...document.querySelectorAll<HTMLElement>('[data-anchor]')]
        .filter((el) => (el.dataset.anchor as KindName) in KINDS)
        // Sur mobile, un seul canvas (devant) porte tous les objets : c'est lui qui reçoit les gestes.
        .filter((el) => (mobile ? layer === 'front' : (el.dataset.layer ?? 'back') === layer))
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
  }, [layer, mobile])
  return anchors
}

/**
 * Pilote de rendu : le canvas ne dessine qu'à la demande. On redessine seulement quand au moins un objet est proche du
 * cadre (ou en mouvement après un lancer), jamais onglet caché, à 30 images/s quand rien ne se passe, et la résolution
 * s'abaisse d'elle-même si la machine ne tient pas la cadence (elle remonte quand elle suit).
 */
function FrameDriver({ reduced, anchors }: { reduced: boolean; anchors: AnchorRef[] }) {
  const { invalidate, setDpr, gl } = useThree()
  useEffect(() => {
    if (reduced) {
      // Mouvement réduit : image figée, redessinée seulement au défilement et au redimensionnement.
      const redraw = () => invalidate()
      redraw()
      window.addEventListener('scroll', redraw, { passive: true })
      window.addEventListener('resize', redraw)
      return () => {
        window.removeEventListener('scroll', redraw)
        window.removeEventListener('resize', redraw)
      }
    }
    const cap = window.matchMedia('(max-width: 767px)').matches ? 1.1 : 1.3
    const base = Math.min(window.devicePixelRatio || 1, cap)
    let scale = 1
    const near = new Set<Element>()
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) near.add(e.target)
          else near.delete(e.target)
        }
      },
      { rootMargin: '30% 0px 30% 0px' },
    )
    anchors.forEach((a) => io.observe(a.el))
    let lastActivity = performance.now()
    const bump = () => {
      lastActivity = performance.now()
    }
    window.addEventListener('scroll', bump, { passive: true })
    window.addEventListener('pointerdown', bump, { passive: true })
    window.addEventListener('touchstart', bump, { passive: true })
    const moving = () => {
      for (const b of bodies) {
        if (b.held || Math.abs(b.vx) + Math.abs(b.vy) > 3 || Math.abs(b.dx) + Math.abs(b.dy) > 2 || Math.abs(b.sq) > 0.004) return true
      }
      return false
    }
    let raf = 0
    let last = 0
    let frameNo = 0
    let ema = 16
    let slowSince = 0
    let fastSince = 0
    const tick = (now: number) => {
      raf = requestAnimationFrame(tick)
      if (document.hidden) {
        last = 0
        return
      }
      const busy = moving()
      if (near.size === 0 && !busy) {
        last = 0
        return
      }
      const idle = !busy && now - lastActivity > 1200
      frameNo++
      if (idle && frameNo % 2 === 1) return
      invalidate()
      if (last && !idle) {
        ema = ema * 0.93 + (now - last) * 0.07
        if (ema > 27 && scale > 0.6) {
          slowSince = slowSince || now
          if (now - slowSince > 1200) {
            scale = Math.max(0.6, scale - 0.15)
            setDpr(base * scale)
            slowSince = 0
            fastSince = 0
            ema = 16
          }
        } else {
          slowSince = 0
          if (ema < 17.5 && scale < 1) {
            fastSince = fastSince || now
            if (now - fastSince > 6000) {
              scale = Math.min(1, scale + 0.1)
              setDpr(base * scale)
              fastSince = 0
            }
          } else fastSince = 0
        }
      }
      last = idle ? 0 : now
    }
    raf = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(raf)
      io.disconnect()
      window.removeEventListener('scroll', bump)
      window.removeEventListener('pointerdown', bump)
      window.removeEventListener('touchstart', bump)
      gl.setPixelRatio(base)
    }
  }, [reduced, anchors, invalidate, setDpr, gl])
  return null
}

/**
 * Lumières du cel-shading : un fond doux (les ombres ne tombent jamais au noir) et une lumière haute à gauche qui choisit
 * la marche de la rampe. Intensités en unités physiques (×π) pour que la face éclairée rende la couleur exacte de la charte.
 * Tient aussi à jour la taille du canvas pour l'épaisseur des contours.
 */
function CelLights() {
  const size = useThree((s) => s.size)
  useEffect(() => {
    outlineUniforms.uRes.value.set(size.width, size.height)
    outlineUniforms.uPx.value = size.width < 768 ? 2 : 2.6
  }, [size.width, size.height])
  return (
    <>
      <ambientLight intensity={0.62 * Math.PI} color="#ffffff" />
      <directionalLight intensity={0.4 * Math.PI} position={[-4, 5, 6]} color="#ffffff" />
    </>
  )
}

function Scene({ reduced, layer, mobile }: { reduced: boolean; layer: 'back' | 'front'; mobile: boolean }) {
  const anchors = useAnchors(layer, mobile)
  const [geos, setGeos] = useState<Partial<Record<GeoKey, GeoData>>>({})
  const onGeo = useCallback((k: GeoKey, g: GeoData) => setGeos((prev) => (prev[k] === g ? prev : { ...prev, [k]: g })), [])
  const needed = useMemo(() => [...new Set(anchors.map((a) => KINDS[a.kind]?.geo).filter((k): k is GeoKey => Boolean(k)))], [anchors])
  const mats = useMaterials()
  const life = useLifeMaterials(mats)

  // Les gestes (attraper, lancer) : une seule écoute pour toute la page, sauf en mouvement réduit.
  useEffect(() => (reduced ? undefined : useToysInput()), [reduced])

  const shared = useMemo<Shared>(() => ({ geos, mats, life, reduced }), [geos, mats, life, reduced])

  return (
    <SharedCtx.Provider value={shared}>
      <Studio />
      <CelLights />
      {needed.map((k) => (geos[k] ? null : (
        <Suspense key={k} fallback={null}>
          <GeoLoader gkey={k} onReady={onGeo} />
        </Suspense>
      )))}
      <FrameDriver reduced={reduced} anchors={anchors} />
      {anchors.map((a, i) => (
        <Piece key={`${i}-${a.kind}`} el={a.el} kind={a.kind} seed={i + (layer === 'front' ? 5 : 0)} front={layer === 'front'} />
      ))}
    </SharedCtx.Provider>
  )
}

export default function SiteScene({ layer = 'back' }: { layer?: 'back' | 'front' }) {
  const reduced = useMemo(() => prefersReducedMotion(), [])
  const mobile = typeof window !== 'undefined' && window.matchMedia('(max-width: 767px)').matches
  if (mobile && layer === 'back') return null
  return (
    <div className={layer === 'front' ? 'pointer-events-none fixed inset-0 z-[40]' : 'pointer-events-none fixed inset-0 z-[15]'} aria-hidden="true">
      <Canvas
        flat
        dpr={[1, mobile ? 1.1 : 1.3]}
        frameloop="demand"
        gl={{ alpha: true, antialias: true }}
        camera={{ fov: FOV, near: 0.1, far: 60, position: [0, 0, CAM_Z] }}
        style={{ pointerEvents: 'none' }}
        onCreated={({ gl }) => {
          // Si le navigateur reprend le contexte WebGL (économie d'énergie, onglet en arrière-plan), on le laisse se rétablir.
          gl.domElement.addEventListener('webglcontextlost', (e) => e.preventDefault())
        }}
      >
        <Scene reduced={reduced} layer={layer} mobile={mobile} />
      </Canvas>
    </div>
  )
}
