import type { Request, Response } from 'express';
import * as menuService from '../services/menu.service.js';
import { success, created } from '../utils/api-response.js';
import { asyncHandler } from '../utils/async-handler.js';
import { HttpStatus } from '../constants/http-status.js';

// Categories
export const getAllCategories = asyncHandler(async (_req: Request, res: Response) => {
  const result = await menuService.getAllCategories();
  success(res, result);
});

export const createCategory = asyncHandler(async (req: Request, res: Response) => {
  const result = await menuService.createCategory(req.body);
  created(res, result);
});

export const updateCategory = asyncHandler(async (req: Request, res: Response) => {
  const result = await menuService.updateCategory(Number(req.params.id), req.body);
  success(res, result);
});

export const deleteCategory = asyncHandler(async (req: Request, res: Response) => {
  await menuService.deleteCategory(Number(req.params.id));
  res.status(HttpStatus.NO_CONTENT).send();
});

// Menu Items
export const getAllMenuItems = asyncHandler(async (req: Request, res: Response) => {
  const categoryId = req.query.categoryId ? Number(req.query.categoryId) : undefined;
  const result = await menuService.getAllMenuItems(categoryId);
  success(res, result);
});

export const getMenuItemById = asyncHandler(async (req: Request, res: Response) => {
  const result = await menuService.getMenuItemById(Number(req.params.id));
  success(res, result);
});

export const createMenuItem = asyncHandler(async (req: Request, res: Response) => {
  const result = await menuService.createMenuItem(req.body);
  created(res, result);
});

export const updateMenuItem = asyncHandler(async (req: Request, res: Response) => {
  const result = await menuService.updateMenuItem(Number(req.params.id), req.body);
  success(res, result);
});

export const toggleAvailability = asyncHandler(async (req: Request, res: Response) => {
  const result = await menuService.toggleAvailability(Number(req.params.id));
  success(res, result);
});

// Toppings
export const getAllToppings = asyncHandler(async (_req: Request, res: Response) => {
  const result = await menuService.getAllToppings();
  success(res, result);
});

export const createTopping = asyncHandler(async (req: Request, res: Response) => {
  const result = await menuService.createTopping(req.body);
  created(res, result);
});

export const updateTopping = asyncHandler(async (req: Request, res: Response) => {
  const result = await menuService.updateTopping(Number(req.params.id), req.body);
  success(res, result);
});
