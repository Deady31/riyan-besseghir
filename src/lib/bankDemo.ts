/**
 * Moteur de la démo « assistant bancaire » : entièrement simulé, sans IA ni réseau.
 * Deux briques reprises du vrai prototype : le garde-fou (masquage des données sensibles avant tout modèle)
 * et le routage (une phrase libre mène à un parcours guidé, sinon l'assistant avoue qu'il ne sait pas).
 */
export type Intent = 'lost' | 'fees' | 'claim' | 'code' | 'human' | 'unknown'
export type Masked = { text: string; found: string[] }

const strip = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

const RULES: { label: string; re: RegExp; token: string }[] = [
  { label: 'IBAN', re: /\b[A-Z]{2}\d{2}(?:[ ]?[A-Z0-9]{4}){3,7}(?:[ ]?[A-Z0-9]{1,4})?\b/gi, token: '[IBAN MASQUÉ]' },
  { label: 'carte', re: /\b(?:\d[ -]?){15,19}\b/g, token: '[NUMÉRO DE CARTE MASQUÉ]' },
  { label: 'e-mail', re: /[\w.+-]+@[\w-]+\.[\w.]+/g, token: '[E-MAIL MASQUÉ]' },
  { label: 'téléphone', re: /\b0[1-9](?:[ .]?\d{2}){4}\b/g, token: '[TÉLÉPHONE MASQUÉ]' },
  { label: 'code', re: /\b(?:mon\s+)?(?:code|pin)\s+(?:secret\s+)?(?:est|:)\s*\d{4,6}\b/gi, token: '[CODE MASQUÉ]' },
]

/** Remplace les données sensibles par un repère et dit lesquelles ont été trouvées. L'ordre compte : IBAN avant carte. */
export function maskSensitive(input: string): Masked {
  let text = input
  const found: string[] = []
  for (const r of RULES) {
    r.re.lastIndex = 0
    if (r.re.test(text)) {
      found.push(r.label)
      r.re.lastIndex = 0
      text = text.replace(r.re, r.token)
    }
  }
  return { text, found }
}

const ROUTES: [Intent, RegExp][] = [
  ['human', /conseiller|humain|une personne|quelqu.un|rappel|advisor|human|call back|callback/],
  ['lost', /perdu|perdue|vol[ee]|bloqu|disparu|egare|\blost\b|stolen|\bblock|missing/],
  ['fees', /frais|tarif|cotisation|combien|prix|cout|\bfees?\b|price|\bcost|how much/],
  ['claim', /reclam|plainte|mecontent|contest|erreur|prelevement|complain|dispute|direct debit/],
  ['code', /\bcode\b|\bpin\b|mot de passe|identifiant|password|forgot/],
]

/** Une phrase libre → un parcours. Sans correspondance claire : `unknown` (l'assistant propose un conseiller plutôt que de deviner). */
export function route(input: string): Intent {
  const s = strip(input)
  for (const [intent, re] of ROUTES) if (re.test(s)) return intent
  return 'unknown'
}
