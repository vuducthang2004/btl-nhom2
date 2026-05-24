import * as reportRepo from '../repositories/report.repository.js';
import { AppError } from '../middleware/error-handler.middleware.js';
import { HttpStatus } from '../constants/http-status.js';
import type {
  ReportPeriod, DashboardResponse, RevenueSummaryResponse,
  RevenueByMethodItem, TopSellingItem, CategoryPerformance,
  CashierPerformance, InventorySummaryItem, InventoryMovement,
} from '../types/report.types.js';
import type { PaginationMeta } from '../types/common.types.js';
import { getLocalDateString } from '../utils/timezone.js';

const MAX_DATE_RANGE_DAYS = 90;

// ============================================
// Date Range Parsing
// ============================================

function parseDateRange(params: {
  period: ReportPeriod;
  date?: string;
  month?: string;
  year?: string;
  from?: string;
  to?: string;
}): { from: string; to: string } {
  switch (params.period) {
    case 'daily':
      return { from: params.date!, to: params.date! };

    case 'monthly': {
      const [y, m] = params.month!.split('-');
      const lastDay = new Date(Number(y), Number(m), 0).getDate();
      return { from: `${params.month}-01`, to: `${params.month}-${String(lastDay).padStart(2, '0')}` };
    }

    case 'yearly':
      return { from: `${params.year}-01-01`, to: `${params.year}-12-31` };

    case 'custom': {
      const fromDate = new Date(params.from!);
      const toDate = new Date(params.to!);
      const diffDays = Math.ceil((toDate.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays > MAX_DATE_RANGE_DAYS) {
        throw new AppError(`Date range must not exceed ${MAX_DATE_RANGE_DAYS} days`, HttpStatus.BAD_REQUEST);
      }
      if (diffDays < 0) {
        throw new AppError('"from" must be before "to"', HttpStatus.BAD_REQUEST);
      }
      return { from: params.from!, to: params.to! };
    }
  }
}

// ============================================
// Dashboard
// ============================================

export async function getDashboard(): Promise<DashboardResponse> {
  const today = getLocalDateString();
  const data = await reportRepo.getDashboardData(today);

  return {
    todayRevenue: Number(data.orderStats.total_revenue),
    todayOrders: Number(data.orderStats.total_orders),
    completedOrders: Number(data.orderStats.completed_orders),
    cancelledOrders: Number(data.orderStats.cancelled_orders),
    lowStockCount: data.lowStockCount,
    topSellingToday: data.topSelling
      ? { name: data.topSelling.name, quantity: Number(data.topSelling.total_quantity) }
      : null,
  };
}

// ============================================
// Revenue Summary
// ============================================

export async function getRevenueSummary(params: {
  period: ReportPeriod;
  date?: string;
  month?: string;
  year?: string;
  from?: string;
  to?: string;
}): Promise<RevenueSummaryResponse> {
  const { from, to } = parseDateRange(params);
  const data = await reportRepo.getRevenueSummary(from, to);

  const totalOrders = Number(data.total_orders);
  const totalRevenue = Number(data.total_revenue);

  return {
    period: params.period,
    from,
    to,
    totalOrders,
    completedOrders: Number(data.completed_orders),
    cancelledOrders: Number(data.cancelled_orders),
    totalRevenue,
    avgOrderValue: totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0,
  };
}

// ============================================
// Revenue By Method
// ============================================

export async function getRevenueByMethod(params: {
  period: ReportPeriod;
  date?: string;
  month?: string;
  year?: string;
  from?: string;
  to?: string;
}): Promise<RevenueByMethodItem[]> {
  const { from, to } = parseDateRange(params);
  const rows = await reportRepo.getRevenueByMethod(from, to);

  const grandTotal = rows.reduce((sum: number, r: any) => sum + Number(r.total_amount), 0);

  return rows.map((r: any) => ({
    method: r.method,
    totalAmount: Number(r.total_amount),
    orderCount: Number(r.order_count),
    percentage: grandTotal > 0 ? Math.round((Number(r.total_amount) / grandTotal) * 10000) / 100 : 0,
  }));
}

// ============================================
// Top Selling
// ============================================

export async function getTopSelling(params: {
  period: ReportPeriod;
  date?: string;
  month?: string;
  year?: string;
  from?: string;
  to?: string;
  limit: number;
}): Promise<TopSellingItem[]> {
  const { from, to } = parseDateRange(params);
  const rows = await reportRepo.getTopSelling(from, to, params.limit);
  const grandTotal = await reportRepo.getTotalRevenue(from, to);

  return rows.map((r: any, i: number) => ({
    rank: i + 1,
    menuItemId: r.menu_item_id,
    name: r.name,
    categoryName: r.category_name,
    totalQuantity: Number(r.total_quantity),
    totalRevenue: Number(r.total_revenue),
    percentOfTotal: grandTotal > 0 ? Math.round((Number(r.total_revenue) / grandTotal) * 10000) / 100 : 0,
  }));
}

// ============================================
// Category Performance
// ============================================

export async function getCategoryPerformance(params: {
  period: ReportPeriod;
  date?: string;
  month?: string;
  year?: string;
  from?: string;
  to?: string;
}): Promise<CategoryPerformance[]> {
  const { from, to } = parseDateRange(params);
  const rows = await reportRepo.getCategoryPerformance(from, to);

  const grandTotal = rows.reduce((sum: number, r: any) => sum + Number(r.total_revenue), 0);

  return rows.map((r: any) => ({
    categoryId: r.category_id,
    name: r.name,
    totalItems: Number(r.total_items),
    totalQuantity: Number(r.total_quantity),
    totalRevenue: Number(r.total_revenue),
    percentOfTotal: grandTotal > 0 ? Math.round((Number(r.total_revenue) / grandTotal) * 10000) / 100 : 0,
  }));
}

// ============================================
// Cashier Performance
// ============================================

export async function getCashierPerformance(params: {
  period: ReportPeriod;
  date?: string;
  month?: string;
  year?: string;
  from?: string;
  to?: string;
}): Promise<CashierPerformance[]> {
  const { from, to } = parseDateRange(params);
  const rows = await reportRepo.getCashierPerformance(from, to);

  return rows.map((r: any) => {
    const totalOrders = Number(r.total_orders);
    const totalRevenue = Number(r.total_revenue);
    return {
      userId: r.user_id,
      fullName: r.full_name,
      totalOrders,
      totalRevenue,
      avgOrderValue: totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0,
    };
  });
}

// ============================================
// Inventory Summary
// ============================================

export async function getInventorySummary(): Promise<InventorySummaryItem[]> {
  const rows = await reportRepo.getInventorySummary();

  return rows.map((r: any) => {
    const stockQuantity = Number(r.stock_quantity);
    const minThreshold = Number(r.min_threshold);
    let status: 'OK' | 'LOW' | 'OUT';
    if (stockQuantity <= 0) status = 'OUT';
    else if (stockQuantity <= minThreshold) status = 'LOW';
    else status = 'OK';

    return {
      id: r.id,
      name: r.name,
      unit: r.unit,
      stockQuantity,
      minThreshold,
      status,
      affectedItemsCount: Number(r.affected_items_count),
    };
  });
}

// ============================================
// Inventory Movements
// ============================================

export async function getInventoryMovements(params: {
  ingredientId?: number;
  type?: string;
  from?: string;
  to?: string;
  page: number;
  limit: number;
}): Promise<{ data: InventoryMovement[]; meta: PaginationMeta }> {
  const { rows, total } = await reportRepo.getInventoryMovements(params);

  return {
    data: rows.map((r: any) => ({
      id: r.id,
      ingredientId: r.ingredient_id,
      ingredientName: r.ingredient_name,
      changeType: r.change_type,
      quantityChange: Number(r.quantity_change),
      stockBefore: Number(r.stock_before),
      stockAfter: Number(r.stock_after),
      referenceId: r.reference_id,
      note: r.note,
      createdAt: r.created_at,
    })),
    meta: {
      page: params.page,
      limit: params.limit,
      total,
      totalPages: Math.ceil(total / params.limit),
    },
  };
}

// ============================================
// Export CSV
// ============================================

function toCsvRow(values: (string | number | null)[]): string {
  return values.map(v => {
    if (v === null || v === undefined) return '';
    const str = String(v);
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  }).join(',');
}

function buildCsv(headers: string[], rows: (string | number | null)[][]): string {
  const lines = [toCsvRow(headers), ...rows.map(toCsvRow)];
  return '\uFEFF' + lines.join('\n'); // BOM for UTF-8 Excel compatibility
}

export async function exportCsv(params: {
  type: string;
  period?: ReportPeriod;
  date?: string;
  month?: string;
  year?: string;
  from?: string;
  to?: string;
  limit?: number;
}): Promise<{ filename: string; content: string }> {
  const periodParams = params.period ? {
    period: params.period,
    date: params.date,
    month: params.month,
    year: params.year,
    from: params.from,
    to: params.to,
  } : { period: 'daily' as const, date: new Date().toISOString().split('T')[0] };

  switch (params.type) {
    case 'revenue': {
      const data = await getRevenueSummary(periodParams);
      const content = buildCsv(
        ['period', 'from', 'to', 'total_orders', 'completed_orders', 'cancelled_orders', 'total_revenue', 'avg_order_value'],
        [[data.period, data.from, data.to, data.totalOrders, data.completedOrders, data.cancelledOrders, data.totalRevenue, data.avgOrderValue]]
      );
      return { filename: `revenue_${data.from}_${data.to}.csv`, content };
    }

    case 'top-selling': {
      const data = await getTopSelling({ ...periodParams, limit: params.limit ?? 10 });
      const content = buildCsv(
        ['rank', 'name', 'category', 'total_quantity', 'total_revenue', 'percent_of_total'],
        data.map(d => [d.rank, d.name, d.categoryName, d.totalQuantity, d.totalRevenue, d.percentOfTotal])
      );
      const { from } = parseDateRange(periodParams);
      return { filename: `top-selling_${from}.csv`, content };
    }

    case 'category': {
      const data = await getCategoryPerformance(periodParams);
      const content = buildCsv(
        ['category', 'total_items', 'total_quantity', 'total_revenue', 'percent_of_total'],
        data.map(d => [d.name, d.totalItems, d.totalQuantity, d.totalRevenue, d.percentOfTotal])
      );
      const { from } = parseDateRange(periodParams);
      return { filename: `category_${from}.csv`, content };
    }

    case 'cashier': {
      const data = await getCashierPerformance(periodParams);
      const content = buildCsv(
        ['name', 'total_orders', 'total_revenue', 'avg_order_value'],
        data.map(d => [d.fullName, d.totalOrders, d.totalRevenue, d.avgOrderValue])
      );
      const { from } = parseDateRange(periodParams);
      return { filename: `cashier_${from}.csv`, content };
    }

    case 'inventory': {
      const data = await getInventorySummary();
      const content = buildCsv(
        ['name', 'unit', 'stock_quantity', 'min_threshold', 'status', 'affected_items_count'],
        data.map(d => [d.name, d.unit, d.stockQuantity, d.minThreshold, d.status, d.affectedItemsCount])
      );
      return { filename: `inventory_${new Date().toISOString().split('T')[0]}.csv`, content };
    }

    case 'movements': {
      const result = await getInventoryMovements({ page: 1, limit: 1000, from: params.from, to: params.to });
      const content = buildCsv(
        ['id', 'ingredient', 'type', 'quantity_change', 'stock_before', 'stock_after', 'reference_id', 'note', 'created_at'],
        result.data.map(d => [d.id, d.ingredientName, d.changeType, d.quantityChange, d.stockBefore, d.stockAfter, d.referenceId, d.note, d.createdAt])
      );
      return { filename: `movements_${new Date().toISOString().split('T')[0]}.csv`, content };
    }

    default:
      throw new AppError(`Unknown export type: ${params.type}`, HttpStatus.BAD_REQUEST);
  }
}
