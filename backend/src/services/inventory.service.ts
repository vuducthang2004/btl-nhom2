import * as inventoryRepo from '../repositories/inventory.repository.js';
import * as menuRepo from '../repositories/menu.repository.js';
import * as orderRepo from '../repositories/order.repository.js';
import { AppError } from '../middleware/error-handler.middleware.js';
import { HttpStatus } from '../constants/http-status.js';
import type { Ingredient, CreateIngredientRequest, UpdateIngredientRequest, AdjustStockRequest, RecipeItem, IngredientAlert } from '../types/inventory.types.js';

// ============================================
// Ingredients CRUD
// ============================================

function toIngredient(row: any): Ingredient {
  return {
    id: row.id,
    name: row.name,
    unit: row.unit,
    stockQuantity: Number(row.stock_quantity),
    minThreshold: Number(row.min_threshold),
    isActive: Boolean(row.is_active),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function createIngredient(data: CreateIngredientRequest): Promise<Ingredient> {
  const existing = await inventoryRepo.getIngredientByName(data.name);
  if (existing) throw new AppError(`Ingredient "${data.name}" already exists`, HttpStatus.CONFLICT);

  const id = await inventoryRepo.createIngredient(
    data.name,
    data.unit,
    data.stockQuantity ?? 0,
    data.minThreshold ?? 0
  );
  return getIngredientById(id);
}

export async function getAllIngredients(): Promise<Ingredient[]> {
  const rows = await inventoryRepo.getAllIngredients();
  return rows.map(toIngredient);
}

export async function getIngredientById(id: number): Promise<Ingredient> {
  const row = await inventoryRepo.getIngredientById(id);
  if (!row) throw new AppError('Ingredient not found', HttpStatus.NOT_FOUND);
  return toIngredient(row);
}

export async function updateIngredient(id: number, data: UpdateIngredientRequest): Promise<Ingredient> {
  const existing = await inventoryRepo.getIngredientById(id);
  if (!existing) throw new AppError('Ingredient not found', HttpStatus.NOT_FOUND);

  if (data.name && data.name !== existing.name) {
    const duplicate = await inventoryRepo.getIngredientByName(data.name);
    if (duplicate) throw new AppError(`Ingredient "${data.name}" already exists`, HttpStatus.CONFLICT);
  }

  await inventoryRepo.updateIngredient(id, data);
  return getIngredientById(id);
}

export async function toggleActive(id: number): Promise<Ingredient> {
  const existing = await inventoryRepo.getIngredientById(id);
  if (!existing) throw new AppError('Ingredient not found', HttpStatus.NOT_FOUND);

  await inventoryRepo.toggleActive(id, !existing.is_active);
  return getIngredientById(id);
}

export async function adjustStock(id: number, data: AdjustStockRequest): Promise<Ingredient> {
  const existing = await inventoryRepo.getIngredientById(id);
  if (!existing) throw new AppError('Ingredient not found', HttpStatus.NOT_FOUND);

  const stockBefore = Number(existing.stock_quantity);
  await inventoryRepo.adjustStock(id, data.quantity, data.action);

  // Record inventory movement
  const stockAfter = data.action === 'set' ? data.quantity : stockBefore + data.quantity;
  const changeType = data.action === 'set' ? 'ADJUST_SET' as const : 'ADJUST_ADD' as const;
  const quantityChange = data.action === 'set' ? data.quantity - stockBefore : data.quantity;
  try {
    await inventoryRepo.insertMovement(id, changeType, quantityChange, stockBefore, stockAfter);
  } catch (err) {
    console.warn(`⚠️ Failed to record movement for ingredient ${id}:`, err);
  }

  const updated = await getIngredientById(id);

  if (updated.stockQuantity <= updated.minThreshold) {
    await checkAndAutoLock(id);
  } else {
    await checkAndReEnableItems(id);
  }

  return updated;
}

// ============================================
// Alerts
// ============================================

export async function getAlerts(): Promise<IngredientAlert[]> {
  const lowStock = await inventoryRepo.getLowStockIngredients();
  const alerts: IngredientAlert[] = [];

  for (const row of lowStock) {
    const menuItems = await inventoryRepo.getMenuItemsByIngredientId(row.id);
    const toppings = await inventoryRepo.getToppingsByIngredientId(row.id);

    alerts.push({
      id: row.id,
      name: row.name,
      unit: row.unit,
      stockQuantity: Number(row.stock_quantity),
      minThreshold: Number(row.min_threshold),
      affectedMenuItems: menuItems.map((m: any) => ({ id: m.id, name: m.name })),
      affectedToppings: toppings.map((t: any) => ({ id: t.id, name: t.name })),
    });
  }

  return alerts;
}

// ============================================
// Recipes (Menu Item ↔ Ingredients)
// ============================================

export async function getMenuItemRecipe(menuItemId: number): Promise<RecipeItem[]> {
  const menuItem = await menuRepo.getMenuItemById(menuItemId);
  if (!menuItem) throw new AppError('Menu item not found', HttpStatus.NOT_FOUND);

  const rows = await inventoryRepo.getMenuItemIngredients(menuItemId);
  return rows.map((r: any) => ({
    ingredientId: r.ingredient_id,
    ingredientName: r.ingredient_name,
    unit: r.unit,
    quantityPerUnit: Number(r.quantity_per_unit),
  }));
}

export async function setMenuItemRecipe(menuItemId: number, items: { ingredientId: number; quantityPerUnit: number }[]): Promise<RecipeItem[]> {
  const menuItem = await menuRepo.getMenuItemById(menuItemId);
  if (!menuItem) throw new AppError('Menu item not found', HttpStatus.NOT_FOUND);

  // Validate all ingredients exist
  for (const item of items) {
    const ingredient = await inventoryRepo.getIngredientById(item.ingredientId);
    if (!ingredient) throw new AppError(`Ingredient ${item.ingredientId} not found`, HttpStatus.BAD_REQUEST);
  }

  await inventoryRepo.setMenuItemIngredients(menuItemId, items);
  return getMenuItemRecipe(menuItemId);
}

export async function getToppingRecipe(toppingId: number): Promise<RecipeItem[]> {
  const topping = await menuRepo.getToppingById(toppingId);
  if (!topping) throw new AppError('Topping not found', HttpStatus.NOT_FOUND);

  const rows = await inventoryRepo.getToppingIngredients(toppingId);
  return rows.map((r: any) => ({
    ingredientId: r.ingredient_id,
    ingredientName: r.ingredient_name,
    unit: r.unit,
    quantityPerUnit: Number(r.quantity_per_unit),
  }));
}

export async function setToppingRecipe(toppingId: number, items: { ingredientId: number; quantityPerUnit: number }[]): Promise<RecipeItem[]> {
  const topping = await menuRepo.getToppingById(toppingId);
  if (!topping) throw new AppError('Topping not found', HttpStatus.NOT_FOUND);

  for (const item of items) {
    const ingredient = await inventoryRepo.getIngredientById(item.ingredientId);
    if (!ingredient) throw new AppError(`Ingredient ${item.ingredientId} not found`, HttpStatus.BAD_REQUEST);
  }

  await inventoryRepo.setToppingIngredients(toppingId, items);
  return getToppingRecipe(toppingId);
}

// ============================================
// Stock Deduction (called after payment)
// ============================================

export async function deductStockForOrder(orderId: number): Promise<void> {
  const { pool: dbPool } = await import('../config/database.js');
  const connection = await dbPool.getConnection();
  const affectedIngredientIds = new Set<number>();

  try {
    await connection.beginTransaction();

    const orderItems = await orderRepo.getOrderItems(orderId);

    for (const orderItem of orderItems) {
      const quantity = orderItem.quantity;

      // Deduct for menu item ingredients
      const menuRecipe = await inventoryRepo.getMenuItemIngredients(orderItem.menu_item_id);
      for (const recipe of menuRecipe) {
        const deductAmount = Number(recipe.quantity_per_unit) * quantity;
        // Lock the row for this transaction
        const [lockedRows] = await connection.execute<any[]>(
          'SELECT stock_quantity FROM ingredients WHERE id = ? FOR UPDATE',
          [recipe.ingredient_id]
        );
        const stockBefore = lockedRows[0] ? Number(lockedRows[0].stock_quantity) : 0;
        await connection.execute(
          'UPDATE ingredients SET stock_quantity = stock_quantity - ? WHERE id = ?',
          [deductAmount, recipe.ingredient_id]
        );
        try {
          await inventoryRepo.insertMovement(
            recipe.ingredient_id, 'DEDUCT_ORDER', -deductAmount,
            stockBefore, stockBefore - deductAmount, orderId
          );
        } catch (err) {
          console.warn(`⚠️ Failed to record deduct movement:`, err);
        }
        affectedIngredientIds.add(recipe.ingredient_id);
      }

      // Deduct for topping ingredients
      const orderItemToppings = await orderRepo.getOrderItemToppings(orderItem.id);
      for (const oit of orderItemToppings) {
        const toppingRecipe = await inventoryRepo.getToppingIngredients(oit.topping_id);
        for (const recipe of toppingRecipe) {
          const deductAmount = Number(recipe.quantity_per_unit) * quantity;
          const [lockedRows] = await connection.execute<any[]>(
            'SELECT stock_quantity FROM ingredients WHERE id = ? FOR UPDATE',
            [recipe.ingredient_id]
          );
          const stockBefore = lockedRows[0] ? Number(lockedRows[0].stock_quantity) : 0;
          await connection.execute(
            'UPDATE ingredients SET stock_quantity = stock_quantity - ? WHERE id = ?',
            [deductAmount, recipe.ingredient_id]
          );
          try {
            await inventoryRepo.insertMovement(
              recipe.ingredient_id, 'DEDUCT_ORDER', -deductAmount,
              stockBefore, stockBefore - deductAmount, orderId
            );
          } catch (err) {
            console.warn(`⚠️ Failed to record deduct movement:`, err);
          }
          affectedIngredientIds.add(recipe.ingredient_id);
        }
      }
    }

    await connection.commit();
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }

  // Check auto-lock for all affected ingredients (outside transaction)
  for (const ingredientId of affectedIngredientIds) {
    await checkAndAutoLock(ingredientId);
  }
}

// ============================================
// Auto-lock / Auto-re-enable
// ============================================

async function checkAndAutoLock(ingredientId: number): Promise<void> {
  const ingredient = await inventoryRepo.getIngredientById(ingredientId);
  if (!ingredient) return;

  if (Number(ingredient.stock_quantity) <= Number(ingredient.min_threshold)) {
    // Lock all menu items using this ingredient
    const menuItems = await inventoryRepo.getMenuItemsByIngredientId(ingredientId);
    for (const item of menuItems) {
      await menuRepo.toggleAvailability(item.id, false);
    }

    // Lock all toppings using this ingredient
    const toppings = await inventoryRepo.getToppingsByIngredientId(ingredientId);
    for (const topping of toppings) {
      await menuRepo.toggleToppingAvailability(topping.id, false);
    }
  }
}

async function checkAndReEnableItems(ingredientId: number): Promise<void> {
  // Re-enable menu items where ALL ingredients are above threshold
  const menuItems = await inventoryRepo.getMenuItemsByIngredientId(ingredientId);
  for (const item of menuItems) {
    const allIngredients = await inventoryRepo.getAllIngredientsForMenuItem(item.id);
    const allSufficient = allIngredients.every(
      (i: any) => Number(i.stock_quantity) > Number(i.min_threshold)
    );
    if (allSufficient) {
      await menuRepo.toggleAvailability(item.id, true);
    }
  }

  // Re-enable toppings where ALL ingredients are above threshold
  const toppings = await inventoryRepo.getToppingsByIngredientId(ingredientId);
  for (const topping of toppings) {
    const allIngredients = await inventoryRepo.getAllIngredientsForTopping(topping.id);
    const allSufficient = allIngredients.every(
      (i: any) => Number(i.stock_quantity) > Number(i.min_threshold)
    );
    if (allSufficient) {
      await menuRepo.toggleToppingAvailability(topping.id, true);
    }
  }
}
