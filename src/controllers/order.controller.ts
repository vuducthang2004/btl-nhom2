import type { Request, Response } from 'express';
import * as orderService from '../services/order.service.js';
import { success, created } from '../utils/api-response.js';
import { asyncHandler } from '../utils/async-handler.js';

export const createOrder = asyncHandler(async (req: Request, res: Response) => {
  const result = await orderService.createOrder(req.user!.id, req.body);
  created(res, result);
});

export const getOrders = asyncHandler(async (req: Request, res: Response) => {
  const filters = {
    status: req.query.status as string | undefined,
    date: req.query.date as string | undefined,
    page: Number(req.query.page) || 1,
    limit: Number(req.query.limit) || 20,
  };
  const result = await orderService.getOrders(filters);
  success(res, result.data, result.meta);
});

export const getOrderById = asyncHandler(async (req: Request, res: Response) => {
  const result = await orderService.getOrderById(Number(req.params.id));
  success(res, result);
});

export const updateOrderStatus = asyncHandler(async (req: Request, res: Response) => {
  const result = await orderService.updateOrderStatus(
    Number(req.params.id),
    req.body.status,
    req.user!.id
  );
  success(res, result);
});
