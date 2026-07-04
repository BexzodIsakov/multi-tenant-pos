import { Request, Response, NextFunction } from 'express';
import { UserRole } from '../utils/tokens';

export function requireRole(role: UserRole) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (req.auth?.role !== role) return res.status(403).json({ error: 'forbidden' });
    next();
  };
}
