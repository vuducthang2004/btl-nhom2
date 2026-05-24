import { z } from 'zod';

const dateString = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)');
const monthString = z.string().regex(/^\d{4}-\d{2}$/, 'Invalid month format (YYYY-MM)');
const yearString = z.string().regex(/^\d{4}$/, 'Invalid year format (YYYY)');

export const revenueSummarySchema = z.object({
  period: z.enum(['daily', 'monthly', 'yearly', 'custom']),
  date: dateString.optional(),
  month: monthString.optional(),
  year: yearString.optional(),
  from: dateString.optional(),
  to: dateString.optional(),
}).refine((data) => {
  if (data.period === 'daily' && !data.date) return false;
  if (data.period === 'monthly' && !data.month) return false;
  if (data.period === 'yearly' && !data.year) return false;
  if (data.period === 'custom' && (!data.from || !data.to)) return false;
  return true;
}, {
  message: 'Missing required date parameter for the selected period',
});

export const topSellingSchema = z.object({
  period: z.enum(['daily', 'monthly', 'yearly', 'custom']),
  date: dateString.optional(),
  month: monthString.optional(),
  year: yearString.optional(),
  from: dateString.optional(),
  to: dateString.optional(),
  limit: z.coerce.number().int().min(1).max(50).default(10),
}).refine((data) => {
  if (data.period === 'daily' && !data.date) return false;
  if (data.period === 'monthly' && !data.month) return false;
  if (data.period === 'yearly' && !data.year) return false;
  if (data.period === 'custom' && (!data.from || !data.to)) return false;
  return true;
}, {
  message: 'Missing required date parameter for the selected period',
});

export const periodSchema = z.object({
  period: z.enum(['daily', 'monthly', 'yearly', 'custom']),
  date: dateString.optional(),
  month: monthString.optional(),
  year: yearString.optional(),
  from: dateString.optional(),
  to: dateString.optional(),
}).refine((data) => {
  if (data.period === 'daily' && !data.date) return false;
  if (data.period === 'monthly' && !data.month) return false;
  if (data.period === 'yearly' && !data.year) return false;
  if (data.period === 'custom' && (!data.from || !data.to)) return false;
  return true;
}, {
  message: 'Missing required date parameter for the selected period',
});

export const inventoryMovementsSchema = z.object({
  ingredientId: z.coerce.number().int().positive().optional(),
  type: z.enum(['DEDUCT_ORDER', 'ADJUST_ADD', 'ADJUST_SET', 'INITIAL']).optional(),
  from: dateString.optional(),
  to: dateString.optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const exportSchema = z.object({
  type: z.enum(['revenue', 'top-selling', 'inventory', 'movements', 'category', 'cashier']),
  period: z.enum(['daily', 'monthly', 'yearly', 'custom']).optional(),
  date: dateString.optional(),
  month: monthString.optional(),
  year: yearString.optional(),
  from: dateString.optional(),
  to: dateString.optional(),
  limit: z.coerce.number().int().min(1).max(50).default(10),
});
