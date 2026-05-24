import { pool } from '../config/database.js';
import type { RowDataPacket, ResultSetHeader } from 'mysql2';
import type { AttendanceStatus } from '../constants/attendance-status.js';
import type { AttendanceFilter } from '../types/shift.types.js';

export async function findByAssignmentId(assignmentId: number) {
  const [rows] = await pool.execute<RowDataPacket[]>(
    'SELECT * FROM attendance_logs WHERE assignment_id = ?',
    [assignmentId]
  );
  return rows[0] || null;
}

export async function createCheckIn(
  assignmentId: number,
  userId: number,
  checkInAt: string,
  status: AttendanceStatus,
  createdBy?: number | null
) {
  const [result] = await pool.execute<ResultSetHeader>(
    `INSERT INTO attendance_logs (assignment_id, user_id, check_in_at, status, created_by)
     VALUES (?, ?, ?, ?, ?)`,
    [assignmentId, userId, checkInAt, status, createdBy || null]
  );
  return result.insertId;
}

export async function updateCheckOut(
  id: number,
  checkOutAt: string,
  actualHours: number,
  status?: AttendanceStatus
) {
  const statusClause = status ? ', status = ?' : '';
  const params: (string | number)[] = status
    ? [checkOutAt, actualHours, status, id]
    : [checkOutAt, actualHours, id];

  await pool.execute(
    `UPDATE attendance_logs SET check_out_at = ?, actual_hours = ?${statusClause} WHERE id = ?`,
    params
  );
}

export async function upsertOverride(
  assignmentId: number,
  userId: number,
  data: { checkInAt?: string; checkOutAt?: string; notes?: string },
  status: AttendanceStatus,
  actualHours: number | null,
  createdBy: number
) {
  const existing = await findByAssignmentId(assignmentId);

  if (existing) {
    const fields: string[] = [];
    const values: (string | number | null)[] = [];

    if (data.checkInAt !== undefined) { fields.push('check_in_at = ?'); values.push(data.checkInAt); }
    if (data.checkOutAt !== undefined) { fields.push('check_out_at = ?'); values.push(data.checkOutAt); }
    if (data.notes !== undefined) { fields.push('notes = ?'); values.push(data.notes); }
    fields.push('status = ?'); values.push(status);
    if (actualHours !== null) { fields.push('actual_hours = ?'); values.push(actualHours); }
    fields.push('created_by = ?'); values.push(createdBy);

    values.push(existing.id);
    await pool.execute(`UPDATE attendance_logs SET ${fields.join(', ')} WHERE id = ?`, values);
    return existing.id;
  }

  const [result] = await pool.execute<ResultSetHeader>(
    `INSERT INTO attendance_logs (assignment_id, user_id, check_in_at, check_out_at, status, actual_hours, notes, created_by)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [assignmentId, userId, data.checkInAt || null, data.checkOutAt || null, status, actualHours, data.notes || null, createdBy]
  );
  return result.insertId;
}

export async function getAttendanceLogs(filter: AttendanceFilter) {
  let where = 'WHERE 1=1';
  const params: (string | number)[] = [];

  if (filter.userId) { where += ' AND al.user_id = ?'; params.push(filter.userId); }
  if (filter.status) { where += ' AND al.status = ?'; params.push(filter.status); }
  if (filter.from) { where += ' AND sa.work_date >= ?'; params.push(filter.from); }
  if (filter.to) { where += ' AND sa.work_date <= ?'; params.push(filter.to); }

  const page = filter.page || 1;
  const limit = filter.limit || 20;
  const offset = (page - 1) * limit;

  const [countRows] = await pool.execute<RowDataPacket[]>(
    `SELECT COUNT(*) as total FROM attendance_logs al
     JOIN shift_assignments sa ON sa.id = al.assignment_id
     ${where}`, params
  );
  const total = (countRows[0] as { total: number }).total;

  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT al.id, al.assignment_id, al.user_id, u.full_name as user_full_name,
            s.name as shift_name, sa.work_date,
            al.check_in_at, al.check_out_at, al.status, al.actual_hours,
            al.notes, al.created_by, cb.full_name as created_by_name, al.created_at
     FROM attendance_logs al
     JOIN shift_assignments sa ON sa.id = al.assignment_id
     JOIN shifts s ON s.id = sa.shift_id
     JOIN users u ON u.id = al.user_id
     LEFT JOIN users cb ON cb.id = al.created_by
     ${where}
     ORDER BY sa.work_date DESC, al.check_in_at DESC
     LIMIT ${Number(limit)} OFFSET ${Number(offset)}`,
    params
  );

  return { data: rows, total, page, limit, totalPages: Math.ceil(total / limit) };
}

export async function getMyHistory(userId: number, from?: string, to?: string, page = 1, limit = 20) {
  let where = 'WHERE al.user_id = ?';
  const params: (string | number)[] = [userId];

  if (from) { where += ' AND sa.work_date >= ?'; params.push(from); }
  if (to) { where += ' AND sa.work_date <= ?'; params.push(to); }

  const offset = (page - 1) * limit;

  const [countRows] = await pool.execute<RowDataPacket[]>(
    `SELECT COUNT(*) as total FROM attendance_logs al
     JOIN shift_assignments sa ON sa.id = al.assignment_id
     ${where}`, params
  );
  const total = (countRows[0] as { total: number }).total;

  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT al.id, al.assignment_id, s.name as shift_name, sa.work_date,
            al.check_in_at, al.check_out_at, al.status, al.actual_hours,
            al.notes, al.created_by, cb.full_name as created_by_name, al.created_at
     FROM attendance_logs al
     JOIN shift_assignments sa ON sa.id = al.assignment_id
     JOIN shifts s ON s.id = sa.shift_id
     LEFT JOIN users cb ON cb.id = al.created_by
     ${where}
     ORDER BY sa.work_date DESC, al.check_in_at DESC
     LIMIT ${Number(limit)} OFFSET ${Number(offset)}`,
    params
  );

  return { data: rows, total, page, limit, totalPages: Math.ceil(total / limit) };
}

export async function getSummary(from: string, to: string) {
  const [rows] = await pool.execute<RowDataPacket[]>(
    `SELECT
       u.id as user_id,
       u.full_name,
       u.role,
       COUNT(DISTINCT sa.id) as total_shifts,
       COUNT(DISTINCT al.id) as attended_shifts,
       SUM(CASE WHEN al.status = 'ON_TIME' THEN 1 ELSE 0 END) as on_time_count,
       SUM(CASE WHEN al.status = 'LATE' THEN 1 ELSE 0 END) as late_count,
       SUM(CASE WHEN al.status = 'EARLY_LEAVE' THEN 1 ELSE 0 END) as early_leave_count,
       (COUNT(DISTINCT sa.id) - COUNT(DISTINCT al.id)) as absent_count,
       COALESCE(SUM(al.actual_hours), 0) as total_hours
     FROM users u
     JOIN shift_assignments sa ON sa.user_id = u.id AND sa.work_date >= ? AND sa.work_date <= ?
     LEFT JOIN attendance_logs al ON al.assignment_id = sa.id
     WHERE u.is_active = TRUE AND u.role != 'OWNER'
     GROUP BY u.id, u.full_name, u.role
     ORDER BY u.full_name ASC`,
    [from, to]
  );
  return rows;
}
