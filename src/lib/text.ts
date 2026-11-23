/**
 * ============================================================================
 * OUTILS DE TRAITEMENT DE TEXTE (français)
 * ============================================================================
 *
 * Fonctions PURES (sans React) : faciles à tester et réutilisées par la
 * recherche et par la vérification de citations.
 */

/**
 * Normalise un texte pour la comparaison :
 * minuscules, sans accents, sans ponctuation.
 * "l'Exécutif !" -> "l executif"
 */
export function normalize(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // supprime les accents décomposés
    .replace(/[’']/g, ' ')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

/** Découpe un texte normalisé en mots. */
export function tokenize(input: string): string[] {
  const n = normalize(input);
  return n.length === 0 ? [] : n.split(' ');
}

/**
 * Mots vides français ignorés pour la recherche et la comparaison :
 * ils sont trop fréquents pour être discriminants.
 */
export const STOPWORDS = new Set([
  'a', 'au', 'aux', 'avec', 'ce', 'ces', 'dans', 'de', 'des', 'du', 'elle', 'en', 'est', 'et', 'il',
  'l', 'la', 'le', 'les', 'leur', 'lui', 'mais', 'ne', 'ni', 'on', 'ou', 'par', 'pas', 'pour', 'qu',
  'que', 'qui', 'sa', 'se', 'ses', 'son', 'sur', 'un', 'une', 'd', 's', 'n', 'y',
]);

/** Mots-clés significatifs d'un texte (sans mots vides, au moins 2 lettres). */
export function keywords(input: string): string[] {
  return tokenize(input).filter((w) => w.length > 1 && !STOPWORDS.has(w));
}

/**
 * Distance de Levenshtein : nombre minimal de modifications (ajout,
 * suppression, substitution d'une lettre) pour passer de `a` à `b`.
 * "constitutionel" -> "constitutionnel" = 1
 */
export function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const curr = [i];
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr[j] = Math.min(prev[j]! + 1, curr[j - 1]! + 1, prev[j - 1]! + cost);
    }
    prev = curr;
  }
  return prev[b.length]!;
}

/**
 * Tolérance aux fautes selon la longueur du mot :
 * pas de faute admise sous 5 lettres, 1 jusqu'à 7, 2 au-delà.
 */
export function typoTolerance(word: string): number {
  if (word.length < 5) return 0;
  if (word.length < 8) return 1;
  return 2;
}

/**
 * Deux mots "correspondent" s'ils sont identiques, si l'un est le début
 * de l'autre (recherche en cours de frappe, pluriels), ou s'ils sont
 * proches à une faute de frappe près.
 */
export function wordsMatch(query: string, candidate: string): boolean {
  if (query === candidate) return true;
  if (query.length >= 3 && candidate.startsWith(query)) return true;
  if (candidate.length >= 4 && query.startsWith(candidate) && query.length - candidate.length <= 1) return true;
  const tolerance = typoTolerance(query);
  return tolerance > 0 && Math.abs(query.length - candidate.length) <= tolerance && levenshtein(query, candidate) <= tolerance;
}

/**
 * Initiales d'un nom, pour un avatar (2 lettres au plus).
 * "Awa Ndiaye" -> "AN" ; "" ou null -> "".
 */
export function initials(name: string | null | undefined): string {
  if (!name) return '';
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]!.toUpperCase())
    .join('');
}
