import { Router } from 'express';
import * as orderController from '../controllers/order.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/role.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { Role } from '../constants/roles.js';
import { createOrderSchema, updateOrderStatusSchema, orderIdParamSchema, orderFilterSchema } from '../validations/order.validation.js';

const router = Router();

/**
 * @swagger
 * /orders:
 *   post:
 *     summary: Create new order (CASHIER only)
 *     tags: [Orders]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [items]
 *             properties:
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required: [menuItemId, quantity]
 *                   properties:
 *                     menuItemId: { type: integer, example: 1 }
 *                     quantity: { type: integer, example: 2 }
 *                     notes: { type: string }
 *                     toppingIds: { type: array, items: { type: integer } }
 *               notes: { type: string }
 *     responses:
 *       201:
 *         description: Order created with queue number
 *   get:
 *     summary: List orders (filter by status, date)
 *     tags: [Orders]
 *     parameters:
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [PENDING, PREPARING, READY, COMPLETED, CANCELLED] }
 *       - in: query
 *         name: date
 *         schema: { type: string, format: date }
 *     responses:
 *       200:
 *         description: List of orders
 */
router.post('/', authenticate, authorize(Role.CASHIER), validate({ body: createOrderSchema }), orderController.createOrder);
router.get('/', authenticate, validate({ query: orderFilterSchema }), orderController.getOrders);

/**
 * @swagger
 * /orders/{id}:
 *   get:
 *     summary: Get order by ID
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Order details with items and toppings
 */
router.get('/:id', authenticate, validate({ params: orderIdParamSchema }), orderController.getOrderById);

/**
 * @swagger
 * /orders/{id}/status:
 *   patch:
 *     summary: Update order status (BARISTA only)
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status: { type: string, enum: [PREPARING, READY, COMPLETED, CANCELLED] }
 *     responses:
 *       200:
 *         description: Updated order
 */
router.patch('/:id/status', authenticate, authorize(Role.BARISTA), validate({ params: orderIdParamSchema, body: updateOrderStatusSchema }), orderController.updateOrderStatus);

export default router;
