import type { Request, Response } from 'express';
import * as shiftService from '../services/shift.service.js';
import { success, created } from '../utils/api-response.js';
import { asyncHandler } from '../utils/async-handler.js';

// Shift CRUD
export const createShift = asyncHandler(async (req: Request, res: Response) => {
  const result = await shiftService.createShift(req.body);
  created(res, result);
});

export const getAllShifts = asyncHandler(async (_req: Request, res: Response) => {
  const result = await shiftService.getAllShifts();
  success(res, result);
});

export const updateShift = asyncHandler(async (req: Request, res: Response) => {
  const result = await shiftService.updateShift(Number(req.params.id), req.body);
  success(res, result);
});

export const toggleActive = asyncHandler(async (req: Request, res: Response) => {
  const result = await shiftService.toggleActive(Number(req.params.id));
  success(res, result);
});

// Assignments
export const createAssignment = asyncHandler(async (req: Request, res: Response) => {
  // Detect mode: if body has startDate/endDate → bulk, otherwise single
  if (req.body.startDate && req.body.endDate) {
    const result = await shiftService.createBulkAssignment(req.body);
    created(res, result);
  } else {
    const result = await shiftService.createAssignment(req.body);
    created(res, result);
  }
});

export const getAssignments = asyncHandler(async (req: Request, res: Response) => {
  const result = await shiftService.getAssignments(req.query as any);
  success(res, result.data, result.meta);
});

export const updateAssignment = asyncHandler(async (req: Request, res: Response) => {
  const result = await shiftService.updateAssignment(Number(req.params.id), req.body);
  success(res, result);
});

export const deleteAssignment = asyncHandler(async (req: Request, res: Response) => {
  await shiftService.deleteAssignment(Number(req.params.id));
  success(res, { message: 'Assignment deleted successfully' });
});

export const getMySchedule = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const { from, to } = req.query as any;
  const result = await shiftService.getMySchedule(userId, from, to);
  success(res, result);
});
