import { z } from 'zod';

export const createUserSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters').max(50),
  password: z.string().min(6, 'Password must be at least 6 characters').max(100),
  fullName: z.string().min(1, 'Full name is required').max(100),
  role: z.enum(['CASHIER', 'BARISTA'], { message: 'Role must be CASHIER or BARISTA' }),
});

export const updateUserSchema = z.object({
  fullName: z.string().min(1).max(100).optional(),
  role: z.enum(['CASHIER', 'BARISTA']).optional(),
}).refine((data) => Object.keys(data).length > 0, { message: 'At least one field is required' });

export const resetPasswordSchema = z.object({
  newPassword: z.string().min(6, 'Password must be at least 6 characters').max(100),
});

export const userIdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});
