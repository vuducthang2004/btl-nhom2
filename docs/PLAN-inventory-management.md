# PLAN: Phase 2 — Inventory Management

## Overview

Mở rộng Coffee Shop Backend với hệ thống quản lý kho nguyên liệu.
Tính năng chính: CRUD nguyên liệu, định lượng (recipe) cho món/topping, tự động trừ kho khi thanh toán, cảnh báo + auto-lock khi hết nguyên liệu.

**Project Type:** BACKEND (API only)
**Phase:** 2 of 4
**Depends on:** Phase 1 (COMPLETED — 27 endpoints, 10/10 tasks)

## Decisions (từ brainstorm Phase 2)

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Đơn vị đo | ENUM: g, kg, ml, l, unit, pack, shot, pump, tbsp | Cover quán cafe, chuẩn hóa, tránh typo |
| Thời điểm trừ kho | Khi thanh toán thành công | Đơn giản, 1 chiều, không cần rollback |
| Stock âm | Cho phép, chỉ cảnh báo | Thực tế pha từ dự trữ chưa nhập hệ thống |
| Recipe bắt buộc | Optional (backward compatible) | Món chưa gán nguyên liệu vẫn bán bình thường |
| Auto-lock | Reactive (check sau trừ kho) + Alert endpoint | Đủ thông minh, không over-engineer |
| Nhập kho | Cộng stock đơn giản | Dễ dùng, sau này nâng lên audit trail nếu cần |
| Topping ingredients | Có bảng riêng (topping_ingredients) | Chính xác, consistent với menu_item_ingredients |
| Mount endpoint | Gom chung `/api/v1/inventory` | Namespace rõ ràng |
| Seed data | Có sample ingredients + gán định lượng | Demo được ngay |

## Success Criteria

- [ ] CRUD nguyên liệu hoạt động (OWNER only)
- [ ] Gán/sửa định lượng cho menu items + toppings
- [ ] Thanh toán đơn hàng → tự động trừ kho đúng số lượng
- [ ] Nguyên liệu xuống dưới threshold → auto-lock tất cả món/topping liên quan
- [ ] Nhập kho → stock tăng → auto re-enable món nếu đủ nguyên liệu
- [ ] GET /inventory/alerts trả danh sách nguyên liệu sắp hết
- [ ] Backward compatible: 27 endpoints Phase 1 hoạt động y nguyên
- [ ] Seed data có nguyên liệu mẫu + gán cho menu items
- [ ] Swagger docs cập nhật cho tất cả endpoints mới
- [ ] TypeScript 0 errors

## New Endpoints (Phase 2)

### Inventory — `/api/v1/inventory` (OWNER only)

| Method | Path | Role | Mô tả |
|--------|------|------|-------|
| POST | /ingredients | OWNER | Tạo nguyên liệu mới |
| GET | /ingredients | OWNER | Danh sách nguyên liệu + stock |
| GET | /ingredients/:id | OWNER | Chi tiết 1 nguyên liệu |
| PUT | /ingredients/:id | OWNER | Sửa thông tin nguyên liệu |
| PATCH | /ingredients/:id/active | OWNER | Enable/disable nguyên liệu |
| PATCH | /ingredients/:id/stock | OWNER | Nhập kho (cộng/set stock) |
| GET | /alerts | OWNER | Nguyên liệu sắp hết (stock ≤ threshold) |

### Menu Recipe — `/api/v1/menu` (OWNER only)

| Method | Path | Role | Mô tả |
|--------|------|------|-------|
| GET | /items/:id/ingredients | OWNER | Xem định lượng của món |
| PUT | /items/:id/ingredients | OWNER | Cập nhật định lượng (replace all) |
| GET | /toppings/:id/ingredients | OWNER | Xem định lượng của topping |
| PUT | /toppings/:id/ingredients | OWNER | Cập nhật định lượng (replace all) |

**Tổng: 11 endpoints mới** → Phase 2 hoàn thành sẽ có **38 endpoints**

## Database Schema (New Tables)

