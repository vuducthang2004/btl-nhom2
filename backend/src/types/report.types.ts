export type ReportPeriod = 'daily' | 'monthly' | 'yearly' | 'custom';

export interface DashboardResponse {
  todayRevenue: number;
  todayOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  lowStockCount: number;
  topSellingToday: { name: string; quantity: number } | null;
}

export interface RevenueSummaryResponse {
  period: ReportPeriod;
  from: string;
  to: string;
  totalOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  totalRevenue: number;
  avgOrderValue: number;
}

export interface RevenueByMethodItem {
  method: string;
  totalAmount: number;
  orderCount: number;
  percentage: number;
}

export interface TopSellingItem {
  rank: number;
  menuItemId: number;
  name: string;
  categoryName: string;
  totalQuantity: number;
  totalRevenue: number;
  percentOfTotal: number;
}

export interface CategoryPerformance {
  categoryId: number;
  name: string;
  totalItems: number;
  totalQuantity: number;
  totalRevenue: number;
  percentOfTotal: number;
}

export interface CashierPerformance {
  userId: number;
  fullName: string;
  totalOrders: number;
  totalRevenue: number;
  avgOrderValue: number;
}

export interface InventorySummaryItem {
  id: number;
  name: string;
  unit: string;
  stockQuantity: number;
  minThreshold: number;
  status: 'OK' | 'LOW' | 'OUT';
  affectedItemsCount: number;
}

export interface InventoryMovement {
  id: number;
  ingredientId: number;
  ingredientName: string;
  changeType: string;
  quantityChange: number;
  stockBefore: number;
  stockAfter: number;
  referenceId: number | null;
  note: string | null;
  createdAt: string;
}
