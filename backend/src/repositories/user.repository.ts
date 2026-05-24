import { pool } from '../config/database.js';
import type { RowDataPacket, ResultSetHeader } from 'mysql2';
import type { Role } from '../constants/roles.js';

interface UserRow extends RowDataPacket {
  id: number;
  username: string;
  password_hash: string;
  full_name: string;
  role: Role;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export async function createUser(username: string, passwordHash: string, fullName: string, role: string): Promise<number> {
  const [result] = await pool.execute<ResultSetHeader>(
    'INSERT INTO users (username, password_hash, full_name, role) VALUES (?, ?, ?, ?)',
    [username, passwordHash, fullName, role]
  );
  return result.insertId;
}

export async function getAllUsers(): Promise<UserRow[]> {
  const [rows] = await pool.execute<UserRow[]>(
    'SELECT id, username, full_name, role, is_active, created_at, updated_at FROM users ORDER BY created_at DESC'
  );
  return rows;
}

export async function getUserById(id: number): Promise<UserRow | null> {
  const [rows] = await pool.execute<UserRow[]>(
    'SELECT id, username, full_name, role, is_active, created_at, updated_at FROM users WHERE id = ?',
    [id]
  );
  return rows[0] ?? null;
}

export async function updateUser(id: number, fullName?: string, role?: string): Promise<void> {
  const fields: string[] = [];
  const values: (string | number)[] = [];

  if (fullName) { fields.push('full_name = ?'); values.push(fullName); }
  if (role) { fields.push('role = ?'); values.push(role); }

  if (fields.length === 0) return;

  values.push(id);
  await pool.query(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`, values);
}

export async function toggleActive(id: number, isActive: boolean): Promise<void> {
  await pool.execute('UPDATE users SET is_active = ? WHERE id = ?', [isActive, id]);
}

export async function updatePassword(id: number, passwordHash: string): Promise<void> {
  await pool.execute('UPDATE users SET password_hash = ? WHERE id = ?', [passwordHash, id]);
}

export async function findByUsername(username: string): Promise<UserRow | null> {
  const [rows] = await pool.execute<UserRow[]>(
    'SELECT id, username, full_name, role, is_active FROM users WHERE username = ?',
    [username]
  );
  return rows[0] ?? null;
}
