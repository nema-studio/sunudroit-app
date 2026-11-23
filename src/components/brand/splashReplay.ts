/**
 * Rejouer l'écran d'ouverture animé (outil de développement).
 *
 * Un petit « store » sans bibliothèque : un compteur et une liste d'abonnés.
 * `replaySplash()` incrémente le compteur ; `useSplashReplayCount()` le lit
 * avec `useSyncExternalStore` (le hook React prévu pour suivre une source de
 * données extérieure à React), ce qui redéclenche l'écran dans `_layout.tsx`.
 */
import { useSyncExternalStore } from 'react';

let replayCount = 0;
const listeners = new Set<() => void>();

/** Demande à l'app de rejouer l'écran d'ouverture. */
export function replaySplash(): void {
  replayCount += 1;
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** Nombre de demandes de relecture depuis le lancement (0 au départ). */
export function useSplashReplayCount(): number {
  return useSyncExternalStore(subscribe, () => replayCount);
}
