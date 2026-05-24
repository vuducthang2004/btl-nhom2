import * as paymentRepo from '../repositories/payment.repository.js';
import * as orderRepo from '../repositories/order.repository.js';
import * as inventoryService from './inventory.service.js';
import { AppError } from '../middleware/error-handler.middleware.js';
import { HttpStatus } from '../constants/http-status.js';
import type { CreatePaymentRequest, PaymentResponse } from '../types/payment.types.js';

function toResponse(row: any): PaymentResponse {
  return {
    id: row.id,
    orderId: row.order_id,
    amount: Number(row.amount),
    method: row.method,
    status: row.status,
    transactionRef: row.transaction_ref,
    paidAt: row.paid_at,
    createdAt: row.created_at,
  };
}

export async function processPayment(data: CreatePaymentRequest): Promise<PaymentResponse> {
  const order = await orderRepo.getOrderById(data.orderId);
  if (!order) throw new AppError('Order not found', HttpStatus.NOT_FOUND);

  const existingPayment = await paymentRepo.getPaymentByOrderId(data.orderId);
  if (existingPayment) throw new AppError('Order already paid', HttpStatus.CONFLICT);

  const paymentId = await paymentRepo.createPayment(
    data.orderId,
    Number(order.total_amount),
    data.method,
    data.transactionRef ?? null
  );

  // Deduct inventory stock (graceful — never blocks payment)
  try {
    await inventoryService.deductStockForOrder(data.orderId);
  } catch (err) {
    console.error(`🚨 Inventory deduction FAILED for order ${data.orderId}:`, err);
  }

  const payment = await paymentRepo.getPaymentByOrderId(data.orderId);
  return toResponse(payment);
}

export async function getPaymentByOrderId(orderId: number): Promise<PaymentResponse> {
  const payment = await paymentRepo.getPaymentByOrderId(orderId);
  if (!payment) throw new AppError('Payment not found', HttpStatus.NOT_FOUND);
  return toResponse(payment);
}
