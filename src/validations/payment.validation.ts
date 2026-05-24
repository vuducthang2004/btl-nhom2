import { z } from 'zod';

export const createPaymentSchema = z.object({
  orderId: z.coerce.number().int().positive(),
  method: z.enum(['CASH', 'TRANSFER', 'E_WALLET']),
  transactionRef: z.string().max(255).optional(),
});

export const paymentOrderIdParamSchema = z.object({
  orderId: z.coerce.number().int().positive(),
});
