# PLAN: Coffee Shop Management Backend

## Overview

Hệ thống quản lý quán cafe backend với Express.js + TypeScript + MySQL.
3 nhóm user: Thu ngân (Cashier), Barista, Chủ quán (Owner).
Triển khai theo 4 phase, plan này tập trung **Phase 1: Core**.

**Project Type:** BACKEND (API only)

## Tech Stack

| Component | Choice | Rationale |
|-----------|--------|-----------|
| Runtime | Node.js + TypeScript | Type-safe, ít runtime bug |
| Framework | Express.js | User yêu cầu |
| Database | MySQL + mysql2 (thuần SQL) | Kiểm soát hoàn toàn query |
| Auth | JWT (Access 15min + Refresh 7d) | Stateless, scalable |
| Validation | Zod | Lightweight, TypeScript-native |
| API Docs | swagger-jsdoc + swagger-ui-express | Auto-gen từ JSDoc comments |
| Security | helmet + cors + express-rate-limit + bcryptjs | OWASP basics |
| Realtime | Polling (client gọi GET mỗi 5-10s) | Đơn giản, đủ dùng |
| Deploy | Localhost (máy tại quán) | Chi phí 0 |

## Decisions (từ brainstorm)

| Decision | Choice |
|----------|--------|
| STT range | 001-999, reset mỗi ngày |
| Login | Username + Password cho tất cả role |
| Thanh toán CK/ví | Ghi nhận thủ công (thu ngân xác nhận) |
| Thông báo khách | Màn hình hiển thị tại quán (public endpoint) |
| Multi-store | Không, 1 quán duy nhất |
| Architecture | Layered (Classic MVC) |
| Đăng ký tài khoản | Chỉ OWNER tạo/cấp quyền, không có self-register |

## Success Criteria

- [ ] Server khởi động thành công trên `localhost:3000`
- [ ] Swagger UI hiển thị tại `/api-docs`
- [ ] Auth flow hoàn chỉnh (login → access token → refresh → logout)
- [ ] RBAC hoạt động (Owner/Cashier/Barista đều bị chặn khi truy cập endpoint không đúng role)
- [ ] Thu ngân tạo được đơn hàng + thanh toán → sinh STT
- [ ] Barista xem được queue + cập nhật trạng thái đơn
- [ ] Màn hình khách hiển thị được danh sách STT sẵn sàng
- [ ] Barista toggle được trạng thái hết món → thu ngân thấy món bị khóa

## File Structure

