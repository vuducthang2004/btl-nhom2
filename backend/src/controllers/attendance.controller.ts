import type { Request, Response } from 'express';
import * as attendanceService from '../services/attendance.service.js';
import { success } from '../utils/api-response.js';
import { asyncHandler } from '../utils/async-handler.js';

export const checkIn = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const result = await attendanceService.checkIn(userId);
  success(res, result);
});

export const checkOut = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const result = await attendanceService.checkOut(userId);
  success(res, result);
});

export const overrideAttendance = asyncHandler(async (req: Request, res: Response) => {
  const ownerId = req.user!.id;
  const result = await attendanceService.overrideAttendance(req.body, ownerId);
  success(res, result);
});

export const getAttendanceLogs = asyncHandler(async (req: Request, res: Response) => {
  const result = await attendanceService.getAttendanceLogs(req.query as any);
  success(res, result.data, result.meta);
});

export const getMyHistory = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const { from, to, page, limit } = req.query as any;
  const result = await attendanceService.getMyHistory(userId, from, to, Number(page) || 1, Number(limit) || 20);
  success(res, result.data, result.meta);
});

export const getAttendanceSummary = asyncHandler(async (req: Request, res: Response) => {
  const { from, to } = req.query as any;
  const result = await attendanceService.getSummary(from, to);
  success(res, result);
});
