import * as menuService from '../services/menu.service.js';
import { success, created } from '../utils/api-response.js';
import { HttpStatus } from '../constants/http-status.js';

// Categories
export const getAllCategories = async (_req, res, next) => {
  try {
    const result = await menuService.getAllCategories();
    success(res, result);
  } catch (error) {
    next(error);
  }
};

export const createCategory = async (req, res, next) => {
  try {
    const result = await menuService.createCategory(req.body);
    created(res, result);
  } catch (error) {
    next(error);
  }
};

export const updateCategory = async (req, res, next) => {
  try {
    const result = await menuService.updateCategory(Number(req.params.id), req.body);
    success(res, result);
  } catch (error) {
    next(error);
  }
};

export const deleteCategory = async (req, res, next) => {
  try {
    await menuService.deleteCategory(Number(req.params.id));
    res.status(HttpStatus.NO_CONTENT).send();
  } catch (error) {
    next(error);
  }
};

// Menu Items
export const getAllMenuItems = async (req, res, next) => {
  try {
    const categoryId = req.query.categoryId ? Number(req.query.categoryId) : undefined;
    const result = await menuService.getAllMenuItems(categoryId);
    success(res, result);
  } catch (error) {
    next(error);
  }
};

export const getMenuItemById = async (req, res, next) => {
  try {
    const result = await menuService.getMenuItemById(Number(req.params.id));
    success(res, result);
  } catch (error) {
    next(error);
  }
};

export const createMenuItem = async (req, res, next) => {
  try {
    const result = await menuService.createMenuItem(req.body);
    created(res, result);
  } catch (error) {
    next(error);
  }
};

export const updateMenuItem = async (req, res, next) => {
  try {
    const result = await menuService.updateMenuItem(Number(req.params.id), req.body);
    success(res, result);
  } catch (error) {
    next(error);
  }
};

export const toggleAvailability = async (req, res, next) => {
  try {
    const result = await menuService.toggleAvailability(Number(req.params.id));
    success(res, result);
  } catch (error) {
    next(error);
  }
};

// Toppings
export const getAllToppings = async (_req, res, next) => {
  try {
    const result = await menuService.getAllToppings();
    success(res, result);
  } catch (error) {
    next(error);
  }
};

export const createTopping = async (req, res, next) => {
  try {
    const result = await menuService.createTopping(req.body);
    created(res, result);
  } catch (error) {
    next(error);
  }
};

export const updateTopping = async (req, res, next) => {
  try {
    const result = await menuService.updateTopping(Number(req.params.id), req.body);
    success(res, result);
  } catch (error) {
    next(error);
  }
};