```
back-end-coffee-shop-reborn/
├── src/
│   ├── app.ts                          # Express app config
│   ├── server.ts                       # Entry point
│   │
│   ├── config/
│   │   ├── database.ts                 # MySQL pool (mysql2)
│   │   ├── env.ts                      # Env validation (Zod)
│   │   └── swagger.ts                  # Swagger config
│   │
│   ├── constants/
│   │   ├── roles.ts                    # Role enum (OWNER, CASHIER, BARISTA)
│   │   ├── order-status.ts             # OrderStatus enum
│   │   └── http-status.ts              # HTTP status codes
│   │
│   ├── types/
│   │   ├── express.d.ts                # Express augmentation (user on Request)
│   │   ├── common.types.ts             # ApiResponse, Pagination
│   │   ├── auth.types.ts               # LoginRequest, TokenPayload...
│   │   ├── user.types.ts               # CreateUserRequest, UpdateUserRequest...
│   │   ├── menu.types.ts               # Category, MenuItem, Topping...
│   │   ├── order.types.ts              # CreateOrderRequest, OrderResponse...
│   │   ├── payment.types.ts            # CreatePaymentRequest, PaymentResponse...
│   │   └── kitchen.types.ts            # QueueItem, KitchenQueueResponse...
│   │
│   ├── validations/
│   │   ├── auth.validation.ts          # Zod schemas: login, refresh
│   │   ├── user.validation.ts          # Zod schemas: create/update user
│   │   ├── menu.validation.ts          # Zod schemas: category, item, topping
│   │   ├── order.validation.ts         # Zod schemas: create order
│   │   └── payment.validation.ts       # Zod schemas: create payment
│   │
│   ├── middleware/
│   │   ├── auth.middleware.ts           # JWT verify
│   │   ├── role.middleware.ts           # RBAC guard
│   │   ├── validate.middleware.ts       # Zod request validation
│   │   └── error-handler.middleware.ts  # Global error handler
│   │
│   ├── utils/
│   │   ├── api-response.ts             # success(), error() helpers
│   │   ├── hash.ts                     # bcrypt helpers
│   │   ├── jwt.ts                      # sign/verify token helpers
│   │   └── async-handler.ts            # Express async wrapper
│   │
│   ├── repositories/                    # Data access layer (SQL queries)
│   │   ├── auth.repository.ts
│   │   ├── user.repository.ts
│   │   ├── menu.repository.ts
│   │   ├── order.repository.ts
│   │   ├── payment.repository.ts
│   │   └── kitchen.repository.ts
│   │
│   ├── services/                        # Business logic layer
│   │   ├── auth.service.ts
│   │   ├── user.service.ts
│   │   ├── menu.service.ts
│   │   ├── order.service.ts
│   │   ├── payment.service.ts
│   │   └── kitchen.service.ts
│   │
│   ├── controllers/                     # Request/response handling
│   │   ├── auth.controller.ts
│   │   ├── user.controller.ts
│   │   ├── menu.controller.ts
│   │   ├── order.controller.ts
│   │   ├── payment.controller.ts
│   │   └── kitchen.controller.ts
│   │
│   ├── routes/                          # Express route definitions
│   │   ├── index.ts                     # Mount all routes
│   │   ├── auth.routes.ts
│   │   ├── user.routes.ts
│   │   ├── menu.routes.ts
│   │   ├── order.routes.ts
│   │   ├── payment.routes.ts
│   │   └── kitchen.routes.ts
│   │
│   └── database/
│       ├── migrations/
│       │   ├── 001_create_users.sql
│       │   ├── 002_create_categories.sql
│       │   ├── 003_create_menu_items.sql
│       │   ├── 004_create_toppings.sql
│       │   ├── 005_create_menu_item_toppings.sql
│       │   ├── 006_create_orders.sql
│       │   ├── 007_create_order_items.sql
│       │   ├── 008_create_order_item_toppings.sql
│       │   └── 009_create_payments.sql
│       ├── seeds/
│       │   └── seed.sql
│       └── migrate.ts
│
├── docs/
│   └── PLAN-coffee-shop-backend.md     # This file
├── .env.example
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

### Layered Architecture Flow

```
Request → Routes → Middleware (auth, validate) → Controllers → Services → Repositories → MySQL
                                                      ↑               ↑            ↑
                                                   types/         types/       SQL queries
                                                validations/    constants/     (mysql2)
