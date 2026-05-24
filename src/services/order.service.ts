import * as orderRepo from '../repositories/order.repository.js';
import * as menuRepo from '../repositories/menu.repository.js';
import { AppError } from '../middleware/error-handler.middleware.js';
import { HttpStatus } from '../constants/http-status.js';
import type { CreateOrderRequest, OrderResponse, OrderItemResponse } from '../types/order.types.js';
import type { PaginationMeta } from '../types/common.types.js';

export async function createOrder(cashierId: number, data: CreateOrderRequest): Promise<OrderResponse> {
  const connection = await orderRepo.pool.getConnection();

  try {
    await connection.beginTransaction();

    // Validate all items and calculate totals
    let totalAmount = 0;
    const itemsWithPrices: { menuItemId: number; quantity: number; unitPrice: number; subtotal: number; notes: string | null; toppings: { id: number; price: number }[] }[] = [];

    for (const item of data.items) {
      const menuItem = await menuRepo.getMenuItemById(item.menuItemId);
      if (!menuItem) throw new AppError(`Menu item ${item.menuItemId} not found`, HttpStatus.BAD_REQUEST);
      if (!menuItem.is_available) throw new AppError(`Menu item "${menuItem.name}" is not available`, HttpStatus.BAD_REQUEST);

      let unitPrice = Number(menuItem.base_price);
      const toppings: { id: number; price: number }[] = [];

      if (item.toppingIds?.length) {
        for (const toppingId of item.toppingIds) {
          const topping = await menuRepo.getToppingById(toppingId);
          if (!topping) throw new AppError(`Topping ${toppingId} not found`, HttpStatus.BAD_REQUEST);
          if (!topping.is_available) throw new AppError(`Topping "${topping.name}" is not available`, HttpStatus.BAD_REQUEST);
          toppings.push({ id: toppingId, price: Number(topping.price) });
          unitPrice += Number(topping.price);
        }
      }

      const subtotal = unitPrice * item.quantity;
      totalAmount += subtotal;
      itemsWithPrices.push({ menuItemId: item.menuItemId, quantity: item.quantity, unitPrice, subtotal, notes: item.notes ?? null, toppings });
    }

    // Get next queue number (with lock)
    const queueNumber = await orderRepo.getNextQueueNumber(connection);

    // Create order
    const orderId = await orderRepo.createOrder(connection, queueNumber, cashierId, totalAmount, data.notes ?? null);

    // Create order items and toppings
    for (const item of itemsWithPrices) {
      const orderItemId = await orderRepo.createOrderItem(connection, orderId, item.menuItemId, item.quantity, item.unitPrice, item.subtotal, item.notes);

      for (const topping of item.toppings) {
        await orderRepo.createOrderItemTopping(connection, orderItemId, topping.id, topping.price);
      }
    }

    await connection.commit();
    return getOrderById(orderId);
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

export async function getOrders(filters?: { status?: string; date?: string; page?: number; limit?: number }): Promise<{ data: OrderResponse[]; meta: PaginationMeta }> {
  const result = await orderRepo.getOrders(filters);
  const orderIds = result.rows.map((r: any) => r.id);

  if (orderIds.length === 0) {
    return {
      data: [],
      meta: { page: result.page, limit: result.limit, total: result.total, totalPages: Math.ceil(result.total / result.limit) },
    };
  }

  // Batch fetch all items for all orders (1 query instead of N)
  const allItems = await orderRepo.getOrderItemsBatch(orderIds);
  const itemIds = allItems.map((i: any) => i.id);

  // Batch fetch all toppings for all items (1 query instead of N*M)
  const allToppings = itemIds.length > 0 ? await orderRepo.getOrderItemToppingsBatch(itemIds) : [];

  // Group toppings by order_item_id
  const toppingsByItemId = new Map<number, any[]>();
  for (const t of allToppings) {
    const arr = toppingsByItemId.get(t.order_item_id) ?? [];
    arr.push(t);
    toppingsByItemId.set(t.order_item_id, arr);
  }

  // Group items by order_id
  const itemsByOrderId = new Map<number, OrderItemResponse[]>();
  for (const itemRow of allItems) {
    const toppingRows = toppingsByItemId.get(itemRow.id) ?? [];
    const item: OrderItemResponse = {
      id: itemRow.id,
      menuItemId: itemRow.menu_item_id,
      menuItemName: itemRow.menu_item_name,
      quantity: itemRow.quantity,
      unitPrice: Number(itemRow.unit_price),
      subtotal: Number(itemRow.subtotal),
      notes: itemRow.notes,
      toppings: toppingRows.map((t: any) => ({
        id: t.id,
        toppingId: t.topping_id,
        toppingName: t.topping_name,
        toppingPrice: Number(t.topping_price),
      })),
    };
    const arr = itemsByOrderId.get(itemRow.order_id) ?? [];
    arr.push(item);
    itemsByOrderId.set(itemRow.order_id, arr);
  }

  const orders: OrderResponse[] = result.rows.map((row: any) =>
    toOrderResponse(row, itemsByOrderId.get(row.id) ?? [])
  );

  return {
    data: orders,
    meta: { page: result.page, limit: result.limit, total: result.total, totalPages: Math.ceil(result.total / result.limit) },
  };
}

export async function getOrderById(id: number): Promise<OrderResponse> {
  const row = await orderRepo.getOrderById(id);
  if (!row) throw new AppError('Order not found', HttpStatus.NOT_FOUND);

  const items = await buildOrderItems(id);
  return toOrderResponse(row, items);
}

export async function updateOrderStatus(orderId: number, status: string, baristaId?: number): Promise<OrderResponse> {
  const order = await orderRepo.getOrderById(orderId);
  if (!order) throw new AppError('Order not found', HttpStatus.NOT_FOUND);

  // State machine: enforce valid transitions
  const VALID_TRANSITIONS: Record<string, string[]> = {
    PENDING: ['PREPARING', 'CANCELLED'],
    PREPARING: ['READY', 'CANCELLED'],
    READY: ['COMPLETED'],
    COMPLETED: [],
    CANCELLED: [],
  };

  const allowed = VALID_TRANSITIONS[order.status] ?? [];
  if (!allowed.includes(status)) {
    throw new AppError(
      `Cannot transition from ${order.status} to ${status}`,
      HttpStatus.BAD_REQUEST
    );
  }

  await orderRepo.updateOrderStatus(orderId, status, baristaId);
  return getOrderById(orderId);
}

async function buildOrderItems(orderId: number): Promise<OrderItemResponse[]> {
  const itemRows = await orderRepo.getOrderItems(orderId);
  const items: OrderItemResponse[] = [];

  for (const itemRow of itemRows) {
    const toppingRows = await orderRepo.getOrderItemToppings(itemRow.id);
    items.push({
      id: itemRow.id,
      menuItemId: itemRow.menu_item_id,
      menuItemName: itemRow.menu_item_name,
      quantity: itemRow.quantity,
      unitPrice: Number(itemRow.unit_price),
      subtotal: Number(itemRow.subtotal),
      notes: itemRow.notes,
      toppings: toppingRows.map((t: any) => ({
        id: t.id,
        toppingId: t.topping_id,
        toppingName: t.topping_name,
        toppingPrice: Number(t.topping_price),
      })),
    });
  }

  return items;
}

function toOrderResponse(row: any, items: OrderItemResponse[]): OrderResponse {
  return {
    id: row.id,
    queueNumber: row.queue_number,
    cashierId: row.cashier_id,
    baristaId: row.barista_id,
    status: row.status,
    totalAmount: Number(row.total_amount),
    notes: row.notes,
    items,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
