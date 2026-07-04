import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { User } from '../models/User';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/tokens';

const REFRESH_COOKIE_NAME = 'refreshToken';

const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: process.env.NODE_ENV === 'production',
  path: '/api/auth/refresh',
  maxAge: 3 * 24 * 60 * 60 * 1000 // 3 days, in ms
};

export async function login(req: Request, res: Response) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'missing_credentials' });
  }

  // The one and only place in the app that queries User without a tenant filter,
  // the tenant is discovered from the email, not known yet at this point.
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(401).json({ error: 'invalid_credentials' });
  }

  const passwordMatches = await bcrypt.compare(password, user.passwordHash);
  if (!passwordMatches) {
    return res.status(401).json({ error: 'invalid_credentials' });
  }

  const tokenPayload = {
    sub: user._id.toString(),
    tenantId: user.tenantId.toString(),
    role: user.role
  };

  const accessToken = signAccessToken(tokenPayload);
  const refreshToken = signRefreshToken(tokenPayload);

  res.cookie(REFRESH_COOKIE_NAME, refreshToken, REFRESH_COOKIE_OPTIONS);
  res.json({ accessToken });
}

export async function refresh(req: Request, res: Response) {
  const token = req.cookies?.[REFRESH_COOKIE_NAME];
  if (!token) {
    return res.status(401).json({ error: 'invalid_refresh_token' });
  }

  let payload;
  try {
    payload = verifyRefreshToken(token);
  } catch {
    return res.status(401).json({ error: 'invalid_refresh_token' });
  }

  if (payload.type !== 'refresh') {
    return res.status(401).json({ error: 'invalid_refresh_token' });
  }

  const accessToken = signAccessToken({
    sub: payload.sub,
    tenantId: payload.tenantId,
    role: payload.role
  });

  res.json({ accessToken });
}

export function logout(_req: Request, res: Response) {
  res.clearCookie(REFRESH_COOKIE_NAME, { path: REFRESH_COOKIE_OPTIONS.path });
  res.status(200).json({ status: 'ok' });
}
