import jwt from 'jsonwebtoken';

export type UserRole = 'admin' | 'cashier';

export interface AccessTokenPayload {
  sub: string;
  tenantId: string;
  role: UserRole;
  type: 'access';
}

export interface RefreshTokenPayload {
  sub: string;
  tenantId: string;
  role: UserRole;
  type: 'refresh';
}

export function signAccessToken(payload: Omit<AccessTokenPayload, 'type'>): string {
  const secret = process.env.ACCESS_TOKEN_SECRET;
  if (!secret) throw new Error('ACCESS_TOKEN_SECRET is not set');
  return jwt.sign({ ...payload, type: 'access' }, secret, { expiresIn: '15m' });
}

export function signRefreshToken(payload: Omit<RefreshTokenPayload, 'type'>): string {
  const secret = process.env.REFRESH_TOKEN_SECRET;
  if (!secret) throw new Error('REFRESH_TOKEN_SECRET is not set');
  return jwt.sign({ ...payload, type: 'refresh' }, secret, { expiresIn: '3d' });
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  const secret = process.env.ACCESS_TOKEN_SECRET;
  if (!secret) throw new Error('ACCESS_TOKEN_SECRET is not set');
  return jwt.verify(token, secret) as AccessTokenPayload;
}

export function verifyRefreshToken(token: string): RefreshTokenPayload {
  const secret = process.env.REFRESH_TOKEN_SECRET;
  if (!secret) throw new Error('REFRESH_TOKEN_SECRET is not set');
  return jwt.verify(token, secret) as RefreshTokenPayload;
}
