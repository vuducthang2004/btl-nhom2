import type { Response } from 'express';
import type { ApiResponse, PaginationMeta } from '../types/common.types.js';
import { HttpStatus } from '../constants/http-status.js';

export function success<T>(res: Response, data?: T, meta?: PaginationMeta, statusCode: number = HttpStatus.OK): void {
  const response: ApiResponse<T> = { success: true };
  if (data !== undefined) response.data = data;
  if (meta) response.meta = meta;
  res.status(statusCode).json(response);
}

export function created<T>(res: Response, data?: T): void {
  success(res, data, undefined, HttpStatus.CREATED);
}

export function error(res: Response, statusCode: number, message: string, errors?: { field: string; message: string }[]): void {
  const response: ApiResponse = { success: false, message };
  if (errors) response.errors = errors;
  res.status(statusCode).json(response);
}
