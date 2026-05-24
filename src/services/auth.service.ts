import * as authRepo from '../repositories/auth.repository.js';
import { comparePassword } from '../utils/hash.js';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt.js';
import { AppError } from '../middleware/error-handler.middleware.js';
import { HttpStatus } from '../constants/http-status.js';
import type { LoginRequest, LoginResponse, RefreshResponse, UserInfo } from '../types/auth.types.js';

export async function login(data: LoginRequest): Promise<LoginResponse> {
  const user = await authRepo.findByUsername(data.username);

  if (!user || !user.is_active) {
    throw new AppError('Invalid username or password', HttpStatus.UNAUTHORIZED);
  }

  const isValid = await comparePassword(data.password, user.password_hash);
  if (!isValid) {
    throw new AppError('Invalid username or password', HttpStatus.UNAUTHORIZED);
  }

  const payload = { id: user.id, role: user.role };
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  await authRepo.updateRefreshToken(user.id, refreshToken);

  return {
    accessToken,
    refreshToken,
    user: {
      id: user.id,
      username: user.username,
      fullName: user.full_name,
      role: user.role,
    },
  };
}

export async function refresh(refreshToken: string): Promise<RefreshResponse> {
  try {
    const decoded = verifyRefreshToken(refreshToken);
    const user = await authRepo.findById(decoded.id);

    if (!user || !user.is_active || user.refresh_token !== refreshToken) {
      throw new AppError('Invalid refresh token', HttpStatus.UNAUTHORIZED);
    }

    const accessToken = generateAccessToken({ id: user.id, role: user.role });
    return { accessToken };
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('Invalid refresh token', HttpStatus.UNAUTHORIZED);
  }
}

export async function logout(userId: number): Promise<void> {
  await authRepo.updateRefreshToken(userId, null);
}

export async function getMe(userId: number): Promise<UserInfo> {
  const user = await authRepo.findById(userId);

  if (!user || !user.is_active) {
    throw new AppError('User not found', HttpStatus.NOT_FOUND);
  }

  return {
    id: user.id,
    username: user.username,
    fullName: user.full_name,
    role: user.role,
  };
}