```

## Task Breakdown — Phase 1: Core

---

### Task 1: Project Initialization
**Agent:** `backend-specialist` | **Skill:** `nodejs-best-practices`
**Priority:** P0 (Blocker — mọi task khác phụ thuộc)

- [ ] `npm init -y` + install dependencies (express, mysql2, zod, jsonwebtoken, bcryptjs, swagger-jsdoc, swagger-ui-express, cors, helmet, morgan, dotenv, express-rate-limit)
- [ ] Install devDependencies (typescript, tsx, nodemon, @types/*)
- [ ] Tạo `tsconfig.json` (strict mode, ES2022, NodeNext module)
- [ ] Tạo `nodemon.json` (watch `src/`, exec `tsx`)
- [ ] Tạo `.env.example` + `.gitignore`
- [ ] Tạo `src/server.ts` + `src/app.ts` (Express boilerplate với helmet, cors, morgan, rate-limit, json parser)
- [ ] Thêm npm scripts: `dev`, `build`, `start`

**INPUT:** Empty project
**OUTPUT:** Express server chạy được trên port 3000
**VERIFY:** `npm run dev` → terminal hiện `Server running on port 3000`

---

### Task 2: Database Setup + Config
**Agent:** `backend-specialist` | **Skill:** `database-design`
**Priority:** P0 (Blocker)
**Depends:** Task 1

- [ ] Tạo `src/config/env.ts` — validate env vars bằng Zod (DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME, JWT_SECRET, JWT_REFRESH_SECRET, PORT)
- [ ] Tạo `src/config/database.ts` — MySQL connection pool (mysql2/promise)
- [ ] Test kết nối DB khi server start, log thành công/thất bại

**INPUT:** `.env` với MySQL credentials
**OUTPUT:** Pool connection hoạt động
**VERIFY:** Server start → log `Database connected successfully`

---

### Task 3: Shared Infrastructure (Constants, Types, Utils, Middleware)
**Agent:** `backend-specialist` | **Skill:** `api-patterns`
**Priority:** P0 (Blocker)
**Depends:** Task 1

- [ ] Tạo `src/constants/` — roles.ts (OWNER, CASHIER, BARISTA), order-status.ts (PENDING, PREPARING, READY, COMPLETED, CANCELLED), http-status.ts
- [ ] Tạo `src/types/common.types.ts` — ApiResponse<T>, PaginationQuery, PaginatedResult<T>
- [ ] Tạo `src/types/express.d.ts` — augment Request với `user: { id, role }`
- [ ] Tạo `src/utils/api-response.ts` — success(data, meta?), error(code, message, details?)
- [ ] Tạo `src/utils/hash.ts` — hashPassword(), comparePassword()
- [ ] Tạo `src/utils/jwt.ts` — generateAccessToken(), generateRefreshToken(), verifyToken()
- [ ] Tạo `src/utils/async-handler.ts` — wrap async route handlers
- [ ] Tạo `src/middleware/error-handler.middleware.ts` — global error handler (AppError class + catch-all)
- [ ] Tạo `src/middleware/validate.middleware.ts` — validate body/params/query bằng Zod schema

**INPUT:** Constants, types cần thiết
**OUTPUT:** Tất cả shared utilities hoạt động, có type-safety
**VERIFY:** Import từ các layer khác không lỗi TypeScript

---

### Task 4: Database Migrations
**Agent:** `backend-specialist` | **Skill:** `database-design`
**Priority:** P0 (Blocker)
**Depends:** Task 2

- [ ] Tạo `src/database/migrate.ts` — migration runner (đọc .sql files theo thứ tự, tracking bảng `_migrations`)
- [ ] Tạo 9 migration files:
  - `001_create_users.sql` — id, username (UNIQUE), password_hash, full_name, role (ENUM), is_active, refresh_token, created_at, updated_at
  - `002_create_categories.sql` — id, name, description, sort_order, is_active, created_at
  - `003_create_menu_items.sql` — id, category_id (FK), name, description, base_price (DECIMAL 10,2), image_url, is_available, sort_order, created_at, updated_at
  - `004_create_toppings.sql` — id, name, price (DECIMAL 10,2), is_available, created_at
  - `005_create_menu_item_toppings.sql` — id, menu_item_id (FK), topping_id (FK), UNIQUE(menu_item_id, topping_id)
  - `006_create_orders.sql` — id, queue_number (INT), cashier_id (FK), barista_id (FK nullable), status (ENUM), total_amount, notes, created_at, updated_at
  - `007_create_order_items.sql` — id, order_id (FK), menu_item_id (FK), quantity, unit_price, subtotal, notes
  - `008_create_order_item_toppings.sql` — id, order_item_id (FK), topping_id (FK), topping_price
  - `009_create_payments.sql` — id, order_id (FK UNIQUE), amount, method (ENUM: CASH, TRANSFER, E_WALLET), status (ENUM), transaction_ref, paid_at, created_at
- [ ] Tạo `src/database/seeds/seed.sql` — tài khoản OWNER mặc định (admin/admin123) + menu mẫu (3 categories, 10+ items, 5+ toppings)
- [ ] Thêm npm scripts: `migrate`, `seed`

**INPUT:** Schema design từ brainstorm
**OUTPUT:** Tất cả bảng được tạo trong MySQL
**VERIFY:** `npm run migrate` → log "Migration complete", kiểm tra bảng trong MySQL client

---

### Task 5: Auth Layer (Login only — KHÔNG có register)
**Agent:** `backend-specialist` + `security-auditor` | **Skill:** `api-patterns`, `clean-code`
**Priority:** P1
**Depends:** Task 3, Task 4

> ⚠️ **KHÔNG có endpoint đăng ký (register/signup).** Chỉ OWNER mới được tạo tài khoản nhân viên (xem Task 5b).

- [ ] `src/types/auth.types.ts` — LoginRequest, LoginResponse, TokenPayload, RefreshRequest
- [ ] `src/validations/auth.validation.ts` — Zod schemas cho login, refresh
- [ ] `src/repositories/auth.repository.ts` — findByUsername(), updateRefreshToken(), findById()
- [ ] `src/services/auth.service.ts` — login() (verify password → generate tokens → save refresh), refresh() (verify refresh → new access), logout() (clear refresh token), getMe()
- [ ] `src/controllers/auth.controller.ts` — POST /login, POST /refresh, POST /logout, GET /me
- [ ] `src/routes/auth.routes.ts` — mount routes
- [ ] `src/middleware/auth.middleware.ts` — verify JWT từ Authorization header
- [ ] `src/middleware/role.middleware.ts` — authorize(...roles) guard
- [ ] Register routes trong `src/routes/index.ts` tại `/api/v1/auth`

**INPUT:** User bảng với credentials (tài khoản OWNER từ seed)
**OUTPUT:** Auth flow hoàn chỉnh (login only, không register)
**VERIFY:**
- `POST /api/v1/auth/login` với user/pass → 200 + tokens
- `GET /api/v1/auth/me` với valid token → 200 + user info
- `GET /api/v1/auth/me` không có token → 401
- `POST /api/v1/auth/refresh` với refresh token → new access token
- `POST /api/v1/auth/logout` → refresh token bị xóa
- ❌ Không có POST /register endpoint

---

### Task 5b: User Management Layer (OWNER only)
**Agent:** `backend-specialist` | **Skill:** `api-patterns`, `clean-code`
**Priority:** P1
**Depends:** Task 5

> 🔐 **Tất cả endpoints đều yêu cầu role OWNER.** Nhân viên không thể tự tạo hoặc sửa tài khoản.

- [ ] `src/types/user.types.ts` — CreateUserRequest, UpdateUserRequest, UserResponse (không trả password_hash)
- [ ] `src/validations/user.validation.ts` — Zod schemas cho create/update user (validate role phải là CASHIER hoặc BARISTA khi tạo, OWNER không tạo thêm OWNER)
- [ ] `src/repositories/user.repository.ts` — createUser(), getAllUsers(), getUserById(), updateUser(), toggleActive()
- [ ] `src/services/user.service.ts` — createUser() (hash password → insert), updateUser(), deactivateUser() (soft delete bằng is_active=false), resetPassword()
- [ ] `src/controllers/user.controller.ts` — endpoints
- [ ] `src/routes/user.routes.ts` — mount routes, tất cả dùng authorize(Role.OWNER)
- [ ] Register tại `src/routes/index.ts` → `/api/v1/users`

**Endpoints:**
| Method | Path | Mô tả | Role |
|--------|------|-------|------|
| POST | / | Tạo tài khoản nhân viên | OWNER |
| GET | / | Danh sách nhân viên | OWNER |
| GET | /:id | Chi tiết nhân viên | OWNER |
| PUT | /:id | Sửa thông tin (tên, role) | OWNER |
| PATCH | /:id/active | Kích hoạt/vô hiệu hóa tài khoản | OWNER |
| PATCH | /:id/password | Reset mật khẩu nhân viên | OWNER |

**INPUT:** Auth middleware + OWNER role
**OUTPUT:** Full CRUD quản lý tài khoản nhân viên
**VERIFY:**
- OWNER tạo tài khoản CASHIER → nhân viên login thành công
- OWNER tạo tài khoản BARISTA → nhân viên login thành công
- CASHIER/BARISTA gọi POST /users → 403 Forbidden
- OWNER deactivate tài khoản → nhân viên đó không login được nữa
- OWNER reset password → nhân viên login bằng password mới

---

### Task 6: Menu Layer
**Agent:** `backend-specialist` | **Skill:** `api-patterns`, `clean-code`
**Priority:** P1
**Depends:** Task 3, Task 4

- [ ] `src/types/menu.types.ts` — Category, MenuItem, Topping, CreateMenuItemRequest, UpdateMenuItemRequest
- [ ] `src/validations/menu.validation.ts` — Zod schemas cho create/update category, item, topping
- [ ] `src/repositories/menu.repository.ts` — CRUD operations cho categories, menu_items, toppings, menu_item_toppings
- [ ] `src/services/menu.service.ts` — Business logic (toggle availability, get items with toppings, filter by category)
- [ ] `src/controllers/menu.controller.ts` — Tất cả endpoints theo API design
- [ ] `src/routes/menu.routes.ts` — mount routes với auth + role middleware
- [ ] Register tại `src/routes/index.ts` → `/api/v1/menu`

**Endpoints:**
| Method | Path | Role |
|--------|------|------|
| GET | /categories | ALL |
| POST | /categories | OWNER |
| PUT | /categories/:id | OWNER |
| DELETE | /categories/:id | OWNER |
| GET | /items | ALL |
| GET | /items/:id | ALL |
| POST | /items | OWNER |
| PUT | /items/:id | OWNER |
| PATCH | /items/:id/availability | OWNER, BARISTA |
| GET | /toppings | ALL |
| POST | /toppings | OWNER |
| PUT | /toppings/:id | OWNER |

**INPUT:** Menu data
**OUTPUT:** Full CRUD menu hoạt động
**VERIFY:**
- OWNER tạo được category + item + topping
- CASHIER/BARISTA không tạo được (403)
- GET /items trả về danh sách với toppings đi kèm
- BARISTA toggle availability → item.is_available = false

---

### Task 7: Orders Layer
**Agent:** `backend-specialist` | **Skill:** `api-patterns`, `clean-code`
**Priority:** P1
**Depends:** Task 5, Task 6

- [ ] `src/types/order.types.ts` — CreateOrderRequest (items[] with toppings[]), OrderResponse, OrderItemResponse
- [ ] `src/validations/order.validation.ts` — Zod schemas
- [ ] `src/repositories/order.repository.ts` — createOrder() (transaction: insert order + items + item_toppings), getOrders() (with filters), getOrderById() (with items + toppings JOIN), updateStatus(), getNextQueueNumber() (SELECT MAX for today, range 1-999)
- [ ] `src/services/order.service.ts` — createOrder() (validate items available → calculate totals → get queue number → insert), getOrders(), getOrderById(), updateOrderStatus()
- [ ] `src/controllers/order.controller.ts` — endpoints
- [ ] `src/routes/order.routes.ts` — mount routes
- [ ] Register tại `src/routes/index.ts` → `/api/v1/orders`

**Endpoints:**
| Method | Path | Role |
|--------|------|------|
| POST | / | CASHIER |
| GET | / | ALL (filter by status, date) |
| GET | /:id | ALL |
| PATCH | /:id/status | BARISTA |

**Critical:** Queue number dùng `SELECT ... FOR UPDATE` trong transaction để tránh race condition.

**INPUT:** Menu items đã có sẵn
**OUTPUT:** Order creation + STT flow hoạt động
**VERIFY:**
- CASHIER tạo đơn → response có queue_number
- Tạo 2 đơn liên tiếp → STT tăng dần (001, 002)
- Gọi món đã hết (is_available=false) → 400 error
- BARISTA cập nhật status PENDING → PREPARING → READY → COMPLETED

---

### Task 8: Payments Layer
**Agent:** `backend-specialist` | **Skill:** `api-patterns`
**Priority:** P1
**Depends:** Task 7

- [ ] `src/types/payment.types.ts` — CreatePaymentRequest, PaymentResponse
- [ ] `src/validations/payment.validation.ts` — Zod schemas
- [ ] `src/repositories/payment.repository.ts` — createPayment(), getPaymentByOrderId()
- [ ] `src/services/payment.service.ts` — processPayment() (validate order exists + not paid → create payment → update order status nếu cần)
- [ ] `src/controllers/payment.controller.ts` — endpoints
- [ ] `src/routes/payment.routes.ts` — mount routes
- [ ] Register tại `src/routes/index.ts` → `/api/v1/payments`

**Endpoints:**
| Method | Path | Role |
|--------|------|------|
| POST | / | CASHIER |
| GET | /:orderId | CASHIER, OWNER |

**INPUT:** Order đã tạo
**OUTPUT:** Payment ghi nhận thành công
**VERIFY:**
- Thanh toán đơn hàng → payment.status = SUCCESS
- Thanh toán đơn đã thanh toán rồi → 409 Conflict
- GET payment → trả đúng thông tin

---

### Task 9: Kitchen Layer (Barista View)
**Agent:** `backend-specialist` | **Skill:** `api-patterns`
**Priority:** P1
**Depends:** Task 7

- [ ] `src/types/kitchen.types.ts` — QueueItem, KitchenQueueResponse
- [ ] `src/repositories/kitchen.repository.ts` — getActiveQueue() (orders PENDING + PREPARING, order by created_at ASC), getReadyOrders()
- [ ] `src/services/kitchen.service.ts` — getQueue(), markItemUnavailable()
- [ ] `src/controllers/kitchen.controller.ts` — endpoints
- [ ] `src/routes/kitchen.routes.ts` — mount routes
- [ ] Register tại `src/routes/index.ts` → `/api/v1/kitchen`

**Endpoints:**
| Method | Path | Role |
|--------|------|------|
| GET | /queue | BARISTA |
| GET | /display | PUBLIC (no auth) |

`/display` là public endpoint cho màn hình khách — trả danh sách STT có status = READY.

**INPUT:** Orders đã có trong DB
**OUTPUT:** Queue hiển thị đúng thứ tự, display endpoint hoạt động
**VERIFY:**
- GET /queue (BARISTA) → danh sách PENDING + PREPARING, sắp xếp theo thời gian
- GET /display (no auth) → danh sách STT đang READY
- Khi BARISTA đánh dấu READY → xuất hiện trên /display

---

### Task 10: Swagger API Documentation
**Agent:** `backend-specialist` | **Skill:** `api-patterns`
**Priority:** P2
**Depends:** Task 5-9

- [ ] Tạo `src/config/swagger.ts` — swagger-jsdoc config (info, servers, components/securitySchemes)
- [ ] Thêm JSDoc comments (`@swagger`) cho tất cả endpoints
- [ ] Mount swagger-ui-express tại `/api-docs`
- [ ] Định nghĩa shared schemas trong swagger config (ApiResponse, Error, Pagination)

**INPUT:** Tất cả routes đã có
**OUTPUT:** Swagger UI hoạt động tại /api-docs
**VERIFY:** Truy cập `http://localhost:3000/api-docs` → hiển thị đầy đủ endpoints, có thể "Try it out"

