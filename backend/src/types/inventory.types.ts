import type { Unit } from '../constants/unit.js';

export interface Ingredient {
  id: number;
  name: string;
  unit: Unit;
  stockQuantity: number;
  minThreshold: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateIngredientRequest {
  name: string;
  unit: Unit;
  stockQuantity?: number;
  minThreshold?: number;
}

export interface UpdateIngredientRequest {
  name?: string;
  unit?: Unit;
  minThreshold?: number;
}

export interface AdjustStockRequest {
  quantity: number;
  action: 'add' | 'set';
}

export interface RecipeItem {
  ingredientId: number;
  ingredientName?: string;
  unit?: Unit;
  quantityPerUnit: number;
}

export interface SetRecipeRequest {
  items: RecipeItem[];
}

export interface IngredientAlert {
  id: number;
  name: string;
  unit: Unit;
  stockQuantity: number;
  minThreshold: number;
  affectedMenuItems: { id: number; name: string }[];
  affectedToppings: { id: number; name: string }[];
}