### `ingredients`
```sql
CREATE TABLE ingredients (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  unit ENUM('g','kg','ml','l','unit','pack','shot','pump','tbsp') NOT NULL,
  stock_quantity DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  min_threshold DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_ingredients_active (is_active),
  INDEX idx_ingredients_stock (stock_quantity, min_threshold)
);
```

### `menu_item_ingredients`
```sql
CREATE TABLE menu_item_ingredients (
  id INT AUTO_INCREMENT PRIMARY KEY,
  menu_item_id INT NOT NULL,
  ingredient_id INT NOT NULL,
  quantity_per_unit DECIMAL(10,2) NOT NULL,
  FOREIGN KEY (menu_item_id) REFERENCES menu_items(id) ON DELETE CASCADE,
  FOREIGN KEY (ingredient_id) REFERENCES ingredients(id) ON DELETE RESTRICT,
  UNIQUE KEY uq_menu_ingredient (menu_item_id, ingredient_id)
);
```

### `topping_ingredients`
```sql
CREATE TABLE topping_ingredients (
  id INT AUTO_INCREMENT PRIMARY KEY,
  topping_id INT NOT NULL,
  ingredient_id INT NOT NULL,
  quantity_per_unit DECIMAL(10,2) NOT NULL,
  FOREIGN KEY (topping_id) REFERENCES toppings(id) ON DELETE CASCADE,
  FOREIGN KEY (ingredient_id) REFERENCES ingredients(id) ON DELETE RESTRICT,
  UNIQUE KEY uq_topping_ingredient (topping_id, ingredient_id)
);
```

## File Structure (New + Modified)

```
src/
├── constants/
│   └── unit.ts                              [NEW] Unit enum
├── types/
│   └── inventory.types.ts                   [NEW] Ingredient, Recipe types
├── validations/
│   └── inventory.validation.ts              [NEW] Zod schemas
├── repositories/
│   └── inventory.repository.ts              [NEW] SQL queries
├── services/
│   └── inventory.service.ts                 [NEW] Business logic (deduct, lock, alert)
├── controllers/
│   └── inventory.controller.ts              [NEW] Request handlers
├── routes/
│   ├── inventory.routes.ts                  [NEW] Route definitions
│   └── index.ts                             [MOD] Mount inventory routes
├── database/
│   ├── migrations/
│   │   ├── 010_create_ingredients.sql       [NEW]
│   │   ├── 011_create_menu_item_ingredients.sql [NEW]
│   │   └── 012_create_topping_ingredients.sql   [NEW]
│   └── seed.ts                              [MOD] Add ingredients + recipes
└── services/
    └── payment.service.ts                   [MOD] Hook deductStock after payment

# Also modified:
src/controllers/menu.controller.ts           [MOD] Recipe endpoints
src/routes/menu.routes.ts                    [MOD] Recipe routes
```

## Task Breakdown — Phase 2: Inventory Management

---

### Task 1: Database Migrations (Ingredients + Recipes)
**Agent:** `backend-specialist` | **Skill:** `database-design`
**Priority:** P0 (Blocker — tất cả task khác phụ thuộc)

- [ ] Tạo `src/database/migrations/010_create_ingredients.sql`
- [ ] Tạo `src/database/migrations/011_create_menu_item_ingredients.sql`
- [ ] Tạo `src/database/migrations/012_create_topping_ingredients.sql`

**INPUT:** Schema design từ brainstorm (đã confirm)
**OUTPUT:** 3 bảng mới trong MySQL
**VERIFY:** `pnpm run migrate` → log "Migration complete", kiểm tra bảng tồn tại

---

### Task 2: Constants + Types + Validations
**Agent:** `backend-specialist` | **Skill:** `api-patterns`, `clean-code`
**Priority:** P0 (Blocker)
**Depends:** Task 1

