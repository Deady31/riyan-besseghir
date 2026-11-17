import { useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Environment, Lightformer } from '@react-three/drei'
import * as THREE from 'three'
import { prefersReducedMotion } from '../../lib/motion'

/**
 * Le logo : un R en 3D, en chrome violet, dessiné ici même (pas de police) : une tige, une panse et une jambe, extrudés avec un
 * biseau large pour accrocher la lumière. Il repose, se tourne vers le curseur au survol et fait un tour complet au clic.
 * Le canvas ne dessine que lorsque quelque chose bouge (survol, tour), sinon une seule image fixe.
 */

const DOME_V = `varying vec3 vDir; void main() { vDir = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`
const DOME_F = `varying vec3 vDir;
void main() {
  float h = vDir.y * 0.5 + 0.5;
  vec3 low = vec3(0.07, 0.03, 0.25);
  vec3 mid = vec3(0.38, 0.22, 0.85);
  vec3 top = vec3(0.92, 0.88, 1.0);
  vec3 c = mix(low, mid, smoothstep(0.0, 0.55, h));
  c = mix(c, top, smoothstep(0.5, 1.0, h));
  gl_FragColor = vec4(c, 1.0);
}`

function buildR() {
  const s = new THREE.Shape()
  s.moveTo(0, 0)
  s.lineTo(0.24, 0)
  s.lineTo(0.24, 0.38)
  s.lineTo(0.37, 0.38)
  s.lineTo(0.6, 0)
  s.lineTo(0.9, 0)
  s.lineTo(0.62, 0.43)
  s.bezierCurveTo(0.99, 0.52, 0.99, 1.0, 0.5, 1.0)
  s.lineTo(0, 1.0)
  s.closePath()
  const hole = new THREE.Path()
  hole.moveTo(0.24, 0.62)
  hole.lineTo(0.5, 0.62)
  hole.bezierCurveTo(0.75, 0.62, 0.75, 0.82, 0.5, 0.82)
  hole.lineTo(0.24, 0.82)
  hole.closePath()
  s.holes.push(hole)
  const g = new THREE.ExtrudeGeometry(s, { depth: 0.2, bevelEnabled: true, bevelThickness: 0.09, bevelSize: 0.075, bevelSegments: 10, curveSegments: 28 })
  g.center()
  g.computeVertexNormals()
  return g
}

function RMesh({ active, spinKey }: { active: boolean; spinKey: number }) {
  const mesh = useRef<THREE.Mesh>(null)
  const geometry = useMemo(buildR, [])
  const reduced = useMemo(() => prefersReducedMotion(), [])
  const { invalidate } = useThree()
  const spinStart = useRef<number | null>(null)
  const pointer = useRef({ x: 0, y: 0 })

  useEffect(() => {
    const move = (e: PointerEvent) => {
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1
      pointer.current.y = -((e.clientY / window.innerHeight) * 2 - 1)
    }
    window.addEventListener('pointermove', move, { passive: true })
    return () => window.removeEventListener('pointermove', move)
  }, [])

  useEffect(() => {
    if (spinKey > 0 && !reduced) spinStart.current = performance.now()
    invalidate()
  }, [spinKey, reduced, invalidate])

  const smoothY = useRef(-0.5)
  useFrame((state, dt) => {
    const m = mesh.current
    if (!m) return
    const t = state.clock.elapsedTime
    // Pose de repos : trois quarts, léger balancement ; au survol, le R suit le curseur.
    const baseY = reduced ? -0.5 : active ? pointer.current.x * 0.9 : -0.5 + Math.sin(t * 0.8) * 0.1
    const baseX = reduced ? 0.18 : active ? -pointer.current.y * 0.5 : 0.18
    let spin = 0
    if (spinStart.current !== null) {
      const k = Math.min(1, (performance.now() - spinStart.current) / 900)
      spin = (1 - Math.pow(1 - k, 3)) * Math.PI * 2
      if (k >= 1) spinStart.current = null
    }
    const ease = Math.min(1, dt * 8)
    smoothY.current += (baseY - smoothY.current) * ease
    m.rotation.y = smoothY.current + spin
    m.rotation.x += (baseX - m.rotation.x) * ease
  })

  return (
    <mesh ref={mesh} geometry={geometry} rotation={[0.18, -0.5, 0]}>
      <meshPhysicalMaterial color="#9d7dff" metalness={1} roughness={0.1} clearcoat={1} clearcoatRoughness={0.06} envMapIntensity={1.35} />
    </mesh>
  )
}

export default function Logo3D({ active, spinKey, onReady }: { active: boolean; spinKey: number; onReady?: () => void }) {
  const [live, setLive] = useState(false)
  useEffect(() => {
    // Image fixe d'abord ; l'animation ne tourne que pendant un survol ou un tour.
    if (active || spinKey > 0) setLive(true)
    const id = window.setTimeout(() => setLive(false), active ? 1e9 : 1000)
    return () => window.clearTimeout(id)
  }, [active, spinKey])

  return (
    <Canvas
      dpr={[1, 2]}
      camera={{ position: [0, 0, 2.75], fov: 30 }}
      onCreated={() => requestAnimationFrame(() => onReady?.())}
      frameloop={live ? 'always' : 'demand'}
      gl={{ alpha: true, antialias: true }}
      style={{ width: '100%', height: '100%', pointerEvents: 'none' }}
    >
      <Environment frames={1} resolution={128}>
        <mesh scale={30}>
          <sphereGeometry args={[1, 32, 16]} />
          <shaderMaterial side={THREE.BackSide} vertexShader={DOME_V} fragmentShader={DOME_F} depthWrite={false} />
        </mesh>
        {/* grande source douce derrière la caméra : c'est elle que la face avant du R reflète */}
        <Lightformer form="rect" intensity={2.6} position={[0, 0.3, 6]} rotation={[0, Math.PI, 0]} scale={[9, 5, 1]} color="#e6dcff" />
        <Lightformer form="rect" intensity={14} position={[-3, 3, 3]} scale={[5, 2.4, 1]} color="#fff6e5" />
        <Lightformer form="rect" intensity={9} position={[3.2, 0.5, 2]} scale={[1.4, 5, 1]} color="#ff7ec8" />
        <Lightformer form="rect" intensity={7} position={[0, -3, 2]} scale={[6, 1.6, 1]} color="#eadfff" />
        <Lightformer form="circle" intensity={8} position={[0, 3.5, -2]} scale={2.4} color="#ffffff" />
      </Environment>
      <directionalLight position={[-2, 3, 4]} intensity={1.2} color="#ffffff" />
      <RMesh active={active} spinKey={spinKey} />
    </Canvas>
  )
}
