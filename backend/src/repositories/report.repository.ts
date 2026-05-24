import { pool } from '../config/database.js';
import type { RowDataPacket } from 'mysql2';

// ============================================
// Dashboard
// ============================================

export async function getDashboardData(today: string) {
  const [orderStats] = await pool.execute<RowDataPacket[]>(
    `SELECT
       COUNT(*) as total_orders,
       SUM(CASE WHEN o.status = 'COMPLETED' THEN 1 ELSE 0 END) as completed_orders,
       SUM(CASE WHEN o.status = 'CANCELLED' THEN 1 ELSE 0 END) as cancelled_orders,
       COALESCE(SUM(CASE WHEN p.status = 'SUCCESS' THEN p.amount ELSE 0 END), 0) as total_revenue
     FROM orders o
     LEFT JOIN payments p ON o.id = p.order_id
     WHERE DATE(o.created_at) = ?`,
    [today]
  );

  const [lowStock] = await pool.execute<RowDataPacket[]>(
    `SELECT COUNT(*) as count FROM ingredients WHERE stock_quantity <= min_threshold AND is_active = TRUE`
  );

  const [topSelling] = await pool.execute<RowDataPacket[]>(
    `SELECT mi.name, SUM(oi.quantity) as total_quantity
     FROM order_items oi
     JOIN menu_items mi ON oi.menu_item_id = mi.id
     JOIN orders o ON oi.order_id = o.id
     JOIN payments p ON o.id = p.order_id
     WHERE DATE(o.created_at) = ? AND p.status = 'SUCCESS'
     GROUP BY oi.menu_item_id, mi.name
     ORDER BY total_quantity DESC
     LIMIT 1`,
    [today]
  );

  return {
    orderStats: orderStats[0],
    lowStockCount: Number(lowStock[0].count),
    topSelling: topSelling[0] ?? null,
  };
}

// ============================================
// Revenue Summary
// ============================================

export async function getRevenueSummary(from: string, to: string) {
  const [rows] = await pool.execute<RowDataPacket[]>(
    `SELECT
       COUNT(DISTINCT o.id) as total_orders,
       SUM(CASE WHEN o.status = 'COMPLETED' THEN 1 ELSE 0 END) as completed_orders,
       SUM(CASE WHEN o.status = 'CANCELLED' THEN 1 ELSE 0 END) as cancelled_orders,
       COALESCE(SUM(CASE WHEN p.status = 'SUCCESS' THEN p.amount ELSE 0 END), 0) as total_revenue
     FROM orders o
     LEFT JOIN payments p ON o.id = p.order_id
     WHERE DATE(o.created_at) >= ? AND DATE(o.created_at) <= ?`,
    [from, to]
  );
  return rows[0];
}

// ============================================
// Revenue By Payment Method
// ============================================

export async function getRevenueByMethod(from: string, to: string) {
  const [rows] = await pool.execute<RowDataPacket[]>(
    `SELECT
       p.method,
       COALESCE(SUM(p.amount), 0) as total_amount,
       COUNT(*) as order_count
     FROM payments p
     JOIN orders o ON p.order_id = o.id
     WHERE p.status = 'SUCCESS' AND DATE(o.created_at) >= ? AND DATE(o.created_at) <= ?
     GROUP BY p.method
     ORDER BY total_amount DESC`,
    [from, to]
  );
  return rows;
}

// ============================================
// Top Selling Items
// ============================================

