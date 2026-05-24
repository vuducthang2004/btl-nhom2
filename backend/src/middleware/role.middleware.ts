import type { Request, Response, NextFunction } from 'express';
import type { Role } from '../constants/roles.js';
import { HttpStatus } from '../constants/http-status.js';

export function authorize(...roles: Role[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(HttpStatus.UNAUTHORIZED).json({
        success: false,
        message: 'Authentication required',
      });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(HttpStatus.FORBIDDEN).json({
        success: false,
        message: 'Insufficient permissions',
      });
      return;
    }

    next();
  };
}
