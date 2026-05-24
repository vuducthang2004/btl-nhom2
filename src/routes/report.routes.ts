import { Router } from 'express';
import * as reportController from '../controllers/report.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/role.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { Role } from '../constants/roles.js';
import {
  revenueSummarySchema,
  topSellingSchema,
  periodSchema,
  inventoryMovementsSchema,
  exportSchema,
} from '../validations/report.validation.js';

const router = Router();

// ============================================
// Dashboard — /api/v1/reports/dashboard
// ============================================

/**
 * @swagger
 * /reports/dashboard:
 *   get:
 *     summary: Dashboard overview (OWNER only)
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     description: Returns today's revenue, order count, low stock alerts, and top selling item in a single API call
 *     responses:
 *       200:
 *         description: Dashboard overview data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   type: object
 *                   properties:
 *                     todayRevenue: { type: number, example: 2350000 }
 *                     todayOrders: { type: integer, example: 47 }
 *                     completedOrders: { type: integer, example: 42 }
 *                     cancelledOrders: { type: integer, example: 5 }
 *                     lowStockCount: { type: integer, example: 3 }
 *                     topSellingToday:
 *                       type: object
 *                       nullable: true
 *                       properties:
 *                         name: { type: string, example: Cà Phê Sữa }
 *                         quantity: { type: integer, example: 23 }
 */
router.get('/dashboard', authenticate, authorize(Role.OWNER), reportController.getDashboard);

// ============================================
// Revenue — /api/v1/reports/revenue
// ============================================

/**
 * @swagger
 * /reports/revenue/summary:
 *   get:
 *     summary: Revenue summary (OWNER only)
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     description: Aggregate revenue data for a given period. Custom date range limited to 90 days.
 *     parameters:
 *       - in: query
 *         name: period
 *         required: true
 *         schema: { type: string, enum: [daily, monthly, yearly, custom] }
 *         description: Report period type
 *       - in: query
 *         name: date
 *         schema: { type: string, example: "2026-05-24" }
 *         description: Required when period=daily (YYYY-MM-DD)
 *       - in: query
 *         name: month
 *         schema: { type: string, example: "2026-05" }
 *         description: Required when period=monthly (YYYY-MM)
 *       - in: query
 *         name: year
 *         schema: { type: string, example: "2026" }
 *         description: Required when period=yearly (YYYY)
 *       - in: query
 *         name: from
 *         schema: { type: string, example: "2026-05-01" }
 *         description: Required when period=custom (YYYY-MM-DD)
 *       - in: query
 *         name: to
 *         schema: { type: string, example: "2026-05-24" }
 *         description: Required when period=custom (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: Revenue summary data
 *       400:
 *         description: Missing date parameter or date range exceeds 90 days
 */
router.get('/revenue/summary', authenticate, authorize(Role.OWNER), validate({ query: revenueSummarySchema }), reportController.getRevenueSummary);

/**
 * @swagger
 * /reports/revenue/by-method:
 *   get:
 *     summary: Revenue by payment method (OWNER only)
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     description: Revenue breakdown by CASH, TRANSFER, E_WALLET
 *     parameters:
 *       - in: query
 *         name: period
 *         required: true
 *         schema: { type: string, enum: [daily, monthly, yearly, custom] }
 *       - in: query
 *         name: date
 *         schema: { type: string, example: "2026-05-24" }
 *       - in: query
 *         name: month
 *         schema: { type: string, example: "2026-05" }
 *       - in: query
 *         name: year
 *         schema: { type: string, example: "2026" }
 *       - in: query
 *         name: from
 *         schema: { type: string, example: "2026-05-01" }
 *       - in: query
 *         name: to
 *         schema: { type: string, example: "2026-05-24" }
 *     responses:
 *       200:
 *         description: Revenue grouped by payment method
 */
router.get('/revenue/by-method', authenticate, authorize(Role.OWNER), validate({ query: periodSchema }), reportController.getRevenueByMethod);

// ============================================
// Sales Analytics — /api/v1/reports
// ============================================

/**
 * @swagger
 * /reports/top-selling:
 *   get:
 *     summary: Top selling menu items (OWNER only)
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     description: Ranked list of best-selling items by quantity sold
 *     parameters:
 *       - in: query
 *         name: period
 *         required: true
 *         schema: { type: string, enum: [daily, monthly, yearly, custom] }
 *       - in: query
 *         name: date
 *         schema: { type: string, example: "2026-05-24" }
 *       - in: query
 *         name: month
 *         schema: { type: string, example: "2026-05" }
 *       - in: query
 *         name: year
 *         schema: { type: string, example: "2026" }
 *       - in: query
 *         name: from
 *         schema: { type: string, example: "2026-05-01" }
 *       - in: query
 *         name: to
 *         schema: { type: string, example: "2026-05-24" }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10, minimum: 1, maximum: 50 }
 *         description: Number of items to return (default 10)
 *     responses:
 *       200:
 *         description: Top selling items ranked
 */
router.get('/top-selling', authenticate, authorize(Role.OWNER), validate({ query: topSellingSchema }), reportController.getTopSelling);