- [ ] Tạo `src/constants/unit.ts` — Unit enum (G, KG, ML, L, UNIT, PACK, SHOT, PUMP, TBSP)
- [ ] Tạo `src/types/inventory.types.ts`:
  - `Ingredient` — response type
  - `CreateIngredientRequest` — name, unit, stock_quantity, min_threshold
  - `UpdateIngredientRequest` — name, unit, min_threshold (stock riêng endpoint)
  - `AdjustStockRequest` — quantity, action ('add' | 'set')
  - `RecipeItem` — ingredient_id, quantity_per_unit
  - `SetRecipeRequest` — items: RecipeItem[] (replace all)
  - `IngredientAlert` — ingredient + affected menu items/toppings
- [ ] Tạo `src/validations/inventory.validation.ts`:
  - `createIngredientSchema` — name required, unit enum, stock ≥ 0, threshold ≥ 0
  - `updateIngredientSchema` — partial of create (no stock)
  - `adjustStockSchema` — quantity (number), action ('add' | 'set')
  - `setRecipeSchema` — items[]: ingredient_id (int), quantity_per_unit (> 0)

**INPUT:** Unit enum, type definitions
**OUTPUT:** Tất cả types + validations compile success
**VERIFY:** `npx tsc --noEmit` → 0 errors

---

### Task 3: Inventory Repository (Data Access Layer)
**Agent:** `backend-specialist` | **Skill:** `database-design`, `clean-code`
**Priority:** P1
**Depends:** Task 1, Task 2

- [ ] Tạo `src/repositories/inventory.repository.ts`:
  - `createIngredient(name, unit, stockQuantity, minThreshold)` → insert, return id
  - `getAllIngredients()` → SELECT * with sorting
  - `getIngredientById(id)` → single record
  - `updateIngredient(id, data)` → UPDATE name, unit, min_threshold
  - `toggleActive(id, isActive)` → UPDATE is_active
  - `adjustStock(id, quantity, action)` → UPDATE stock_quantity (add hoặc set)
  - `deductStock(id, amount)` → UPDATE stock_quantity = stock_quantity - amount
  - `getLowStockIngredients()` → WHERE stock_quantity <= min_threshold AND is_active = true
  - `getMenuItemIngredients(menuItemId)` → JOIN ingredients
  - `setMenuItemIngredients(menuItemId, items[])` → DELETE all + INSERT (transaction)
  - `getToppingIngredients(toppingId)` → JOIN ingredients
  - `setToppingIngredients(toppingId, items[])` → DELETE all + INSERT (transaction)
  - `getMenuItemsByIngredientId(ingredientId)` → for auto-lock
  - `getToppingsByIngredientId(ingredientId)` → for auto-lock

**INPUT:** Migration tables created
**OUTPUT:** All SQL queries hoạt động
**VERIFY:** Import và gọi từ service layer không lỗi

---

### Task 4: Inventory Service (Business Logic)
**Agent:** `backend-specialist` | **Skill:** `api-patterns`, `clean-code`
**Priority:** P1
**Depends:** Task 3

- [ ] Tạo `src/services/inventory.service.ts`:
  - `createIngredient(data)` → validate unique name → insert → return
  - `getAllIngredients()` → return list
  - `getIngredientById(id)` → 404 if not found
  - `updateIngredient(id, data)` → 404 if not found → update
  - `toggleActive(id)` → 404 if not found → toggle is_active
  - `adjustStock(id, quantity, action)`:
    - action = 'add': stock += quantity
    - action = 'set': stock = quantity
    - Sau adjust: gọi `checkAndReEnableItems(ingredientId)` nếu stock tăng
  - `getAlerts()` → getLowStockIngredients() + map ra affected items/toppings
  - `setMenuItemRecipe(menuItemId, items[])` → validate menu item exists + all ingredients exist → replace
  - `getMenuItemRecipe(menuItemId)` → 404 if menu item not found
  - `setToppingRecipe(toppingId, items[])` → validate topping exists + all ingredients exist → replace
  - `getToppingRecipe(toppingId)` → 404 if topping not found
  - `deductStockForOrder(orderId)` — **Core logic:**
    1. Lấy tất cả order items + order item toppings
    2. Với mỗi order item: lấy recipe → quantity × quantity_per_unit → deduct
    3. Với mỗi topping: lấy recipe → tương tự → deduct
    4. Bỏ qua items/toppings chưa gán recipe (backward compatible)
    5. Sau khi trừ: check từng ingredient → nếu stock ≤ threshold → auto-lock
  - `checkAndAutoLock(ingredientId)` — private:
    - Lấy tất cả menu items + toppings dùng ingredient này
    - Nếu stock ≤ threshold: set is_available = false cho tất cả
  - `checkAndReEnableItems(ingredientId)` — private:
    - Ngược lại auto-lock: nếu stock > threshold
    - Chỉ re-enable món nếu TẤT CẢ nguyên liệu của món đều đủ

