import { pool } from '../config/database.js';
import type { RowDataPacket } from 'mysql2';
import type { Role } from '../constants/roles.js';

interface UserRow extends RowDataPacket {
  id: number;
  username: string;
  password_hash: string;
  full_name: string;
  role: Role;
  is_active: boolean;
  refresh_token: string | null;
}

export async function findByUsername(username: string): Promise<UserRow | null> {
  const [rows] = await pool.execute<UserRow[]>(
    'SELECT id, username, password_hash, full_name, role, is_active, refresh_token FROM users WHERE username = ?',
    [username]
  );
  return rows[0] ?? null;
}

export async function findById(id: number): Promise<UserRow | null> {
  const [rows] = await pool.execute<UserRow[]>(
    'SELECT id, username, password_hash, full_name, role, is_active, refresh_token FROM users WHERE id = ?',
    [id]
  );
  return rows[0] ?? null;
}

export async function updateRefreshToken(userId: number, refreshToken: string | null): Promise<void> {
  await pool.execute(
    'UPDATE users SET refresh_token = ? WHERE id = ?',
    [refreshToken, userId]
  );
}

export async function findByRefreshToken(refreshToken: string): Promise<UserRow | null> {
  const [rows] = await pool.execute<UserRow[]>(
    'SELECT id, username, password_hash, full_name, role, is_active, refresh_token FROM users WHERE refresh_token = ?',
    [refreshToken]
  );
  return rows[0] ?? null;
}
