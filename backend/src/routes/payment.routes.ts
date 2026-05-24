import { Router } from 'express';
import * as paymentController from '../controllers/payment.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/role.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { Role } from '../constants/roles.js';
import { createPaymentSchema, paymentOrderIdParamSchema } from '../validations/payment.validation.js';

const router = Router();

/**
 * @swagger
 * /payments:
 *   post:
 *     summary: Process payment for an order (CASHIER only)
 *     tags: [Payments]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [orderId, method]
 *             properties:
 *               orderId: { type: integer, example: 1 }
 *               method: { type: string, enum: [CASH, TRANSFER, E_WALLET] }
 *               transactionRef: { type: string }
 *     responses:
 *       201:
 *         description: Payment processed
 *       409:
 *         description: Order already paid
 */
router.post('/', authenticate, authorize(Role.CASHIER), validate({ body: createPaymentSchema }), paymentController.processPayment);

/**
 * @swagger
 * /payments/{orderId}:
 *   get:
 *     summary: Get payment by order ID (CASHIER, OWNER)
 *     tags: [Payments]
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Payment details
 */
router.get('/:orderId', authenticate, authorize(Role.CASHIER, Role.OWNER), validate({ params: paymentOrderIdParamSchema }), paymentController.getPaymentByOrderId);

export default router;
