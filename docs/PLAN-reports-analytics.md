# PLAN: Phase 3 — Reports & Analytics

## Overview

Mở rộng Coffee Shop Backend với hệ thống báo cáo & phân tích.
Approach: **Hybrid** — Revenue reports dùng SQL aggregate real-time, inventory tracking dùng bảng `inventory_movements`.
Tổng cộng **9 endpoints mới**, mount tại `/api/v1/reports`, OWNER only.

**Project Type:** BACKEND (API only)
**Phase:** 3 of 4
**Depends on:** Phase 1 (27 endpoints ✅) + Phase 2 (11 endpoints ✅) = 38 endpoints hiện tại

## Decisions (từ brainstorm Phase 3)

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Approach | Hybrid (SQL real-time + inventory_movements) | Revenue query đủ nhanh cho quán nhỏ, inventory cần audit trail |
| Comparison | Không — chỉ trả dữ liệu kỳ hiện tại | Đơn giản hơn, giảm complexity |
| Export format | Chỉ CSV | Đủ dùng, mở bằng Excel, không cần library phức tạp |
| Dashboard endpoint | Có — tổng hợp 1 API call | Tiện cho frontend |
| Date range max | 90 ngày | Safe cho performance |
| Revenue by hour | Bỏ | Không cần thiết |
| Inventory valuation | Bỏ | Không cần thiết |

## Success Criteria

- [ ] 1 migration mới (`inventory_movements`) chạy thành công
- [ ] 9 endpoints mới hoạt động (tổng 47 endpoints)
- [ ] Dashboard trả overview chính xác (1 API call)
- [ ] Revenue summary hỗ trợ daily/monthly/yearly/custom period
- [ ] Top selling + category + cashier performance trả data chính xác
- [ ] Inventory movements ghi log khi deduct + adjust stock
- [ ] Export CSV hoạt động cho tất cả report types
- [ ] Date range bị giới hạn 90 ngày (400 nếu vượt)
- [ ] RBAC: chỉ OWNER truy cập /reports (CASHIER/BARISTA → 403)
- [ ] Backward compatible: 38 endpoints Phase 1+2 hoạt động y nguyên
- [ ] TypeScript 0 errors
- [ ] Swagger docs đầy đủ

## New Endpoints (Phase 3)

### Reports — `/api/v1/reports` (OWNER only)

| # | Method | Path | Mô tả | Query Params |
|---|--------|------|--------|--------------|
| 1 | GET | `/dashboard` | Tổng hợp overview | — |
| 2 | GET | `/revenue/summary` | Doanh thu tổng hợp | `period` (daily/monthly/yearly/custom), `date`, `month`, `year`, `from`, `to` |
| 3 | GET | `/revenue/by-method` | Doanh thu theo phương thức | `period`, date params |
| 4 | GET | `/top-selling` | Top món bán chạy | `period`, date params, `limit` |
| 5 | GET | `/category-performance` | Doanh thu theo danh mục | `period`, date params |
| 6 | GET | `/cashier-performance` | Hiệu suất thu ngân | `period`, date params |
| 7 | GET | `/inventory/summary` | Tổng quan tồn kho | — |
| 8 | GET | `/inventory/movements` | Lịch sử biến động kho | `ingredientId`, `type`, `from`, `to`, `page`, `limit` |
| 9 | GET | `/export` | Export CSV | `type` (revenue/top-selling/inventory/movements/category/cashier), params tương ứng |

**Tổng: 9 endpoints mới** → Phase 3 hoàn thành sẽ có **47 endpoints**

## Database Schema (New Table)

