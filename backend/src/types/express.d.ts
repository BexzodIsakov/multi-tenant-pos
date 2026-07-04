import { UserRole } from '../utils/tokens';

declare global {
  namespace Express {
    interface Request {
      auth?: {
        userId: string;
        tenantId: string;
        role: UserRole;
      };
    }
  }
}

export {};
