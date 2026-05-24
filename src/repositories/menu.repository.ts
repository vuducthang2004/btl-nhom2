import { pool } from '../config/database.js';
import type { RowDataPacket, ResultSetHeader } from 'mysql2';

// ============================================
// Categories
// ============================================

export async function getAllCategories() {
  const [rows] = await pool.execute<RowDataPacket[]>(
    'SELECT * FROM categories ORDER BY sort_order ASC, id ASC'
  );
  return rows;
}

export async function getCategoryById(id: number) {
  const [rows] = await pool.execute<RowDataPacket[]>(
    'SELECT * FROM categories WHERE id = ?', [id]
  );
  return rows[0] ?? null;
}

export async function createCategory(name: string, description: string | null, sortOrder: number) {
  const [result] = await pool.execute<ResultSetHeader>(
    'INSERT INTO categories (name, description, sort_order) VALUES (?, ?, ?)',
    [name, description ?? null, sortOrder]
  );
  return result.insertId;
}

export async function updateCategory(id: number, fields: { name?: string; description?: string; sortOrder?: number }) {
  const sets: string[] = [];
  const values: (string | number | null)[] = [];

  if (fields.name !== undefined) { sets.push('name = ?'); values.push(fields.name); }
  if (fields.description !== undefined) { sets.push('description = ?'); values.push(fields.description); }
  if (fields.sortOrder !== undefined) { sets.push('sort_order = ?'); values.push(fields.sortOrder); }

  if (sets.length === 0) return;
  values.push(id);
  await pool.query(`UPDATE categories SET ${sets.join(', ')} WHERE id = ?`, values);
}

export async function deleteCategory(id: number) {
  await pool.execute('DELETE FROM categories WHERE id = ?', [id]);
}

// ============================================
// Menu Items
// ============================================

export async function getAllMenuItems(categoryId?: number) {
  let sql = `
    SELECT mi.*, c.name as category_name
    FROM menu_items mi
    JOIN categories c ON mi.category_id = c.id
  `;
  const params: (string | number)[] = [];

  if (categoryId) {
    sql += ' WHERE mi.category_id = ?';
    params.push(categoryId);
  }

  sql += ' ORDER BY mi.sort_order ASC, mi.id ASC';
  const [rows] = await pool.query<RowDataPacket[]>(sql, params);
  return rows;
}

export async function getMenuItemById(id: number) {
  const [rows] = await pool.execute<RowDataPacket[]>(
    `SELECT mi.*, c.name as category_name
     FROM menu_items mi
     JOIN categories c ON mi.category_id = c.id
     WHERE mi.id = ?`,
    [id]
  );
  return rows[0] ?? null;
}

export async function getMenuItemToppings(menuItemId: number) {
  const [rows] = await pool.execute<RowDataPacket[]>(
    `SELECT t.id, t.name, t.price, t.is_available
     FROM toppings t
     JOIN menu_item_toppings mit ON t.id = mit.topping_id
     WHERE mit.menu_item_id = ?`,
    [menuItemId]
  );
  return rows;
}

/**
 * Batch: get toppings for multiple menu items (N+1 fix)
 */
export async function getMenuItemToppingsBatch(menuItemIds: number[]) {
  if (menuItemIds.length === 0) return [];
  const placeholders = menuItemIds.map(() => '?').join(',');
  const [rows] = await pool.execute<RowDataPacket[]>(
    `SELECT mit.menu_item_id, t.id, t.name, t.price, t.is_available
     FROM toppings t
     JOIN menu_item_toppings mit ON t.id = mit.topping_id
     WHERE mit.menu_item_id IN (${placeholders})
     ORDER BY mit.menu_item_id`,
    menuItemIds
  );
  return rows;
}

export async function createMenuItem(data: {
  categoryId: number; name: string; description: string | null;
  basePrice: number; imageUrl: string | null; sortOrder: number;
}) {
  const [result] = await pool.execute<ResultSetHeader>(
    'INSERT INTO menu_items (category_id, name, description, base_price, image_url, sort_order) VALUES (?, ?, ?, ?, ?, ?)',
    [data.categoryId, data.name, data.description ?? null, data.basePrice, data.imageUrl ?? null, data.sortOrder]
  );
  return result.insertId;
}

export async function updateMenuItem(id: number, fields: { categoryId?: number; name?: string; description?: string; basePrice?: number; imageUrl?: string | null; sortOrder?: number }) {
  const sets: string[] = [];
  const values: (string | number | null)[] = [];

  if (fields.categoryId !== undefined) { sets.push('category_id = ?'); values.push(fields.categoryId); }
  if (fields.name !== undefined) { sets.push('name = ?'); values.push(fields.name); }
  if (fields.description !== undefined) { sets.push('description = ?'); values.push(fields.description); }
  if (fields.basePrice !== undefined) { sets.push('base_price = ?'); values.push(fields.basePrice); }
  if (fields.imageUrl !== undefined) { sets.push('image_url = ?'); values.push(fields.imageUrl ?? null); }
  if (fields.sortOrder !== undefined) { sets.push('sort_order = ?'); values.push(fields.sortOrder); }

  if (sets.length === 0) return;
  values.push(id);
  await pool.query(`UPDATE menu_items SET ${sets.join(', ')} WHERE id = ?`, values);
}

export async function toggleAvailability(id: number, isAvailable: boolean) {
  await pool.execute('UPDATE menu_items SET is_available = ? WHERE id = ?', [isAvailable, id]);
}

export async function setMenuItemToppings(menuItemId: number, toppingIds: number[]) {
  await pool.execute('DELETE FROM menu_item_toppings WHERE menu_item_id = ?', [menuItemId]);
  for (const toppingId of toppingIds) {
    await pool.execute(
      'INSERT INTO menu_item_toppings (menu_item_id, topping_id) VALUES (?, ?)',
      [menuItemId, toppingId]
    );
  }
}

// ============================================
// Toppings
// ============================================

export async function getAllToppings() {
  const [rows] = await pool.execute<RowDataPacket[]>(
    'SELECT * FROM toppings ORDER BY id ASC'
  );
  return rows;
}

export async function getToppingById(id: number) {
  const [rows] = await pool.execute<RowDataPacket[]>(
    'SELECT * FROM toppings WHERE id = ?', [id]
  );
  return rows[0] ?? null;
}

export async function createTopping(name: string, price: number) {
  const [result] = await pool.execute<ResultSetHeader>(
    'INSERT INTO toppings (name, price) VALUES (?, ?)',
    [name, price]
  );
  return result.insertId;
}

export async function updateTopping(id: number, fields: { name?: string; price?: number }) {
  const sets: string[] = [];
  const values: (string | number | null)[] = [];

  if (fields.name !== undefined) { sets.push('name = ?'); values.push(fields.name); }
  if (fields.price !== undefined) { sets.push('price = ?'); values.push(fields.price); }

  if (sets.length === 0) return;
  values.push(id);
  await pool.query(`UPDATE toppings SET ${sets.join(', ')} WHERE id = ?`, values);
}

export async function toggleToppingAvailability(id: number, isAvailable: boolean): Promise<void> {
  await pool.execute('UPDATE toppings SET is_available = ? WHERE id = ?', [isAvailable, id]);
}