### `inventory_movements`
```sql
CREATE TABLE inventory_movements (
  id INT AUTO_INCREMENT PRIMARY KEY,
  ingredient_id INT NOT NULL,
  change_type ENUM('DEDUCT_ORDER', 'ADJUST_ADD', 'ADJUST_SET', 'INITIAL') NOT NULL,
  quantity_change DECIMAL(10,2) NOT NULL,
  stock_before DECIMAL(10,2) NOT NULL,
  stock_after DECIMAL(10,2) NOT NULL,
  reference_id INT NULL,
  note VARCHAR(255) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (ingredient_id) REFERENCES ingredients(id) ON DELETE RESTRICT,
  INDEX idx_movements_ingredient_date (ingredient_id, created_at),
  INDEX idx_movements_type (change_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

## File Structure (New + Modified)

```
src/
├── types/
│   └── report.types.ts                     [NEW] Report response types
├── validations/
│   └── report.validation.ts                [NEW] Zod schemas cho query params
├── repositories/
│   └── report.repository.ts                [NEW] SQL aggregate queries
├── services/
│   ├── report.service.ts                   [NEW] Business logic + CSV gen
│   └── inventory.service.ts                [MOD] Ghi inventory_movements
├── controllers/
│   └── report.controller.ts                [NEW] Request handlers
├── routes/
│   ├── report.routes.ts                    [NEW] Route definitions
│   └── index.ts                            [MOD] Mount report routes
├── database/
│   ├── migrations/
│   │   └── 013_create_inventory_movements.sql  [NEW]
│   └── seed.ts                             [MOD] Seed initial movements
```

## Task Breakdown — Phase 3: Reports & Analytics

---

### Task 1: Database Migration (inventory_movements)
**Agent:** `backend-specialist` | **Skill:** `database-design`
**Priority:** P0 (Blocker — tất cả task khác phụ thuộc)

- [ ] Tạo `src/database/migrations/013_create_inventory_movements.sql`
  - Bảng `inventory_movements` với schema như trên
  - Indexes: `idx_movements_ingredient_date`, `idx_movements_type`

**INPUT:** 12 migrations hiện tại
**OUTPUT:** Bảng `inventory_movements` tồn tại trong MySQL
**VERIFY:** `pnpm run migrate` → log "Migration complete", kiểm tra bảng tồn tại

---

### Task 2: Types + Validations
**Agent:** `backend-specialist` | **Skill:** `api-patterns`, `clean-code`
**Priority:** P0 (Blocker)
**Depends:** Task 1

- [ ] Tạo `src/types/report.types.ts`:
  - `DashboardResponse` — todayRevenue, todayOrders, completedOrders, cancelledOrders, lowStockCount, topSellingToday (name + quantity)
  - `RevenueSummaryResponse` — period, dateRange, totalOrders, completedOrders, cancelledOrders, totalRevenue, avgOrderValue
  - `RevenueByMethodResponse` — method breakdown (cash, transfer, ewallet) with amount + count
  - `TopSellingItem` — rank, menuItemId, name, categoryName, totalQuantity, totalRevenue, percentOfTotal
  - `CategoryPerformance` — categoryId, name, totalItems, totalQuantity, totalRevenue, percentOfTotal
  - `CashierPerformance` — userId, fullName, totalOrders, totalRevenue, avgOrderValue
  - `InventorySummaryItem` — id, name, unit, stockQuantity, minThreshold, status (OK/LOW/OUT), affectedItemsCount
  - `InventoryMovement` — id, ingredientId, ingredientName, changeType, quantityChange, stockBefore, stockAfter, referenceId, note, createdAt
  - `ReportPeriod` type — 'daily' | 'monthly' | 'yearly' | 'custom'
- [ ] Tạo `src/validations/report.validation.ts`:
  - `revenueSummarySchema` — period (enum), date?, month?, year?, from?, to? (conditional validation)
  - `topSellingSchema` — extends revenue params + limit (default 10, max 50)
  - `inventoryMovementsSchema` — ingredientId?, type? (DEDUCT_ORDER|ADJUST_ADD|ADJUST_SET|INITIAL), from?, to?, page (default 1), limit (default 20, max 100)
  - `exportSchema` — type (enum), tất cả params tương ứng
  - **Date range validation:** from/to diff ≤ 90 ngày, return 400 nếu vượt

**INPUT:** Schema design + brainstorm decisions
**OUTPUT:** Tất cả types + validations compile success
**VERIFY:** `npx tsc --noEmit` → 0 errors

---

### Task 3: Inventory Service Hooks (ghi movements)
**Agent:** `backend-specialist` | **Skill:** `clean-code`
**Priority:** P1
**Depends:** Task 1

- [ ] Sửa `src/services/inventory.service.ts`:
  - Thêm private helper `recordMovement(ingredientId, changeType, quantityChange, stockBefore, stockAfter, referenceId?, note?)`
  - Trong `deductStockForOrder()`: sau mỗi `deductStock()`, gọi `recordMovement(type: DEDUCT_ORDER, referenceId: orderId)`
  - Trong `adjustStock()`:
    - action 'add': gọi `recordMovement(type: ADJUST_ADD)`
    - action 'set': gọi `recordMovement(type: ADJUST_SET)`
  - Movement ghi async — nếu lỗi thì log warning, **không block** operation chính
- [ ] Thêm repository function: `insertMovement()` vào `inventory.repository.ts`

**INPUT:** Inventory service hiện tại + bảng movements
**OUTPUT:** Mỗi lần deduct/adjust stock → có record trong inventory_movements
**VERIFY:**
- Adjust stock ingredient → check DB có movement record
- Thanh toán order → check DB có DEDUCT_ORDER movements
- Movement lỗi → operation chính vẫn thành công

---

### Task 4: Report Repository (SQL Queries)
**Agent:** `backend-specialist` | **Skill:** `database-design`, `clean-code`
**Priority:** P1
**Depends:** Task 2

- [ ] Tạo `src/repositories/report.repository.ts`:
  - `getDashboardData(today: string)`:
    - Subquery 1: COUNT + SUM orders/payments cho hôm nay
    - Subquery 2: COUNT low-stock ingredients
    - Subquery 3: Top selling item hôm nay
  - `getRevenueSummary(from, to)`:
    - JOIN orders + payments WHERE payment.status = 'SUCCESS'
    - GROUP BY logic tùy period (DATE, YEAR-MONTH, YEAR)
    - Returns: totalOrders, completedOrders, cancelledOrders, totalRevenue, avgOrderValue
  - `getRevenueByMethod(from, to)`:
    - GROUP BY payments.method
    - Returns: method, totalAmount, orderCount
  - `getTopSelling(from, to, limit)`:
    - JOIN order_items + menu_items + categories
    - WHERE order paid (EXISTS payment success)
    - GROUP BY menu_item_id, ORDER BY total_quantity DESC
    - Returns: rank, name, category, quantity, revenue, percent
  - `getCategoryPerformance(from, to)`:
    - JOIN order_items + menu_items + categories
    - GROUP BY category_id
    - Returns: category info + totals
  - `getCashierPerformance(from, to)`:
    - JOIN orders + users + payments
    - GROUP BY cashier_id
    - Returns: cashier info + order count + revenue
  - `getInventorySummary()`:
    - SELECT ingredients + COUNT affected items/toppings
    - Compute status: stock ≤ 0 → OUT, stock ≤ threshold → LOW, else OK
  - `getInventoryMovements(filters)`:
    - JOIN inventory_movements + ingredients
    - Filters: ingredientId, type, from, to
    - Pagination: LIMIT + OFFSET + total count

**INPUT:** Bảng hiện tại (orders, payments, order_items, menu_items, categories, users, ingredients, inventory_movements)
**OUTPUT:** Tất cả SQL queries hoạt động, trả đúng dữ liệu
**VERIFY:** Import + gọi từ service layer không lỗi

---

### Task 5: Report Service (Business Logic + CSV)
**Agent:** `backend-specialist` | **Skill:** `api-patterns`, `clean-code`
**Priority:** P1
**Depends:** Task 4

- [ ] Tạo `src/services/report.service.ts`:
  - `getDashboard()` → gọi repo, format response
  - `getRevenueSummary(params)` → parse date range từ period → gọi repo
  - `getRevenueByMethod(params)` → tương tự
  - `getTopSelling(params)` → thêm percentOfTotal calculation
  - `getCategoryPerformance(params)` → tương tự
  - `getCashierPerformance(params)` → tương tự
  - `getInventorySummary()` → format + add status
  - `getInventoryMovements(params)` → pagination
  - Helper: `parseDateRange(period, date?, month?, year?, from?, to?)` → returns `{ from: string, to: string }`
    - daily: date → date
    - monthly: month → first/last day
    - yearly: year → first/last day
    - custom: from/to trực tiếp
    - **Validate:** range ≤ 90 ngày
  - `exportCsv(type, params)`:
    - Gọi service tương ứng lấy data
    - Transform data → CSV string (header row + data rows)
    - Hỗ trợ: revenue, top-selling, inventory, movements, category, cashier
    - Dùng simple CSV generation (no external library — data volume nhỏ)
    - Return: `{ filename: string, content: string }`

**INPUT:** Repository layer hoạt động
**OUTPUT:** Business logic hoàn chỉnh + CSV generation
**VERIFY:** TypeScript compile + gọi từ controller

---

### Task 6: Report Controller + Routes
**Agent:** `backend-specialist` | **Skill:** `api-patterns`, `clean-code`
**Priority:** P1
**Depends:** Task 5

- [ ] Tạo `src/controllers/report.controller.ts`:
  - `getDashboard` — GET /dashboard
  - `getRevenueSummary` — GET /revenue/summary
  - `getRevenueByMethod` — GET /revenue/by-method
  - `getTopSelling` — GET /top-selling
  - `getCategoryPerformance` — GET /category-performance
  - `getCashierPerformance` — GET /cashier-performance
  - `getInventorySummary` — GET /inventory/summary
  - `getInventoryMovements` — GET /inventory/movements
  - `exportCsv` — GET /export (set Content-Type: text/csv, Content-Disposition: attachment)
- [ ] Tạo `src/routes/report.routes.ts`:
  - Mount tất cả routes tại `/api/v1/reports`
  - Tất cả dùng `authenticate` + `authorize(Role.OWNER)`
  - Validation middleware cho query params
- [ ] Cập nhật `src/routes/index.ts` — mount reportRoutes

**INPUT:** Service layer hoạt động
**OUTPUT:** 9 endpoints hoạt động
**VERIFY:**
- GET /reports/dashboard → trả overview data
- GET /reports/revenue/summary?period=daily&date=2026-05-24 → doanh thu ngày
- GET /reports/export?type=revenue&period=monthly&month=2026-05 → download CSV file
- CASHIER/BARISTA gọi → 403

---

### Task 7: Seed Data (Initial Movements)
**Agent:** `backend-specialist` | **Skill:** `database-design`
**Priority:** P2
**Depends:** Task 1, Task 3

- [ ] Cập nhật `src/database/seed.ts`:
  - Thêm TRUNCATE `inventory_movements` (trước FK checks off)
  - Seed initial movements cho 15 ingredients (type: INITIAL, quantityChange = stock_quantity, stockBefore = 0, stockAfter = stock_quantity)
  - Giúp có data demo cho GET /inventory/movements

**INPUT:** Seed hiện tại + bảng movements
**OUTPUT:** Seed chạy thành công với inventory_movements
**VERIFY:** `pnpm run seed` → log "Seed complete", check DB có 15 movement records

---

### Task 8: Swagger Documentation
**Agent:** `backend-specialist` | **Skill:** `api-patterns`
**Priority:** P2
**Depends:** Task 6

- [ ] Thêm JSDoc `@swagger` comments cho tất cả 9 endpoints mới
- [ ] Thêm Swagger schemas: DashboardResponse, RevenueSummaryResponse, TopSellingItem, etc.
- [ ] Document query params với examples
- [ ] Verify trên Swagger UI

**INPUT:** Tất cả routes đã hoạt động
**OUTPUT:** Swagger UI hiển thị 9 endpoints Phase 3
**VERIFY:** Truy cập `/api-docs` → 9 endpoints mới hiển thị, có thể "Try it out"

---

## Dependency Graph

```
Task 1 (Migration) ──────────────────────────────────┐
    │                                                  │
    ▼                                                  ▼
