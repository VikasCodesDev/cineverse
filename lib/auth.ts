// lib/auth.ts — Session cookie config and password hashing (Node-only; use lib/jwt for Edge)
import bcrypt from 'bcryptjs';
import { createToken, verifyToken, type SessionPayload } from '@/lib/jwt';

export type { SessionPayload } from '@/lib/jwt';
export { createToken, verifyToken, getCookieName } from '@/lib/jwt';

const COOKIE_NAME = 'cv_session';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function getSessionCookieConfig() {
  return {
    name: COOKIE_NAME,
    maxAge: COOKIE_MAX_AGE,
    path: '/',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
  };
}
