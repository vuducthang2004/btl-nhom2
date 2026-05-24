import { Router } from 'express';
import * as attendanceController from '../controllers/attendance.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/role.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { Role } from '../constants/roles.js';
import {
  overrideAttendanceSchema,
  attendanceFilterSchema,
  attendanceSummarySchema,
  myHistorySchema,
} from '../validations/shift.validation.js';

const router = Router();

// ============================================
// Self-service — /api/v1/attendance/check-in, check-out, my-history
// ============================================

/**
 * @swagger
 * /attendance/check-in:
 *   post:
 *     summary: Check in for today's shift
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     description: Auto-detects the closest assigned shift for today. Returns ON_TIME or LATE status (15-minute threshold).
 *     responses:
 *       200:
 *         description: Check-in successful
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               data:
 *                 id: 1
 *                 shiftName: Ca sáng
 *                 workDate: "2026-05-26"
 *                 checkInAt: "2026-05-26 07:05:00"
 *                 status: ON_TIME
 *                 message: "Checked in successfully. Shift starts at 07:00."
 *       404:
 *         description: No shift assigned for today
 *       409:
 *         description: Already checked in
 */
router.post('/check-in', authenticate, attendanceController.checkIn);

/**
 * @swagger
 * /attendance/check-out:
 *   post:
 *     summary: Check out from today's shift
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     description: Finds active check-in (no check-out yet) and records check-out. Computes actual hours and detects EARLY_LEAVE.
 *     responses:
 *       200:
 *         description: Check-out successful
 *       404:
 *         description: No active check-in found
 */
router.post('/check-out', authenticate, attendanceController.checkOut);

/**
 * @swagger
 * /attendance/my-history:
 *   get:
 *     summary: Get my attendance history
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: from
 *         schema: { type: string, format: date }
 *       - in: query
 *         name: to
 *         schema: { type: string, format: date }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *     responses:
 *       200:
 *         description: Paginated list of my attendance records
 */
router.get('/my-history', authenticate, validate({ query: myHistorySchema }), attendanceController.getMyHistory);

// ============================================
// OWNER-only — /api/v1/attendance/override, list, summary
// ============================================

/**
 * @swagger
 * /attendance/override:
 *   post:
 *     summary: Override attendance for an employee (OWNER only)
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     description: Create or update attendance for any assignment. Records who made the override via `created_by` field.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [assignmentId]
 *             properties:
 *               assignmentId: { type: integer, example: 1 }
 *               checkInAt: { type: string, example: "2026-05-26T07:00" }
 *               checkOutAt: { type: string, example: "2026-05-26T14:00" }
 *               notes: { type: string, example: "Manual override - employee forgot to check in" }
 *     responses:
 *       200:
 *         description: Override applied
 *       404:
 *         description: Assignment not found
 */
router.post('/override', authenticate, authorize(Role.OWNER), validate({ body: overrideAttendanceSchema }), attendanceController.overrideAttendance);

/**
 * @swagger
 * /attendance:
 *   get:
 *     summary: List all attendance logs (OWNER only)
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: userId
 *         schema: { type: integer }
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [ON_TIME, LATE, EARLY_LEAVE, ABSENT] }
 *       - in: query
 *         name: from
 *         schema: { type: string, format: date }
 *       - in: query
 *         name: to
 *         schema: { type: string, format: date }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *     responses:
 *       200:
 *         description: Paginated attendance logs
 */
router.get('/', authenticate, authorize(Role.OWNER), validate({ query: attendanceFilterSchema }), attendanceController.getAttendanceLogs);

/**
 * @swagger
 * /attendance/summary:
 *   get:
 *     summary: Attendance summary report (OWNER only)
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     description: Aggregate attendance per employee for a date range (max 90 days). Shows total shifts, on-time, late, early-leave, absent counts, and total hours worked.
 *     parameters:
 *       - in: query
 *         name: from
 *         required: true
 *         schema: { type: string, format: date }
 *       - in: query
 *         name: to
 *         required: true
 *         schema: { type: string, format: date }
 *     responses:
 *       200:
 *         description: Summary per employee
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               data:
 *                 - userId: 2
 *                   fullName: Thu ngân 1
 *                   role: CASHIER
 *                   totalShifts: 22
 *                   attendedShifts: 20
 *                   onTimeCount: 17
 *                   lateCount: 2
 *                   earlyLeaveCount: 1
 *                   absentCount: 2
 *                   totalHours: 138.50
 *       400:
 *         description: Date range exceeds 90 days
 */
router.get('/summary', authenticate, authorize(Role.OWNER), validate({ query: attendanceSummarySchema }), attendanceController.getAttendanceSummary);

export default router;
