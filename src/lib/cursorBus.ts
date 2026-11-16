/**
 * Pont entre la scène 3D et le curseur main : la scène dit quand la souris survole un objet attrapable
 * et quand on en tient un ; le curseur le lit à chaque image (aucun rendu React).
 */
export const cursorBus = {
  /** Un objet 3D attrapable est sous le curseur. */
  overGrab: false,
  /** On tient un objet 3D. */
  dragging: false,
}
