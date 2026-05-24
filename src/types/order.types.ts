import type { OrderStatus } from '../constants/order-status.js';

export interface CreateOrderRequest {
  items: CreateOrderItemRequest[];
  notes?: string;
}

export interface CreateOrderItemRequest {
  menuItemId: number;
  quantity: number;
  notes?: string;
  toppingIds?: number[];
}

export interface OrderResponse {
  id: number;
  queueNumber: number;
  cashierId: number;
  baristaId: number | null;
  status: OrderStatus;
  totalAmount: number;
  notes: string | null;
  items: OrderItemResponse[];
  createdAt: string;
  updatedAt: string;
}

export interface OrderItemResponse {
  id: number;
  menuItemId: number;
  menuItemName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  notes: string | null;
  toppings: OrderItemToppingResponse[];
}

export interface OrderItemToppingResponse {
  id: number;
  toppingId: number;
  toppingName: string;
  toppingPrice: number;
}
