import * as userRepo from '../repositories/user.repository.js';
import { hashPassword } from '../utils/hash.js';
import { AppError } from '../middleware/error-handler.middleware.js';
import { HttpStatus } from '../constants/http-status.js';
import type { CreateUserRequest, UpdateUserRequest, UserResponse, ResetPasswordRequest } from '../types/user.types.js';

function toResponse(user: any): UserResponse {
  return {
    id: user.id,
    username: user.username,
    fullName: user.full_name,
    role: user.role,
    isActive: Boolean(user.is_active),
    createdAt: user.created_at,
    updatedAt: user.updated_at,
  };
}

export async function createUser(data: CreateUserRequest): Promise<UserResponse> {
  const existing = await userRepo.findByUsername(data.username);
  if (existing) {
    throw new AppError('Username already exists', HttpStatus.CONFLICT);
  }

  const passwordHash = await hashPassword(data.password);
  const id = await userRepo.createUser(data.username, passwordHash, data.fullName, data.role);
  const user = await userRepo.getUserById(id);

  return toResponse(user);
}

export async function getAllUsers(): Promise<UserResponse[]> {
  const users = await userRepo.getAllUsers();
  return users.map(toResponse);
}

export async function getUserById(id: number): Promise<UserResponse> {
  const user = await userRepo.getUserById(id);
  if (!user) throw new AppError('User not found', HttpStatus.NOT_FOUND);
  return toResponse(user);
}

export async function updateUser(id: number, data: UpdateUserRequest): Promise<UserResponse> {
  const user = await userRepo.getUserById(id);
  if (!user) throw new AppError('User not found', HttpStatus.NOT_FOUND);

  await userRepo.updateUser(id, data.fullName, data.role);
  const updated = await userRepo.getUserById(id);
  return toResponse(updated);
}

export async function toggleActive(id: number): Promise<UserResponse> {
  const user = await userRepo.getUserById(id);
  if (!user) throw new AppError('User not found', HttpStatus.NOT_FOUND);

  await userRepo.toggleActive(id, !user.is_active);
  const updated = await userRepo.getUserById(id);
  return toResponse(updated);
}

export async function resetPassword(id: number, data: ResetPasswordRequest): Promise<void> {
  const user = await userRepo.getUserById(id);
  if (!user) throw new AppError('User not found', HttpStatus.NOT_FOUND);

  const passwordHash = await hashPassword(data.newPassword);
  await userRepo.updatePassword(id, passwordHash);
}