**INPUT:** Repository layer hoạt động
**OUTPUT:** Tất cả business logic hoạt động
**VERIFY:** TypeScript compile + gọi từ controller

---

### Task 5: Inventory Controller + Routes
**Agent:** `backend-specialist` | **Skill:** `api-patterns`, `clean-code`
**Priority:** P1
**Depends:** Task 4

- [ ] Tạo `src/controllers/inventory.controller.ts`:
  - `createIngredient` — POST /ingredients
  - `getAllIngredients` — GET /ingredients
  - `getIngredientById` — GET /ingredients/:id
  - `updateIngredient` — PUT /ingredients/:id
  - `toggleActive` — PATCH /ingredients/:id/active
  - `adjustStock` — PATCH /ingredients/:id/stock
  - `getAlerts` — GET /alerts
- [ ] Tạo `src/routes/inventory.routes.ts`:
  - Mount tất cả routes tại `/api/v1/inventory`
  - Tất cả dùng `authenticate` + `authorize(Role.OWNER)`
  - Validation middleware cho POST/PUT/PATCH
- [ ] Cập nhật `src/routes/index.ts` — mount inventoryRoutes

**INPUT:** Service layer hoạt động
**OUTPUT:** 7 endpoints inventory hoạt động
**VERIFY:**
- POST /inventory/ingredients → tạo nguyên liệu
- GET /inventory/ingredients → danh sách
- PATCH /inventory/ingredients/:id/stock → cộng stock
- GET /inventory/alerts → danh sách cảnh báo
- CASHIER/BARISTA gọi → 403

---

### Task 6: Recipe Endpoints (Menu Integration)
**Agent:** `backend-specialist` | **Skill:** `api-patterns`, `clean-code`
**Priority:** P1
**Depends:** Task 4

- [ ] Thêm vào `src/controllers/menu.controller.ts`:
  - `getMenuItemIngredients` — GET /items/:id/ingredients
  - `setMenuItemIngredients` — PUT /items/:id/ingredients
  - `getToppingIngredients` — GET /toppings/:id/ingredients
  - `setToppingIngredients` — PUT /toppings/:id/ingredients
- [ ] Cập nhật `src/routes/menu.routes.ts` — thêm 4 recipe routes (OWNER only)

**INPUT:** Inventory service hoạt động
**OUTPUT:** 4 endpoints recipe hoạt động
**VERIFY:**
- PUT /menu/items/1/ingredients body `{"items": [{"ingredientId": 1, "quantityPerUnit": 18}]}` → 200
- GET /menu/items/1/ingredients → trả list nguyên liệu + định lượng
- Tương tự cho toppings

---

### Task 7: Payment Integration (Auto-deduct Stock)
**Agent:** `backend-specialist` | **Skill:** `api-patterns`, `clean-code`
**Priority:** P1 (Critical)
**Depends:** Task 4

- [ ] Cập nhật `src/services/payment.service.ts`:
  - Trong `processPayment()`, sau khi tạo payment thành công:
    - Gọi `inventoryService.deductStockForOrder(data.orderId)`
    - Bọc trong try-catch riêng: nếu trừ kho lỗi → log warning nhưng KHÔNG fail payment
    - (Tại sao: payment là critical, inventory là secondary — không nên block thanh toán vì lỗi kho)

**INPUT:** Payment flow Phase 1 + inventory service
**OUTPUT:** Thanh toán → tự động trừ kho
**VERIFY:**
- Tạo order (1 ly Cà Phê Đen) → thanh toán → check stock ingredient "Cà phê Robusta" giảm đúng quantity
- Tạo order (1 ly + 1 topping) → thanh toán → stock giảm cho cả món + topping
- Món chưa gán recipe → thanh toán vẫn OK (không lỗi)
- Mock lỗi deduct → payment vẫn success (graceful degradation)

