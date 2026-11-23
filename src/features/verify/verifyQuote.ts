/**
 * ============================================================================
 * VÉRIFICATION D'UNE CITATION
 * ============================================================================
 *
 * Entrée  : une phrase entendue ("le mandat du Président est de sept ans").
 * Sortie  : l'article le plus proche, un verdict, les mots qui diffèrent,
 *           et, si la citation correspond à une ANCIENNE version de
 *           l'article, cette version (le cas le plus fréquent en débat).
 *
 * Algorithme (volontairement simple et explicable, pas d'IA) :
 *  1. On cherche l'article dont une version partage le plus de mots-clés
 *     avec la citation.
 *  2. On aligne mot à mot la citation et le texte en vigueur avec un
 *     algorithme de plus longue sous-séquence commune (LCS, le même
 *     principe que `git diff`).
 *  3. Une "substitution" = un court groupe de mots de la citation remplacé
 *     par un court groupe de mots du texte, ENTRE deux mots identiques.
 *     Ex. "est de [sept] ans" / "est de [cinq] ans".
 *  4. On regarde si une ancienne version contient les mots substitués.
 */
import { repository, versionToPlainText, type LegalRepository } from '@/data/repository';
import type { ArticleVersion, ArticleWithVersion } from '@/data/types';
import { keywords, normalize, STOPWORDS } from '@/lib/text';

export type Verdict = 'exact' | 'inexact' | 'introuvable';

/** Un mot affichable, avec son état après comparaison. */
export interface DiffWord {
  raw: string;
  changed: boolean;
}

export interface VerificationResult {
  verdict: Verdict;
  /** Article le plus proche (absent si introuvable). */
  match?: ArticleWithVersion;
  /** La citation découpée, avec les mots erronés marqués. */
  said: DiffWord[];
  /** Le texte officiel découpé, avec les mots corrects marqués. */
  official: DiffWord[];
  /** Ancienne version qui correspond à la citation, le cas échéant. */
  matchingOldVersion?: ArticleVersion;
  /** Score de proximité entre 0 et 1. */
  confidence: number;
}

/** Seuil sous lequel on considère qu'aucun article ne correspond. */
const MIN_CONFIDENCE = 0.35;
/** Taille max d'un groupe de mots substitué. */
const MAX_SUBSTITUTION = 3;

interface Word {
  raw: string;
  norm: string;
}

/** Découpe en mots en gardant la forme d'origine pour l'affichage. */
function splitWords(text: string): Word[] {
  return text
    .split(/\s+/)
    .filter(Boolean)
    .map((raw) => ({ raw, norm: normalize(raw).replace(/ /g, '') }))
    .filter((w) => w.norm.length > 0);
}

/** Proportion des mots-clés de la citation présents dans la version. */
function overlap(quoteKeywords: string[], version: ArticleVersion): number {
  if (quoteKeywords.length === 0) return 0;
  const hay = new Set(keywords(versionToPlainText(version)));
  return quoteKeywords.filter((k) => hay.has(k)).length / quoteKeywords.length;
}

type Op = { type: 'same'; a: number; b: number } | { type: 'del'; a: number } | { type: 'ins'; b: number };

/** Diff mot à mot par plus longue sous-séquence commune. */
function diff(a: Word[], b: Word[]): Op[] {
  const n = a.length;
  const m = b.length;
  // lcs[i][j] = longueur de la LCS entre a[i..] et b[j..]
  const lcs = Array.from({ length: n + 1 }, () => new Array<number>(m + 1).fill(0));
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      lcs[i]![j] = a[i]!.norm === b[j]!.norm ? lcs[i + 1]![j + 1]! + 1 : Math.max(lcs[i + 1]![j]!, lcs[i]![j + 1]!);
    }
  }
  const ops: Op[] = [];
  let i = 0;
  let j = 0;
  while (i < n && j < m) {
    if (a[i]!.norm === b[j]!.norm) ops.push({ type: 'same', a: i++, b: j++ });
    else if (lcs[i + 1]![j]! >= lcs[i]![j + 1]!) ops.push({ type: 'del', a: i++ });
    else ops.push({ type: 'ins', b: j++ });
  }
  while (i < n) ops.push({ type: 'del', a: i++ });
  while (j < m) ops.push({ type: 'ins', b: j++ });
  return ops;
}

