/**
 * ============================================================================
 * ADRESSES E-MAIL
 * ============================================================================
 * Fonctions PURES (sans React), testées par scripts/check-auth.ts.
 *
 * La validation locale reste volontairement simple : elle attrape les fautes
 * de frappe évidentes avant tout appel réseau. La vraie preuve que l'adresse
 * existe et appartient à l'utilisateur, c'est le code reçu par e-mail.
 */

/** Forme stockée et envoyée au serveur : sans espaces, en minuscules. */
export function normalizeEmail(input: string): string {
  return input.trim().toLowerCase();
}

/** Un « @ », un nom de domaine avec au moins un point, pas d'espace. */
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export type EmailError = 'empty' | 'invalid' | null;

export function validateEmail(input: string): EmailError {
  const email = normalizeEmail(input);
  if (email.length === 0) return 'empty';
  if (!EMAIL_PATTERN.test(email)) return 'invalid';
  return null;
}

export function emailErrorMessage(error: EmailError): string | null {
  if (error === 'empty') return 'Indiquez votre adresse e-mail.';
  if (error === 'invalid') return 'Cette adresse ne semble pas valide (exemple : awa@gmail.com).';
  return null;
}

/** « awa.ndiaye@gmail.com » → « a•••@gmail.com » (affichage discret). */
export function maskEmail(email: string): string {
  const [local = '', domain = ''] = normalizeEmail(email).split('@');
  if (!domain) return email;
  return `${local.slice(0, 1)}•••@${domain}`;
}