---

### Task 8: Seed Data (Ingredients + Recipes)
**Agent:** `backend-specialist` | **Skill:** `database-design`
**Priority:** P2
**Depends:** Task 1

- [ ] Cập nhật `src/database/seed.ts`:
  - Thêm TRUNCATE cho 3 bảng mới (trước FK checks off)
  - Seed nguyên liệu mẫu (~15 items):

| # | Nguyên liệu | Đơn vị | Stock | Threshold |
|---|-------------|--------|-------|-----------|
| 1 | Cà phê Robusta | g | 5000 | 500 |
| 2 | Sữa tươi | ml | 10000 | 1000 |
| 3 | Sữa đặc | ml | 5000 | 500 |
| 4 | Đường | g | 5000 | 500 |
| 5 | Đá viên | unit | 2000 | 200 |
| 6 | Trà đen (lá) | g | 3000 | 300 |
| 7 | Matcha | g | 1000 | 100 |
| 8 | Bột cacao | g | 2000 | 200 |
| 9 | Bơ | g | 3000 | 300 |
| 10 | Kem whipping | ml | 3000 | 300 |
| 11 | Bột trân châu đen | g | 2000 | 200 |
| 12 | Bột trân châu trắng | g | 2000 | 200 |
| 13 | Đường đen | ml | 2000 | 200 |
| 14 | Syrup caramel | ml | 1500 | 150 |
| 15 | Đào (lon) | unit | 50 | 5 |

  - Seed định lượng mẫu (menu_item_ingredients):

| Món | Nguyên liệu | Lượng/ly |
|-----|-------------|----------|
| Cà Phê Đen | Cà phê Robusta 18g, Đá viên 5unit, Đường 10g |
| Cà Phê Sữa | Cà phê Robusta 18g, Sữa đặc 30ml, Đá viên 5unit |
| Bạc Xỉu | Cà phê Robusta 10g, Sữa tươi 100ml, Sữa đặc 20ml, Đá viên 5unit |
| Cappuccino | Cà phê Robusta 18g, Sữa tươi 150ml |
| Latte | Cà phê Robusta 18g, Sữa tươi 200ml |
| Americano | Cà phê Robusta 18g, Đá viên 5unit |
| Trà Sữa Trân Châu | Trà đen 5g, Sữa tươi 100ml, Đường 15g, Đá viên 5unit |
| Trà Đào Cam Sả | Trà đen 5g, Đào 1unit, Đường 10g, Đá viên 5unit |
| Trà Sen Vàng | Trà đen 5g, Đường 15g, Đá viên 5unit |
| Trà Vải | Trà đen 5g, Đường 15g, Đá viên 5unit |
| Freeze Trà Xanh | Matcha 10g, Sữa tươi 100ml, Đá viên 8unit, Kem whipping 30ml |
| Freeze Socola | Bột cacao 20g, Sữa tươi 100ml, Đá viên 8unit, Kem whipping 30ml |
| Sinh Tố Bơ | Bơ 100g, Sữa đặc 30ml, Đá viên 8unit |

  - Seed định lượng topping (topping_ingredients):

| Topping | Nguyên liệu | Lượng/serving |
|---------|-------------|---------------|
| Trân Châu Đen | Bột trân châu đen 30g, Đường đen 10ml |
| Trân Châu Trắng | Bột trân châu trắng 30g, Đường 5g |
| Thạch Cà Phê | Cà phê Robusta 5g, Đường 5g |
| Shot Espresso | Cà phê Robusta 18g |
| Kem Whip | Kem whipping 30ml |
| Sốt Caramel | Syrup caramel 15ml |

**INPUT:** Migration tables + existing seed structure
**OUTPUT:** Seed chạy thành công với đầy đủ nguyên liệu
**VERIFY:** `pnpm run seed` → log "Seed complete", check DB có ingredients + recipes

