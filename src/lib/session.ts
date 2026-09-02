import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const SECRET_KEY = process.env.JWT_SECRET || 'vamtech_portal_secure_jwt_secret_key_2026_99887766';
const key = new TextEncoder().encode(SECRET_KEY);

export interface UserSession {
  id: string;
  email: string;
  name: string;
  role: 'employee' | 'admin';
  refNumber?: string;
  mustResetPassword?: boolean;
}

export const SESSION_COOKIE_NAME = 'vamtech_portal_session';

/**
 * Encrypt session data into JWT
 */
export async function encrypt(payload: UserSession) {
  return await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(key);
}

/**
 * Decrypt & verify session JWT token
 */
export async function decrypt(token: string): Promise<UserSession | null> {
  try {
    const { payload } = await jwtVerify(token, key, {
      algorithms: ['HS256'],
    });
    return payload as unknown as UserSession;
  } catch (error) {
    return null;
  }
}

/**
 * Create HTTP-only session cookie
 */
export async function createSession(user: UserSession) {
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
  const sessionToken = await encrypt(user);

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    expires: expiresAt,
    sameSite: 'lax',
    path: '/',
    // Scope strictly to domain
    ...(process.env.COOKIE_DOMAIN ? { domain: process.env.COOKIE_DOMAIN } : {}),
  });
}

/**
 * Get current authenticated user session from cookie
 */
export async function getSession(): Promise<UserSession | null> {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!sessionToken) return null;
  return await decrypt(sessionToken);
}

/**
 * Destroy session cookie (logout)
 */
export async function destroySession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}
