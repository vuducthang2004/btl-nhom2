import * as attendanceRepo from '../repositories/attendance.repository.js';
import * as shiftRepo from '../repositories/shift.repository.js';
import { AppError } from '../middleware/error-handler.middleware.js';
import { HttpStatus } from '../constants/http-status.js';
import { AttendanceStatus } from '../constants/attendance-status.js';
import { getLocalDateString, getLocalDateTimeString } from '../utils/timezone.js';
import type {
  AttendanceLog,
  OverrideAttendanceRequest,
  AttendanceFilter,
  AttendanceSummary,
} from '../types/shift.types.js';

const LATE_THRESHOLD_MINUTES = 15;

// ============================================
// Row Mapper
// ============================================

function toAttendanceLog(row: any): AttendanceLog {
  return {
    id: row.id,
    assignmentId: row.assignment_id,
    userId: row.user_id,
    userFullName: row.user_full_name,
    shiftName: row.shift_name,
    workDate: typeof row.work_date === 'string' ? row.work_date : row.work_date?.toISOString?.()?.slice(0, 10),
    checkInAt: row.check_in_at,
    checkOutAt: row.check_out_at,
    status: row.status,
    actualHours: row.actual_hours ? Number(row.actual_hours) : null,
    notes: row.notes,
    createdBy: row.created_by,
    createdByName: row.created_by_name || null,
    createdAt: row.created_at,
  };
}

// ============================================
// Check-in
// ============================================

export async function checkIn(userId: number) {
  const today = getLocalDateString();
  const assignments = await shiftRepo.getAssignmentsByUserAndDate(userId, today);

  if (assignments.length === 0) {
    throw new AppError('No shift assigned for today', HttpStatus.NOT_FOUND);
  }

  // Find the best assignment: closest shift to current time, not yet checked in
  const now = new Date();
  let bestAssignment: any = null;
  let bestDiff = Infinity;

  for (const assignment of assignments) {
    const existing = await attendanceRepo.findByAssignmentId(assignment.id);
    if (existing) continue; // Already checked in

    const shiftStart = parseTimeToToday(assignment.start_time);
    const diff = Math.abs(now.getTime() - shiftStart.getTime());
    if (diff < bestDiff) {
      bestDiff = diff;
      bestAssignment = assignment;
    }
  }

  if (!bestAssignment) {
    throw new AppError('Already checked in for all assigned shifts today', HttpStatus.CONFLICT);
  }

  // Compute status
  const checkInAt = getLocalDateTimeString();
  const shiftStartTime = parseTimeToToday(bestAssignment.start_time);
  const lateThreshold = new Date(shiftStartTime.getTime() + LATE_THRESHOLD_MINUTES * 60 * 1000);
  const status = now > lateThreshold ? AttendanceStatus.LATE : AttendanceStatus.ON_TIME;

  const id = await attendanceRepo.createCheckIn(bestAssignment.id, userId, checkInAt, status);

  const minutesLate = status === AttendanceStatus.LATE
    ? Math.floor((now.getTime() - shiftStartTime.getTime()) / 60000)
    : 0;

  const startTimeStr = bestAssignment.start_time?.slice(0, 5);
  const message = status === AttendanceStatus.LATE
    ? `Checked in ${minutesLate} minutes late. Shift started at ${startTimeStr}.`
    : `Checked in successfully. Shift starts at ${startTimeStr}.`;

  return {
    id,
    shiftName: bestAssignment.shift_name,
    workDate: today,
    checkInAt,
    status,
    message,
  };
}

// ============================================
// Check-out
// ============================================

export async function checkOut(userId: number) {
  const today = getLocalDateString();
  const assignments = await shiftRepo.getAssignmentsByUserAndDate(userId, today);

  // Find assignment with check-in but no check-out
  let targetAttendance: any = null;
  let targetAssignment: any = null;

  for (const assignment of assignments) {
    const attendance = await attendanceRepo.findByAssignmentId(assignment.id);
    if (attendance && !attendance.check_out_at) {
      targetAttendance = attendance;
      targetAssignment = assignment;
      break;
    }
  }

  if (!targetAttendance) {
    throw new AppError('No active check-in found for today', HttpStatus.NOT_FOUND);
  }

  const now = new Date();
  const checkOutAt = getLocalDateTimeString(now);

  // Compute actual hours
  const checkInTime = new Date(targetAttendance.check_in_at);
  const actualHours = Math.round(((now.getTime() - checkInTime.getTime()) / 3600000) * 100) / 100;

  // Check early leave
  const shiftEndTime = parseTimeToToday(targetAssignment.end_time, targetAssignment.start_time);
  const earlyThreshold = new Date(shiftEndTime.getTime() - LATE_THRESHOLD_MINUTES * 60 * 1000);
  let status: AttendanceStatus | undefined;
  if (now < earlyThreshold) {
    status = AttendanceStatus.EARLY_LEAVE;
  }

  await attendanceRepo.updateCheckOut(targetAttendance.id, checkOutAt, actualHours, status);

  const finalStatus = status || targetAttendance.status;
  const endTimeStr = targetAssignment.end_time?.slice(0, 5);
  const message = status === AttendanceStatus.EARLY_LEAVE
    ? `Checked out early. Shift ends at ${endTimeStr}. Worked ${actualHours}h.`
    : `Checked out successfully. Worked ${actualHours}h.`;

  return {
    id: targetAttendance.id,
    shiftName: targetAssignment.shift_name,
    workDate: today,
    checkInAt: targetAttendance.check_in_at,
    checkOutAt,
    status: finalStatus,
    actualHours,
    message,
  };
}