---

### Task 9: Swagger Documentation
**Agent:** `backend-specialist` | **Skill:** `api-patterns`
**Priority:** P2
**Depends:** Task 5, Task 6

- [ ] Thêm JSDoc `@swagger` comments cho tất cả 11 endpoints mới
- [ ] Thêm Swagger schemas: Ingredient, RecipeItem, AdjustStockRequest, IngredientAlert
- [ ] Verify trên Swagger UI

**INPUT:** Tất cả routes đã hoạt động
**OUTPUT:** Swagger UI hiển thị đầy đủ endpoints Phase 2
**VERIFY:** Truy cập `/api-docs` → 11 endpoints mới hiển thị, có thể "Try it out"

---

## Dependency Graph

```
Task 1 (Migrations) ─────────────────────────────────┐
    │                                                  │
    ▼                                                  ▼
Task 2 (Types + Validations)                    Task 8 (Seed Data)
    │
    ▼
Task 3 (Repository)
    │
    ▼
Task 4 (Service) ─────────────────────────────┐
    │                │                          │
    ▼                ▼                          ▼
Task 5 (Controller   Task 6 (Recipe       Task 7 (Payment
+ Inventory Routes)  Endpoints)           Integration)
    │                │
    ▼                ▼
Task 9 (Swagger) ◄────┘
```

**Parallel opportunities:**
- Task 2 + Task 8 có thể chạy song song (sau Task 1)
- Task 5 + Task 6 + Task 7 có thể chạy song song (sau Task 4)

## Edge Cases

| Case | Xử lý |
|------|-------|
| Món chưa gán recipe → thanh toán | Cho phép, bỏ qua trừ kho (backward compatible) |
| 1 nguyên liệu dùng cho 10 món → hết | Auto-lock tất cả 10 món + topping liên quan |
| Nhập kho → stock > threshold | Auto re-enable CHỈ KHI tất cả nguyên liệu của món đều đủ |
| Đơn có 3 ly cùng 1 món | quantity × quantity_per_unit (nhân đúng) |
| Stock xuống âm | Cho phép — chỉ cảnh báo, không block |
| Xóa nguyên liệu đang dùng | ON DELETE RESTRICT — phải gỡ recipe trước |
| Deduct lỗi khi thanh toán | Catch riêng — payment vẫn success, log warning |
| Ingredient name trùng | Return 409 Conflict |

## Phase X: Verification

### Automated
- [ ] `npx tsc --noEmit` — TypeScript 0 errors
- [ ] Tất cả 38 endpoints test qua Swagger UI

### Manual Test Scenarios
- [ ] **CRUD Ingredient:** OWNER tạo/sửa/xóa nguyên liệu → hoạt động
- [ ] **RBAC:** CASHIER/BARISTA gọi /inventory/* → 403
- [ ] **Recipe:** Gán nguyên liệu cho Cà Phê Đen → GET recipe trả đúng
- [ ] **Deduct flow:** Tạo order 2 ly Cà Phê Đen → thanh toán → stock Robusta giảm 36g (18×2)
- [ ] **Deduct with topping:** Order + Trân Châu Đen → stock bột trân châu giảm 30g
- [ ] **Auto-lock:** Set stock Robusta = 400 (< threshold 500) → tất cả 6 món cà phê bị lock
- [ ] **Auto re-enable:** Nhập kho Robusta +5000 → 6 món cà phê available lại
- [ ] **No recipe → thanh toán OK:** Tạo order món mới (chưa gán recipe) → thanh toán không lỗi
- [ ] **Phase 1 regression:** Tất cả 27 endpoints Phase 1 hoạt động bình thường
- [ ] **Seed:** `pnpm run seed` → tất cả nguyên liệu + recipe được tạo

### Done When
- [ ] 38 endpoints hoạt động (27 Phase 1 + 11 Phase 2)
- [ ] Swagger docs cập nhật tại /api-docs
- [ ] Seed data hoàn chỉnh (có thể demo inventory flow ngay)
- [ ] TypeScript 0 errors
- [ ] Docker build thành công
