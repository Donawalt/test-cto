import { randomBytes } from 'crypto';

export interface TokenPayload {
  userId: string;
  email: string;
  iat: number;
  exp: number;
}

export interface Session {
  id: string;
  userId: string;
  token: string;
  expiresAt: Date;
  createdAt: Date;
}

export function createAuthToken(
  payload: Omit<TokenPayload, 'iat' | 'exp'>,
  expiresInSeconds: number = 86400
): string {
  const now = Math.floor(Date.now() / 1000);
  const fullPayload: TokenPayload = {
    ...payload,
    iat: now,
    exp: now + expiresInSeconds,
  };

  const encoded = Buffer.from(JSON.stringify(fullPayload)).toString('base64url');
  const signature = randomBytes(32).toString('base64url');
  
  return `${encoded}.${signature}`;
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    const [encodedPayload] = token.split('.');
    if (!encodedPayload) return null;

    const payload = JSON.parse(
      Buffer.from(encodedPayload, 'base64url').toString('utf-8')
    ) as TokenPayload;

    const now = Math.floor(Date.now() / 1000);
    if (payload.exp < now) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

export function createSession(userId: string, expiresInSeconds: number = 86400): Session {
  const token = createAuthToken({ userId, email: '' }, expiresInSeconds);
  const now = new Date();
  const expiresAt = new Date(now.getTime() + expiresInSeconds * 1000);

  return {
    id: randomBytes(16).toString('hex'),
    userId,
    token,
    expiresAt,
    createdAt: now,
  };
}

export function generateApiKey(): string {
  return randomBytes(32).toString('hex');
}

export function generateSecureToken(length: number = 32): string {
  return randomBytes(length).toString('base64url');
}

export function isSessionExpired(session: Session): boolean {
  return new Date() > session.expiresAt;
}
