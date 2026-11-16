import { useEffect, useMemo, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { ContactShadows, Environment, Float, Lightformer, useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { prefersReducedMotion } from '../../lib/motion'

/**
 * Scène du hero : sculpture chromée, orbe irisé, anneau d'aluminium et satellites,
 * photographiés dans un studio virtuel (softboxes + fond sombre) pour que le chrome ait du contraste sur l'ivoire.
 * Le canvas est transparent : l'aplat cobalt et le nom sont en HTML derrière.
 */

const BASE = '/media/3d/'
const COBALT = '#254dff'
const VERMILION = '#f05235'
const FILES = ['master-sculpture.glb', 'glass-orb.glb', 'brushed-ring.glb', 'satellites.glb']

const useMesh = (file: string, name?: string) => {
  const { scene } = useGLTF(BASE + file)
  return useMemo(() => {
    let found: THREE.Mesh | null = null
    scene.traverse((o) => {
      if (o instanceof THREE.Mesh && (!name || o.name === name) && !found) found = o
    })
    return (found as THREE.Mesh | null)?.geometry ?? null
  }, [scene, name])
}

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

/** Dôme dégradé : fond de studio sombre en bas, clair en haut, pour que le chrome ait de vrais dégradés. */
function GradientDome() {
  return (
    <mesh scale={60}>
      <sphereGeometry args={[1, 48, 24]} />
      <shaderMaterial side={THREE.BackSide} vertexShader={DOME_VERT} fragmentShader={DOME_FRAG} depthWrite={false} />
    </mesh>
  )
}

function Studio() {
  return (
    <Environment resolution={512} frames={1}>
      <GradientDome />
      {/* softbox principal, haut gauche */}
      <Lightformer form="rect" intensity={11} position={[-5, 4, 3]} scale={[7, 3.4, 1]} rotation={[0, 0.5, 0]} color="#fff4e4" />
      {/* bandeau lumineux au-dessus */}
      <Lightformer form="rect" intensity={5} position={[0, 6, -1]} scale={[10, 2, 1]} rotation={[Math.PI / 2, 0, 0]} color="#ffffff" />
      {/* appoint droit, étroit : donne les liserés sur les bords */}
      <Lightformer form="rect" intensity={3.2} position={[6, 0.5, 2]} scale={[1.6, 7, 1]} rotation={[0, -1.2, 0]} color="#f4f1ff" />
      {/* grand écran diffus devant, côté gauche : éclaire les faces tournées vers le visiteur */}
      <Lightformer form="rect" intensity={4.5} position={[-3, -1, 8]} scale={[8, 5, 1]} color="#fff8ee" />
      {/* sol ivoire : reflet chaud en bas des objets */}
      <Lightformer form="rect" intensity={2.2} position={[0, -6, 0]} scale={[16, 16, 1]} rotation={[-Math.PI / 2, 0, 0]} color="#f1ebdd" />
      {/* point cobalt : visible dans le chrome, lie les objets à l'aplat */}
      <Lightformer form="circle" intensity={2.4} position={[3, -1.5, 4]} scale={1.6} color={COBALT} />
    </Environment>
  )
}

function useRig(reduced: boolean) {
  const pointer = useRef({ x: 0, y: 0 })
  const scroll = useRef(0)
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return
      pointer.current.x = (e.clientX / window.innerWidth - 0.5) * 2
      pointer.current.y = (e.clientY / window.innerHeight - 0.5) * 2
    }
    const onScroll = () => {
      scroll.current = Math.min(window.scrollY / Math.max(window.innerHeight, 1), 1.4)
    }
    onScroll()
    if (!reduced) window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('scroll', onScroll)
    }
  }, [reduced])
  return { pointer, scroll }
}

