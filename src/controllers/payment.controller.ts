import type { Request, Response } from 'express';
import * as paymentService from '../services/payment.service.js';
import { success, created } from '../utils/api-response.js';
import { asyncHandler } from '../utils/async-handler.js';

export const processPayment = asyncHandler(async (req: Request, res: Response) => {
  const result = await paymentService.processPayment(req.body);
  created(res, result);
});

export const getPaymentByOrderId = asyncHandler(async (req: Request, res: Response) => {
  const result = await paymentService.getPaymentByOrderId(Number(req.params.orderId));
  success(res, result);
});
