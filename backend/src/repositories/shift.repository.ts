import { pool } from '../config/database.js';
import type { RowDataPacket, ResultSetHeader } from 'mysql2';
import type {
  CreateShiftRequest,
  UpdateShiftRequest,
  AssignmentFilter,
} from '../types/shift.types.js';

// --- Shifts ---

export async function createShift(data: CreateShiftRequest) {
  const [result] = await pool.execute<ResultSetHeader>(
    'INSERT INTO shifts (name, start_time, end_time) VALUES (?, ?, ?)',
    [data.name, data.startTime, data.endTime]
  );
  return getShiftById(result.insertId);
}

export async function getAllShifts() {
  const [rows] = await pool.execute<RowDataPacket[]>(
    'SELECT id, name, start_time, end_time, is_active, created_at, updated_at FROM shifts ORDER BY start_time ASC'
  );
  return rows;
}

export async function getShiftById(id: number) {
  const [rows] = await pool.execute<RowDataPacket[]>(
    'SELECT id, name, start_time, end_time, is_active, created_at, updated_at FROM shifts WHERE id = ?',
    [id]
  );
  return rows[0] || null;
}

export async function findShiftByName(name: string, excludeId?: number) {
  const query = excludeId
    ? 'SELECT id FROM shifts WHERE name = ? AND id != ?'
    : 'SELECT id FROM shifts WHERE name = ?';
  const params = excludeId ? [name, excludeId] : [name];
  const [rows] = await pool.execute<RowDataPacket[]>(query, params);
  return rows[0] || null;
}

export async function updateShift(id: number, data: UpdateShiftRequest) {
  const fields: string[] = [];
  const values: (string | number | null)[] = [];

  if (data.name !== undefined) { fields.push('name = ?'); values.push(data.name); }
  if (data.startTime !== undefined) { fields.push('start_time = ?'); values.push(data.startTime); }
  if (data.endTime !== undefined) { fields.push('end_time = ?'); values.push(data.endTime); }

  values.push(id);
  await pool.execute(`UPDATE shifts SET ${fields.join(', ')} WHERE id = ?`, values);
  return getShiftById(id);
}

export async function toggleShiftActive(id: number) {
  await pool.execute('UPDATE shifts SET is_active = NOT is_active WHERE id = ?', [id]);
  return getShiftById(id);
}

// --- Assignments ---

export async function createAssignment(shiftId: number, userId: number, workDate: string, notes?: string | null) {
  const [result] = await pool.execute<ResultSetHeader>(
    'INSERT INTO shift_assignments (shift_id, user_id, work_date, notes) VALUES (?, ?, ?, ?)',
    [shiftId, userId, workDate, notes || null]
  );
  return getAssignmentById(result.insertId);
}

export async function createBulkAssignments(assignments: { shiftId: number; userId: number; workDate: string }[]): Promise<number> {
  if (assignments.length === 0) return 0;

  const placeholders = assignments.map(() => '(?, ?, ?)').join(', ');
  const values = assignments.flatMap(a => [a.shiftId, a.userId, a.workDate]);

  const [result] = await pool.execute<ResultSetHeader>(
    `INSERT IGNORE INTO shift_assignments (shift_id, user_id, work_date) VALUES ${placeholders}`,
    values
  );
  return result.affectedRows;
}

export async function getAssignments(filter: AssignmentFilter) {
  let where = 'WHERE 1=1';
  const params: (string | number)[] = [];

  if (filter.userId) { where += ' AND sa.user_id = ?'; params.push(filter.userId); }
  if (filter.shiftId) { where += ' AND sa.shift_id = ?'; params.push(filter.shiftId); }
  if (filter.from) { where += ' AND sa.work_date >= ?'; params.push(filter.from); }
  if (filter.to) { where += ' AND sa.work_date <= ?'; params.push(filter.to); }

  const page = filter.page || 1;
  const limit = filter.limit || 20;
  const offset = (page - 1) * limit;

  const [countRows] = await pool.execute<RowDataPacket[]>(
    `SELECT COUNT(*) as total FROM shift_assignments sa ${where}`, params
  );
  const total = (countRows[0] as { total: number }).total;

  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT sa.id, sa.shift_id, s.name as shift_name, sa.user_id, u.full_name as user_full_name,
            sa.work_date, sa.notes, sa.created_at
     FROM shift_assignments sa
     JOIN shifts s ON s.id = sa.shift_id
     JOIN users u ON u.id = sa.user_id
     ${where}
     ORDER BY sa.work_date ASC, s.start_time ASC
     LIMIT ${Number(limit)} OFFSET ${Number(offset)}`,
    params
  );

  return { data: rows, total, page, limit, totalPages: Math.ceil(total / limit) };
}

export async function getAssignmentById(id: number) {
  const [rows] = await pool.execute<RowDataPacket[]>(
    `SELECT sa.id, sa.shift_id, s.name as shift_name, s.start_time, s.end_time,
            sa.user_id, u.full_name as user_full_name, sa.work_date, sa.notes, sa.created_at
     FROM shift_assignments sa
     JOIN shifts s ON s.id = sa.shift_id
     JOIN users u ON u.id = sa.user_id
     WHERE sa.id = ?`,
    [id]
  );
  return rows[0] || null;
}

export async function getAssignmentsByUserAndDate(userId: number, workDate: string) {
  const [rows] = await pool.execute<RowDataPacket[]>(
    `SELECT sa.id, sa.shift_id, s.name as shift_name, s.start_time, s.end_time,
            sa.user_id, u.full_name as user_full_name, sa.work_date, sa.notes, sa.created_at
     FROM shift_assignments sa
     JOIN shifts s ON s.id = sa.shift_id
     JOIN users u ON u.id = sa.user_id
     WHERE sa.user_id = ? AND sa.work_date = ?
     ORDER BY s.start_time ASC`,
    [userId, workDate]
  );
  return rows;
}

export async function updateAssignment(id: number, data: { shiftId?: number; workDate?: string; notes?: string | null }) {
  const fields: string[] = [];
  const values: (string | number | null)[] = [];

  if (data.shiftId !== undefined) { fields.push('shift_id = ?'); values.push(data.shiftId); }
  if (data.workDate !== undefined) { fields.push('work_date = ?'); values.push(data.workDate); }
  if (data.notes !== undefined) { fields.push('notes = ?'); values.push(data.notes); }

  values.push(id);
  await pool.execute(`UPDATE shift_assignments SET ${fields.join(', ')} WHERE id = ?`, values);
  return getAssignmentById(id);
}

export async function deleteAssignment(id: number) {
  await pool.execute('DELETE FROM shift_assignments WHERE id = ?', [id]);
}

export async function hasAttendance(assignmentId: number): Promise<boolean> {
  const [rows] = await pool.execute<RowDataPacket[]>(
    'SELECT id FROM attendance_logs WHERE assignment_id = ?',
    [assignmentId]
  );
  return rows.length > 0;
}

export async function getMySchedule(userId: number, from: string, to: string) {
  const [rows] = await pool.execute<RowDataPacket[]>(
    `SELECT sa.id, sa.shift_id, s.name as shift_name, s.start_time, s.end_time,
            sa.work_date, sa.notes, sa.created_at
     FROM shift_assignments sa
     JOIN shifts s ON s.id = sa.shift_id
     WHERE sa.user_id = ? AND sa.work_date >= ? AND sa.work_date <= ?
     ORDER BY sa.work_date ASC, s.start_time ASC`,
    [userId, from, to]
  );
  return rows;
}
