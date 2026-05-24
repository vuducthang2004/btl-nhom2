import type { Request, Response, NextFunction } from 'express';
import { HttpStatus } from '../constants/http-status.js';

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode: number, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
    return;
  }

  console.error(`[ERROR] ${_req.method} ${_req.originalUrl} —`, err.message, err.stack);
  res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
    success: false,
    message: 'Internal server error',
  });
}
