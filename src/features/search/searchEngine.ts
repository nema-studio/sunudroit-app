/**
 * ============================================================================
 * MOTEUR DE RECHERCHE (local, hors ligne)
 * ============================================================================
 *
 * Fonctionnalités :
 *  1. Accès direct par numéro : "27", "art 92", "article 1".
 *  2. Recherche plein texte tolérante aux fautes ("constitutionel").
 *  3. Correction de la requête affichée à l'utilisateur.
 *  4. Classement par pertinence (titre/thème > texte).
 *
 * Version 1 : parcours en mémoire, largement suffisant pour quelques
 * centaines d'articles. Quand le corpus grossira, on déléguera la
 * présélection à SQLite FTS5 (voir docs/ARCHITECTURE.md) et on gardera
 * ce module pour le classement et la tolérance aux fautes.
 */
import { repository, versionToPlainText, type LegalRepository } from '@/data/repository';
import type { ArticleWithVersion, LegalText, TextType } from '@/data/types';
import { keywords, levenshtein, tokenize, typoTolerance, wordsMatch } from '@/lib/text';

export type SearchFilter = 'all' | TextType;

export type SearchResult =
  | {
      kind: 'article';
      item: ArticleWithVersion;
      score: number;
      /** Extrait à afficher, centré sur le premier passage pertinent. */
      excerpt: string;
      /** Mots (normalisés) à surligner dans l'extrait. */
      terms: string[];
      relationCount: number;
    }
  | { kind: 'text'; text: LegalText; score: number; terms: string[] };

export interface SearchResponse {
  /** Requête corrigée, si une faute a été détectée ("conseil constitutionnel"). */
  correctedQuery?: string;
  /** Article ouvert directement quand on tape un numéro. */
  directArticle?: ArticleWithVersion;
  results: SearchResult[];
}

const ARTICLE_NUMBER = /^\s*(?:art(?:icle)?\.?\s*)?(\d+)\s*$/i;
const EXCERPT_LENGTH = 170;

/** Poids d'une correspondance selon sa qualité. */
function matchWeight(query: string, candidate: string): number {
  if (query === candidate) return 3;
  if (candidate.startsWith(query)) return 2;
  return wordsMatch(query, candidate) ? 1.5 : 0;
}

/**
 * Calcule la pertinence d'un ensemble de mots (le "haystack") pour la requête.
 * Retourne le score et les mots trouvés, ou null si moins de la moitié
 * des mots de la requête sont présents.
 */
function scoreTokens(queryWords: string[], hay: string[]): { score: number; terms: string[] } | null {
  let score = 0;
  let matched = 0;
  const terms = new Set<string>();
  for (const q of queryWords) {
    let best = 0;
    for (const h of hay) {
      const w = matchWeight(q, h);
      if (w > 0) terms.add(h);
      if (w > best) best = w;
    }
    if (best > 0) matched++;
    score += best;
  }
  if (matched === 0 || matched < queryWords.length / 2) return null;
  // Bonus si TOUS les mots sont présents.
  if (matched === queryWords.length) score += 2;
  return { score, terms: [...terms] };
}

/** Extrait la phrase contenant le premier terme trouvé, tronquée proprement. */
function buildExcerpt(plain: string, terms: string[]): string {
  const sentences = plain.split(/(?<=[.;:])\s+/);
  const hit = sentences.find((s) => tokenize(s).some((w) => terms.includes(w))) ?? sentences[0] ?? '';
  if (hit.length <= EXCERPT_LENGTH) return hit;
  return `${hit.slice(0, EXCERPT_LENGTH).replace(/\s+\S*$/, '')}…`;
}

/**
 * Corrige la requête mot à mot à partir du vocabulaire du corpus.
 * Retourne undefined si rien n'a été corrigé.
 */
function correctQuery(query: string, vocabulary: Set<string>): string | undefined {
  let changed = false;
  const corrected = tokenize(query).map((word) => {
    if (vocabulary.has(word) || word.length < 5) return word;
    let best: string | undefined;
    let bestDistance = typoTolerance(word) + 1;
    for (const candidate of vocabulary) {
      if (Math.abs(candidate.length - word.length) > 2) continue;
      const d = levenshtein(word, candidate);
      if (d < bestDistance) {
        best = candidate;
        bestDistance = d;
      }
    }
    if (best) {
      changed = true;
      return best;
    }
    return word;
  });
  return changed ? corrected.join(' ') : undefined;
}

export function search(
  rawQuery: string,
  filter: SearchFilter = 'all',
  repo: LegalRepository = repository,
): SearchResponse {
  const query = rawQuery.trim();
  if (query.length === 0) return { results: [] };

  const all = repo.listCurrentArticles();

  // 1. Accès direct par numéro d'article (Constitution par défaut).
  const numberMatch = ARTICLE_NUMBER.exec(query);
  if (numberMatch) {
    const directArticle = all.find((a) => a.text.type === 'constitution' && a.article.number === numberMatch[1]);
    return { directArticle, results: [] };
  }

  const queryWords = keywords(query);
  if (queryWords.length === 0) return { results: [] };

  const vocabulary = new Set<string>();
  const results: SearchResult[] = [];

  // 2. Articles
  for (const item of all) {
    const plain = versionToPlainText(item.version);
    const titleHay = keywords(`${item.article.chapter} ${item.article.summary}`);
    const bodyHay = keywords(plain);
    [...titleHay, ...bodyHay].forEach((w) => vocabulary.add(w));
    if (filter !== 'all' && item.text.type !== filter) continue;

    const inBody = scoreTokens(queryWords, bodyHay);
    const inTitle = scoreTokens(queryWords, titleHay);
    if (!inBody && !inTitle) continue;

    // Un mot trouvé dans le thème de l'article compte plus que dans le texte.
    const score = (inBody?.score ?? 0) + (inTitle?.score ?? 0) * 1.5;
    const terms = [...new Set([...(inBody?.terms ?? []), ...(inTitle?.terms ?? [])])];
    results.push({
      kind: 'article',
      item,
      score,
      excerpt: buildExcerpt(plain, terms),
      terms,
      relationCount: repo.getRelations(item.article.id).length,
    });
  }

  // 3. Textes entiers (lois organiques, décisions) par leur intitulé
  for (const text of repo.listTexts()) {
    const hay = keywords(`${text.title} ${text.subtitle ?? ''} ${text.shortTitle}`);
    hay.forEach((w) => vocabulary.add(w));
    if (text.type === 'constitution') continue;
    if (filter !== 'all' && text.type !== filter) continue;
    const hit = scoreTokens(queryWords, hay);
    if (hit) results.push({ kind: 'text', text, score: hit.score, terms: hit.terms });
  }

  results.sort((a, b) => b.score - a.score);
  return { correctedQuery: correctQuery(query, vocabulary), results };
}
