import { Router } from 'express';
import * as inventoryController from '../controllers/inventory.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/role.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { Role } from '../constants/roles.js';
import {
  createIngredientSchema,
  updateIngredientSchema,
  adjustStockSchema,
  ingredientIdParamSchema,
} from '../validations/inventory.validation.js';

const router = Router();

// ============================================
// Ingredients CRUD — /api/v1/inventory/ingredients
// ============================================

/**
 * @swagger
 * /inventory/ingredients:
 *   get:
 *     summary: List all ingredients (OWNER only)
 *     tags: [Inventory]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of ingredients with stock info
 *   post:
 *     summary: Create ingredient (OWNER only)
 *     tags: [Inventory]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, unit]
 *             properties:
 *               name: { type: string, example: Cà phê Robusta }
 *               unit: { type: string, enum: [g, kg, ml, l, unit, pack, shot, pump, tbsp], example: g }
 *               stockQuantity: { type: number, default: 0, example: 5000 }
 *               minThreshold: { type: number, default: 0, example: 500 }
 *     responses:
 *       201:
 *         description: Ingredient created
 *       409:
 *         description: Ingredient name already exists
 */
router.get('/ingredients', authenticate, authorize(Role.OWNER), inventoryController.getAllIngredients);
router.post('/ingredients', authenticate, authorize(Role.OWNER), validate({ body: createIngredientSchema }), inventoryController.createIngredient);

/**
 * @swagger
 * /inventory/ingredients/{id}:
 *   get:
 *     summary: Get ingredient by ID (OWNER only)
 *     tags: [Inventory]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Ingredient details
 *       404:
 *         description: Ingredient not found
 *   put:
 *     summary: Update ingredient (OWNER only)
 *     tags: [Inventory]
 *     security:
 *       - bearerAuth: []
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
 *             properties:
 *               name: { type: string }
 *               unit: { type: string, enum: [g, kg, ml, l, unit, pack, shot, pump, tbsp] }
 *               minThreshold: { type: number }
 *     responses:
 *       200:
 *         description: Updated ingredient
 */
router.get('/ingredients/:id', authenticate, authorize(Role.OWNER), validate({ params: ingredientIdParamSchema }), inventoryController.getIngredientById);
router.put('/ingredients/:id', authenticate, authorize(Role.OWNER), validate({ params: ingredientIdParamSchema, body: updateIngredientSchema }), inventoryController.updateIngredient);

/**
 * @swagger
 * /inventory/ingredients/{id}/active:
 *   patch:
 *     summary: Toggle ingredient active status (OWNER only)
 *     tags: [Inventory]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Updated ingredient
 */
router.patch('/ingredients/:id/active', authenticate, authorize(Role.OWNER), validate({ params: ingredientIdParamSchema }), inventoryController.toggleActive);

/**
 * @swagger
 * /inventory/ingredients/{id}/stock:
 *   patch:
 *     summary: Adjust ingredient stock (OWNER only)
 *     tags: [Inventory]
 *     security:
 *       - bearerAuth: []
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
 *             required: [quantity, action]
 *             properties:
 *               quantity: { type: number, example: 500 }
 *               action: { type: string, enum: [add, set], example: add }
 *     responses:
 *       200:
 *         description: Updated ingredient with new stock
 */
router.patch('/ingredients/:id/stock', authenticate, authorize(Role.OWNER), validate({ params: ingredientIdParamSchema, body: adjustStockSchema }), inventoryController.adjustStock);

// ============================================
// Alerts — /api/v1/inventory/alerts
// ============================================

/**
 * @swagger
 * /inventory/alerts:
 *   get:
 *     summary: Get low-stock alerts (OWNER only)
 *     tags: [Inventory]
 *     security:
 *       - bearerAuth: []
 *     description: Returns ingredients where stock_quantity <= min_threshold, with affected menu items and toppings
 *     responses:
 *       200:
 *         description: List of low-stock alerts
 */
router.get('/alerts', authenticate, authorize(Role.OWNER), inventoryController.getAlerts);

export default router;
