import type { Role } from '../constants/roles.js';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        role: Role;
      };
    }
  }
}
