/**
 * Les trois collections de textes : un type de texte chacune, une couleur
 * du drapeau chacune (vert, jaune, rouge). Utilisées par l'accueil
 * (CollectionCards) et par le filtre de la recherche.
 */
import type { TextType } from '@/data/types';
import { brand } from '@/theme';

export type CollectionId = 'constitution' | 'lois' | 'decisions';

export interface Collection {
  id: CollectionId;
  /** Type de texte correspondant dans le corpus (filtre de recherche). */
  textType: TextType;
  chip: string;
  /** Phrase courte sous le titre d'une tuile. */
  summary: string;
  eyebrow: string; // référence en mono
  title: string;
  cta: string;
  bg: string;
  fg: string; // texte sur la carte
  muted: string; // texte secondaire sur la carte
  watermark: string; // couleur du filigrane (balance)
  tagLabel: string;
}

export const COLLECTIONS: Collection[] = [
  {
    id: 'constitution',
    textType: 'constitution',
    chip: 'Constitution',
    summary: 'Texte consolidé, en vigueur',
    eyebrow: 'LOI N°2001-03 · TEXTE CONSOLIDÉ',
    title: 'Constitution\ndu Sénégal',
    cta: 'Explorer les articles',
    bg: brand.green,
    fg: '#FFFFFF',
    muted: '#D6EBDD',
    watermark: brand.greenWatermark,
    tagLabel: 'EN VIGUEUR',
  },
  {
    id: 'lois',
    textType: 'loi_organique',
    chip: 'Lois organiques',
    summary: 'Précisent la Constitution',
    eyebrow: 'PRÉCISENT LA CONSTITUTION',
    title: 'Lois\norganiques',
    cta: 'Voir les lois organiques',
    bg: brand.yellow,
    fg: brand.inkFixed,
    muted: '#5A4A12',
    watermark: '#EDB92C',
    tagLabel: '● EN VIGUEUR',
  },
  {
    id: 'decisions',
    textType: 'decision',
    chip: 'Décisions',
    summary: 'Du Conseil constitutionnel',
    eyebrow: 'CONSEIL CONSTITUTIONNEL',
    title: 'Décisions\nrécentes',
    cta: 'Voir les décisions',
    bg: brand.coral,
    fg: brand.inkFixed,
    muted: '#5C1E12',
    watermark: '#E04A2E',
    tagLabel: 'JURISPRUDENCE',
  },
];

/** Retrouve une collection par son identifiant (ex. : paramètre d'URL). */
export function findCollection(id: string | undefined): Collection | undefined {
  return COLLECTIONS.find((c) => c.id === id);
}
