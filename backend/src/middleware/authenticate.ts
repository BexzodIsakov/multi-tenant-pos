import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { verifyAccessToken } from '../utils/tokens';

export function authenticate(req: Request, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'missing_token' });

  let payload;
  try {
    payload = verifyAccessToken(token);
  } catch {
    return res.status(401).json({ error: 'invalid_token' });
  }

  if (payload.type !== 'access') {
    return res.status(401).json({ error: 'invalid_token' });
  }

  if (!payload.tenantId || !mongoose.isValidObjectId(payload.tenantId)) {
    return res.status(401).json({ error: 'invalid_tenant' });
  }

  req.auth = { userId: payload.sub, tenantId: payload.tenantId, role: payload.role };
  next();
}
