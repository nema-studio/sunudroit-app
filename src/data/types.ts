/**
 * ============================================================================
 * MODÈLE DE DONNÉES JURIDIQUE
 * ============================================================================
 *
 * Le cœur du projet : on représente le droit comme un GRAPHE de textes reliés,
 * pas comme une liste de PDF.
 *
 *   LegalText ──< Article ──< ArticleVersion
 *                    │
 *                    └──< Relation >── LegalText (cible)
 *
 * Ces types correspondent 1 pour 1 aux tables SQL de `docs/schema.sql`,
 * pour qu'on puisse passer du corpus fictif (en mémoire) à SQLite sans
 * toucher aux écrans.
 */

/** Nature d'un texte. Chaque type a sa couleur dans la charte. */
export type TextType = 'constitution' | 'loi_organique' | 'decision';

/**
 * Statut juridique. "censure" couvre le cas d'un texte adopté puis déclaré
 * contraire à la Constitution (ex. loi n°18/2026) : il existe mais ne
 * s'applique pas, l'app doit le montrer clairement.
 */
export type LegalStatus = 'en_vigueur' | 'abroge' | 'censure';

/** Une subdivision d'un texte (titre, chapitre) vers laquelle on peut sauter. */
export interface TextSection {
  id: string;
  title: string;
}

export interface LegalText {
  /** Identifiant STABLE et interne, jamais affiché. */
  id: string;
  type: TextType;
  /** Forme courte pour les puces ("LO 2016-23"). */
  shortTitle: string;
  /** Intitulé officiel ("Loi organique n°2016-23 du 14 juillet 2016"). */
  title: string;
  /** Objet du texte ("relative au Conseil constitutionnel"). */
  subtitle?: string;
  status: LegalStatus;
  /** Référence de publication officielle (Journal officiel). */
  officialSource: string;
  sections: TextSection[];
}

/**
 * Un article, indépendamment de ses versions successives.
 *
 * ATTENTION : `id` est un identifiant permanent ("const-art-92"), distinct du
 * numéro affiché. Une révision peut renuméroter un article : les favoris de
 * l'utilisateur pointent vers `id`, ils resteront donc valides.
 */
export interface Article {
  id: string;
  textId: string;
  /** Numéro affiché ("92"). */
  number: string;
  /** Chapitre ou titre auquel l'article appartient. */
  chapter: string;
  /** Résumé d'une ligne, rédigé par nous, utile pour la recherche par thème. */
  summary: string;
}

/**
 * Le contenu d'un alinéa est découpé en segments, pour pouvoir rendre
 * certains mots CLIQUABLES (renvois vers un autre texte).
 */
export type Segment =
  | { kind: 'text'; value: string }
  | { kind: 'ref'; value: string; relationId: string };

export interface Paragraph {
  segments: Segment[];
}

/** Le contenu d'un article sur une période donnée. */
export interface ArticleVersion {
  id: string;
  articleId: string;
  /** Date d'entrée en vigueur (ISO, AAAA-MM-JJ). */
  validFrom: string;
  /** Date de fin (exclue). Absente = version actuellement en vigueur. */
  validTo?: string;
  /** Texte ayant introduit cette version ("loi constitutionnelle n°2016-10..."). */
  amendedBy: string;
  paragraphs: Paragraph[];
}

/**
 * Types de liens entre textes. Ce ne sont pas des liens "génériques" :
 * l'interface les présente différemment.
 */
export type RelationType =
  | 'precise_par' // l'article renvoie à une loi organique qui le précise
  | 'cite_par' // une décision cite cet article
  | 'modifie_par'
  | 'abroge_par';

export interface Relation {
  id: string;
  fromArticleId: string;
  type: RelationType;
  targetTextId: string;
  /** Section de la cible la plus pertinente, mise en avant dans la feuille de renvoi. */
  targetSectionId?: string;
}

/** Article accompagné de sa version en vigueur : forme la plus utilisée par les écrans. */
export interface ArticleWithVersion {
  article: Article;
  text: LegalText;
  version: ArticleVersion;
}
