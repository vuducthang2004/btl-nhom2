import * as menuRepo from '../repositories/menu.repository.js';
import { AppError } from '../middleware/error-handler.middleware.js';
import { HttpStatus } from '../constants/http-status.js';
import type { Category, MenuItem, ToppingInfo } from '../types/menu.types.js';

// ============================================
// Categories
// ============================================

function toCategory(row: any): Category {
  return {
    id: row.id, name: row.name, description: row.description,
    sortOrder: row.sort_order, isActive: Boolean(row.is_active), createdAt: row.created_at,
  };
}

export async function getAllCategories(): Promise<Category[]> {
  const rows = await menuRepo.getAllCategories();
  return rows.map(toCategory);
}

export async function createCategory(data: { name: string; description?: string; sortOrder?: number }): Promise<Category> {
  const id = await menuRepo.createCategory(data.name, data.description ?? null, data.sortOrder ?? 0);
  const cat = await menuRepo.getCategoryById(id);
  return toCategory(cat);
}

export async function updateCategory(id: number, data: { name?: string; description?: string; sortOrder?: number }): Promise<Category> {
  const cat = await menuRepo.getCategoryById(id);
  if (!cat) throw new AppError('Category not found', HttpStatus.NOT_FOUND);

  await menuRepo.updateCategory(id, data);
  const updated = await menuRepo.getCategoryById(id);
  return toCategory(updated);
}

export async function deleteCategory(id: number): Promise<void> {
  const cat = await menuRepo.getCategoryById(id);
  if (!cat) throw new AppError('Category not found', HttpStatus.NOT_FOUND);

  try {
    await menuRepo.deleteCategory(id);
  } catch (err: any) {
    if (err.code === 'ER_ROW_IS_REFERENCED_2' || err.code === 'ER_ROW_IS_REFERENCED') {
      throw new AppError('Cannot delete category with existing menu items', HttpStatus.CONFLICT);
    }
    throw err;
  }
}

// ============================================
// Menu Items
// ============================================

function toMenuItem(row: any, toppings?: any[]): MenuItem {
  return {
    id: row.id, categoryId: row.category_id, categoryName: row.category_name,
    name: row.name, description: row.description, basePrice: Number(row.base_price),
    imageUrl: row.image_url, isAvailable: Boolean(row.is_available),
    sortOrder: row.sort_order,
    toppings: toppings?.map(toToppingInfo),
    createdAt: row.created_at, updatedAt: row.updated_at,
  };
}

function toToppingInfo(row: any): ToppingInfo {
  return { id: row.id, name: row.name, price: Number(row.price), isAvailable: Boolean(row.is_available) };
}

export async function getAllMenuItems(categoryId?: number): Promise<MenuItem[]> {
  const rows = await menuRepo.getAllMenuItems(categoryId);
  if (rows.length === 0) return [];

  const menuItemIds = rows.map((r: any) => r.id);

  // Batch: 1 query for all toppings across all menu items
  const allToppings = await menuRepo.getMenuItemToppingsBatch(menuItemIds);

  // Group toppings by menu_item_id
  const toppingsByItemId = new Map<number, any[]>();
  for (const t of allToppings) {
    const arr = toppingsByItemId.get(t.menu_item_id) ?? [];
    arr.push(t);
    toppingsByItemId.set(t.menu_item_id, arr);
  }

  return rows.map((row: any) => toMenuItem(row, toppingsByItemId.get(row.id)));
}

export async function getMenuItemById(id: number): Promise<MenuItem> {
  const row = await menuRepo.getMenuItemById(id);
  if (!row) throw new AppError('Menu item not found', HttpStatus.NOT_FOUND);

  const toppings = await menuRepo.getMenuItemToppings(id);
  return toMenuItem(row, toppings);
}

export async function createMenuItem(data: {
  categoryId: number; name: string; description?: string;
  basePrice: number; imageUrl?: string; sortOrder?: number; toppingIds?: number[];
}): Promise<MenuItem> {
  const category = await menuRepo.getCategoryById(data.categoryId);
  if (!category) throw new AppError('Category not found', HttpStatus.NOT_FOUND);

  const id = await menuRepo.createMenuItem({
    categoryId: data.categoryId, name: data.name,
    description: data.description ?? null, basePrice: data.basePrice,
    imageUrl: data.imageUrl ?? null, sortOrder: data.sortOrder ?? 0,
  });

  if (data.toppingIds?.length) {
    await menuRepo.setMenuItemToppings(id, data.toppingIds);
  }

  return getMenuItemById(id);
}

export async function updateMenuItem(id: number, data: {
  categoryId?: number; name?: string; description?: string;
  basePrice?: number; imageUrl?: string | null; sortOrder?: number; toppingIds?: number[];
}): Promise<MenuItem> {
  const item = await menuRepo.getMenuItemById(id);
  if (!item) throw new AppError('Menu item not found', HttpStatus.NOT_FOUND);

  if (data.categoryId) {
    const category = await menuRepo.getCategoryById(data.categoryId);
    if (!category) throw new AppError('Category not found', HttpStatus.NOT_FOUND);
  }

  const { toppingIds, ...fields } = data;
  await menuRepo.updateMenuItem(id, fields);

  if (toppingIds !== undefined) {
    await menuRepo.setMenuItemToppings(id, toppingIds);
  }

  return getMenuItemById(id);
}

export async function toggleAvailability(id: number): Promise<MenuItem> {
  const item = await menuRepo.getMenuItemById(id);
  if (!item) throw new AppError('Menu item not found', HttpStatus.NOT_FOUND);

  await menuRepo.toggleAvailability(id, !item.is_available);
  return getMenuItemById(id);
}

// ============================================
// Toppings
// ============================================

export async function getAllToppings(): Promise<ToppingInfo[]> {
  const rows = await menuRepo.getAllToppings();
  return rows.map(toToppingInfo);
}

export async function createTopping(data: { name: string; price: number }): Promise<ToppingInfo> {
  const id = await menuRepo.createTopping(data.name, data.price);
  const topping = await menuRepo.getToppingById(id);
  return toToppingInfo(topping);
}

export async function updateTopping(id: number, data: { name?: string; price?: number }): Promise<ToppingInfo> {
  const topping = await menuRepo.getToppingById(id);
  if (!topping) throw new AppError('Topping not found', HttpStatus.NOT_FOUND);

  await menuRepo.updateTopping(id, data);
  const updated = await menuRepo.getToppingById(id);
  return toToppingInfo(updated);
}