/**
 * @swagger
 * /reports/category-performance:
 *   get:
 *     summary: Category performance (OWNER only)
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     description: Revenue and sales count grouped by menu category
 *     parameters:
 *       - in: query
 *         name: period
 *         required: true
 *         schema: { type: string, enum: [daily, monthly, yearly, custom] }
 *       - in: query
 *         name: date
 *         schema: { type: string, example: "2026-05-24" }
 *       - in: query
 *         name: month
 *         schema: { type: string, example: "2026-05" }
 *       - in: query
 *         name: year
 *         schema: { type: string, example: "2026" }
 *       - in: query
 *         name: from
 *         schema: { type: string, example: "2026-05-01" }
 *       - in: query
 *         name: to
 *         schema: { type: string, example: "2026-05-24" }
 *     responses:
 *       200:
 *         description: Revenue by category
 */
router.get('/category-performance', authenticate, authorize(Role.OWNER), validate({ query: periodSchema }), reportController.getCategoryPerformance);

/**
 * @swagger
 * /reports/cashier-performance:
 *   get:
 *     summary: Cashier performance (OWNER only)
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     description: Order count and revenue per cashier
 *     parameters:
 *       - in: query
 *         name: period
 *         required: true
 *         schema: { type: string, enum: [daily, monthly, yearly, custom] }
 *       - in: query
 *         name: date
 *         schema: { type: string, example: "2026-05-24" }
 *       - in: query
 *         name: month
 *         schema: { type: string, example: "2026-05" }
 *       - in: query
 *         name: year
 *         schema: { type: string, example: "2026" }
 *       - in: query
 *         name: from
 *         schema: { type: string, example: "2026-05-01" }
 *       - in: query
 *         name: to
 *         schema: { type: string, example: "2026-05-24" }
 *     responses:
 *       200:
 *         description: Cashier performance data
 */
router.get('/cashier-performance', authenticate, authorize(Role.OWNER), validate({ query: periodSchema }), reportController.getCashierPerformance);

// ============================================
// Inventory Reports — /api/v1/reports/inventory
// ============================================

/**
 * @swagger
 * /reports/inventory/summary:
 *   get:
 *     summary: Inventory summary (OWNER only)
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     description: Current stock levels for all active ingredients with status (OK/LOW/OUT)
 *     responses:
 *       200:
 *         description: Inventory summary with stock status
 */
router.get('/inventory/summary', authenticate, authorize(Role.OWNER), reportController.getInventorySummary);

/**
 * @swagger
 * /reports/inventory/movements:
 *   get:
 *     summary: Inventory movements history (OWNER only)
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     description: Paginated log of all stock changes (deductions, adjustments, initial seed)
 *     parameters:
 *       - in: query
 *         name: ingredientId
 *         schema: { type: integer }
 *         description: Filter by ingredient ID
 *       - in: query
 *         name: type
 *         schema: { type: string, enum: [DEDUCT_ORDER, ADJUST_ADD, ADJUST_SET, INITIAL] }
 *         description: Filter by movement type
 *       - in: query
 *         name: from
 *         schema: { type: string, example: "2026-05-01" }
 *         description: Start date filter (YYYY-MM-DD)
 *       - in: query
 *         name: to
 *         schema: { type: string, example: "2026-05-24" }
 *         description: End date filter (YYYY-MM-DD)
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20, maximum: 100 }
 *     responses:
 *       200:
 *         description: Paginated inventory movements
 */
router.get('/inventory/movements', authenticate, authorize(Role.OWNER), validate({ query: inventoryMovementsSchema }), reportController.getInventoryMovements);

// ============================================
// Export — /api/v1/reports/export
// ============================================

/**
 * @swagger
 * /reports/export:
 *   get:
 *     summary: Export report as CSV (OWNER only)
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     description: Download report data as a CSV file. Supports revenue, top-selling, category, cashier, inventory, and movements.
 *     parameters:
 *       - in: query
 *         name: type
 *         required: true
 *         schema: { type: string, enum: [revenue, top-selling, inventory, movements, category, cashier] }
 *         description: Report type to export
 *       - in: query
 *         name: period
 *         schema: { type: string, enum: [daily, monthly, yearly, custom] }
 *         description: Period (required for revenue/top-selling/category/cashier)
 *       - in: query
 *         name: date
 *         schema: { type: string, example: "2026-05-24" }
 *       - in: query
 *         name: month
 *         schema: { type: string, example: "2026-05" }
 *       - in: query
 *         name: year
 *         schema: { type: string, example: "2026" }
 *       - in: query
 *         name: from
 *         schema: { type: string, example: "2026-05-01" }
 *       - in: query
 *         name: to
 *         schema: { type: string, example: "2026-05-24" }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *         description: Limit for top-selling export
 *     responses:
 *       200:
 *         description: CSV file download
 *         content:
 *           text/csv:
 *             schema:
 *               type: string
 */
router.get('/export', authenticate, authorize(Role.OWNER), validate({ query: exportSchema }), reportController.exportCsv);

export default router;
