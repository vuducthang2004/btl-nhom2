import { Router } from 'express';
import * as userController from '../controllers/user.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/role.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { Role } from '../constants/roles.js';
import { createUserSchema, updateUserSchema, resetPasswordSchema, userIdParamSchema } from '../validations/user.validation.js';

const router = Router();

/**
 * @swagger
 * /users:
 *   post:
 *     summary: Create staff account (OWNER only)
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [username, password, fullName, role]
 *             properties:
 *               username: { type: string, example: cashier2 }
 *               password: { type: string, example: pass123 }
 *               fullName: { type: string, example: Thu Ngân 2 }
 *               role: { type: string, enum: [CASHIER, BARISTA] }
 *     responses:
 *       201:
 *         description: User created
 *   get:
 *     summary: List all staff (OWNER only)
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: List of users
 */
router.post('/', authenticate, authorize(Role.OWNER), validate({ body: createUserSchema }), userController.createUser);
router.get('/', authenticate, authorize(Role.OWNER), userController.getAllUsers);

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Get user by ID (OWNER only)
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: User details
 *   put:
 *     summary: Update user (OWNER only)
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fullName: { type: string }
 *               role: { type: string, enum: [CASHIER, BARISTA] }
 *     responses:
 *       200:
 *         description: Updated user
 */
router.get('/:id', authenticate, authorize(Role.OWNER), validate({ params: userIdParamSchema }), userController.getUserById);
router.put('/:id', authenticate, authorize(Role.OWNER), validate({ params: userIdParamSchema, body: updateUserSchema }), userController.updateUser);

/**
 * @swagger
 * /users/{id}/active:
 *   patch:
 *     summary: Toggle user active status (OWNER only)
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Updated user
 */
router.patch('/:id/active', authenticate, authorize(Role.OWNER), validate({ params: userIdParamSchema }), userController.toggleActive);

/**
 * @swagger
 * /users/{id}/password:
 *   patch:
 *     summary: Reset user password (OWNER only)
 *     tags: [Users]
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
 *             required: [newPassword]
 *             properties:
 *               newPassword: { type: string }
 *     responses:
 *       204:
 *         description: Password reset successful
 */
router.patch('/:id/password', authenticate, authorize(Role.OWNER), validate({ params: userIdParamSchema, body: resetPasswordSchema }), userController.resetPassword);

export default router;
