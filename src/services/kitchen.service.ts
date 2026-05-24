import * as kitchenRepo from '../repositories/kitchen.repository.js';
import type { QueueItem, DisplayItem } from '../types/kitchen.types.js';

export async function getQueue(): Promise<QueueItem[]> {
  const rows = await kitchenRepo.getActiveQueue();
  if (rows.length === 0) return [];

  const orderIds = rows.map((r: any) => r.id);

  // Batch: 1 query for all items across all orders
  const allItems = await kitchenRepo.getOrderItemsSummaryBatch(orderIds);
  const allItemIds = allItems.map((i: any) => i.id);

  // Batch: 1 query for all toppings across all items
  const allToppings = allItemIds.length > 0
    ? await kitchenRepo.getOrderItemToppingNamesBatch(allItemIds)
    : [];

  // Group toppings by order_item_id
  const toppingsByItemId = new Map<number, string[]>();
  for (const t of allToppings) {
    const arr = toppingsByItemId.get(t.order_item_id) ?? [];
    arr.push(t.name);
    toppingsByItemId.set(t.order_item_id, arr);
  }

  // Group items by order_id
  const itemsByOrderId = new Map<number, { name: string; quantity: number; toppings: string[] }[]>();
  for (const ir of allItems) {
    const toppings = toppingsByItemId.get(ir.id) ?? [];
    const arr = itemsByOrderId.get(ir.order_id) ?? [];
    arr.push({ name: ir.name, quantity: ir.quantity, toppings });
    itemsByOrderId.set(ir.order_id, arr);
  }

  return rows.map((row: any) => ({
    id: row.id,
    queueNumber: row.queue_number,
    status: row.status,
    totalAmount: Number(row.total_amount),
    notes: row.notes,
    items: itemsByOrderId.get(row.id) ?? [],
    createdAt: row.created_at,
  }));
}

export async function getDisplay(): Promise<DisplayItem[]> {
  const rows = await kitchenRepo.getReadyOrders();
  return rows.map((r: any) => ({
    queueNumber: r.queue_number,
    status: r.status,
    readyAt: r.ready_at,
  }));
}
