import type { Request, Response } from 'express';
import * as inventoryService from '../services/inventory.service.js';
import { success, created } from '../utils/api-response.js';
import { asyncHandler } from '../utils/async-handler.js';

// Ingredients CRUD
export const createIngredient = asyncHandler(async (req: Request, res: Response) => {
  const result = await inventoryService.createIngredient(req.body);
  created(res, result);
});

export const getAllIngredients = asyncHandler(async (_req: Request, res: Response) => {
  const result = await inventoryService.getAllIngredients();
  success(res, result);
});

export const getIngredientById = asyncHandler(async (req: Request, res: Response) => {
  const result = await inventoryService.getIngredientById(Number(req.params.id));
  success(res, result);
});

export const updateIngredient = asyncHandler(async (req: Request, res: Response) => {
  const result = await inventoryService.updateIngredient(Number(req.params.id), req.body);
  success(res, result);
});

export const toggleActive = asyncHandler(async (req: Request, res: Response) => {
  const result = await inventoryService.toggleActive(Number(req.params.id));
  success(res, result);
});

export const adjustStock = asyncHandler(async (req: Request, res: Response) => {
  const result = await inventoryService.adjustStock(Number(req.params.id), req.body);
  success(res, result);
});

// Alerts
export const getAlerts = asyncHandler(async (_req: Request, res: Response) => {
  const result = await inventoryService.getAlerts();
  success(res, result);
});

// Recipes (Menu Item / Topping Ingredients)
export const getMenuItemIngredients = asyncHandler(async (req: Request, res: Response) => {
  const result = await inventoryService.getMenuItemRecipe(Number(req.params.id));
  success(res, result);
});

export const setMenuItemIngredients = asyncHandler(async (req: Request, res: Response) => {
  const result = await inventoryService.setMenuItemRecipe(Number(req.params.id), req.body.items);
  success(res, result);
});

export const getToppingIngredients = asyncHandler(async (req: Request, res: Response) => {
  const result = await inventoryService.getToppingRecipe(Number(req.params.id));
  success(res, result);
});

export const setToppingIngredients = asyncHandler(async (req: Request, res: Response) => {
  const result = await inventoryService.setToppingRecipe(Number(req.params.id), req.body.items);
  success(res, result);
});