export async function getTopSelling(from: string, to: string, limit: number) {
  const safeLimit = Math.max(1, Math.min(50, Math.floor(limit)));
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT
       oi.menu_item_id,
       mi.name,
       c.name as category_name,
       SUM(oi.quantity) as total_quantity,
       SUM(oi.subtotal) as total_revenue
     FROM order_items oi
     JOIN menu_items mi ON oi.menu_item_id = mi.id
     JOIN categories c ON mi.category_id = c.id
     JOIN orders o ON oi.order_id = o.id
     JOIN payments p ON o.id = p.order_id
     WHERE p.status = 'SUCCESS' AND DATE(o.created_at) >= ? AND DATE(o.created_at) <= ?
     GROUP BY oi.menu_item_id, mi.name, c.name
     ORDER BY total_quantity DESC
     LIMIT ${safeLimit}`,
    [from, to]
  );
  return rows;
}

export async function getTotalRevenue(from: string, to: string) {
  const [rows] = await pool.execute<RowDataPacket[]>(
    `SELECT COALESCE(SUM(p.amount), 0) as total
     FROM payments p
     JOIN orders o ON p.order_id = o.id
     WHERE p.status = 'SUCCESS' AND DATE(o.created_at) >= ? AND DATE(o.created_at) <= ?`,
    [from, to]
  );
  return Number(rows[0].total);
}

// ============================================
// Category Performance
// ============================================

export async function getCategoryPerformance(from: string, to: string) {
  const [rows] = await pool.execute<RowDataPacket[]>(
    `SELECT
       c.id as category_id,
       c.name,
       COUNT(DISTINCT oi.menu_item_id) as total_items,
       COALESCE(SUM(oi.quantity), 0) as total_quantity,
       COALESCE(SUM(oi.subtotal), 0) as total_revenue
     FROM categories c
     LEFT JOIN menu_items mi ON c.id = mi.category_id
     LEFT JOIN order_items oi ON mi.id = oi.menu_item_id
     LEFT JOIN orders o ON oi.order_id = o.id AND DATE(o.created_at) >= ? AND DATE(o.created_at) <= ?
     LEFT JOIN payments p ON o.id = p.order_id AND p.status = 'SUCCESS'
     WHERE (p.id IS NOT NULL OR oi.id IS NULL)
     GROUP BY c.id, c.name
     ORDER BY total_revenue DESC`,
    [from, to]
  );
  return rows;
}

// ============================================
// Cashier Performance
// ============================================

export async function getCashierPerformance(from: string, to: string) {
  const [rows] = await pool.execute<RowDataPacket[]>(
    `SELECT
       u.id as user_id,
       u.full_name,
       COUNT(DISTINCT o.id) as total_orders,
       COALESCE(SUM(CASE WHEN p.status = 'SUCCESS' THEN p.amount ELSE 0 END), 0) as total_revenue
     FROM users u
     JOIN orders o ON u.id = o.cashier_id
     LEFT JOIN payments p ON o.id = p.order_id
     WHERE u.role = 'CASHIER' AND DATE(o.created_at) >= ? AND DATE(o.created_at) <= ?
     GROUP BY u.id, u.full_name
     ORDER BY total_revenue DESC`,
    [from, to]
  );
  return rows;
}

// ============================================
// Inventory Summary
// ============================================

export async function getInventorySummary() {
  const [rows] = await pool.execute<RowDataPacket[]>(
    `SELECT
       i.id, i.name, i.unit, i.stock_quantity, i.min_threshold, i.is_active,
       (SELECT COUNT(DISTINCT mii.menu_item_id) FROM menu_item_ingredients mii WHERE mii.ingredient_id = i.id)
       + (SELECT COUNT(DISTINCT ti.topping_id) FROM topping_ingredients ti WHERE ti.ingredient_id = i.id) as affected_items_count
     FROM ingredients i
     WHERE i.is_active = TRUE
     ORDER BY i.stock_quantity ASC`
  );
  return rows;
}

// ============================================
// Inventory Movements
// ============================================

export async function getInventoryMovements(filters: {
  ingredientId?: number;
  type?: string;
  from?: string;
  to?: string;
  page: number;
  limit: number;
}) {
  let whereClauses = '1=1';
  const params: (string | number)[] = [];

  if (filters.ingredientId) {
    whereClauses += ' AND im.ingredient_id = ?';
    params.push(filters.ingredientId);
  }
  if (filters.type) {
    whereClauses += ' AND im.change_type = ?';
    params.push(filters.type);
  }
  if (filters.from) {
    whereClauses += ' AND DATE(im.created_at) >= ?';
    params.push(filters.from);
  }
  if (filters.to) {
    whereClauses += ' AND DATE(im.created_at) <= ?';
    params.push(filters.to);
  }

  // Count total
  const [countResult] = await pool.execute<RowDataPacket[]>(
    `SELECT COUNT(*) as total FROM inventory_movements im WHERE ${whereClauses}`,
    params
  );
  const total = Number(countResult[0].total);

  // Get paginated data
  const offset = (filters.page - 1) * filters.limit;
  const safeLimit = Math.max(1, Math.min(100, Math.floor(filters.limit)));
  const safeOffset = Math.max(0, Math.floor(offset));
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT im.*, i.name as ingredient_name
     FROM inventory_movements im
     JOIN ingredients i ON im.ingredient_id = i.id
     WHERE ${whereClauses}
     ORDER BY im.created_at DESC
     LIMIT ${safeLimit} OFFSET ${safeOffset}`,
    params
  );

  return { rows, total };
}
