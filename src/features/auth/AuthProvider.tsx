/**
 * ============================================================================
 * ÉTAT D'AUTHENTIFICATION
 * ============================================================================
 *
 * Le compte est FACULTATIF : lire, chercher et vérifier marchent sans compte.
 * On distingue donc trois choses :
 *  - status   : 'loading' (lecture du stockage) | 'guest' | 'signedIn'
 *  - onboarded: l'écran de bienvenue a-t-il déjà été vu ?
 *  - pending  : la demande de code en cours (entre « Connexion » et « Code »)
 *
 * Parcours (un seul pour l'inscription et la connexion) :
 *   requestCode(email) → verifyCode(code) → { isNewUser }
 *   → si nouveau compte : updateProfile({ firstName, lastName })
 *
 * Le routage (src/app/_layout.tsx) lit cet état avec Stack.Protected :
 * pas de redirection manuelle dans les écrans.
 */
import { createContext, use, useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { authApi } from './authApi';
import { clearOnboarded, clearSession, hasOnboarded, loadSession, saveSession, setOnboarded } from './sessionStore';
import type { OtpRequestResponse, ProfileUpdate, Session, User } from './types';

type Status = 'loading' | 'guest' | 'signedIn';

interface PendingOtp extends OtpRequestResponse {
  /** Adresse à laquelle le code a été envoyé. */
  email: string;
  requestedAt: number;
}

interface AuthContextValue {
  status: Status;
  user: User | null;
  onboarded: boolean;
  pending: PendingOtp | null;
  completeOnboarding: () => void;
  /** Outil de développement : réaffiche Bienvenue (les gardes de _layout.tsx redirigent). */
  resetOnboarding: () => void;
  /** Envoie un code à 6 chiffres à cette adresse (déjà normalisée). */
  requestCode: (email: string) => Promise<OtpRequestResponse>;
  /** Vérifie le code ; `isNewUser` indique qu'il faut demander le nom. */
  verifyCode: (code: string) => Promise<{ isNewUser: boolean }>;
  /** Enregistre le prénom et le nom de l'utilisateur connecté. */
  updateProfile: (profile: ProfileUpdate) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<Status>('loading');
  const [session, setSession] = useState<Session | null>(null);
  const [onboarded, setOnboardedState] = useState<boolean>(hasOnboarded);
  const [pending, setPending] = useState<PendingOtp | null>(null);

  // Lecture de la session au démarrage.
  useEffect(() => {
    loadSession().then((s) => {
      setSession(s);
      setStatus(s ? 'signedIn' : 'guest');
    });
  }, []);

  const completeOnboarding = useCallback(() => {
    setOnboarded();
    setOnboardedState(true);
  }, []);

  const resetOnboarding = useCallback(() => {
    clearOnboarded();
    setOnboardedState(false);
  }, []);

  const requestCode = useCallback(async (email: string) => {
    const res = await authApi.requestOtp(email);
    setPending({ ...res, email, requestedAt: Date.now() });
    return res;
  }, []);

  const verifyCode = useCallback(
    async (code: string) => {
      if (!pending) throw new Error('Aucune demande de code en cours.');
      const { isNewUser, ...s } = await authApi.verifyOtp(pending.requestId, code);
      await saveSession(s);
      setSession(s);
      setPending(null);
      setStatus('signedIn');
      // Se connecter vaut « bienvenue vue » : on ne la remontre plus.
      setOnboarded();
      setOnboardedState(true);
      // Un compte existant sans prénom (parcours interrompu) repasse par l'écran du nom.
      return { isNewUser: isNewUser || !s.user.firstName };
    },
    [pending],
  );

  const updateProfile = useCallback(
    async (profile: ProfileUpdate) => {
      if (!session) throw new Error('Aucune session.');
      const user = await authApi.updateProfile(session.accessToken, profile);
      const next = { ...session, user };
      await saveSession(next);
      setSession(next);
    },
    [session],
  );

  const signOut = useCallback(async () => {
    const token = session?.refreshToken;
    await clearSession();
    setSession(null);
    setStatus('guest');
    // Le serveur révoque le jeton ; si le réseau manque, la session locale est déjà effacée.
    if (token) authApi.logout(token).catch(() => {});
  }, [session]);

  const value = useMemo<AuthContextValue>(
    () => ({ status, user: session?.user ?? null, onboarded, pending, completeOnboarding, resetOnboarding, requestCode, verifyCode, updateProfile, signOut }),
    [status, session, onboarded, pending, completeOnboarding, resetOnboarding, requestCode, verifyCode, updateProfile, signOut],
  );

  return <AuthContext value={value}>{children}</AuthContext>;
}

export function useAuth(): AuthContextValue {
  const ctx = use(AuthContext);
  if (!ctx) throw new Error('useAuth doit être utilisé dans <AuthProvider>.');
  return ctx;
}
