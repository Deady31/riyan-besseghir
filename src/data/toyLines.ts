/**
 * Les petites phrases que disent les objets 3D quand on les saisit, les tape ou les lance.
 * Chaque objet a ses blagues, adaptées à ce qu'il est. Format : [événement, français, anglais].
 */
export type ToyKind = string
export type Ev = 'grab' | 'tap' | 'throw'
export type Line = readonly [Ev, string, string]

export const TOY_LINES: Record<string, readonly Line[]> = {
  robot: [
    ['grab', 'Hé ! Pas les circuits !', 'Hey! Not the circuits!'],
    ['grab', 'Bip ? Je suis en mise à jour…', 'Beep? I’m updating…'],
    ['tap', 'Aïe ! Mon firmware !', 'Ouch! My firmware!'],
    ['tap', 'Erreur 418 : je suis une théière', 'Error 418: I’m a teapot'],
    ['throw', 'Wééé ! Calcul de la trajectoire…', 'Wheee! Computing trajectory…'],
    ['throw', 'Je ne suis pas un frisbee !', 'I’m not a frisbee!'],
  ],
  cat: [
    ['grab', 'Miaou ?', 'Meow?'],
    ['grab', 'Pas par la queue !', 'Not by the tail!'],
    ['tap', 'Miaou !', 'Meow!'],
    ['tap', 'Pattes de velours, s’il te plaît', 'Velvet paws, please'],
    ['throw', 'Je retombe toujours sur mes pattes', 'I always land on my feet'],
    ['throw', 'Miaouuu… j’ai le vertige', 'Meooow… I’m dizzy'],
  ],
  dumbbell: [
    ['grab', 'Oh, tu soulèves ?', 'Oh, do you lift?'],
    ['grab', 'Respire, c’est 2 kilos', 'Breathe, it’s only 2 kg'],
    ['tap', 'Même pas mal, j’ai de la masse', 'Didn’t feel a thing, I have mass'],
    ['tap', 'On ne tape pas un haltère un jour de jambes', 'No poking dumbbells on leg day'],
    ['throw', 'Attention aux orteils !', 'Mind your toes!'],
    ['throw', 'Jamais sans échauffement !', 'Never without a warm-up!'],
  ],
  gamepad: [
    ['grab', 'Player 1 prêt !', 'Player 1 ready!'],
    ['grab', 'Appuie sur Start', 'Press Start'],
    ['tap', 'Combo ! +100 points', 'Combo! +100 points'],
    ['tap', 'Pas les boutons, ça rage-quit', 'Not the buttons, that’s a rage quit'],
    ['throw', 'Game over ?', 'Game over?'],
    ['throw', 'Lag… j’ai lâché la manette', 'Lag… I dropped the controller'],
  ],
  psp: [
    ['grab', 'Pas de batterie, juste de la nostalgie', 'No battery, just nostalgia'],
    ['grab', 'UMD introuvable', 'UMD not found'],
    ['tap', 'Ouch, mon écran !', 'Ouch, my screen!'],
    ['tap', 'Je suis fragile, on est en 2005 !', 'I’m fragile, it’s 2005!'],
    ['throw', 'Monster Hunter m’attend !', 'Monster Hunter is waiting!'],
    ['throw', 'Sauvegarde auto : échec', 'Autosave: failed'],
  ],
  stopwatch: [
    ['grab', 'Tic, tac…', 'Tick, tock…'],
    ['grab', 'Chrono lancé !', 'Timer started!'],
    ['tap', 'Tu perds du temps !', 'You’re wasting time!'],
    ['tap', 'Trente heures, pas une de plus', 'Thirty hours, not one more'],
    ['throw', 'Record de vitesse !', 'Speed record!'],
    ['throw', 'Temps écoulé !', 'Time’s up!'],
  ],
  reel: [
    ['grab', 'Silence, on tourne !', 'Quiet on set!'],
    ['grab', 'Moteur… ça tourne !', 'Rolling… action!'],
    ['tap', 'Coupez !', 'Cut!'],
    ['tap', 'On la refait, prise 12', 'Let’s go again, take 12'],
    ['throw', 'Plan séquence !', 'One-take shot!'],
    ['throw', 'Ça part en bobine !', 'That’s a wrap!'],
  ],
  earphones: [
    ['grab', 'Pardon, j’écoute ?', 'Sorry, listening?'],
    ['grab', 'Fils emmêlés, comme d’hab', 'Tangled, as usual'],
    ['tap', 'Hein ? Quoi ?', 'Huh? What?'],
    ['tap', 'Volume trop fort !', 'Too loud!'],
    ['throw', 'Débranchés !', 'Unplugged!'],
    ['throw', 'Un fil à la patte', 'Wired up!'],
  ],
  'star-cobalt': [
    ['grab', 'Fais un vœu !', 'Make a wish!'],
    ['grab', 'Je brille quand même', 'Still shining'],
    ['tap', 'Étoile filante !', 'Shooting star!'],
    ['tap', 'Cinq branches, zéro défaut', 'Five points, zero flaws'],
    ['throw', 'Direction la galaxie !', 'To the galaxy!'],
    ['throw', 'Vœu exaucé !', 'Wish granted!'],
  ],
  orb: [
    ['grab', 'Doucement, je suis une bulle !', 'Gently, I’m a bubble!'],
    ['grab', 'Ploc ?', 'Plop?'],
    ['tap', 'Pop !', 'Pop!'],
    ['tap', 'Presque éclatée !', 'Almost popped!'],
    ['throw', 'Je flotte !', 'I’m floating!'],
    ['throw', 'Bulle de savon, pas de filtre', 'Soap bubble, no filter'],
  ],
  vinyl: [
    ['grab', 'Ça tourne à 33 tours', 'Spinning at 33'],
    ['grab', 'Attention aux rayures', 'Mind the scratches'],
    ['tap', 'Ça saute !', 'It skips!'],
    ['tap', 'Pas de scratch sans DJ', 'No scratching without a DJ'],
    ['throw', 'Frisbee musical !', 'Musical frisbee!'],
    ['throw', 'Face B !', 'Side B!'],
  ],
  camera: [
    ['grab', 'Souris !', 'Smile!'],
    ['grab', 'Mets-toi bien dans le cadre', 'Get in frame'],
    ['tap', 'Flash !', 'Flash!'],
    ['tap', 'Photo floue, recommence', 'Blurry, try again'],
    ['throw', 'Ne me laisse pas tomber !', 'Don’t drop me!'],
    ['throw', 'Pose longue… très longue', 'Long exposure… very long'],
  ],
}

/** Pour les objets sans blagues à eux (formes, œufs cachés…). */
export const GENERIC_LINES: readonly Line[] = [
  ['grab', 'Hé !', 'Hey!'],
  ['grab', 'Doucement !', 'Easy!'],
  ['tap', 'Aïe !', 'Ouch!'],
  ['tap', 'Poke !', 'Boop!'],
  ['throw', 'Wééé !', 'Wheee!'],
  ['throw', 'À moi les étoiles !', 'To the stars!'],
]

/** Une réplique pour cet objet et cet événement, jamais la même deux fois de suite. */
export function pickLine(kind: string | undefined, ev: Ev, lang: 'fr' | 'en', last?: string, rnd: () => number = Math.random): string {
  const pool = (TOY_LINES[kind ?? ''] ?? GENERIC_LINES).filter((l) => l[0] === ev)
  const texts = pool.map((l) => (lang === 'en' ? l[2] : l[1]))
  const fresh = texts.filter((t) => t !== last)
  const from = fresh.length ? fresh : texts
  return from[Math.floor(rnd() * from.length)]
}