// ============================================
// Override (OWNER)
// ============================================

export async function overrideAttendance(data: OverrideAttendanceRequest, ownerId: number) {
  const assignment = await shiftRepo.getAssignmentById(data.assignmentId);
  if (!assignment) throw new AppError('Assignment not found', HttpStatus.NOT_FOUND);

  // Compute status
  let status: AttendanceStatus = AttendanceStatus.ON_TIME;
  if (data.checkInAt) {
    const checkIn = new Date(data.checkInAt);
    const shiftStart = parseTimeOnDate(assignment.start_time, assignment.work_date);
    const lateThreshold = new Date(shiftStart.getTime() + LATE_THRESHOLD_MINUTES * 60 * 1000);
    if (checkIn > lateThreshold) status = AttendanceStatus.LATE;
  }

  // Compute actual hours
  let actualHours: number | null = null;
  if (data.checkInAt && data.checkOutAt) {
    const diff = new Date(data.checkOutAt).getTime() - new Date(data.checkInAt).getTime();
    actualHours = Math.round((diff / 3600000) * 100) / 100;

    // Check early leave
    const shiftEnd = parseTimeOnDate(assignment.end_time, assignment.work_date, assignment.start_time);
    const earlyThreshold = new Date(shiftEnd.getTime() - LATE_THRESHOLD_MINUTES * 60 * 1000);
    if (new Date(data.checkOutAt) < earlyThreshold) {
      status = AttendanceStatus.EARLY_LEAVE;
    }
  }

  const id = await attendanceRepo.upsertOverride(
    data.assignmentId,
    assignment.user_id,
    { checkInAt: data.checkInAt, checkOutAt: data.checkOutAt, notes: data.notes },
    status,
    actualHours,
    ownerId
  );

  return {
    id,
    assignmentId: data.assignmentId,
    userId: assignment.user_id,
    userFullName: assignment.user_full_name,
    shiftName: assignment.shift_name,
    status,
    actualHours,
    overriddenBy: ownerId,
    message: 'Attendance override applied successfully.',
  };
}

// ============================================
// List / History / Summary
// ============================================

export async function getAttendanceLogs(filter: AttendanceFilter) {
  const result = await attendanceRepo.getAttendanceLogs(filter);
  return {
    data: result.data.map(toAttendanceLog),
    meta: { total: result.total, page: result.page, limit: result.limit, totalPages: result.totalPages },
  };
}

export async function getMyHistory(userId: number, from?: string, to?: string, page = 1, limit = 20) {
  const result = await attendanceRepo.getMyHistory(userId, from, to, page, limit);
  return {
    data: result.data.map(toAttendanceLog),
    meta: { total: result.total, page: result.page, limit: result.limit, totalPages: result.totalPages },
  };
}

export async function getSummary(from: string, to: string): Promise<AttendanceSummary[]> {
  const rows = await attendanceRepo.getSummary(from, to);
  return rows.map((row: any) => ({
    userId: row.user_id,
    fullName: row.full_name,
    role: row.role,
    totalShifts: Number(row.total_shifts),
    attendedShifts: Number(row.attended_shifts),
    onTimeCount: Number(row.on_time_count),
    lateCount: Number(row.late_count),
    earlyLeaveCount: Number(row.early_leave_count),
    absentCount: Number(row.absent_count),
    totalHours: Number(row.total_hours),
  }));
}

// ============================================
// Helpers
// ============================================

function parseTimeToToday(timeStr: string, refStartTime?: string): Date {
  const [hours, minutes] = timeStr.slice(0, 5).split(':').map(Number);
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);

  // Cross-midnight: if end_time < start_time, add 1 day
  if (refStartTime) {
    const [startH] = refStartTime.slice(0, 5).split(':').map(Number);
    if (hours < startH) {
      date.setDate(date.getDate() + 1);
    }
  }

  return date;
}

function parseTimeOnDate(timeStr: string, dateStr: string | Date, refStartTime?: string): Date {
  const [hours, minutes] = timeStr.slice(0, 5).split(':').map(Number);
  const dateVal = typeof dateStr === 'string' ? dateStr : dateStr.toISOString().slice(0, 10);
  const date = new Date(`${dateVal}T${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00`);

  if (refStartTime) {
    const [startH] = refStartTime.slice(0, 5).split(':').map(Number);
    if (hours < startH) {
      date.setDate(date.getDate() + 1);
    }
  }

  return date;
}
