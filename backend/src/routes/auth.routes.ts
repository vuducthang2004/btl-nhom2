import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import * as authController from '../controllers/auth.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { loginSchema, refreshSchema } from '../validations/auth.validation.js';

const router = Router();

// Stricter rate limit for login (brute force protection)
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many login attempts, please try again later.' },
});

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login with username and password
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [username, password]
 *             properties:
 *               username: { type: string, example: admin }
 *               password: { type: string, example: admin123 }
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 */
router.post('/login', loginLimiter, validate({ body: loginSchema }), authController.login);

/**
 * @swagger
 * /auth/refresh:
 *   post:
 *     summary: Refresh access token
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [refreshToken]
 *             properties:
 *               refreshToken: { type: string }
 *     responses:
 *       200:
 *         description: New access token
 *       401:
 *         description: Invalid refresh token
 */
router.post('/refresh', validate({ body: refreshSchema }), authController.refresh);

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Logout (clear refresh token)
 *     tags: [Auth]
 *     responses:
 *       204:
 *         description: Logout successful
 */
router.post('/logout', authenticate, authController.logout);

/**
 * @swagger
 * /auth/me:
 *   get:
 *     summary: Get current user info
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Current user info
 */
router.get('/me', authenticate, authController.getMe);

export default router;
