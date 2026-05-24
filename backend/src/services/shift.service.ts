import * as shiftRepo from '../repositories/shift.repository.js';
import { AppError } from '../middleware/error-handler.middleware.js';
import { HttpStatus } from '../constants/http-status.js';
import { pool } from '../config/database.js';
import type { RowDataPacket } from 'mysql2';
import type {
  Shift,
  CreateShiftRequest,
  UpdateShiftRequest,
  ShiftAssignment,
  BulkAssignmentRequest,
  BulkAssignmentResponse,
  AssignmentFilter,
} from '../types/shift.types.js';

// ============================================
// Row Mappers
// ============================================

function toShift(row: any): Shift {
  return {
    id: row.id,
    name: row.name,
    startTime: row.start_time?.slice(0, 5) ?? row.startTime,
    endTime: row.end_time?.slice(0, 5) ?? row.endTime,
    isActive: Boolean(row.is_active),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function toAssignment(row: any): ShiftAssignment {
  return {
    id: row.id,
    shiftId: row.shift_id,
    shiftName: row.shift_name,
    userId: row.user_id,
    userFullName: row.user_full_name,
    workDate: typeof row.work_date === 'string' ? row.work_date : row.work_date?.toISOString?.()?.slice(0, 10),
    notes: row.notes,
    createdAt: row.created_at,
  };
}

// ============================================
// Shift CRUD
// ============================================

export async function createShift(data: CreateShiftRequest): Promise<Shift> {
  const existing = await shiftRepo.findShiftByName(data.name);
  if (existing) throw new AppError(`Shift "${data.name}" already exists`, HttpStatus.CONFLICT);

  const row = await shiftRepo.createShift(data);
  return toShift(row);
}

export async function getAllShifts(): Promise<Shift[]> {
  const rows = await shiftRepo.getAllShifts();
  return rows.map(toShift);
}

export async function updateShift(id: number, data: UpdateShiftRequest): Promise<Shift> {
  const existing = await shiftRepo.getShiftById(id);
  if (!existing) throw new AppError('Shift not found', HttpStatus.NOT_FOUND);

  if (data.name && data.name !== existing.name) {
    const duplicate = await shiftRepo.findShiftByName(data.name, id);
    if (duplicate) throw new AppError(`Shift "${data.name}" already exists`, HttpStatus.CONFLICT);
  }

  const finalStartTime = data.startTime || existing.start_time?.slice(0, 5);
  const finalEndTime = data.endTime || existing.end_time?.slice(0, 5);
  if (finalStartTime === finalEndTime) {
    throw new AppError('Start time and end time must be different', HttpStatus.BAD_REQUEST);
  }

  const row = await shiftRepo.updateShift(id, data);
  return toShift(row);
}

export async function toggleActive(id: number): Promise<Shift> {
  const existing = await shiftRepo.getShiftById(id);
  if (!existing) throw new AppError('Shift not found', HttpStatus.NOT_FOUND);

  const row = await shiftRepo.toggleShiftActive(id);
  return toShift(row);
}

// ============================================
// Assignment CRUD
// ============================================

async function validateUserExists(userId: number) {
  const [rows] = await pool.execute<RowDataPacket[]>(
    'SELECT id, is_active FROM users WHERE id = ?', [userId]
  );
  if (!rows[0]) throw new AppError('User not found', HttpStatus.NOT_FOUND);
  if (!rows[0].is_active) throw new AppError('User is not active', HttpStatus.BAD_REQUEST);
}

export async function createAssignment(data: { shiftId: number; userId: number; workDate: string; notes?: string }): Promise<ShiftAssignment> {
  const shift = await shiftRepo.getShiftById(data.shiftId);
  if (!shift) throw new AppError('Shift not found', HttpStatus.NOT_FOUND);
  if (!shift.is_active) throw new AppError('Shift is not active', HttpStatus.BAD_REQUEST);

  await validateUserExists(data.userId);

  try {
    const row = await shiftRepo.createAssignment(data.shiftId, data.userId, data.workDate, data.notes);
    return toAssignment(row);
  } catch (err: any) {
    if (err.code === 'ER_DUP_ENTRY') {
      throw new AppError('Assignment already exists for this shift/user/date', HttpStatus.CONFLICT);
    }
    throw err;
  }
}

export async function createBulkAssignment(data: BulkAssignmentRequest): Promise<BulkAssignmentResponse> {
  const shift = await shiftRepo.getShiftById(data.shiftId);
  if (!shift) throw new AppError('Shift not found', HttpStatus.NOT_FOUND);
  if (!shift.is_active) throw new AppError('Shift is not active', HttpStatus.BAD_REQUEST);

  await validateUserExists(data.userId);

  // Generate dates from startDate to endDate filtered by daysOfWeek
  const assignments: { shiftId: number; userId: number; workDate: string }[] = [];
  const start = new Date(data.startDate);
  const end = new Date(data.endDate);

  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const dayOfWeek = d.getDay();
    if (data.daysOfWeek.includes(dayOfWeek)) {
      const dateStr = d.toISOString().slice(0, 10);
      assignments.push({ shiftId: data.shiftId, userId: data.userId, workDate: dateStr });
    }
  }

  if (assignments.length === 0) {
    return { created: 0, skipped: 0, assignments: [] };
  }

  const affectedRows = await shiftRepo.createBulkAssignments(assignments);
  const skipped = assignments.length - affectedRows;

  // Fetch the created assignments
  const created = await shiftRepo.getAssignments({
    shiftId: data.shiftId,
    userId: data.userId,
    from: data.startDate,
    to: data.endDate,
    page: 1,
    limit: 100,
  });

  return {
    created: affectedRows,
    skipped,
    assignments: created.data.map(toAssignment),
  };
}

export async function getAssignments(filter: AssignmentFilter) {
  const result = await shiftRepo.getAssignments(filter);
  return {
    data: result.data.map(toAssignment),
    meta: { total: result.total, page: result.page, limit: result.limit, totalPages: result.totalPages },
  };
}

export async function updateAssignment(id: number, data: { shiftId?: number; workDate?: string; notes?: string | null }): Promise<ShiftAssignment> {
  const existing = await shiftRepo.getAssignmentById(id);
  if (!existing) throw new AppError('Assignment not found', HttpStatus.NOT_FOUND);

  if (data.shiftId) {
    const shift = await shiftRepo.getShiftById(data.shiftId);
    if (!shift) throw new AppError('Shift not found', HttpStatus.NOT_FOUND);
    if (!shift.is_active) throw new AppError('Shift is not active', HttpStatus.BAD_REQUEST);
  }

  const row = await shiftRepo.updateAssignment(id, data);
  return toAssignment(row);
}

export async function deleteAssignment(id: number): Promise<void> {
  const existing = await shiftRepo.getAssignmentById(id);
  if (!existing) throw new AppError('Assignment not found', HttpStatus.NOT_FOUND);

  const hasRecord = await shiftRepo.hasAttendance(id);
  if (hasRecord) throw new AppError('Cannot delete assignment with attendance record', HttpStatus.CONFLICT);

  await shiftRepo.deleteAssignment(id);
}

export async function getMySchedule(userId: number, from?: string, to?: string) {
  // Default: current week (Monday → Sunday)
  if (!from || !to) {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = new Date(now);
    monday.setDate(now.getDate() + mondayOffset);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    from = from || monday.toISOString().slice(0, 10);
    to = to || sunday.toISOString().slice(0, 10);
  }

  const rows = await shiftRepo.getMySchedule(userId, from, to);
  return rows.map((row: any) => ({
    id: row.id,
    shiftId: row.shift_id,
    shiftName: row.shift_name,
    startTime: row.start_time?.slice(0, 5),
    endTime: row.end_time?.slice(0, 5),
    workDate: typeof row.work_date === 'string' ? row.work_date : row.work_date?.toISOString?.()?.slice(0, 10),
    notes: row.notes,
  }));
}
