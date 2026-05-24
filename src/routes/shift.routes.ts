import { Router } from 'express';
import * as shiftController from '../controllers/shift.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/role.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { Role } from '../constants/roles.js';
import {
  createShiftSchema,
  updateShiftSchema,
  shiftIdParamSchema,
  createAssignmentSchema,
  bulkAssignmentSchema,
  createOrBulkAssignmentSchema,
  updateAssignmentSchema,
  assignmentIdParamSchema,
  assignmentFilterSchema,
  myScheduleFilterSchema,
} from '../validations/shift.validation.js';

const router = Router();

// ============================================
// Shift Templates — /api/v1/shifts
// ============================================

/**
 * @swagger
 * /shifts:
 *   get:
 *     summary: List all shift templates
 *     tags: [Shifts]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of shift templates
 *   post:
 *     summary: Create shift template (OWNER only)
 *     tags: [Shifts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, startTime, endTime]
 *             properties:
 *               name: { type: string, example: Ca sáng }
 *               startTime: { type: string, example: "07:00" }
 *               endTime: { type: string, example: "14:00" }
 *     responses:
 *       201:
 *         description: Shift created
 *       409:
 *         description: Shift name already exists
 */
router.get('/', authenticate, shiftController.getAllShifts);
router.post('/', authenticate, authorize(Role.OWNER), validate({ body: createShiftSchema }), shiftController.createShift);

/**
 * @swagger
 * /shifts/{id}:
 *   put:
 *     summary: Update shift template (OWNER only)
 *     tags: [Shifts]
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
 *               startTime: { type: string, example: "07:00" }
 *               endTime: { type: string, example: "14:00" }
 *     responses:
 *       200:
 *         description: Updated shift
 *       404:
 *         description: Shift not found
 */
router.put('/:id', authenticate, authorize(Role.OWNER), validate({ params: shiftIdParamSchema, body: updateShiftSchema }), shiftController.updateShift);

/**
 * @swagger
 * /shifts/{id}/active:
 *   patch:
 *     summary: Toggle shift active status (OWNER only)
 *     tags: [Shifts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Updated shift
 */
router.patch('/:id/active', authenticate, authorize(Role.OWNER), validate({ params: shiftIdParamSchema }), shiftController.toggleActive);

// ============================================
// My Schedule — /api/v1/shifts/my-schedule
// ============================================

/**
 * @swagger
 * /shifts/my-schedule:
 *   get:
 *     summary: Get my schedule (current week by default)
 *     tags: [Shifts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: from
 *         schema: { type: string, format: date }
 *         description: Start date (YYYY-MM-DD)
 *       - in: query
 *         name: to
 *         schema: { type: string, format: date }
 *         description: End date (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: List of my shift assignments
 */
router.get('/my-schedule', authenticate, validate({ query: myScheduleFilterSchema }), shiftController.getMySchedule);

// ============================================
// Assignments — /api/v1/shifts/assignments
// ============================================

/**
 * @swagger
 * /shifts/assignments:
 *   get:
 *     summary: List shift assignments (OWNER only)
 *     tags: [Shifts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: userId
 *         schema: { type: integer }
 *       - in: query
 *         name: shiftId
 *         schema: { type: integer }
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
 *         description: Paginated list of assignments
 *   post:
 *     summary: Create shift assignment — single or bulk (OWNER only)
 *     tags: [Shifts]
 *     security:
 *       - bearerAuth: []
 *     description: |
 *       **Single mode:** Send `shiftId`, `userId`, `workDate`
 *       **Bulk mode:** Send `shiftId`, `userId`, `startDate`, `endDate`, `daysOfWeek[]`
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           examples:
 *             single:
 *               summary: Single assignment
 *               value: { shiftId: 1, userId: 2, workDate: "2026-05-26" }
 *             bulk:
 *               summary: Bulk assignment (Mon-Fri)
 *               value: { shiftId: 1, userId: 2, startDate: "2026-05-25", endDate: "2026-05-30", daysOfWeek: [1,2,3,4,5] }
 *     responses:
 *       201:
 *         description: Assignment(s) created
 *       409:
 *         description: Duplicate assignment
 */
router.get('/assignments', authenticate, authorize(Role.OWNER), validate({ query: assignmentFilterSchema }), shiftController.getAssignments);
router.post('/assignments', authenticate, authorize(Role.OWNER), validate({ body: createOrBulkAssignmentSchema }), shiftController.createAssignment);

/**
 * @swagger
 * /shifts/assignments/{id}:
 *   put:
 *     summary: Update shift assignment (OWNER only)
 *     tags: [Shifts]
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
 *               shiftId: { type: integer }
 *               workDate: { type: string, format: date }
 *               notes: { type: string }
 *     responses:
 *       200:
 *         description: Updated assignment
 *   delete:
 *     summary: Delete shift assignment (OWNER only)
 *     tags: [Shifts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Assignment deleted
 *       409:
 *         description: Cannot delete — has attendance record
 */
router.put('/assignments/:id', authenticate, authorize(Role.OWNER), validate({ params: assignmentIdParamSchema, body: updateAssignmentSchema }), shiftController.updateAssignment);
router.delete('/assignments/:id', authenticate, authorize(Role.OWNER), validate({ params: assignmentIdParamSchema }), shiftController.deleteAssignment);

export default router;
