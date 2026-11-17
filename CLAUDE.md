# riyan.world — portfolio de Riyan Besseghir (AI Product Manager)

Dépôt `Deady31/riyan-besseghir`, déployé par Vercel à chaque push sur `main` → https://riyan-besseghir.vercel.app

## Règles de travail (Riyan)
- Réponses courtes, en français. Preuve avant promesse : lancer, mesurer, montrer.
- **Jamais de prod sans son OK explicite.** Flux : branche `vNN-sujet` → build + tests + captures → « je mets en prod ? » → seulement si oui : `git merge --ff-only` dans `main`, push, vérifier le bundle servi.
- Commits en français (`feat:` `fix:` `perf:`), **sans** trailer Co-Authored-By. Ne jamais inventer de chiffre ni de fait. Jamais de clé affichée.
- Un crochet bloque `git commit` + un drapeau `-n` dans la même commande (ex. `grep -n`) : commit seul.

## Stack et commandes
Vite 8, React 19, TS, Tailwind 4, GSAP (+ScrollTrigger, SplitText), Lenis, Motion, react-three-fiber/three/drei, OGL.
`npm run build` · `npx vitest run` (65 tests) · `npx tsc -b`
Vérifs (une ligne chacune, après `npm run qa:build` : même build que `build` mais FOODER pointe vers la vraie démo) : `npm run qa:shot -- deck:0.1,contact:0.1 [--mobile]` (une planche), `npm run qa:perf` (mobile simulé), `npm run qa:check` (erreurs, menu, ancres, démo).
Ne jamais tester le téléphone 3D sur `npm run dev` (blanc en headless) : build + preview.

## Charte (ne pas dévier)
Crème #FFF6E5 (fond), violet #6C2BFF (dominant), prune #2B0F3A (texte, nuits), rose #FF7EC8, lilas #EADFFF. Citron #FFD83D seulement sur de petits composants. Aucun italique. Titres Space Grotesk propres (sans contour), corps Rubik. Un seul fond : la vague Threads (`src/components/backgrounds/WaveField.tsx`). Riyan veut épuré et cohérent : pas de « fourre-tout », pas d'effets cheap.

## Où est quoi
- Chapitres : `src/data/chapters.ts` (menu + rail) ; sections : `src/components/sections|deck|ai|lab` ; bas de l'accueil chargé à part : `src/BelowFold.tsx`.
- Contenu/FR-EN : `src/i18n/ui.ts`, `src/data/profile.ts`, `projects.ts`, `stories.ts` (gros fichiers : lire par plage).
- 3D : `src/components/three/SiteScene.tsx` (+ `cel.ts` toon), jouets/physique `src/lib/toys.ts`, répliques `src/data/toyLines.ts`, logo `layout/Logo3D.tsx`, démo FOODER `sections/FooderDemo.tsx` + `project/PhoneStage.tsx|PhoneMock.tsx`.
- Modèles 3D fournis : déposer dans `tools/models/inbox/` puis `npm run models`.

## Pièges connus
1. Les sections ont `z-index: 20` : tout DOM de section est SOUS le canvas 3D avant (z-40) → jamais de texte par-dessus le téléphone 3D.
2. Sections du bas chargées après coup : liens d'ancre via `scrollToId` (`src/lib/SmoothScroll.tsx`) ; Lenis garde l'ancienne hauteur → `lenis.resize()`.
3. FOODER (`fooder-tawny.vercel.app/demo`) n'autorise l'iframe que depuis le site en ligne (CSP) : en local l'appli reste blanche, c'est normal (`qa:check` contourne).
4. `.env.local` pointe FOODER vers localhost : pour tester la vraie démo, builder avec `npm run qa:build` (`.env.qa`).
5. Windows : pas de `pkill` ; arrêter un serveur via PowerShell (`netstat` + `Stop-Process`).
