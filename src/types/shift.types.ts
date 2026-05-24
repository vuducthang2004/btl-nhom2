import type { AttendanceStatus } from '../constants/attendance-status.js';

// Shift template
export interface Shift {
  id: number;
  name: string;
  startTime: string;
  endTime: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateShiftRequest {
  name: string;
  startTime: string;
  endTime: string;
}

export interface UpdateShiftRequest {
  name?: string;
  startTime?: string;
  endTime?: string;
}

// Assignment
export interface ShiftAssignment {
  id: number;
  shiftId: number;
  shiftName: string;
  userId: number;
  userFullName: string;
  workDate: string;
  notes: string | null;
  createdAt: string;
}

export interface CreateAssignmentRequest {
  shiftId: number;
  userId: number;
  workDate: string;
}

export interface BulkAssignmentRequest {
  shiftId: number;
  userId: number;
  startDate: string;
  endDate: string;
  daysOfWeek: number[];
}

export interface BulkAssignmentResponse {
  created: number;
  skipped: number;
  assignments: ShiftAssignment[];
}

export interface AssignmentFilter {
  userId?: number;
  shiftId?: number;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
}

// Attendance
export interface AttendanceLog {
  id: number;
  assignmentId: number;
  userId: number;
  userFullName: string;
  shiftName: string;
  workDate: string;
  checkInAt: string | null;
  checkOutAt: string | null;
  status: AttendanceStatus;
  actualHours: number | null;
  notes: string | null;
  createdBy: number | null;
  createdByName: string | null;
  createdAt: string;
}

export interface OverrideAttendanceRequest {
  assignmentId: number;
  checkInAt?: string;
  checkOutAt?: string;
  notes?: string;
}

export interface AttendanceFilter {
  userId?: number;
  status?: AttendanceStatus;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
}

export interface AttendanceSummary {
  userId: number;
  fullName: string;
  role: string;
  totalShifts: number;
  attendedShifts: number;
  onTimeCount: number;
  lateCount: number;
  earlyLeaveCount: number;
  absentCount: number;
  totalHours: number;
}
