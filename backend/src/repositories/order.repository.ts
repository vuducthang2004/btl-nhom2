import { pool } from '../config/database.js';
import type { RowDataPacket, ResultSetHeader, PoolConnection } from 'mysql2/promise';

export async function getNextQueueNumber(connection: PoolConnection): Promise<number> {
  const [rows] = await connection.execute<RowDataPacket[]>(
    `SELECT COALESCE(MAX(queue_number), 0) as max_queue
     FROM orders
     WHERE DATE(created_at) = CURDATE()
     FOR UPDATE`
  );
  const next = (rows[0].max_queue as number) + 1;
  return next > 999 ? 1 : next;
}

export async function createOrder(
  connection: PoolConnection,
  queueNumber: number,
  cashierId: number,
  totalAmount: number,
  notes: string | null
): Promise<number> {
  const [result] = await connection.execute<ResultSetHeader>(
    'INSERT INTO orders (queue_number, cashier_id, total_amount, notes) VALUES (?, ?, ?, ?)',
    [queueNumber, cashierId, totalAmount, notes]
  );
  return result.insertId;
}

export async function createOrderItem(
  connection: PoolConnection,
  orderId: number,
  menuItemId: number,
  quantity: number,
  unitPrice: number,
  subtotal: number,
  notes: string | null
): Promise<number> {
  const [result] = await connection.execute<ResultSetHeader>(
    'INSERT INTO order_items (order_id, menu_item_id, quantity, unit_price, subtotal, notes) VALUES (?, ?, ?, ?, ?, ?)',
    [orderId, menuItemId, quantity, unitPrice, subtotal, notes]
  );
  return result.insertId;
}

export async function createOrderItemTopping(
  connection: PoolConnection,
  orderItemId: number,
  toppingId: number,
  toppingPrice: number
): Promise<void> {
  await connection.execute(
    'INSERT INTO order_item_toppings (order_item_id, topping_id, topping_price) VALUES (?, ?, ?)',
    [orderItemId, toppingId, toppingPrice]
  );
}

export async function getOrders(filters?: { status?: string; date?: string; page?: number; limit?: number }) {
  let whereClauses = '1=1';
  const params: (string | number)[] = [];

  if (filters?.status) {
    whereClauses += ' AND o.status = ?';
    params.push(filters.status);
  }
  if (filters?.date) {
    whereClauses += ' AND DATE(o.created_at) = ?';
    params.push(filters.date);
  }

  // Count total
  const [countResult] = await pool.execute<RowDataPacket[]>(
    `SELECT COUNT(*) as total FROM orders o WHERE ${whereClauses}`,
    params
  );
  const total = Number(countResult[0].total);

  // Paginated query
  const page = filters?.page ?? 1;
  const limit = filters?.limit ?? 20;
  const safeLimit = Math.max(1, Math.min(100, Math.floor(limit)));
  const safeOffset = Math.max(0, Math.floor((page - 1) * safeLimit));

  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT o.*, u.full_name as cashier_name
     FROM orders o
     JOIN users u ON o.cashier_id = u.id
     WHERE ${whereClauses}
     ORDER BY o.created_at DESC
     LIMIT ${safeLimit} OFFSET ${safeOffset}`,
    params
  );

  return { rows, total, page, limit: safeLimit };
}

export async function getOrderById(id: number) {
  const [rows] = await pool.execute<RowDataPacket[]>(
    `SELECT o.*, u.full_name as cashier_name
     FROM orders o
     JOIN users u ON o.cashier_id = u.id
     WHERE o.id = ?`,
    [id]
  );
  return rows[0] ?? null;
}

export async function getOrderItems(orderId: number) {
  const [rows] = await pool.execute<RowDataPacket[]>(
    `SELECT oi.*, mi.name as menu_item_name
     FROM order_items oi
     JOIN menu_items mi ON oi.menu_item_id = mi.id
     WHERE oi.order_id = ?`,
    [orderId]
  );
  return rows;
}

/**
 * Batch: get items for multiple orders in one query (N+1 fix)
 */
export async function getOrderItemsBatch(orderIds: number[]) {
  if (orderIds.length === 0) return [];
  const placeholders = orderIds.map(() => '?').join(',');
  const [rows] = await pool.execute<RowDataPacket[]>(
    `SELECT oi.*, mi.name as menu_item_name
     FROM order_items oi
     JOIN menu_items mi ON oi.menu_item_id = mi.id
     WHERE oi.order_id IN (${placeholders})
     ORDER BY oi.order_id, oi.id`,
    orderIds
  );
  return rows;
}

export async function getOrderItemToppings(orderItemId: number) {
  const [rows] = await pool.execute<RowDataPacket[]>(
    `SELECT oit.*, t.name as topping_name
     FROM order_item_toppings oit
     JOIN toppings t ON oit.topping_id = t.id
     WHERE oit.order_item_id = ?`,
    [orderItemId]
  );
  return rows;
}

/**
 * Batch: get toppings for multiple order items in one query (N+1 fix)
 */
export async function getOrderItemToppingsBatch(orderItemIds: number[]) {
  if (orderItemIds.length === 0) return [];
  const placeholders = orderItemIds.map(() => '?').join(',');
  const [rows] = await pool.execute<RowDataPacket[]>(
    `SELECT oit.*, t.name as topping_name
     FROM order_item_toppings oit
     JOIN toppings t ON oit.topping_id = t.id
     WHERE oit.order_item_id IN (${placeholders})
     ORDER BY oit.order_item_id`,
    orderItemIds
  );
  return rows;
}

export async function updateOrderStatus(id: number, status: string, baristaId?: number): Promise<void> {
  if (baristaId) {
    await pool.execute('UPDATE orders SET status = ?, barista_id = ? WHERE id = ?', [status, baristaId, id]);
  } else {
    await pool.execute('UPDATE orders SET status = ? WHERE id = ?', [status, id]);
  }
}

export { pool };
