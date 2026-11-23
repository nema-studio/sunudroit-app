/**
 * ============================================================================
 * CORPUS DE DÉMONSTRATION
 * ============================================================================
 *
 * ⚠️  DONNÉES ILLUSTRATIVES, À VÉRIFIER AVANT TOUTE PUBLICATION.
 *
 * Ces extraits servent à faire tourner le prototype. Le libellé exact des
 * articles, les dates et les références au Journal officiel doivent être
 * repris d'une version consolidée officielle (Conseil constitutionnel,
 * Journal officiel) puis relus.
 *
 * Étape suivante du projet : remplacer ce fichier par une base SQLite
 * générée par un script d'import (voir docs/ARCHITECTURE.md).
 */
import type { Article, ArticleVersion, LegalText, Relation } from './types';

const JORS = 'Journal officiel de la République du Sénégal [référence à compléter]';

export const texts: LegalText[] = [
  {
    id: 'constitution-2001',
    type: 'constitution',
    shortTitle: 'Constitution',
    title: 'Constitution du 22 janvier 2001',
    subtitle: 'texte consolidé',
    status: 'en_vigueur',
    officialSource: JORS,
    sections: [],
  },
  {
    id: 'lo-2016-23',
    type: 'loi_organique',
    shortTitle: 'LO 2016-23',
    title: 'Loi organique n°2016-23 du 14 juillet 2016',
    subtitle: 'relative au Conseil constitutionnel',
    status: 'en_vigueur',
    officialSource: JORS,
    // Plan simplifié, à remplacer par le vrai plan du texte.
    sections: [
      { id: 'organisation', title: 'Organisation du Conseil' },
      { id: 'competences', title: 'Compétences du Conseil' },
      { id: 'procedure', title: 'Procédure devant le Conseil' },
    ],
  },
  {
    id: 'decision-4-c-2026',
    type: 'decision',
    shortTitle: 'Décision 4/C/2026',
    title: 'Décision n°4/C/2026 du 13 mai 2026',
    subtitle: 'avis sur un projet de loi de révision constitutionnelle',
    status: 'en_vigueur',
    officialSource: JORS,
    sections: [],
  },
];

export const articles: Article[] = [
  {
    id: 'const-art-1',
    textId: 'constitution-2001',
    number: '1',
    chapter: "De l'État et de la souveraineté",
    summary: 'Caractère laïque, démocratique et social de la République',
  },
  {
    id: 'const-art-27',
    textId: 'constitution-2001',
    number: '27',
    chapter: 'Du Président de la République',
    summary: 'Durée et limitation du mandat présidentiel',
  },
  {
    id: 'const-art-92',
    textId: 'constitution-2001',
    number: '92',
    chapter: 'Du Conseil constitutionnel',
    summary: 'Compétences du Conseil constitutionnel',
  },
];

/** Petit utilitaire pour écrire un alinéa sans renvoi. */
const p = (value: string) => ({ segments: [{ kind: 'text' as const, value }] });

export const versions: ArticleVersion[] = [
  {
    id: 'const-art-1@2001',
    articleId: 'const-art-1',
    validFrom: '2001-01-22',
    amendedBy: 'texte originel de 2001',
    paragraphs: [
      p(
        "La République du Sénégal est laïque, démocratique et sociale. Elle assure l'égalité devant la loi de tous les citoyens, sans distinction d'origine, de race, de sexe, de religion. Elle respecte toutes les croyances.",
      ),
    ],
  },

  // L'article 27 a connu plusieurs rédactions : c'est l'exemple parfait
  // pour montrer pourquoi l'historique des versions est indispensable.
  {
    id: 'const-art-27@2001',
    articleId: 'const-art-27',
    validFrom: '2001-01-22',
    validTo: '2008-10-21',
    amendedBy: 'texte originel de 2001',
    paragraphs: [
      p('La durée du mandat du Président de la République est de cinq ans. Le mandat est renouvelable une seule fois.'),
    ],
  },
  {
    id: 'const-art-27@2008',
    articleId: 'const-art-27',
    validFrom: '2008-10-21',
    validTo: '2016-04-05',
    amendedBy: 'loi constitutionnelle n°2008-66 du 21 octobre 2008',
    paragraphs: [
      p('La durée du mandat du Président de la République est de sept ans. Le mandat est renouvelable une seule fois.'),
    ],
  },
  {
    id: 'const-art-27@2016',
    articleId: 'const-art-27',
    validFrom: '2016-04-05',
    amendedBy: 'loi constitutionnelle n°2016-10 du 5 avril 2016',
    paragraphs: [
      p(
        'La durée du mandat du Président de la République est de cinq ans. Nul ne peut exercer plus de deux mandats consécutifs.',
      ),
    ],
  },

  {
    id: 'const-art-92@2016',
    articleId: 'const-art-92',
    validFrom: '2016-04-05',
    amendedBy: 'loi constitutionnelle n°2016-10 du 5 avril 2016',
    paragraphs: [
      p(
        "Le Conseil constitutionnel connaît de la constitutionnalité des lois, des règlements intérieurs des assemblées et des engagements internationaux, ainsi que des conflits de compétence entre l'Exécutif et le Législatif.",
      ),
      p('Il peut être saisi par le Président de la République pour avis.'),
      {
        segments: [
          { kind: 'text', value: 'Une ' },
          // Ce segment est un RENVOI : il devient un lien dans l'interface.
          { kind: 'ref', value: 'loi organique', relationId: 'rel-92-lo' },
          { kind: 'text', value: ' détermine les autres compétences du Conseil constitutionnel.' },
        ],
      },
    ],
  },
];

export const relations: Relation[] = [
  {
    id: 'rel-92-lo',
    fromArticleId: 'const-art-92',
    type: 'precise_par',
    targetTextId: 'lo-2016-23',
    targetSectionId: 'competences',
  },
  {
    id: 'rel-92-dec',
    fromArticleId: 'const-art-92',
    type: 'cite_par',
    targetTextId: 'decision-4-c-2026',
  },
];

/** Date de dernière vérification du corpus, affichée à l'utilisateur. */
export const corpusCheckedAt = '2026-11-21';
