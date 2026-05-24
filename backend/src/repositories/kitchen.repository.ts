import { pool } from '../config/database.js';
import type { RowDataPacket } from 'mysql2';

export async function getActiveQueue() {
  const [rows] = await pool.execute<RowDataPacket[]>(
    `SELECT o.id, o.queue_number, o.status, o.total_amount, o.notes, o.created_at
     FROM orders o
     WHERE o.status IN ('PENDING', 'PREPARING')
     AND DATE(o.created_at) = CURDATE()
     ORDER BY o.created_at ASC`
  );
  return rows;
}

export async function getReadyOrders() {
  const [rows] = await pool.execute<RowDataPacket[]>(
    `SELECT o.queue_number, o.status, o.updated_at as ready_at
     FROM orders o
     WHERE o.status = 'READY'
     AND DATE(o.created_at) = CURDATE()
     ORDER BY o.updated_at DESC`
  );
  return rows;
}

export async function getOrderItemsSummary(orderId: number) {
  const [rows] = await pool.execute<RowDataPacket[]>(
    `SELECT oi.id, mi.name, oi.quantity
     FROM order_items oi
     JOIN menu_items mi ON oi.menu_item_id = mi.id
     WHERE oi.order_id = ?`,
    [orderId]
  );
  return rows;
}

/**
 * Batch: get items for multiple orders (N+1 fix)
 */
export async function getOrderItemsSummaryBatch(orderIds: number[]) {
  if (orderIds.length === 0) return [];
  const placeholders = orderIds.map(() => '?').join(',');
  const [rows] = await pool.execute<RowDataPacket[]>(
    `SELECT oi.id, oi.order_id, mi.name, oi.quantity
     FROM order_items oi
     JOIN menu_items mi ON oi.menu_item_id = mi.id
     WHERE oi.order_id IN (${placeholders})
     ORDER BY oi.order_id, oi.id`,
    orderIds
  );
  return rows;
}

export async function getOrderItemToppingNames(orderItemId: number) {
  const [rows] = await pool.execute<RowDataPacket[]>(
    `SELECT t.name
     FROM order_item_toppings oit
     JOIN toppings t ON oit.topping_id = t.id
     WHERE oit.order_item_id = ?`,
    [orderItemId]
  );
  return rows.map((r) => r.name as string);
}

/**
 * Batch: get topping names for multiple order items (N+1 fix)
 */
export async function getOrderItemToppingNamesBatch(orderItemIds: number[]) {
  if (orderItemIds.length === 0) return [];
  const placeholders = orderItemIds.map(() => '?').join(',');
  const [rows] = await pool.execute<RowDataPacket[]>(
    `SELECT oit.order_item_id, t.name
     FROM order_item_toppings oit
     JOIN toppings t ON oit.topping_id = t.id
     WHERE oit.order_item_id IN (${placeholders})
     ORDER BY oit.order_item_id`,
    orderItemIds
  );
  return rows;
}
