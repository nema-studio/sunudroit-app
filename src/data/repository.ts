/**
 * ============================================================================
 * DÉPÔT DE DONNÉES (Repository pattern)
 * ============================================================================
 *
 * Les écrans ne lisent JAMAIS `corpus.ts` directement : ils passent par
 * l'interface `LegalRepository`. Le jour où le corpus vivra dans SQLite,
 * on écrira une `SqliteLegalRepository` qui implémente la même interface,
 * et aucun écran ne changera.
 *
 * L'interface est SYNCHRONE volontairement : le corpus est local (hors ligne)
 * et expo-sqlite propose des méthodes synchrones (`getAllSync`, `getFirstSync`),
 * ce qui évite des états de chargement inutiles dans l'UI.
 */
import { articles, relations, texts, versions } from './corpus';
import type { Article, ArticleVersion, ArticleWithVersion, LegalText, Relation } from './types';

export interface LegalRepository {
  getText(id: string): LegalText | undefined;
  getArticle(id: string): Article | undefined;
  /** Toutes les versions d'un article, de la plus ancienne à la plus récente. */
  getVersions(articleId: string): ArticleVersion[];
  /** Version applicable à une date donnée (aujourd'hui par défaut). */
  getVersionAt(articleId: string, date?: Date): ArticleVersion | undefined;
  /** Liens partant d'un article. */
  getRelations(articleId: string): Relation[];
  getRelation(id: string): Relation | undefined;
  /** Tous les articles avec leur version en vigueur (utilisé par la recherche). */
  listCurrentArticles(): ArticleWithVersion[];
  listTexts(): LegalText[];
}

/** Compare deux dates ISO (AAAA-MM-JJ) : l'ordre lexical suffit. */
const toIsoDay = (date: Date) => date.toISOString().slice(0, 10);

class InMemoryLegalRepository implements LegalRepository {
  getText(id: string) {
    return texts.find((t) => t.id === id);
  }

  getArticle(id: string) {
    return articles.find((a) => a.id === id);
  }

  getVersions(articleId: string) {
    return versions
      .filter((v) => v.articleId === articleId)
      .sort((a, b) => a.validFrom.localeCompare(b.validFrom));
  }

  getVersionAt(articleId: string, date: Date = new Date()) {
    const day = toIsoDay(date);
    return this.getVersions(articleId).find(
      (v) => v.validFrom <= day && (v.validTo === undefined || day < v.validTo),
    );
  }

  getRelations(articleId: string) {
    return relations.filter((r) => r.fromArticleId === articleId);
  }

  getRelation(id: string) {
    return relations.find((r) => r.id === id);
  }

  listCurrentArticles() {
    const result: ArticleWithVersion[] = [];
    for (const article of articles) {
      const version = this.getVersionAt(article.id);
      const text = this.getText(article.textId);
      if (version && text) result.push({ article, text, version });
    }
    return result;
  }

  listTexts() {
    return texts;
  }
}

/** Instance unique utilisée par toute l'application. */
export const repository: LegalRepository = new InMemoryLegalRepository();

/** Texte brut d'une version (alinéas joints), utile pour la recherche et la copie. */
export function versionToPlainText(version: ArticleVersion): string {
  return version.paragraphs.map((p) => p.segments.map((s) => s.value).join('')).join('\n');
}

/** Libellé lisible d'une date ISO : "5 avril 2016". */
export function formatDate(iso: string): string {
  return new Date(`${iso}T12:00:00Z`).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

/** Référence complète d'un article, utilisée pour la copie et le partage. */
export function articleReference({ article, text, version }: ArticleWithVersion): string {
  return `${text.title}, article ${article.number} (version issue de la ${version.amendedBy}). Source : ${text.officialSource}`;
}
