/**
 * ============================================================================
 * MOUVEMENT
 * ============================================================================
 *
 * Toutes les animations de l'app viennent d'ici : mêmes durées, mêmes
 * courbes, donc un mouvement cohérent d'un écran à l'autre.
 *
 * Principes (dans l'esprit des Human Interface Guidelines d'Apple) :
 *  - AUCUN REBOND. Pas de ressorts élastiques, pas de dépassement : des
 *    courbes qui décélèrent doucement, comme un objet qui se pose.
 *  - Des distances courtes (8 à 16 px) : on suggère le mouvement, on ne le
 *    met pas en scène.
 *  - Des durées brèves : 150 ms pour un retour tactile, 250-450 ms pour une
 *    apparition. Au-delà, l'interface paraît lente.
 *  - « Réduire les animations » du téléphone est respecté
 *    (ReduceMotion.System, valeur par défaut de Reanimated, rendue explicite).
 */
import {
  Easing,
  FadeIn,
  FadeInDown,
  FadeOut,
  LinearTransition,
  ReduceMotion,
  type WithTimingConfig,
} from 'react-native-reanimated';

/** Courbes d'accélération (cubic-bezier). */
export const easing = {
  /** Sortie douce : rapide au départ, se pose lentement. Apparitions, déplacements. */
  out: Easing.bezier(0.22, 1, 0.36, 1),
  /** Standard : accélère puis décélère. Changement d'état sur place. */
  standard: Easing.bezier(0.4, 0, 0.2, 1),
  /** Entrée : démarre lentement. Éléments qui quittent l'écran. */
  in: Easing.bezier(0.4, 0, 1, 1),
} as const;

/** Durées en millisecondes. */
export const duration = {
  /** Retour tactile (appui, relâchement). */
  press: 140,
  /** Petit changement d'état (couleur, opacité). */
  fast: 200,
  /** Apparition d'un élément, déplacement de carte. */
  base: 320,
  /** Entrée d'un écran ou d'un groupe d'éléments. */
  slow: 450,
} as const;

/** Décalage entre deux éléments qui apparaissent en cascade. */
export const STAGGER = 60;

/** Configurations prêtes pour withTiming(). */
export const timing = {
  press: { duration: duration.press, easing: easing.standard, reduceMotion: ReduceMotion.System },
  fast: { duration: duration.fast, easing: easing.standard, reduceMotion: ReduceMotion.System },
  base: { duration: duration.base, easing: easing.out, reduceMotion: ReduceMotion.System },
  slow: { duration: duration.slow, easing: easing.out, reduceMotion: ReduceMotion.System },
} satisfies Record<string, WithTimingConfig>;

/**
 * Apparition standard d'un bloc : fondu + légère montée (8 px).
 * `index` décale l'apparition pour un effet de cascade discret.
 *
 *   <Animated.View entering={enter(2)}>…</Animated.View>
 */
export function enter(index = 0) {
  return FadeInDown.duration(duration.slow)
    .delay(index * STAGGER)
    .easing(easing.out)
    .withInitialValues({ opacity: 0, transform: [{ translateY: 8 }] })
    .reduceMotion(ReduceMotion.System);
}

/** Apparition en fondu seul (sans déplacement). */
export function fadeIn(delay = 0) {
  return FadeIn.duration(duration.base).delay(delay).easing(easing.out).reduceMotion(ReduceMotion.System);
}

/** Disparition en fondu. */
export const fadeOut = FadeOut.duration(duration.fast).easing(easing.in).reduceMotion(ReduceMotion.System);

/** Réorganisation de mise en page (éléments qui glissent à leur nouvelle place). */
export const layoutTransition = LinearTransition.duration(duration.base).easing(easing.out).reduceMotion(ReduceMotion.System);
