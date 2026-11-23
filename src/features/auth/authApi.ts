/**
 * ============================================================================
 * API D'AUTHENTIFICATION (par e-mail, sans mot de passe)
 * ============================================================================
 *
 * Interface unique, deux implémentations :
 *  - HttpAuthApi : vrai backend Spring Boot (EXPO_PUBLIC_API_URL défini).
 *  - MockAuthApi : faux serveur local, code accepté « 123456 ».
 *
 * Endpoints attendus côté Spring Boot :
 *   POST  /api/v1/auth/email/request  { email }               -> OtpRequestResponse
 *   POST  /api/v1/auth/email/verify   { requestId, code }     -> VerifyResponse (session + isNewUser)
 *   PATCH /api/v1/me                  { firstName, lastName } -> User   (en-tête Authorization: Bearer)
 *   POST  /api/v1/auth/refresh        { refreshToken }        -> Session
 *   POST  /api/v1/auth/logout         { refreshToken }        -> 204
 * Erreurs : HTTP 4xx avec corps { "code": "INVALID_CODE" | ... } (Problem Details).
 */
import Storage from 'expo-sqlite/kv-store';
import { env } from '@/config/env';
import { AuthError, type AuthErrorCode, type OtpRequestResponse, type ProfileUpdate, type Session, type User, type VerifyResponse } from './types';

export interface AuthApi {
  requestOtp(email: string): Promise<OtpRequestResponse>;
  verifyOtp(requestId: string, code: string): Promise<VerifyResponse>;
  updateProfile(accessToken: string, profile: ProfileUpdate): Promise<User>;
  refresh(refreshToken: string): Promise<Session>;
  logout(refreshToken: string): Promise<void>;
}

/* ------------------------------------------------------------------ HTTP */

class HttpAuthApi implements AuthApi {
  constructor(private baseUrl: string) {}

  private async send<T>(method: 'POST' | 'PATCH', path: string, body: unknown, accessToken?: string): Promise<T> {
    let res: Response;
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 15000);
      res = await fetch(`${this.baseUrl}${path}`, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      });
      clearTimeout(timer);
    } catch {
      throw new AuthError('NETWORK');
    }
    if (res.status === 204) return undefined as T;
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const code = (data?.code as AuthErrorCode | undefined) ?? (res.status === 429 ? 'RATE_LIMITED' : 'UNKNOWN');
      throw new AuthError(code, data?.detail);
    }
    return data as T;
  }

  requestOtp(email: string) {
    return this.send<OtpRequestResponse>('POST', '/api/v1/auth/email/request', { email });
  }
  verifyOtp(requestId: string, code: string) {
    return this.send<VerifyResponse>('POST', '/api/v1/auth/email/verify', { requestId, code });
  }
  updateProfile(accessToken: string, profile: ProfileUpdate) {
    return this.send<User>('PATCH', '/api/v1/me', profile, accessToken);
  }
  refresh(refreshToken: string) {
    return this.send<Session>('POST', '/api/v1/auth/refresh', { refreshToken });
  }
  async logout(refreshToken: string) {
    await this.send<void>('POST', '/api/v1/auth/logout', { refreshToken });
  }
}

/* ------------------------------------------------------------------ MOCK */

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * Faux serveur pour développer sans backend.
 * Les comptes créés sont gardés sur le téléphone (kv-store), pour pouvoir
 * tester les deux parcours : nouveau compte (écran du nom) et compte existant.
 */
class MockAuthApi implements AuthApi {
  private static USERS_KEY = 'mock.users';
  private pending = new Map<string, { email: string; attempts: number; expiresAt: number }>();

  private readUsers(): Record<string, User> {
    try {
      return JSON.parse(Storage.getItemSync(MockAuthApi.USERS_KEY) ?? '{}') as Record<string, User>;
    } catch {
      return {};
    }
  }
  private writeUsers(users: Record<string, User>) {
    Storage.setItemSync(MockAuthApi.USERS_KEY, JSON.stringify(users));
  }

  async requestOtp(email: string) {
    await wait(700);
    const requestId = `req_${Date.now()}`;
    this.pending.set(requestId, { email, attempts: 0, expiresAt: Date.now() + 10 * 60_000 });
    return { requestId, expiresIn: 600, resendIn: 42 };
  }

  async verifyOtp(requestId: string, code: string): Promise<VerifyResponse> {
    await wait(800);
    const p = this.pending.get(requestId);
    if (!p || Date.now() > p.expiresAt) throw new AuthError('CODE_EXPIRED');
    if (++p.attempts > 5) throw new AuthError('TOO_MANY_ATTEMPTS');
    if (code !== '123456') throw new AuthError('INVALID_CODE');
    this.pending.delete(requestId);

    const users = this.readUsers();
    const existing = users[p.email];
    const user: User = existing ?? { id: `u_${Date.now()}`, email: p.email, firstName: null, lastName: null };
    if (!existing) this.writeUsers({ ...users, [p.email]: user });
    return {
      accessToken: `mock-access:${p.email}`,
      refreshToken: 'mock-refresh',
      expiresAt: Date.now() + 15 * 60_000,
      user,
      isNewUser: !existing,
    };
  }

  async updateProfile(accessToken: string, profile: ProfileUpdate): Promise<User> {
    await wait(500);
    const email = accessToken.replace('mock-access:', '');
    const users = this.readUsers();
    const current = users[email];
    if (!current) throw new AuthError('UNKNOWN');
    const updated: User = { ...current, firstName: profile.firstName, lastName: profile.lastName };
    this.writeUsers({ ...users, [email]: updated });
    return updated;
  }

  async refresh(): Promise<Session> {
    throw new AuthError('UNKNOWN', 'Le faux serveur ne gère pas le rafraîchissement.');
  }

  async logout() {
    await wait(200);
  }
}

export const authApi: AuthApi = env.useMockApi ? new MockAuthApi() : new HttpAuthApi(env.apiUrl);
