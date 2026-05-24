import type { Role } from '../constants/roles.js';

export interface CreateUserRequest {
  username: string;
  password: string;
  fullName: string;
  role: 'CASHIER' | 'BARISTA';
}

export interface UpdateUserRequest {
  fullName?: string;
  role?: 'CASHIER' | 'BARISTA';
}

export interface UserResponse {
  id: number;
  username: string;
  fullName: string;
  role: Role;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ResetPasswordRequest {
  newPassword: string;
}
