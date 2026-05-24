import type { OrderStatus } from '../constants/order-status.js';

export interface QueueItem {
  id: number;
  queueNumber: number;
  status: OrderStatus;
  totalAmount: number;
  notes: string | null;
  items: { name: string; quantity: number; toppings: string[] }[];
  createdAt: string;
}

export interface DisplayItem {
  queueNumber: number;
  status: string;
  readyAt: string;
}
