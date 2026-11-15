// Frames générées avec PixelLab (personnage « Riyan skater », vue de face, 88x88).
// Chaque clip rejoue les frames dans un ordre choisi pour boucler sans à-coup.
const frame = (clip: 'tap' | 'scratch', i: number) => `/media/afk/${clip}-${i}.png`

const TAP_ORDER = [0, 1, 2, 3, 4, 5, 6, 7, 8, 7, 6, 7, 8, 7, 6, 7, 8, 6, 5, 4, 3, 2, 1]
const SCRATCH_ORDER = [0, 1, 2, 3, 4, 5, 6, 7, 8, 7, 6, 7, 8, 7, 6, 7, 8, 8, 8, 6, 4, 2, 1]

export const AFK_FPS = 8

export const AFK_CLIPS = {
  tap: TAP_ORDER.map((i) => frame('tap', i)),
  scratch: SCRATCH_ORDER.map((i) => frame('scratch', i)),
}
