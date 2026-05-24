import type { Request, Response } from 'express';
import * as authService from '../services/auth.service.js';
import { success } from '../utils/api-response.js';
import { asyncHandler } from '../utils/async-handler.js';
import { HttpStatus } from '../constants/http-status.js';

export const login = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.login(req.body);
  success(res, result);
});

export const refresh = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.refresh(req.body.refreshToken);
  success(res, result);
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
  await authService.logout(req.user!.id);
  res.status(HttpStatus.NO_CONTENT).send();
});

export const getMe = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.getMe(req.user!.id);
  success(res, result);
});
