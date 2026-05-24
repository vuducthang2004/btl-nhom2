import { z } from 'zod';

const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

export const createOrderSchema = z.object({
  items: z.array(z.object({
    menuItemId: z.coerce.number().int().positive(),
    quantity: z.coerce.number().int().min(1, 'Quantity must be at least 1'),
    notes: z.string().max(500).optional(),
    toppingIds: z.array(z.coerce.number().int().positive()).optional(),
  })).min(1, 'Order must have at least one item'),
  notes: z.string().max(500).optional(),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum(['PREPARING', 'READY', 'COMPLETED', 'CANCELLED']),
});

export const orderIdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export const orderFilterSchema = z.object({
  status: z.enum(['PENDING', 'PREPARING', 'READY', 'COMPLETED', 'CANCELLED']).optional(),
  date: z.string().regex(dateRegex, 'Format: YYYY-MM-DD').optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});
