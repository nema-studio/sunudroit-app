/**
 * Contrat d'échange avec le backend (DTO). Les noms suivent l'API Spring Boot.
 *
 * Authentification par e-mail, sans mot de passe :
 *   1. l'utilisateur donne son e-mail, le serveur y envoie un code à 6 chiffres ;
 *   2. il saisit le code : le serveur crée le compte s'il n'existe pas ;
 *   3. pour un nouveau compte, il donne son prénom (obligatoire) et son nom (facultatif).
 */

/** Réponse à une demande de code (POST /auth/email/request). */
export interface OtpRequestResponse {
  /** Identifiant de la demande, renvoyé à la vérification. */
  requestId: string;
  /** Durée de validité du code, en secondes. */
  expiresIn: number;
  /** Délai minimal avant de pouvoir redemander un code, en secondes. */
  resendIn: number;
}

export interface User {
  id: string;
  /** Adresse e-mail normalisée (minuscules). */
  email: string;
  /** Prénom. `null` tant que l'utilisateur ne l'a pas renseigné (nouveau compte). */
  firstName: string | null;
  /** Nom de famille, facultatif. */
  lastName: string | null;
}

export interface Session {
  accessToken: string; // JWT courte durée (15 min)
  refreshToken: string; // rotation à chaque usage
  expiresAt: number; // horodatage ms de fin de l'accessToken
  user: User;
}

/** Réponse à la vérification du code (POST /auth/email/verify). */
export interface VerifyResponse extends Session {
  /** Vrai si le compte vient d'être créé : l'app demande alors le nom. */
  isNewUser: boolean;
}

/** Corps de PATCH /me (compléter ou modifier le profil). */
export interface ProfileUpdate {
  firstName: string;
  lastName: string | null;
}

/** Erreurs métier attendues : l'écran affiche un message adapté pour chacune. */
export type AuthErrorCode =
  | 'INVALID_EMAIL'
  | 'INVALID_CODE'
  | 'CODE_EXPIRED'
  | 'TOO_MANY_ATTEMPTS'
  | 'RATE_LIMITED'
  | 'NETWORK'
  | 'UNKNOWN';

export class AuthError extends Error {
  constructor(public code: AuthErrorCode, message?: string) {
    super(message ?? code);
  }
}

export function authErrorMessage(code: AuthErrorCode): string {
  switch (code) {
    case 'INVALID_EMAIL': return 'Cette adresse e-mail n’est pas valide.';
    case 'INVALID_CODE': return 'Code incorrect. Vérifiez l’e-mail et réessayez.';
    case 'CODE_EXPIRED': return 'Ce code a expiré. Demandez-en un nouveau.';
    case 'TOO_MANY_ATTEMPTS': return 'Trop d’essais. Demandez un nouveau code.';
    case 'RATE_LIMITED': return 'Trop de demandes. Patientez une minute.';
    case 'NETWORK': return 'Pas de connexion. Les textes restent lisibles hors ligne.';
    default: return 'Un souci de notre côté. Réessayez.';
  }
}

/** « Awa Ndiaye », ou seulement le prénom, ou `null` si le profil est vide. */
export function fullName(user: Pick<User, 'firstName' | 'lastName'>): string | null {
  const name = [user.firstName, user.lastName].filter(Boolean).join(' ').trim();
  return name.length > 0 ? name : null;
}
