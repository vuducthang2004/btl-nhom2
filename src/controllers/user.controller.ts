import type { Request, Response } from 'express';
import * as userService from '../services/user.service.js';
import { success, created } from '../utils/api-response.js';
import { asyncHandler } from '../utils/async-handler.js';
import { HttpStatus } from '../constants/http-status.js';

export const createUser = asyncHandler(async (req: Request, res: Response) => {
  const result = await userService.createUser(req.body);
  created(res, result);
});

export const getAllUsers = asyncHandler(async (_req: Request, res: Response) => {
  const result = await userService.getAllUsers();
  success(res, result);
});

export const getUserById = asyncHandler(async (req: Request, res: Response) => {
  const result = await userService.getUserById(Number(req.params.id));
  success(res, result);
});

export const updateUser = asyncHandler(async (req: Request, res: Response) => {
  const result = await userService.updateUser(Number(req.params.id), req.body);
  success(res, result);
});

export const toggleActive = asyncHandler(async (req: Request, res: Response) => {
  const result = await userService.toggleActive(Number(req.params.id));
  success(res, result);
});

export const resetPassword = asyncHandler(async (req: Request, res: Response) => {
  await userService.resetPassword(Number(req.params.id), req.body);
  res.status(HttpStatus.NO_CONTENT).send();
});
