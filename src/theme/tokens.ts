/**
 * ============================================================================
 * JETONS DU DESIGN SYSTEM SUNUDROIT (V2)
 * ============================================================================
 *
 * Source unique des couleurs, espacements, rayons et ombres.
 * Les noms reprennent exactement ceux de Figma (collection « Couleurs »,
 * modes Clair et Sombre) : un jeton = une variable Figma.
 *
 * Règle : un écran n'écrit JAMAIS une couleur en dur. Il lit `theme.colors.x`.
 * Ainsi le passage clair / sombre ne demande aucune modification d'écran.
 */

/** Couleurs de marque : identiques dans les deux thèmes (drapeau du Sénégal). */
export const brand = {
  green: '#0F7A47',
  greenWatermark: '#138B52',
  yellow: '#F6C945',
  coral: '#EF5B3F',
  inkFixed: '#121412', // texte posé sur jaune ou corail, quel que soit le thème
  onBrand: '#FFFFFF', // texte posé sur le vert
} as const;

export interface ColorTokens {
  paper: string; // fond des écrans
  surface: string; // cartes, champs, boutons secondaires
  surfaceMuted: string; // zones inactives, rail du contrôle segmenté
  segmentActive: string; // segment sélectionné d'un contrôle segmenté
  ink: string; // texte principal et bouton principal
  inkMuted: string; // texte secondaire, références
  line: string; // bordures
  separator: string; // filets entre les lignes d'une liste
  onPrimary: string; // texte posé sur le bouton principal (ink)
  greenSoft: string; // fond des badges « en vigueur »
  greenDeep: string; // texte vert sur greenSoft
  greenText: string; // texte vert sur fond neutre
  coralSoft: string; // fond d'alerte
  yellowSoft: string; // fond de pastille jaune discrète
  onYellowSoft: string; // icône / texte sur yellowSoft
  danger: string; // actions destructives
  waveTile: string;
  omTile: string;
  overlay: string; // voile derrière une feuille modale
  navBar: string; // barre de navigation flottante
  navIcon: string; // icônes inactives de la barre
  navActive: string; // pastille de l'onglet actif
  navActiveText: string;
}

export const lightColors: ColorTokens = {
  paper: '#EDECE7',
  surface: '#FFFFFF',
  surfaceMuted: '#E2E0D8',
  segmentActive: '#FFFFFF',
  ink: '#121412',
  inkMuted: '#62635E',
  line: '#D3D1C8',
  separator: '#ECEAE3',
  onPrimary: '#FFFFFF',
  greenSoft: '#D6EBDD',
  greenDeep: '#0B5C35',
  greenText: '#0F7A47',
  coralSoft: '#FBD3CA',
  yellowSoft: '#FCE6A6',
  onYellowSoft: '#5A4A12',
  danger: '#A61E25',
  waveTile: '#DDEFFC',
  omTile: '#FDE3CF',
  overlay: 'rgba(10, 14, 11, 0.5)',
  navBar: '#121412',
  navIcon: '#C9C9C4',
  navActive: '#FFFFFF',
  navActiveText: '#121412',
};

export const darkColors: ColorTokens = {
  paper: '#121412',
  surface: '#1F221F',
  surfaceMuted: '#2A2D29',
  segmentActive: '#45493F',
  ink: '#F2F1EC',
  inkMuted: '#A3A49E',
  line: '#34372F',
  separator: '#2A2D29',
  onPrimary: '#121412',
  greenSoft: '#1B3A29',
  greenDeep: '#8FD9B0',
  greenText: '#4CC28A',
  coralSoft: '#4A2219',
  yellowSoft: '#3D3418',
  onYellowSoft: '#F6C945',
  danger: '#FF8A7A',
  waveTile: '#1B3140',
  omTile: '#40291A',
  overlay: 'rgba(0, 0, 0, 0.6)',
  navBar: '#2A2D29',
  navIcon: '#A3A49E',
  navActive: '#F2F1EC',
  navActiveText: '#121412',
};

/** Grille de 4 px. Marge d'écran : space[5] = 20. */
export const space = { 1: 4, 2: 8, 3: 12, 4: 16, 5: 20, 6: 24, 7: 32, 8: 48 } as const;

/** Rayons : étiquettes 10, tuiles 16, groupes 24, cartes héros 30, feuilles 36, pilules 999. */
export const radius = { s: 10, m: 16, l: 24, xl: 30, sheet: 36, pill: 999 } as const;

/** Tailles fixes du système (cibles tactiles de 44 px minimum). */
export const size = {
  touchMin: 44,
  iconButton: 48,
  button: 52,
  field: 56,
  chip: 38,
  navBar: 68,
  screenPadding: 20,
} as const;

/** Peu d'ombres : la profondeur vient surtout des couleurs. */
export const elevation = {
  segment: { shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 2, shadowOffset: { width: 0, height: 1 }, elevation: 1 },
  float: { shadowColor: '#101814', shadowOpacity: 0.15, shadowRadius: 30, shadowOffset: { width: 0, height: 10 }, elevation: 8 },
  sheet: { shadowColor: '#101814', shadowOpacity: 0.18, shadowRadius: 40, shadowOffset: { width: 0, height: -12 }, elevation: 16 },
} as const;
