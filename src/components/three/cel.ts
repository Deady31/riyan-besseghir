import * as THREE from 'three'

/**
 * Cel-shading façon Jet Set Radio : aplats de couleur en paliers (MeshToonMaterial + rampe à 3 marches) et contour prune
 * d'épaisseur constante à l'écran (coque inversée poussée en espace écran, donc la même quel que soit la taille de l'objet).
 */

export const CEL = {
  cream: '#FFF6E5',
  plum: '#2B0F3A',
  violet: '#6C2BFF',
  violetSoft: '#A98BFF',
  lilac: '#EADFFF',
  lilacMid: '#CBB8F5',
  pink: '#FF7EC8',
  pinkDeep: '#E85FAF',
  lemon: '#FFD83D',
} as const

/** Rampe d'ombre : ombre franche, demi-teinte, lumière. Filtrage au plus proche pour garder les marches nettes. */
function makeRamp() {
  const data = new Uint8Array([70, 160, 255])
  const tex = new THREE.DataTexture(data, data.length, 1, THREE.RedFormat)
  tex.minFilter = THREE.NearestFilter
  tex.magFilter = THREE.NearestFilter
  tex.generateMipmaps = false
  tex.needsUpdate = true
  return tex
}
export const RAMP = makeRamp()

export function toon(color: string, extra: Partial<THREE.MeshToonMaterialParameters> = {}) {
  return new THREE.MeshToonMaterial({ color, gradientMap: RAMP, ...extra })
}

/** Convertit une matière quelconque (modèles fournis) en toon, en gardant sa couleur et sa texture. */
const converted = new WeakMap<THREE.Material, THREE.Material>()
export function toToon(m: THREE.Material): THREE.Material {
  const hit = converted.get(m)
  if (hit) return hit
  const src = m as THREE.MeshStandardMaterial
  const out = new THREE.MeshToonMaterial({
    color: src.color ? src.color.clone() : new THREE.Color(CEL.lilac),
    map: src.map ?? null,
    gradientMap: RAMP,
    transparent: src.transparent,
    opacity: src.opacity,
    alphaTest: src.alphaTest,
    side: src.side,
  })
  out.name = m.name
  converted.set(m, out)
  return out
}

/** Taille du canvas en pixels CSS, partagée par tous les contours (mise à jour par la scène). */
export const outlineUniforms = {
  uRes: { value: new THREE.Vector2(1280, 800) },
  uPx: { value: 2.6 },
  uColor: { value: new THREE.Color(CEL.plum) },
}

const OUTLINE_VERT = `
uniform vec2 uRes;
uniform float uPx;
void main() {
  vec4 clip = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  vec3 vn = normalize(normalMatrix * normal);
  vec2 dir = (projectionMatrix * vec4(vn, 0.0)).xy;
  float len = length(dir);
  dir = len > 1e-5 ? dir / len : vec2(0.0);
  clip.xy += dir * uPx * 2.0 / uRes * clip.w;
  gl_Position = clip;
}`
const OUTLINE_FRAG = `
uniform vec3 uColor;
void main() { gl_FragColor = vec4(uColor, 1.0); }`

export const OUTLINE = new THREE.ShaderMaterial({
  uniforms: outlineUniforms,
  vertexShader: OUTLINE_VERT,
  fragmentShader: OUTLINE_FRAG,
  side: THREE.BackSide,
})

/** Ajoute à chaque maillage opaque d'un objet sa coque de contour (même géométrie, faces arrière poussées vers l'extérieur). */
export function addOutlines(root: THREE.Object3D) {
  const meshes: THREE.Mesh[] = []
  root.traverse((o) => {
    if (o instanceof THREE.Mesh && !o.userData.outline && !(o.material as THREE.Material).transparent) meshes.push(o)
  })
  for (const m of meshes) {
    const hull = new THREE.Mesh(m.geometry, OUTLINE)
    hull.userData.outline = true
    hull.raycast = () => {}
    m.add(hull)
  }
  return root
}
