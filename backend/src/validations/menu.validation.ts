import { z } from 'zod';

export const createCategorySchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  description: z.string().max(500).optional(),
  sortOrder: z.coerce.number().int().min(0).default(0),
});

export const updateCategorySchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  sortOrder: z.coerce.number().int().min(0).optional(),
}).refine((data) => Object.keys(data).length > 0, { message: 'At least one field is required' });

export const createMenuItemSchema = z.object({
  categoryId: z.coerce.number().int().positive(),
  name: z.string().min(1, 'Name is required').max(150),
  description: z.string().max(500).optional(),
  basePrice: z.coerce.number().positive('Price must be positive'),
  imageUrl: z.string().url().max(500).optional(),
  sortOrder: z.coerce.number().int().min(0).default(0),
  toppingIds: z.array(z.coerce.number().int().positive()).optional(),
});

export const updateMenuItemSchema = z.object({
  categoryId: z.coerce.number().int().positive().optional(),
  name: z.string().min(1).max(150).optional(),
  description: z.string().max(500).optional(),
  basePrice: z.coerce.number().positive().optional(),
  imageUrl: z.string().url().max(500).nullable().optional(),
  sortOrder: z.coerce.number().int().min(0).optional(),
  toppingIds: z.array(z.coerce.number().int().positive()).optional(),
}).refine((data) => Object.keys(data).length > 0, { message: 'At least one field is required' });

export const createToppingSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  price: z.coerce.number().min(0, 'Price must be non-negative'),
});

export const updateToppingSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  price: z.coerce.number().min(0).optional(),
}).refine((data) => Object.keys(data).length > 0, { message: 'At least one field is required' });

export const idParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});
