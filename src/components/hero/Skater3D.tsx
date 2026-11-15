import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { mergeVertices } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import { gsap, prefersReducedMotion } from '../../lib/motion'

const MODEL_URL = '/media/3d/skater.glb'
const OUTLINE = 0.018
const PLUM = 0x2b0f3a

/** Rampe à 3 paliers, filtrée en « nearest » : c'est elle qui donne le cel-shading façon PS2. */
function toonRamp() {
  const data = new Uint8Array([90, 90, 90, 255, 190, 190, 190, 255, 255, 255, 255, 255])
  const tex = new THREE.DataTexture(data, 3, 1, THREE.RGBAFormat)
  tex.minFilter = THREE.NearestFilter
  tex.magFilter = THREE.NearestFilter
  tex.generateMipmaps = false
  tex.needsUpdate = true
  return tex
}

/** Contour « inverted hull » : copie gonflée le long des normales lissées, rendue face arrière. */
function outlineOf(mesh: THREE.Mesh) {
  const base = mesh.geometry.clone()
  base.deleteAttribute('normal')
  base.deleteAttribute('uv')
  const geo = mergeVertices(base)
  geo.computeVertexNormals()
  const pos = geo.attributes.position
  const nor = geo.attributes.normal
  for (let i = 0; i < pos.count; i++) {
    pos.setXYZ(i, pos.getX(i) + nor.getX(i) * OUTLINE, pos.getY(i) + nor.getY(i) * OUTLINE, pos.getZ(i) + nor.getZ(i) * OUTLINE)
  }
  const line = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: PLUM, side: THREE.BackSide }))
  line.position.copy(mesh.position)
  line.rotation.copy(mesh.rotation)
  line.scale.copy(mesh.scale)
  return line
}

export default function Skater3D({ className }: { className?: string }) {
  const host = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = host.current
    if (!el) return
    const reduced = prefersReducedMotion()

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false, powerPreference: 'low-power' })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.25))
    renderer.outputColorSpace = THREE.SRGBColorSpace
    el.appendChild(renderer.domElement)
    renderer.domElement.style.touchAction = 'pan-y'

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(28, 1, 0.1, 50)
    scene.add(new THREE.AmbientLight(0xffffff, 1.1))
    const sun = new THREE.DirectionalLight(0xffffff, 2.4)
    sun.position.set(-2, 3, 4)
    scene.add(sun)

    const rig = new THREE.Group() // pivot : rotation et saut
    scene.add(rig)
    const shadow = new THREE.Mesh(
      new THREE.CircleGeometry(0.32, 32),
      new THREE.MeshBasicMaterial({ color: PLUM, transparent: true, opacity: 0.18 }),
    )
    shadow.rotation.x = -Math.PI / 2
    scene.add(shadow)

    const ramp = toonRamp()
    let disposed = false
    new GLTFLoader().load(MODEL_URL, (gltf) => {
      if (disposed) return
      const model = gltf.scene
      const meshes: THREE.Mesh[] = []
      model.traverse((o) => {
        if (o instanceof THREE.Mesh) meshes.push(o)
      })
      const swap = (m: THREE.Material) =>
        new THREE.MeshToonMaterial({ color: (m as THREE.MeshStandardMaterial).color, gradientMap: ramp })
      meshes.forEach((o) => {
        o.material = Array.isArray(o.material) ? o.material.map(swap) : swap(o.material)
        o.parent?.add(outlineOf(o))
      })
      const box = new THREE.Box3().setFromObject(model)
      const size = box.getSize(new THREE.Vector3())
      const center = box.getCenter(new THREE.Vector3())
      model.position.set(-center.x, -box.min.y, -center.z)
      const facing = new THREE.Group()
      facing.add(model)
      rig.add(facing)
      const h = size.y
      camera.position.set(0, h * 0.55, h * 2.55)
      camera.lookAt(0, h * 0.5, 0)
      shadow.position.y = 0.002
      el.dataset.ready = '1'
      if (!reduced) gsap.from(rig.scale, { x: 0.01, y: 0.01, z: 0.01, duration: 1.1, ease: 'back.out(1.8)', delay: 0.4 })
    })

    const resize = () => {
      const w = el.clientWidth
      const h = el.clientHeight
      renderer.setSize(w, h, false)
      renderer.domElement.style.width = '100%'
      renderer.domElement.style.height = '100%'
      camera.aspect = w / Math.max(h, 1)
      camera.updateProjectionMatrix()
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(el)

    // Interaction : glisser pour faire tourner (avec inertie), clic pour un kickflip.
    const spin = { angle: -0.35, vel: 0, look: 0 }
    const jump = { y: 0, flip: 0 }
    let dragging = false
    let lastX = 0
    let moved = 0
    const onDown = (e: PointerEvent) => {
      dragging = true
      moved = 0
      lastX = e.clientX
      renderer.domElement.setPointerCapture(e.pointerId)
    }
    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect()
      spin.look = ((e.clientX - r.left) / r.width - 0.5) * 0.9
      if (!dragging) return
      const dx = e.clientX - lastX
      lastX = e.clientX
      moved += Math.abs(dx)
      spin.vel = dx * 0.012
      spin.angle += dx * 0.012
    }
    const kickflip = () => {
      if (reduced || gsap.isTweening(jump)) return
      gsap
        .timeline()
        .to(jump, { y: 0.45, duration: 0.32, ease: 'power2.out' })
        .to(jump, { flip: jump.flip + Math.PI * 2, duration: 0.6, ease: 'power2.inOut' }, 0)
        .to(jump, { y: 0, duration: 0.4, ease: 'bounce.out' }, 0.32)
    }
    const onUp = () => {
      if (dragging && moved < 4) kickflip()
      dragging = false
    }
    renderer.domElement.addEventListener('pointerdown', onDown)
    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('pointerup', onUp)

    let raf = 0
    let visible = true
    const clock = new THREE.Clock()
    const frame = () => {
      const t = clock.getElapsedTime()
      if (!dragging) {
        spin.vel *= 0.94
        spin.angle += spin.vel
        if (Math.abs(spin.vel) < 0.002) spin.angle += ((spin.look - 0.35) - spin.angle) * 0.03
      }
      const bob = reduced ? 0 : Math.sin(t * 2.2) * 0.025
      rig.rotation.y = spin.angle + jump.flip
      rig.rotation.z = reduced ? 0 : Math.sin(t * 1.1) * 0.04
      rig.position.y = bob + jump.y
      const s = 1 - (jump.y + bob) * 0.9
      shadow.scale.setScalar(Math.max(s, 0.4))
      renderer.render(scene, camera)
      if (visible) raf = requestAnimationFrame(frame)
    }
    raf = requestAnimationFrame(frame)

    const io = new IntersectionObserver(([entry]) => {
      const was = visible
      visible = entry.isIntersecting && document.visibilityState === 'visible'
      if (visible && !was) raf = requestAnimationFrame(frame)
    })
    io.observe(el)

    return () => {
      disposed = true
      visible = false
      cancelAnimationFrame(raf)
      io.disconnect()
      ro.disconnect()
      renderer.domElement.removeEventListener('pointerdown', onDown)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      scene.traverse((o) => {
        if (o instanceof THREE.Mesh) {
          o.geometry.dispose()
          const mats = Array.isArray(o.material) ? o.material : [o.material]
          mats.forEach((m) => m.dispose())
        }
      })
      ramp.dispose()
      renderer.dispose()
      renderer.domElement.remove()
    }
  }, [])

  return <div ref={host} className={className} />
}
