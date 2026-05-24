import { pool } from '../config/database.js';
import type { RowDataPacket, ResultSetHeader } from 'mysql2';

// ============================================
// Ingredients CRUD
// ============================================

export async function createIngredient(name: string, unit: string, stockQuantity: number, minThreshold: number): Promise<number> {
  const [result] = await pool.execute<ResultSetHeader>(
    'INSERT INTO ingredients (name, unit, stock_quantity, min_threshold) VALUES (?, ?, ?, ?)',
    [name, unit, stockQuantity, minThreshold]
  );
  return result.insertId;
}

export async function getAllIngredients() {
  const [rows] = await pool.execute<RowDataPacket[]>(
    'SELECT * FROM ingredients ORDER BY name ASC'
  );
  return rows;
}

export async function getIngredientById(id: number) {
  const [rows] = await pool.execute<RowDataPacket[]>(
    'SELECT * FROM ingredients WHERE id = ?', [id]
  );
  return rows[0] ?? null;
}

export async function getIngredientByName(name: string) {
  const [rows] = await pool.execute<RowDataPacket[]>(
    'SELECT * FROM ingredients WHERE name = ?', [name]
  );
  return rows[0] ?? null;
}

export async function updateIngredient(id: number, fields: { name?: string; unit?: string; minThreshold?: number }) {
  const sets: string[] = [];
  const values: (string | number | null)[] = [];

  if (fields.name !== undefined) { sets.push('name = ?'); values.push(fields.name); }
  if (fields.unit !== undefined) { sets.push('unit = ?'); values.push(fields.unit); }
  if (fields.minThreshold !== undefined) { sets.push('min_threshold = ?'); values.push(fields.minThreshold); }

  if (sets.length === 0) return;
  values.push(id);
  await pool.execute(`UPDATE ingredients SET ${sets.join(', ')} WHERE id = ?`, values);
}

export async function toggleActive(id: number, isActive: boolean): Promise<void> {
  await pool.execute('UPDATE ingredients SET is_active = ? WHERE id = ?', [isActive, id]);
}

export async function adjustStock(id: number, quantity: number, action: 'add' | 'set'): Promise<void> {
  if (action === 'set') {
    await pool.execute('UPDATE ingredients SET stock_quantity = ? WHERE id = ?', [quantity, id]);
  } else {
    await pool.execute('UPDATE ingredients SET stock_quantity = stock_quantity + ? WHERE id = ?', [quantity, id]);
  }
}

export async function deductStock(id: number, amount: number): Promise<void> {
  await pool.execute(
    'UPDATE ingredients SET stock_quantity = stock_quantity - ? WHERE id = ?',
    [amount, id]
  );
}

// ============================================
// Low Stock Alerts
// ============================================

export async function getLowStockIngredients() {
  const [rows] = await pool.execute<RowDataPacket[]>(
    'SELECT * FROM ingredients WHERE stock_quantity <= min_threshold AND is_active = TRUE ORDER BY stock_quantity ASC'
  );
  return rows;
}

// ============================================
// Menu Item Ingredients (Recipes)
// ============================================

export async function getMenuItemIngredients(menuItemId: number) {
  const [rows] = await pool.execute<RowDataPacket[]>(
    `SELECT mii.id, mii.ingredient_id, mii.quantity_per_unit, i.name as ingredient_name, i.unit
     FROM menu_item_ingredients mii
     JOIN ingredients i ON mii.ingredient_id = i.id
     WHERE mii.menu_item_id = ?`,
    [menuItemId]
  );
  return rows;
}

export async function setMenuItemIngredients(menuItemId: number, items: { ingredientId: number; quantityPerUnit: number }[]): Promise<void> {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    await connection.execute('DELETE FROM menu_item_ingredients WHERE menu_item_id = ?', [menuItemId]);
    for (const item of items) {
      await connection.execute(
        'INSERT INTO menu_item_ingredients (menu_item_id, ingredient_id, quantity_per_unit) VALUES (?, ?, ?)',
        [menuItemId, item.ingredientId, item.quantityPerUnit]
      );
    }
    await connection.commit();
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
}

// ============================================
// Topping Ingredients (Recipes)
// ============================================

export async function getToppingIngredients(toppingId: number) {
  const [rows] = await pool.execute<RowDataPacket[]>(
    `SELECT ti.id, ti.ingredient_id, ti.quantity_per_unit, i.name as ingredient_name, i.unit
     FROM topping_ingredients ti
     JOIN ingredients i ON ti.ingredient_id = i.id
     WHERE ti.topping_id = ?`,
    [toppingId]
  );
  return rows;
}

export async function setToppingIngredients(toppingId: number, items: { ingredientId: number; quantityPerUnit: number }[]): Promise<void> {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    await connection.execute('DELETE FROM topping_ingredients WHERE topping_id = ?', [toppingId]);
    for (const item of items) {
      await connection.execute(
        'INSERT INTO topping_ingredients (topping_id, ingredient_id, quantity_per_unit) VALUES (?, ?, ?)',
        [toppingId, item.ingredientId, item.quantityPerUnit]
      );
    }
    await connection.commit();
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
}

// ============================================
// Reverse Lookup (for auto-lock/re-enable)
// ============================================

export async function getMenuItemsByIngredientId(ingredientId: number) {
  const [rows] = await pool.execute<RowDataPacket[]>(
    `SELECT DISTINCT mi.id, mi.name
     FROM menu_items mi
     JOIN menu_item_ingredients mii ON mi.id = mii.menu_item_id
     WHERE mii.ingredient_id = ?`,
    [ingredientId]
  );
  return rows;
}

export async function getToppingsByIngredientId(ingredientId: number) {
  const [rows] = await pool.execute<RowDataPacket[]>(
    `SELECT DISTINCT t.id, t.name
     FROM toppings t
     JOIN topping_ingredients ti ON t.id = ti.topping_id
     WHERE ti.ingredient_id = ?`,
    [ingredientId]
  );
  return rows;
}

export async function getAllIngredientsForMenuItem(menuItemId: number) {
  const [rows] = await pool.execute<RowDataPacket[]>(
    `SELECT i.id, i.stock_quantity, i.min_threshold
     FROM ingredients i
     JOIN menu_item_ingredients mii ON i.id = mii.ingredient_id
     WHERE mii.menu_item_id = ?`,
    [menuItemId]
  );
  return rows;
}

export async function getAllIngredientsForTopping(toppingId: number) {
  const [rows] = await pool.execute<RowDataPacket[]>(
    `SELECT i.id, i.stock_quantity, i.min_threshold
     FROM ingredients i
     JOIN topping_ingredients ti ON i.id = ti.ingredient_id
     WHERE ti.topping_id = ?`,
    [toppingId]
  );
  return rows;
}

// ============================================
// Inventory Movements (Audit Trail)
// ============================================

export async function insertMovement(
  ingredientId: number,
  changeType: 'DEDUCT_ORDER' | 'ADJUST_ADD' | 'ADJUST_SET' | 'INITIAL',
  quantityChange: number,
  stockBefore: number,
  stockAfter: number,
  referenceId?: number | null,
  note?: string | null
): Promise<void> {
  await pool.execute(
    `INSERT INTO inventory_movements (ingredient_id, change_type, quantity_change, stock_before, stock_after, reference_id, note)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [ingredientId, changeType, quantityChange, stockBefore, stockAfter, referenceId ?? null, note ?? null]
  );
}
