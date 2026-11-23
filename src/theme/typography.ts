/**
 * ============================================================================
 * TYPOGRAPHIE
 * ============================================================================
 *
 * Une seule famille : Inter (Rasmus Andersson, licence SIL OFL).
 *
 * Pourquoi une seule famille ?
 *  Les produits de référence (Apple, Zara, Linear, Stripe…) tirent leur
 *  aspect premium d'une linéale unique, parfaitement maîtrisée : la
 *  hiérarchie vient de la TAILLE et de la GRAISSE, pas d'un mélange de
 *  polices. Inter est dessinée pour l'écran, très lisible en petite taille,
 *  proche de SF Pro d'Apple, avec un rendu identique sur iOS et Android.
 *
 * Règles d'usage :
 *  - Titres en SemiBold avec un interlettrage resserré : c'est le réglage
 *    recommandé par l'auteur d'Inter pour les grandes tailles (environ
 *    -2 % de la taille à 30 px, -1,5 % à 20 px).
 *  - Les références juridiques (« CONSTITUTION · ART. 92 ») sont en
 *    capitales légèrement espacées : sobres, sans effet « code informatique ».
 *  - En React Native, la graisse se choisit par le NOM de la police chargée
 *    (pas avec fontWeight) : on passe toujours par `fonts.xxx`, et les écrans
 *    passent par les rôles de `type` ci-dessous.
 */
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
import type { TextStyle } from 'react-native';

/** À passer à useFonts() : nom logique → fichier de police. */
export const fontAssets = {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
};

/**
 * Graisses disponibles. Les écrans n'y accèdent pas directement : ils
 * utilisent les rôles de `type` (changer de police ne touche que ce fichier).
 */
export const fonts = {
  /** Titres. */
  heading: 'Inter_600SemiBold',
  /** Texte courant. */
  text: 'Inter_400Regular',
  /** Chiffres mis en avant. */
  textMedium: 'Inter_500Medium',
  /** Boutons, texte appuyé, références. */
  textSemi: 'Inter_600SemiBold',
  /** Rare : mise en avant forte. */
  textBold: 'Inter_700Bold',
} as const;

/** Chiffres de même largeur : les numéros et les codes restent alignés. */
const tabular: TextStyle['fontVariant'] = ['tabular-nums'];

/**
 * ÉCHELLE TYPOGRAPHIQUE : la seule source des tailles et des graisses.
 *
 * Règle stricte : un écran choisit un rôle (`<Text variant="bodySmall">`),
 * il ne fixe JAMAIS `fontSize` ni `fontFamily` lui-même. C'est ce qui garantit
 * un rendu homogène d'un écran à l'autre.
 *
 *   Rôle             Graisse    Taille/interligne  Usage
 *   ───────────────  ─────────  ─────────────────  ─────────────────────────────────
 *   displayXl        semibold   40 / 46            très grands titres (rare)
 *   headingL         semibold   30 / 36            titre d'écran, titre de carte
 *   headingM         semibold   22 / 28            titre d'état vide, nom du profil
 *   headingS         semibold   20 / 26            titre de section, barre du haut
 *   body             regular    16 / 24            texte courant, descriptions
 *   bodyStrong       semibold   16 / 22            titres de ligne, liens dans le texte
 *   bodySmall        regular    14 / 20            textes secondaires, extraits
 *   bodySmallStrong  semibold   14 / 20            puces, onglets, petits liens
 *   button           semibold   16 / 20            boutons
 *   input            regular    17 / 22            champs de saisie
 *   caption          regular    12 / 16            mentions, messages d'erreur
 *   captionStrong    semibold   12 / 16            mot appuyé dans une mention
 *   ref              semibold   11 / 14 capitales  références (« CONSTITUTION · ART. 92 »)
 *   label            = ref                         titres de groupe (« APPARENCE »)
 *   numeric          medium     24 / 30 tabulaire  chiffres seuls (code, n° d'article)
 */
// Pas de chiffres tabulaires ici : dans Inter, ils élargissent aussi les tirets (« 2001-03 »).
const refStyle = { fontFamily: fonts.textSemi, fontSize: 11, lineHeight: 14, letterSpacing: 0.8 } satisfies TextStyle;

export const type = {
  displayXl: { fontFamily: fonts.heading, fontSize: 40, lineHeight: 46, letterSpacing: -1 },
  headingL: { fontFamily: fonts.heading, fontSize: 30, lineHeight: 36, letterSpacing: -0.6 },
  headingM: { fontFamily: fonts.heading, fontSize: 22, lineHeight: 28, letterSpacing: -0.4 },
  headingS: { fontFamily: fonts.heading, fontSize: 20, lineHeight: 26, letterSpacing: -0.3 },
  /** Corps d'un article de loi : grand interligne pour une lecture longue. */
  legal: { fontFamily: fonts.text, fontSize: 17, lineHeight: 28, letterSpacing: -0.2 },
  body: { fontFamily: fonts.text, fontSize: 16, lineHeight: 24, letterSpacing: -0.2 },
  bodyStrong: { fontFamily: fonts.textSemi, fontSize: 16, lineHeight: 22, letterSpacing: -0.2 },
  bodySmall: { fontFamily: fonts.text, fontSize: 14, lineHeight: 20, letterSpacing: -0.1 },
  bodySmallStrong: { fontFamily: fonts.textSemi, fontSize: 14, lineHeight: 20, letterSpacing: -0.1 },
  button: { fontFamily: fonts.textSemi, fontSize: 16, lineHeight: 20, letterSpacing: -0.2 },
  input: { fontFamily: fonts.text, fontSize: 17, lineHeight: 22, letterSpacing: -0.2 },
  caption: { fontFamily: fonts.text, fontSize: 12, lineHeight: 16 },
  captionStrong: { fontFamily: fonts.textSemi, fontSize: 12, lineHeight: 16 },
  ref: refStyle,
  label: refStyle,
  numeric: { fontFamily: fonts.textMedium, fontSize: 24, lineHeight: 30, letterSpacing: -0.3, fontVariant: tabular },
} satisfies Record<string, TextStyle>;

export type TypeVariant = keyof typeof type;