/**
 * Repère les substitutions : un bloc de suppressions + insertions,
 * court, encadré par des mots identiques des deux côtés.
 */
function findSubstitutions(ops: Op[], a: Word[]): { said: Set<number>; official: Set<number> } {
  const said = new Set<number>();
  const official = new Set<number>();
  let k = 0;
  while (k < ops.length) {
    if (ops[k]!.type === 'same') {
      k++;
      continue;
    }
    const start = k;
    const dels: number[] = [];
    const ins: number[] = [];
    while (k < ops.length && ops[k]!.type !== 'same') {
      const op = ops[k]!;
      if (op.type === 'del') dels.push(op.a);
      if (op.type === 'ins') ins.push(op.b);
      k++;
    }
    const enclosed = start > 0 && k < ops.length;
    const meaningful = dels.some((i) => !STOPWORDS.has(a[i]!.norm));
    if (enclosed && meaningful && dels.length > 0 && ins.length > 0 && dels.length <= MAX_SUBSTITUTION && ins.length <= MAX_SUBSTITUTION) {
      dels.forEach((i) => said.add(i));
      ins.forEach((j) => official.add(j));
    }
  }
  return { said, official };
}

export function verifyQuote(quote: string, repo: LegalRepository = repository): VerificationResult {
  const quoteKeywords = keywords(quote).filter((k) => !['constitution', 'dit', 'article'].includes(k));
  const saidWords = splitWords(quote.replace(/[«»"]/g, ''));
  const empty: VerificationResult = {
    verdict: 'introuvable',
    said: saidWords.map((w) => ({ raw: w.raw, changed: false })),
    official: [],
    confidence: 0,
  };

  // 1. Meilleur article, toutes versions confondues.
  let best: { item: ArticleWithVersion; score: number } | undefined;
  for (const item of repo.listCurrentArticles()) {
    const score = Math.max(...repo.getVersions(item.article.id).map((v) => overlap(quoteKeywords, v)));
    if (!best || score > best.score) best = { item, score };
  }
  if (!best || best.score < MIN_CONFIDENCE) return { ...empty, confidence: best?.score ?? 0 };

  // 2. Alignement avec la version EN VIGUEUR.
  const current = best.item.version;
  const officialWords = splitWords(versionToPlainText(current));
  const ops = diff(saidWords, officialWords);
  const subs = findSubstitutions(ops, saidWords);

  const said = saidWords.map((w, i) => ({ raw: w.raw, changed: subs.said.has(i) }));
  const official = officialWords.map((w, j) => ({ raw: w.raw, changed: subs.official.has(j) }));

  // Mots-clés de la citation totalement absents du texte en vigueur
  // (ex. "sept" quand l'alignement n'a pas pu isoler la substitution).
  const currentHay = new Set(keywords(versionToPlainText(current)));
  const missing = quoteKeywords.filter((k) => !currentHay.has(k));
  const isExact = subs.said.size === 0 && missing.length === 0;

  // 3. La citation correspond-elle à une ancienne version ?
  let matchingOldVersion: ArticleVersion | undefined;
  if (!isExact) {
    const wrongWords = [
      ...[...subs.said].map((i) => saidWords[i]!.norm),
      ...missing,
    ].filter((w) => !STOPWORDS.has(w));
    matchingOldVersion = repo
      .getVersions(best.item.article.id)
      .filter((v) => v.id !== current.id)
      .reverse() // la plus récente d'abord
      .find((v) => {
        const hay = new Set(keywords(versionToPlainText(v)));
        return wrongWords.length > 0 && wrongWords.every((w) => hay.has(w));
      });
  }

  return {
    verdict: isExact ? 'exact' : 'inexact',
    match: best.item,
    said,
    official,
    matchingOldVersion,
    confidence: best.score,
  };
}
