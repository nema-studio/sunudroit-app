/**
 * Stockage de la session.
 *  - Jetons : expo-secure-store (Keychain iOS / Keystore Android), chiffré.
 *  - Drapeau « bienvenue vue » : kv-store (non sensible, lecture synchrone).
 */
import * as SecureStore from 'expo-secure-store';
import Storage from 'expo-sqlite/kv-store';
import type { Session } from './types';

const SESSION_KEY = 'sunudroit.session';
const ONBOARDED_KEY = 'app.onboarded';

export async function loadSession(): Promise<Session | null> {
  try {
    const raw = await SecureStore.getItemAsync(SESSION_KEY);
    if (!raw) return null;
    const session = JSON.parse(raw) as Session;
    // Session d'un ancien format (connexion par téléphone) : on l'ignore,
    // l'utilisateur se reconnecte simplement par e-mail.
    if (typeof session.user?.email !== 'string') {
      await clearSession();
      return null;
    }
    return session;
  } catch {
    return null;
  }
}

export async function saveSession(s: Session): Promise<void> {
  await SecureStore.setItemAsync(SESSION_KEY, JSON.stringify(s));
}

export async function clearSession(): Promise<void> {
  await SecureStore.deleteItemAsync(SESSION_KEY);
}

export function hasOnboarded(): boolean {
  return Storage.getItemSync(ONBOARDED_KEY) === '1';
}

export function setOnboarded(): void {
  Storage.setItemSync(ONBOARDED_KEY, '1');
}

/** Outil de développement : l'app se comporte de nouveau comme au premier lancement. */
export function clearOnboarded(): void {
  Storage.removeItemSync(ONBOARDED_KEY);
}