---

## Phase 2-4 (Chưa triển khai — chỉ ghi nhận)

### Phase 2: Inventory Management
- [ ] Ingredients CRUD
- [ ] Định lượng nguyên liệu/món (menu_item_ingredients)
- [ ] Tự động trừ kho khi thanh toán thành công
- [ ] Cảnh báo nguyên liệu sắp hết → auto khóa món

### Phase 3: Reports & Analytics
- [ ] Doanh thu theo ngày/tháng/năm
- [ ] Top món bán chạy
- [ ] Báo cáo tồn kho
- [ ] Export CSV

### Phase 4: Staff Management
- [ ] CRUD tài khoản nhân viên
- [ ] Ca làm việc (shifts)
- [ ] Lịch làm việc (schedules)

---

## Phase X: Verification

### Automated
- [ ] `npx tsc --noEmit` — TypeScript type check pass
- [ ] `python .agent/skills/vulnerability-scanner/scripts/security_scan.py .` — No critical issues
- [ ] Tất cả endpoints test qua Swagger UI hoặc curl

### Manual
- [ ] Auth flow: login → use token → refresh → logout
- [ ] Order flow: create order → payment → STT → barista queue → update status → display
- [ ] RBAC: mỗi role chỉ truy cập được endpoint cho phép
- [ ] Toggle availability: barista đánh dấu hết → cashier thấy món bị khóa
- [ ] Edge case: đơn hàng trùng STT, thanh toán đơn đã thanh toán

### Done When
- [ ] Server chạy ổn định trên localhost:3000
- [ ] Swagger docs hoàn chỉnh tại /api-docs
- [ ] Tất cả test scenarios pass
- [ ] Seed data hoạt động (có thể demo ngay)