Task 2 (Types + Validations)                    Task 3 (Inventory Hooks)
    │                                                  │
    ▼                                                  │
Task 4 (Repository)                                    │
    │                                                  │
    ▼                                                  │
Task 5 (Service)                                       │
    │                                                  │
    ▼                                                  ▼
Task 6 (Controller + Routes)                    Task 7 (Seed Data)
    │
    ▼
Task 8 (Swagger)
```

**Parallel opportunities:**
- Task 2 + Task 3 chạy song song (sau Task 1)
- Task 3 + Task 7 có thể merge (cùng sửa inventory layer)

## Edge Cases

| Case | Xử lý |
|------|-------|
| Không có order trong date range | Trả totalOrders: 0, totalRevenue: 0 |
| Date range > 90 ngày | 400 Bad Request: "Date range must not exceed 90 days" |
| period=daily nhưng thiếu param `date` | 400 Bad Request: "date is required for daily period" |
| period=custom nhưng thiếu from/to | 400 Bad Request: "from and to are required for custom period" |
| Export CSV với data rỗng | Trả CSV file chỉ có header row |
| Movement ghi lỗi | Log warning, không block deduct/adjust (graceful) |
| Ingredient bị xóa (RESTRICT) | Movement vẫn tồn tại (FK intact) |
| Concurrent deduct + adjust | Stock_before/after reflect thời điểm ghi, chấp nhận minor inconsistency |
| Dashboard gọi nhiều query | Dùng Promise.all cho các subquery independent |
| Top selling limit = 0 | Default to 10, min 1 |

## Response Examples

### Dashboard
```json
{
  "success": true,
  "data": {
    "todayRevenue": 2350000,
    "todayOrders": 47,
    "completedOrders": 42,
    "cancelledOrders": 5,
    "lowStockCount": 3,
    "topSellingToday": {
      "name": "Cà Phê Sữa",
      "quantity": 23
    }
  }
}
```

### Revenue Summary (monthly)
```json
{
  "success": true,
  "data": {
    "period": "monthly",
    "from": "2026-05-01",
    "to": "2026-05-31",
    "totalOrders": 1240,
    "completedOrders": 1180,
    "cancelledOrders": 60,
    "totalRevenue": 62000000,
    "avgOrderValue": 52542
  }
}
```

### Export CSV
```
Content-Type: text/csv
Content-Disposition: attachment; filename="revenue_2026-05.csv"

