import type { Request, Response } from 'express';
import * as kitchenService from '../services/kitchen.service.js';
import { success } from '../utils/api-response.js';
import { asyncHandler } from '../utils/async-handler.js';

export const getQueue = asyncHandler(async (_req: Request, res: Response) => {
  const result = await kitchenService.getQueue();
  success(res, result);
});

export const getDisplay = asyncHandler(async (_req: Request, res: Response) => {
  const result = await kitchenService.getDisplay();
  success(res, result);
});