function Objects({ reduced }: { reduced: boolean }) {
  const { size } = useThree()
  const mobile = size.width < 768
  const { pointer, scroll } = useRig(reduced)

  const sculpture = useMesh('master-sculpture.glb')
  const orb = useMesh('glass-orb.glb')
  const ring = useMesh('brushed-ring.glb')
  const sphereA = useMesh('satellites.glb', 'SatSphereA')
  const sphereB = useMesh('satellites.glb', 'SatSphereB')
  const sphereC = useMesh('satellites.glb', 'SatSphereC')
  const cubeA = useMesh('satellites.glb', 'SatCubeA')
  const cubeB = useMesh('satellites.glb', 'SatCubeB')

  const root = useRef<THREE.Group>(null)
  const hero = useRef<THREE.Group>(null)
  const back = useRef<THREE.Group>(null)
  const front = useRef<THREE.Group>(null)

  useFrame((_, dt) => {
    const s = scroll.current
    const px = reduced ? 0 : pointer.current.x
    const py = reduced ? 0 : pointer.current.y
    if (hero.current) {
      hero.current.rotation.y = THREE.MathUtils.damp(hero.current.rotation.y, px * 0.32 + s * 1.3, 3.5, dt)
      hero.current.rotation.x = THREE.MathUtils.damp(hero.current.rotation.x, py * 0.18 + s * 0.4, 3.5, dt)
      hero.current.position.y = THREE.MathUtils.damp(hero.current.position.y, (mobile ? 0.4 : 0.1) + s * 1.4, 4, dt)
    }
    if (back.current) {
      back.current.position.x = THREE.MathUtils.damp(back.current.position.x, -px * 0.15, 3, dt)
      back.current.position.y = THREE.MathUtils.damp(back.current.position.y, py * 0.1 + s * 0.6, 3, dt)
    }
    if (front.current) {
      front.current.position.x = THREE.MathUtils.damp(front.current.position.x, px * 0.45, 3, dt)
      front.current.position.y = THREE.MathUtils.damp(front.current.position.y, -py * 0.3 + s * 2.2, 3, dt)
    }
    if (root.current) root.current.visible = s < 1.35
  })

  const chrome = <meshStandardMaterial color="#eceef2" metalness={1} roughness={0.07} envMapIntensity={1.2} />
  const aluminium = <meshStandardMaterial color="#c9ccd3" metalness={1} roughness={0.34} envMapIntensity={1.0} />
  const iridescent = (
    <meshPhysicalMaterial
      color="#9fb3ff"
      transparent
      opacity={0.5}
      roughness={0.05}
      clearcoat={1}
      clearcoatRoughness={0.04}
      iridescence={1}
      iridescenceIOR={1.35}
      iridescenceThicknessRange={[120, 620]}
      envMapIntensity={1.5}
      depthWrite={false}
    />
  )
  const cobaltGloss = <meshPhysicalMaterial color={COBALT} roughness={0.14} clearcoat={1} clearcoatRoughness={0.03} envMapIntensity={1.1} />
  const vermilionGloss = <meshPhysicalMaterial color={VERMILION} roughness={0.18} clearcoat={1} clearcoatRoughness={0.05} />

  return (
    <group ref={root}>
      {/* Plan arrière : anneau d'aluminium et petits satellites, plus lents. */}
      <group ref={back} position={[0, 0, -1.5]}>
        {!mobile && ring && (
          <Float speed={0.8} rotationIntensity={0.5} floatIntensity={0.5}>
            <mesh geometry={ring} position={[-0.4, 1.95, 0]} rotation={[1.1, 0.2, 0.5]} scale={0.62}>
              {aluminium}
            </mesh>
          </Float>
        )}
        <Float speed={0.6} floatIntensity={0.7}>
          <group position={[mobile ? 1.2 : 4.3, mobile ? 2.4 : 1.7, 0]} scale={mobile ? 0.8 : 1}>
            {sphereB && <mesh geometry={sphereB}>{chrome}</mesh>}
            {sphereC && <mesh geometry={sphereC}>{chrome}</mesh>}
            {cubeB && <mesh geometry={cubeB}>{cobaltGloss}</mesh>}
          </group>
        </Float>
      </group>

      {/* Sujet focal : la sculpture chromée, devant l'aplat cobalt. */}
      <group ref={hero} position={[mobile ? 0 : 2.5, mobile ? 0.4 : 0.1, 0]} scale={mobile ? 0.46 : 0.8}>
        <Float speed={1.1} rotationIntensity={0.35} floatIntensity={0.55} floatingRange={[-0.1, 0.12]}>
          {sculpture && (
            <mesh geometry={sculpture} rotation={[Math.PI / 2 - 0.15, 0.1, -0.5]}>
              {chrome}
            </mesh>
          )}
        </Float>
      </group>

      {/* Plan avant : l'orbe irisé passe devant, avec la sphère vermillon. */}
      <group ref={front} position={[0, 0, 1.6]}>
        <Float speed={1.4} rotationIntensity={0.6} floatIntensity={0.9}>
          {orb && (
            <mesh geometry={orb} position={[mobile ? -1.4 : 0.75, mobile ? -0.9 : -1.45, 0]} scale={mobile ? 0.34 : 0.56}>
              {iridescent}
            </mesh>
          )}
        </Float>
        <Float speed={1.8} floatIntensity={1}>
          {sphereA && (
            <mesh geometry={sphereA} position={[mobile ? 1.3 : 2.3, mobile ? -1.5 : -1.7, 0]} scale={1.15}>
              {vermilionGloss}
            </mesh>
          )}
          {cubeA && !mobile && (
            <mesh geometry={cubeA} position={[4.2, -0.6, 0]} rotation={[0.5, 0.7, 0.2]} scale={1.2}>
              {chrome}
            </mesh>
          )}
        </Float>
      </group>

      {!mobile && <ContactShadows position={[2.5, -2.55, 0]} opacity={0.22} scale={9} blur={3.2} far={4} resolution={256} color="#20211f" />}
    </group>
  )
}

export default function HeroScene({ active }: { active: boolean }) {
  const reduced = useMemo(() => prefersReducedMotion(), [])
  const mobile = typeof window !== 'undefined' && window.matchMedia('(max-width: 767px)').matches
  return (
    <Canvas
      flat
      dpr={[1, mobile ? 1.25 : 1.75]}
      frameloop={active ? (reduced ? 'demand' : 'always') : 'never'}
      gl={{ alpha: true, antialias: true, powerPreference: 'high-performance' }}
      camera={{ fov: 32, near: 0.1, far: 60, position: [0, 0, 9] }}
      style={{ pointerEvents: 'none' }}
    >
      <Studio />
      <Objects reduced={reduced} />
    </Canvas>
  )
}

FILES.forEach((f) => useGLTF.preload(BASE + f))
