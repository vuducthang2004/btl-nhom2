import { Router } from 'express';
import * as menuController from '../controllers/menu.controller.js';
import * as inventoryController from '../controllers/inventory.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/role.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { Role } from '../constants/roles.js';
import {
  createCategorySchema, updateCategorySchema,
  createMenuItemSchema, updateMenuItemSchema,
  createToppingSchema, updateToppingSchema,
  idParamSchema,
} from '../validations/menu.validation.js';
import { setRecipeSchema } from '../validations/inventory.validation.js';

const router = Router();

/**
 * @swagger
 * /menu/categories:
 *   get:
 *     summary: List all categories
 *     tags: [Menu]
 *     responses:
 *       200:
 *         description: List of categories
 *   post:
 *     summary: Create category (OWNER only)
 *     tags: [Menu]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name: { type: string, example: Cà Phê }
 *               description: { type: string }
 *               sortOrder: { type: integer, default: 0 }
 *     responses:
 *       201:
 *         description: Category created
 */
router.get('/categories', authenticate, menuController.getAllCategories);
router.post('/categories', authenticate, authorize(Role.OWNER), validate({ body: createCategorySchema }), menuController.createCategory);

/**
 * @swagger
 * /menu/categories/{id}:
 *   put:
 *     summary: Update category (OWNER only)
 *     tags: [Menu]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Updated category
 *   delete:
 *     summary: Delete category (OWNER only)
 *     tags: [Menu]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       204:
 *         description: Category deleted
 */
router.put('/categories/:id', authenticate, authorize(Role.OWNER), validate({ params: idParamSchema, body: updateCategorySchema }), menuController.updateCategory);
router.delete('/categories/:id', authenticate, authorize(Role.OWNER), validate({ params: idParamSchema }), menuController.deleteCategory);

/**
 * @swagger
 * /menu/items:
 *   get:
 *     summary: List all menu items
 *     tags: [Menu]
 *     parameters:
 *       - in: query
 *         name: categoryId
 *         schema: { type: integer }
 *         description: Filter by category
 *     responses:
 *       200:
 *         description: List of menu items with toppings
 *   post:
 *     summary: Create menu item (OWNER only)
 *     tags: [Menu]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [categoryId, name, basePrice]
 *             properties:
 *               categoryId: { type: integer }
 *               name: { type: string, example: Cà Phê Sữa }
 *               description: { type: string }
 *               basePrice: { type: number, example: 29000 }
 *               imageUrl: { type: string }
 *               sortOrder: { type: integer }
 *               toppingIds: { type: array, items: { type: integer } }
 *     responses:
 *       201:
 *         description: Menu item created
 */
router.get('/items', authenticate, menuController.getAllMenuItems);
router.post('/items', authenticate, authorize(Role.OWNER), validate({ body: createMenuItemSchema }), menuController.createMenuItem);

/**
 * @swagger
 * /menu/items/{id}:
 *   get:
 *     summary: Get menu item by ID
 *     tags: [Menu]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Menu item with toppings
 *   put:
 *     summary: Update menu item (OWNER only)
 *     tags: [Menu]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Updated menu item
 */
router.get('/items/:id', authenticate, validate({ params: idParamSchema }), menuController.getMenuItemById);
router.put('/items/:id', authenticate, authorize(Role.OWNER), validate({ params: idParamSchema, body: updateMenuItemSchema }), menuController.updateMenuItem);

/**
 * @swagger
 * /menu/items/{id}/availability:
 *   patch:
 *     summary: Toggle item availability (OWNER, BARISTA)
 *     tags: [Menu]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Updated menu item
 */
router.patch('/items/:id/availability', authenticate, authorize(Role.OWNER, Role.BARISTA), validate({ params: idParamSchema }), menuController.toggleAvailability);

/**
 * @swagger
 * /menu/toppings:
 *   get:
 *     summary: List all toppings
 *     tags: [Menu]
 *     responses:
 *       200:
 *         description: List of toppings
 *   post:
 *     summary: Create topping (OWNER only)
 *     tags: [Menu]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, price]
 *             properties:
 *               name: { type: string, example: Trân Châu Đen }
 *               price: { type: number, example: 10000 }
 *     responses:
 *       201:
 *         description: Topping created
 */
router.get('/toppings', authenticate, menuController.getAllToppings);
router.post('/toppings', authenticate, authorize(Role.OWNER), validate({ body: createToppingSchema }), menuController.createTopping);

/**
 * @swagger
 * /menu/toppings/{id}:
 *   put:
 *     summary: Update topping (OWNER only)
 *     tags: [Menu]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Updated topping
 */
router.put('/toppings/:id', authenticate, authorize(Role.OWNER), validate({ params: idParamSchema, body: updateToppingSchema }), menuController.updateTopping);

// ============================================
// Recipe Endpoints (Menu Item / Topping Ingredients)
// ============================================

/**
 * @swagger
 * /menu/items/{id}/ingredients:
 *   get:
 *     summary: Get menu item recipe/ingredients (OWNER only)
 *     tags: [Menu]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: List of ingredients with quantity per unit
 *   put:
 *     summary: Set menu item recipe/ingredients (OWNER only)
 *     tags: [Menu]
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
 *             required: [items]
 *             properties:
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required: [ingredientId, quantityPerUnit]
 *                   properties:
 *                     ingredientId: { type: integer, example: 1 }
 *                     quantityPerUnit: { type: number, example: 18 }
 *     responses:
 *       200:
 *         description: Updated recipe
 */
router.get('/items/:id/ingredients', authenticate, authorize(Role.OWNER), validate({ params: idParamSchema }), inventoryController.getMenuItemIngredients);
router.put('/items/:id/ingredients', authenticate, authorize(Role.OWNER), validate({ params: idParamSchema, body: setRecipeSchema }), inventoryController.setMenuItemIngredients);

/**
 * @swagger
 * /menu/toppings/{id}/ingredients:
 *   get:
 *     summary: Get topping recipe/ingredients (OWNER only)
 *     tags: [Menu]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: List of ingredients with quantity per unit
 *   put:
 *     summary: Set topping recipe/ingredients (OWNER only)
 *     tags: [Menu]
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
 *             required: [items]
 *             properties:
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required: [ingredientId, quantityPerUnit]
 *                   properties:
 *                     ingredientId: { type: integer, example: 11 }
 *                     quantityPerUnit: { type: number, example: 30 }
 *     responses:
 *       200:
 *         description: Updated topping recipe
 */
router.get('/toppings/:id/ingredients', authenticate, authorize(Role.OWNER), validate({ params: idParamSchema }), inventoryController.getToppingIngredients);
router.put('/toppings/:id/ingredients', authenticate, authorize(Role.OWNER), validate({ params: idParamSchema, body: setRecipeSchema }), inventoryController.setToppingIngredients);

export default router;
