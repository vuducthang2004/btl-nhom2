import type { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt.js';
import * as authRepo from '../repositories/auth.repository.js';
import { HttpStatus } from '../constants/http-status.js';

export async function authenticate(req: Request, res: Response, next: NextFunction): Promise<void> {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    res.status(HttpStatus.UNAUTHORIZED).json({
      success: false,
      message: 'Access token required',
    });
    return;
  }

  const token = authHeader.slice(7);

  try {
    const payload = verifyAccessToken(token);

    // Check if user still has active session (not logged out)
    const user = await authRepo.findById(payload.id);
    if (!user || !user.is_active || !user.refresh_token) {
      res.status(HttpStatus.UNAUTHORIZED).json({
        success: false,
        message: 'Session expired. Please login again.',
      });
      return;
    }

    req.user = { id: payload.id, role: payload.role };
    next();
  } catch {
    res.status(HttpStatus.UNAUTHORIZED).json({
      success: false,
      message: 'Invalid or expired access token',
    });
  }
}
