import type { Request, Response } from 'express';
import * as reportService from '../services/report.service.js';
import { success } from '../utils/api-response.js';
import { asyncHandler } from '../utils/async-handler.js';

export const getDashboard = asyncHandler(async (_req: Request, res: Response) => {
  const result = await reportService.getDashboard();
  success(res, result);
});

export const getRevenueSummary = asyncHandler(async (req: Request, res: Response) => {
  const result = await reportService.getRevenueSummary(req.query as any);
  success(res, result);
});

export const getRevenueByMethod = asyncHandler(async (req: Request, res: Response) => {
  const result = await reportService.getRevenueByMethod(req.query as any);
  success(res, result);
});

export const getTopSelling = asyncHandler(async (req: Request, res: Response) => {
  const result = await reportService.getTopSelling(req.query as any);
  success(res, result);
});

export const getCategoryPerformance = asyncHandler(async (req: Request, res: Response) => {
  const result = await reportService.getCategoryPerformance(req.query as any);
  success(res, result);
});

export const getCashierPerformance = asyncHandler(async (req: Request, res: Response) => {
  const result = await reportService.getCashierPerformance(req.query as any);
  success(res, result);
});

export const getInventorySummary = asyncHandler(async (_req: Request, res: Response) => {
  const result = await reportService.getInventorySummary();
  success(res, result);
});

export const getInventoryMovements = asyncHandler(async (req: Request, res: Response) => {
  const result = await reportService.getInventoryMovements(req.query as any);
  success(res, result.data, result.meta);
});

export const exportCsv = asyncHandler(async (req: Request, res: Response) => {
  const result = await reportService.exportCsv(req.query as any);
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
  res.send(result.content);
});
