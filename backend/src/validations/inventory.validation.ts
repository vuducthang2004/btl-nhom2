import { z } from 'zod';
import { UNIT_VALUES } from '../constants/unit.js';

export const createIngredientSchema = z.object({
  name: z.string().min(1, 'Name is required').max(150),
  unit: z.enum(UNIT_VALUES as [string, ...string[]]),
  stockQuantity: z.coerce.number().min(0, 'Stock must be non-negative').default(0),
  minThreshold: z.coerce.number().min(0, 'Threshold must be non-negative').default(0),
});

export const updateIngredientSchema = z.object({
  name: z.string().min(1).max(150).optional(),
  unit: z.enum(UNIT_VALUES as [string, ...string[]]).optional(),
  minThreshold: z.coerce.number().min(0).optional(),
}).refine((data) => Object.keys(data).length > 0, { message: 'At least one field is required' });

export const adjustStockSchema = z.object({
  quantity: z.coerce.number().min(0, 'Quantity must be non-negative'),
  action: z.enum(['add', 'set']),
});

export const setRecipeSchema = z.object({
  items: z.array(z.object({
    ingredientId: z.coerce.number().int().positive(),
    quantityPerUnit: z.coerce.number().positive('Quantity per unit must be positive'),
  })),
});

export const ingredientIdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});
