# Modèles 3D fournis

Pour passer des modèles trouvés (Sketchfab, Blender…) dans le site :

1. Dépose les fichiers `.glb` dans `tools/models/inbox/` (ce dossier n'est jamais commité).
2. Lance `npm run models`. Chaque modèle est recentré, compressé (meshopt, textures WebP 1024 px max) et écrit dans
   `public/media/3d/user/<nom>.glb`, avec un index `index.json`. Un avertissement s'affiche au-delà de 50 000 triangles ou 2 Mo.
3. Lance `npm run dev` et ouvre `/model-preview` pour les voir un par un, avec leur poids et leurs triangles.
4. Pour les utiliser comme easter egg 3D, ajoute une entrée `kind: '3d'` dans `src/data/eggs.ts` avec
   `src: '/media/3d/user/<nom>.glb'` et des classes de placement (`className`).

Avant de commiter : vérifie que `inbox/` ne contient pas de fichier de test et que `public/media/3d/user/` ne contient
que des modèles voulus (licence CC0, CC-BY avec crédit, ou fait par toi).
