import { pool } from '../config/database.js';
import type { RowDataPacket, ResultSetHeader } from 'mysql2';

export async function createPayment(orderId: number, amount: number, method: string, transactionRef: string | null): Promise<number> {
  const [result] = await pool.execute<ResultSetHeader>(
    'INSERT INTO payments (order_id, amount, method, status, transaction_ref, paid_at) VALUES (?, ?, ?, ?, ?, NOW())',
    [orderId, amount, method, 'SUCCESS', transactionRef]
  );
  return result.insertId;
}

export async function getPaymentByOrderId(orderId: number) {
  const [rows] = await pool.execute<RowDataPacket[]>(
    'SELECT * FROM payments WHERE order_id = ?',
    [orderId]
  );
  return rows[0] ?? null;
}
