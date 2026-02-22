// lib/jwt.ts — JWT only (Edge-safe, no bcrypt)
import { SignJWT, jwtVerify } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET || 'cineverse-dev-secret-change-in-production';
const secret = new TextEncoder().encode(JWT_SECRET);

export interface SessionPayload {
  userId: string;
  email: string;
  name: string;
  iat?: number;
  exp?: number;
}

export async function createToken(payload: SessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secret);
}

export async function verifyToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret);
    const userId = payload.userId as string;
    const email = payload.email as string;
    const name = payload.name as string;
    if (!userId || !email) return null;
    return { userId, email, name };
  } catch {
    return null;
  }
}

export function getCookieName() {
  return 'cv_session';
}
