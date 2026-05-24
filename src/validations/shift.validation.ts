import { z } from 'zod';
import { ATTENDANCE_STATUS_VALUES } from '../constants/attendance-status.js';

const timeRegex = /^([01]\d|2[0-3]):[0-5]\d$/;
const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
const datetimeRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?$/;

// --- Shift CRUD ---

export const createShiftSchema = z.object({
  name: z.string().min(1, 'Name is required').max(50),
  startTime: z.string().regex(timeRegex, 'Format: HH:mm (e.g. 07:00)'),
  endTime: z.string().regex(timeRegex, 'Format: HH:mm (e.g. 14:00)'),
}).refine((data) => data.startTime !== data.endTime, {
  message: 'Start time and end time must be different',
});

export const updateShiftSchema = z.object({
  name: z.string().min(1).max(50).optional(),
  startTime: z.string().regex(timeRegex, 'Format: HH:mm').optional(),
  endTime: z.string().regex(timeRegex, 'Format: HH:mm').optional(),
}).refine((data) => Object.keys(data).length > 0, {
  message: 'At least one field is required',
});

export const shiftIdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

// --- Assignments ---

export const createAssignmentSchema = z.object({
  shiftId: z.coerce.number().int().positive(),
  userId: z.coerce.number().int().positive(),
  workDate: z.string().regex(dateRegex, 'Format: YYYY-MM-DD'),
});

export const bulkAssignmentSchema = z.object({
  shiftId: z.coerce.number().int().positive(),
  userId: z.coerce.number().int().positive(),
  startDate: z.string().regex(dateRegex, 'Format: YYYY-MM-DD'),
  endDate: z.string().regex(dateRegex, 'Format: YYYY-MM-DD'),
  daysOfWeek: z.array(z.coerce.number().int().min(0).max(6)).min(1, 'At least one day required'),
}).refine((data) => data.startDate <= data.endDate, {
  message: 'startDate must be <= endDate',
}).refine((data) => {
  const start = new Date(data.startDate);
  const end = new Date(data.endDate);
  const diffDays = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
  return diffDays <= 31;
}, {
  message: 'Date range must not exceed 31 days',
});

// Union schema: accepts either single assignment or bulk assignment
export const createOrBulkAssignmentSchema = z.union([
  bulkAssignmentSchema,
  createAssignmentSchema,
]);

export const updateAssignmentSchema = z.object({
  shiftId: z.coerce.number().int().positive().optional(),
  workDate: z.string().regex(dateRegex, 'Format: YYYY-MM-DD').optional(),
  notes: z.string().max(255).nullable().optional(),
}).refine((data) => Object.keys(data).length > 0, {
  message: 'At least one field is required',
});

export const assignmentIdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export const assignmentFilterSchema = z.object({
  userId: z.coerce.number().int().positive().optional(),
  shiftId: z.coerce.number().int().positive().optional(),
  from: z.string().regex(dateRegex, 'Format: YYYY-MM-DD').optional(),
  to: z.string().regex(dateRegex, 'Format: YYYY-MM-DD').optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const myScheduleFilterSchema = z.object({
  from: z.string().regex(dateRegex, 'Format: YYYY-MM-DD').optional(),
  to: z.string().regex(dateRegex, 'Format: YYYY-MM-DD').optional(),
});

// --- Attendance ---

export const overrideAttendanceSchema = z.object({
  assignmentId: z.coerce.number().int().positive(),
  checkInAt: z.string().regex(datetimeRegex, 'Format: YYYY-MM-DDTHH:mm').optional(),
  checkOutAt: z.string().regex(datetimeRegex, 'Format: YYYY-MM-DDTHH:mm').optional(),
  notes: z.string().max(255).optional(),
}).refine((data) => data.checkInAt || data.checkOutAt, {
  message: 'At least checkInAt or checkOutAt is required',
});

export const attendanceFilterSchema = z.object({
  userId: z.coerce.number().int().positive().optional(),
  status: z.enum(ATTENDANCE_STATUS_VALUES as [string, ...string[]]).optional(),
  from: z.string().regex(dateRegex, 'Format: YYYY-MM-DD').optional(),
  to: z.string().regex(dateRegex, 'Format: YYYY-MM-DD').optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const attendanceSummarySchema = z.object({
  from: z.string().regex(dateRegex, 'From date is required'),
  to: z.string().regex(dateRegex, 'To date is required'),
}).refine((data) => {
  const start = new Date(data.from);
  const end = new Date(data.to);
  const diffDays = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
  return diffDays >= 0 && diffDays <= 90;
}, {
  message: 'Date range must be 0-90 days',
});

export const myHistorySchema = z.object({
  from: z.string().regex(dateRegex, 'Format: YYYY-MM-DD').optional(),
  to: z.string().regex(dateRegex, 'Format: YYYY-MM-DD').optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});