date,total_orders,completed_orders,cancelled_orders,total_revenue,avg_order_value
2026-05-01,42,40,2,2100000,52500
2026-05-02,38,36,2,1900000,52778
...
```

## Phase X: Verification

### Automated
- [ ] `npx tsc --noEmit` — TypeScript 0 errors
- [ ] Tất cả 47 endpoints test qua Swagger UI

### Manual Test Scenarios
- [ ] **Dashboard:** GET /reports/dashboard → trả 6 metrics chính xác
- [ ] **Revenue daily:** GET /reports/revenue/summary?period=daily&date=2026-05-24 → đúng doanh thu ngày
- [ ] **Revenue monthly:** GET /reports/revenue/summary?period=monthly&month=2026-05 → đúng doanh thu tháng
- [ ] **Revenue custom:** GET /reports/revenue/summary?period=custom&from=2026-05-01&to=2026-05-15 → đúng range
- [ ] **Revenue date exceed:** from/to > 90 ngày → 400 error
- [ ] **By method:** GET /reports/revenue/by-method → breakdown CASH/TRANSFER/E_WALLET
- [ ] **Top selling:** GET /reports/top-selling?limit=5 → top 5 món
- [ ] **Category:** GET /reports/category-performance → doanh thu mỗi danh mục
- [ ] **Cashier:** GET /reports/cashier-performance → doanh thu mỗi thu ngân
- [ ] **Inventory summary:** GET /reports/inventory/summary → danh sách + status (OK/LOW/OUT)
- [ ] **Inventory movements:** PATCH /inventory/ingredients/1/stock (adjust) → movement ghi log → GET /reports/inventory/movements?ingredientId=1 → thấy record
- [ ] **Deduct movement:** Tạo order + thanh toán → GET /reports/inventory/movements?type=DEDUCT_ORDER → thấy records
- [ ] **Export CSV:** GET /reports/export?type=revenue&period=daily&date=2026-05-24 → download file .csv mở được bằng Excel
- [ ] **RBAC:** CASHIER/BARISTA gọi /reports/* → 403 Forbidden
- [ ] **Phase 1+2 regression:** 38 endpoints cũ hoạt động bình thường
- [ ] **Seed:** `pnpm run seed` → có inventory_movements records

### Done When
- [ ] 47 endpoints hoạt động (38 Phase 1+2 + 9 Phase 3)
- [ ] Swagger docs cập nhật tại /api-docs
- [ ] Inventory movements ghi log đầy đủ
- [ ] Export CSV hoạt động
- [ ] TypeScript 0 errors
- [ ] Docker build thành công
