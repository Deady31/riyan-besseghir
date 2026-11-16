import { Suspense, useEffect, useMemo, useState } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { OrbitControls, useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { Studio } from './SiteScene'

/**
 * Page de développement `/model-preview` : voir un à un les modèles passés par `npm run models`
 * (public/media/3d/user/index.json), avec leur poids et le nombre de triangles réellement dessinés.
 */
type Entry = { name: string; file: string; kb: number; triangles: number | null }

function Model({ url }: { url: string }) {
  const { scene } = useGLTF(url)
  const { object, scale } = useMemo(() => {
    const clone = scene.clone(true)
    const box = new THREE.Box3().setFromObject(clone)
    const size = box.getSize(new THREE.Vector3())
    clone.position.sub(box.getCenter(new THREE.Vector3()))
    return { object: clone, scale: 2.4 / Math.max(size.x, size.y, size.z, 0.0001) }
  }, [scene])
  return (
    <group scale={scale}>
      <primitive object={object} />
    </group>
  )
}

function Stats({ onStats }: { onStats: (s: string) => void }) {
  const { gl } = useThree()
  useEffect(() => {
    const id = window.setInterval(() => {
      const i = gl.info
      onStats(`${i.render.triangles.toLocaleString('fr-FR')} triangles · ${i.render.calls} appels de dessin · ${i.memory.textures} textures`)
    }, 600)
    return () => window.clearInterval(id)
  }, [gl, onStats])
  return null
}

export function ModelPreview() {
  const [list, setList] = useState<Entry[]>([])
  const [current, setCurrent] = useState(0)
  const [stats, setStats] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/media/3d/user/index.json')
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error('index.json introuvable : lance `npm run models`'))))
      .then((j: Entry[]) => setList(j))
      .catch((e: Error) => setError(e.message))
  }, [])

  const entry = list[current]
  return (
    <main className="fixed inset-0 z-[80] flex flex-col bg-[#d8d3c4]">
      <header className="flex flex-wrap items-center gap-2 p-4 pt-[4.5rem]">
        {list.map((m, i) => (
          <button
            key={m.name}
            type="button"
            onClick={() => setCurrent(i)}
            className={`rounded-full px-4 py-2 text-sm font-semibold ${i === current ? 'bg-paper text-ink' : 'bg-graphite-2 text-paper'}`}
          >
            {m.name}
          </button>
        ))}
        {error && <p className="text-sm font-semibold text-vermilion">{error}</p>}
        {entry && (
          <p className="ml-auto text-sm font-semibold text-paper">
            {entry.kb} Ko{entry.triangles ? ` · ${entry.triangles.toLocaleString('fr-FR')} triangles (fichier)` : ''}
            {entry.kb > 2048 && <span className="ml-2 text-vermilion">trop lourd</span>}
          </p>
        )}
      </header>
      <div className="relative min-h-0 flex-1">
        {entry && (
          <Canvas flat camera={{ fov: 32, position: [0, 0.4, 7] }} dpr={[1, 1.6]}>
            <Studio />
            <Suspense fallback={null}>
              <Model key={entry.file} url={`/media/3d/user/${entry.file}`} />
            </Suspense>
            <OrbitControls enablePan={false} />
            <Stats onStats={setStats} />
          </Canvas>
        )}
        <p className="absolute bottom-3 left-4 text-sm font-semibold text-paper">{stats}</p>
      </div>
    </main>
  )
}
