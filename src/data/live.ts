/** Projets dont l'appli réelle s'ouvre dans le téléphone 3D (l'appli doit autoriser l'affichage depuis ce site). */
export const LIVE: Record<string, { url: string; screen: string }> = {
  // `/demo` : entrée sans inscription (profil invité local, aucun compte, cloud coupé).
  fooder: { url: `${import.meta.env.VITE_FOODER_URL ?? 'https://fooder-tawny.vercel.app'}/demo`, screen: '/media/projets/fooder-v2-swipe-mobile.webp' },
}
