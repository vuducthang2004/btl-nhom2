# ☕ Hệ Thống Quản Lý Quán Cà Phê — Backend API

[🇬🇧 English](./README.md)

API RESTful toàn diện cho việc quản lý quán cà phê, được xây dựng với **Node.js 22**, **TypeScript 6**, **Express 5** và **MySQL 8**. Bao gồm quản lý đơn hàng, theo dõi kho nguyên liệu với tự động khoá sản phẩm, báo cáo & phân tích, và quản lý ca làm việc — tổng cộng **62 API endpoint**.

---

## 📋 Mục Lục

- [Tính Năng](#-tính-năng)
- [Công Nghệ Sử Dụng](#-công-nghệ-sử-dụng)
- [Kiến Trúc](#-kiến-trúc)
- [Bắt Đầu](#-bắt-đầu)
- [Biến Môi Trường](#-biến-môi-trường)
- [Cơ Sở Dữ Liệu](#-cơ-sở-dữ-liệu)
- [API Endpoints](#-api-endpoints)
- [Xác Thực & Phân Quyền](#-xác-thực--phân-quyền)
- [Các Quyết Định Thiết Kế](#-các-quyết-định-thiết-kế)
- [Cấu Trúc Dự Án](#-cấu-trúc-dự-án)
- [Lệnh Scripts](#-lệnh-scripts)
- [Tài Liệu API](#-tài-liệu-api)
- [Giấy Phép](#-giấy-phép)

---

## ✨ Tính Năng

### Phase 1 — Vận Hành Cốt Lõi
- **Xác thực** — Cặp JWT access/refresh token với theo dõi phiên trên DB
- **Quản lý nhân viên** — CRUD với phân quyền theo vai trò (OWNER, CASHIER, BARISTA)
- **Quản lý thực đơn** — Danh mục, món, topping với quan hệ nhiều-nhiều
- **Xử lý đơn hàng** — Máy trạng thái (PENDING → PREPARING → READY → COMPLETED)
- **Thanh toán** — Tiền mặt, Chuyển khoản, Ví điện tử
- **Màn hình bếp** — Hàng đợi thời gian thực cho barista + endpoint hiển thị công khai

### Phase 2 — Quản Lý Kho Nguyên Liệu
- **Theo dõi nguyên liệu** — Mức tồn kho với ngưỡng cảnh báo thấp tuỳ chỉnh
- **Hệ thống công thức** — Yêu cầu nguyên liệu cho từng món và topping
- **Tự động trừ kho khi thanh toán** — Trừ kho linh hoạt (không bao giờ chặn thanh toán)
- **Tự động khoá món** — Món tự động bị vô hiệu khi bất kỳ nguyên liệu nào dưới ngưỡng
- **Tự động mở khoá thông minh** — Chỉ mở lại khi TẤT CẢ nguyên liệu đều đủ

### Phase 3 — Báo Cáo & Phân Tích
- **Dashboard** — Doanh thu hôm nay, số đơn, cảnh báo hết hàng, top bán chạy
- **Báo cáo doanh thu** — Theo ngày/tháng/năm/tuỳ chỉnh
- **Chỉ số hiệu suất** — Món bán chạy nhất, hiệu suất danh mục, thống kê thu ngân
- **Báo cáo kho** — Tổng quan tồn kho, lịch sử biến động
- **Xuất CSV** — Tải bất kỳ báo cáo nào dưới dạng CSV (UTF-8 BOM cho Excel)

### Phase 4 — Quản Lý Nhân Sự & Ca Làm
- **Mẫu ca làm** — Định nghĩa các khung giờ ca tái sử dụng
- **Phân công lịch làm** — Phân công đơn lẻ hoặc hàng loạt (Thứ 2 - Thứ 6)
- **Chấm công** — Tự check-in/out với phát hiện đi trễ tự động (ngưỡng 15 phút)
- **OWNER ghi đè** — Ghi đè chấm công của bất kỳ nhân viên nào kèm nhật ký kiểm tra
- **Ca xuyên đêm** — Hỗ trợ đầy đủ ca làm qua nửa đêm
- **Báo cáo tổng hợp** — Thống kê chấm công tổng hợp theo nhân viên

---

## 🛠️ Công Nghệ Sử Dụng

| Tầng             | Công nghệ                                          |
| ---------------- | --------------------------------------------------- |
| **Runtime**      | Node.js 22                                          |
| **Ngôn ngữ**     | TypeScript 6 (strict mode)                          |
| **Framework**    | Express 5                                           |
| **Cơ sở dữ liệu** | MySQL 8 (qua Docker)                              |
| **DB Driver**    | mysql2 (connection pool)                            |
| **Validation**   | Zod 4                                               |
| **Xác thực**     | JWT (jsonwebtoken) + bcryptjs                       |
| **Tài liệu API** | Swagger UI (swagger-jsdoc + swagger-ui-express)    |
| **Bảo mật**      | Helmet, CORS, express-rate-limit                    |
| **Logging**      | Morgan                                              |
| **Container**    | Docker + Docker Compose                             |
| **Dev Tools**    | Nodemon, tsx                                        |
| **Package Mgr**  | pnpm                                                |

---

## 🏗️ Kiến Trúc

```
Client Request
     │
     ▼
┌─────────────────────────────────────────────────┐
│  Express App                                    │
│  ┌───────────┐  ┌────────┐  ┌──────────┐       │
│  │ Middleware │→ │ Routes │→ │ Validate │       │
│  │ (helmet,  │  │        │  │ (Zod)    │       │
│  │  cors,    │  │        │  │          │       │
│  │  rate-    │  │        │  │          │       │
│  │  limit)   │  │        │  │          │       │
│  └───────────┘  └────────┘  └──────────┘       │
│                      │                          │
│                      ▼                          │
│              ┌──────────────┐                   │
│              │  Controllers │                   │
│              └──────┬───────┘                   │
│                     │                           │
│                     ▼                           │
│              ┌──────────────┐                   │
│              │   Services   │  (Business Logic) │
│              └──────┬───────┘                   │
│                     │                           │
│                     ▼                           │
│              ┌──────────────┐                   │
│              │ Repositories │  (Data Access)    │
│              └──────┬───────┘                   │
│                     │                           │
└─────────────────────┼───────────────────────────┘
                      │
                      ▼
               ┌────────────┐
               │  MySQL 8   │
               │  (Docker)  │
               └────────────┘
```

**Kiến trúc phân tầng:** Routes → Middleware → Controllers → Services → Repositories → MySQL

---

## 🚀 Bắt Đầu

### Yêu Cầu

- [Docker](https://www.docker.com/) & Docker Compose
- [Node.js 22+](https://nodejs.org/) (cho phát triển local)
- [pnpm](https://pnpm.io/) (trình quản lý gói)

### Khởi Chạy Nhanh với Docker (Khuyến Nghị)

```bash
# 1. Clone repository
git clone https://github.com/Hth4nh/back-end-coffee-shop-reborn.git
cd back-end-coffee-shop-reborn

# 2. Tạo file cấu hình môi trường
cp .env.example .env

# 3. Khởi chạy tất cả dịch vụ (MySQL + API)
docker compose up -d

# 4. Chạy migration cơ sở dữ liệu
pnpm migrate

# 5. Nạp dữ liệu mẫu
pnpm seed
```

API sẽ hoạt động tại `http://localhost:3000` và Swagger docs tại `http://localhost:3000/api-docs`.

### Phát Triển Local (Không dùng Docker cho API)

```bash
# 1. Chỉ khởi chạy MySQL qua Docker
docker compose up -d mysql

# 2. Cài đặt dependencies
pnpm install

# 3. Tạo file cấu hình môi trường
cp .env.example .env
# Chỉnh .env → đặt DB_HOST=localhost

# 4. Chạy migration & seed
pnpm migrate
pnpm seed

# 5. Khởi chạy dev server (hot reload)
pnpm dev
```

### Tài Khoản Mặc Định (sau khi seed)

| Vai trò    | Tên đăng nhập | Mật khẩu     |
| ---------- | -------------- | ------------- |
| **OWNER**  | admin          | admin123      |
| **CASHIER**| cashier1       | cashier123    |
| **BARISTA**| barista1       | barista123    |

---

## 🔧 Biến Môi Trường

Tạo file `.env` từ `.env.example`:

```env
# Server
PORT=3000
NODE_ENV=development

# Cơ sở dữ liệu (MySQL)
DB_HOST=localhost          # Dùng 'mysql' khi chạy trong Docker
DB_PORT=3306
DB_USER=coffee_user
DB_PASSWORD=coffee_pass
DB_NAME=coffee_shop
DB_ROOT_PASSWORD=root123

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-in-production
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d
```

> ⚠️ **Quan trọng:** Thay đổi `JWT_SECRET` và `JWT_REFRESH_SECRET` thành giá trị ngẫu nhiên mạnh khi triển khai production.

---

## 🗃️ Cơ Sở Dữ Liệu

### Bảng (16 bảng)

| Bảng                       | Phase | Mô tả                                |
| -------------------------- | ----- | ------------------------------------- |
| `users`                    | 1     | Tài khoản người dùng với vai trò      |
| `categories`               | 1     | Danh mục thực đơn                     |
| `menu_items`               | 1     | Các món trong thực đơn                |
| `toppings`                 | 1     | Các topping                           |
| `menu_item_toppings`       | 1     | Nhiều-nhiều: món ↔ topping            |
| `orders`                   | 1     | Đơn hàng với theo dõi trạng thái      |
| `order_items`              | 1     | Các món trong đơn hàng                |
| `order_item_toppings`      | 1     | Topping của món trong đơn             |
| `payments`                 | 1     | Bản ghi thanh toán                    |
| `ingredients`              | 2     | Nguyên liệu kho với ngưỡng cảnh báo  |
| `menu_item_ingredients`    | 2     | Công thức: món → nguyên liệu         |
| `topping_ingredients`      | 2     | Công thức: topping → nguyên liệu     |
| `inventory_movements`      | 3     | Nhật ký biến động kho                 |
| `shifts`                   | 4     | Mẫu ca làm việc                      |
| `shift_assignments`        | 4     | Phân công ca: nhân viên ↔ ca          |
| `attendance_logs`          | 4     | Bản ghi chấm công                    |

### Migration

16 file SQL migration trong `src/database/migrations/`, theo dõi qua bảng `_migrations`. Chạy bằng:

```bash
pnpm migrate
```

### Dữ Liệu Mẫu

Bao gồm 3 tài khoản, 3 danh mục, 13 món, 6 topping, 15 nguyên liệu, công thức và 1 ca làm mẫu. Chạy bằng:

```bash
pnpm seed
```

---

## 📡 API Endpoints

Tất cả endpoint đều có tiền tố `/api/v1`.

### Xác thực (`/auth`) — 4 endpoint

| Phương thức | Endpoint         | Quyền    | Mô tả                           |
| ----------- | ---------------- | -------- | -------------------------------- |
| POST        | `/auth/login`    | Công khai| Đăng nhập, trả về cặp JWT       |
| POST        | `/auth/refresh`  | Công khai| Làm mới access token             |
| POST        | `/auth/logout`   | Đã xác thực | Đăng xuất (huỷ phiên ngay lập tức) |
| GET         | `/auth/me`       | Đã xác thực | Lấy thông tin người dùng hiện tại |

### Người dùng (`/users`) — 6 endpoint

| Phương thức | Endpoint               | Quyền | Mô tả                    |
| ----------- | ---------------------- | ----- | ------------------------- |
| POST        | `/users`               | OWNER | Tạo người dùng mới       |
| GET         | `/users`               | OWNER | Danh sách người dùng     |
| GET         | `/users/:id`           | OWNER | Chi tiết người dùng      |
| PUT         | `/users/:id`           | OWNER | Cập nhật người dùng      |
| PATCH       | `/users/:id/active`    | OWNER | Bật/tắt trạng thái       |
| PATCH       | `/users/:id/password`  | OWNER | Đặt lại mật khẩu         |

### Thực đơn (`/menu`) — 16 endpoint

| Phương thức | Endpoint                            | Quyền         | Mô tả                         |
| ----------- | ----------------------------------- | ------------- | ------------------------------ |
| GET         | `/menu/categories`                  | Đã xác thực   | Danh sách danh mục             |
| POST        | `/menu/categories`                  | OWNER         | Tạo danh mục                   |
| PUT         | `/menu/categories/:id`              | OWNER         | Cập nhật danh mục              |
| DELETE      | `/menu/categories/:id`              | OWNER         | Xoá danh mục                   |
| GET         | `/menu/items`                       | Đã xác thực   | Danh sách món                  |
| GET         | `/menu/items/:id`                   | Đã xác thực   | Chi tiết món                   |
| POST        | `/menu/items`                       | OWNER         | Tạo món mới                    |
| PUT         | `/menu/items/:id`                   | OWNER         | Cập nhật món                   |
| PATCH       | `/menu/items/:id/availability`      | OWNER/BARISTA | Bật/tắt tình trạng còn hàng   |
| GET         | `/menu/toppings`                    | Đã xác thực   | Danh sách topping              |
| POST        | `/menu/toppings`                    | OWNER         | Tạo topping                    |
| PUT         | `/menu/toppings/:id`                | OWNER         | Cập nhật topping               |
| GET         | `/menu/items/:id/ingredients`       | OWNER         | Xem công thức món              |
| PUT         | `/menu/items/:id/ingredients`       | OWNER         | Cập nhật công thức món         |
| GET         | `/menu/toppings/:id/ingredients`    | OWNER         | Xem công thức topping          |
| PUT         | `/menu/toppings/:id/ingredients`    | OWNER         | Cập nhật công thức topping     |

### Đơn hàng (`/orders`) — 4 endpoint

| Phương thức | Endpoint               | Quyền   | Mô tả                     |
| ----------- | ---------------------- | ------- | -------------------------- |
| POST        | `/orders`              | CASHIER | Tạo đơn hàng mới          |
| GET         | `/orders`              | Đã xác thực | Danh sách đơn hàng (lọc) |
| GET         | `/orders/:id`          | Đã xác thực | Chi tiết đơn hàng        |
| PATCH       | `/orders/:id/status`   | BARISTA | Cập nhật trạng thái đơn   |

### Thanh toán (`/payments`) — 2 endpoint

| Phương thức | Endpoint               | Quyền         | Mô tả                                   |
| ----------- | ---------------------- | ------------- | ---------------------------------------- |
| POST        | `/payments`            | CASHIER       | Xử lý thanh toán (kích hoạt trừ kho)    |
| GET         | `/payments/:orderId`   | CASHIER/OWNER | Xem chi tiết thanh toán                  |

### Bếp (`/kitchen`) — 2 endpoint

| Phương thức | Endpoint            | Quyền    | Mô tả                      |
| ----------- | ------------------- | -------- | --------------------------- |
| GET         | `/kitchen/queue`    | BARISTA  | Hàng đợi đơn trong bếp     |
| GET         | `/kitchen/display`  | Công khai| Màn hình hiển thị bếp      |

### Kho nguyên liệu (`/inventory`) — 7 endpoint

| Phương thức | Endpoint                            | Quyền | Mô tả                       |
| ----------- | ----------------------------------- | ----- | ---------------------------- |
| POST        | `/inventory/ingredients`            | OWNER | Thêm nguyên liệu mới        |
| GET         | `/inventory/ingredients`            | OWNER | Danh sách nguyên liệu       |
| GET         | `/inventory/ingredients/:id`        | OWNER | Chi tiết nguyên liệu        |
| PUT         | `/inventory/ingredients/:id`        | OWNER | Cập nhật nguyên liệu        |
| PATCH       | `/inventory/ingredients/:id/active` | OWNER | Bật/tắt nguyên liệu         |
| PATCH       | `/inventory/ingredients/:id/stock`  | OWNER | Điều chỉnh tồn kho          |
| GET         | `/inventory/alerts`                 | OWNER | Cảnh báo sắp hết hàng       |

### Báo cáo (`/reports`) — 9 endpoint

| Phương thức | Endpoint                         | Quyền | Mô tả                                  |
| ----------- | -------------------------------- | ----- | --------------------------------------- |
| GET         | `/reports/dashboard`             | OWNER | Tổng quan hôm nay                      |
| GET         | `/reports/revenue/summary`       | OWNER | Doanh thu theo kỳ (ngày/tháng/năm)     |
| GET         | `/reports/revenue/by-method`     | OWNER | Doanh thu theo phương thức thanh toán   |
| GET         | `/reports/top-selling`           | OWNER | Xếp hạng món bán chạy                  |
| GET         | `/reports/category-performance`  | OWNER | Doanh thu theo danh mục                |
| GET         | `/reports/cashier-performance`   | OWNER | Đơn & doanh thu theo thu ngân          |
| GET         | `/reports/inventory/summary`     | OWNER | Trạng thái tồn kho (OK/LOW/OUT)        |
| GET         | `/reports/inventory/movements`   | OWNER | Lịch sử biến động kho (phân trang)     |
| GET         | `/reports/export`                | OWNER | Xuất CSV cho bất kỳ báo cáo nào        |

### Ca làm việc (`/shifts`) — 7 endpoint

| Phương thức | Endpoint                    | Quyền       | Mô tả                         |
| ----------- | --------------------------- | ----------- | ------------------------------ |
| GET         | `/shifts`                   | Đã xác thực | Danh sách ca làm               |
| POST        | `/shifts`                   | OWNER       | Tạo mẫu ca làm                |
| PUT         | `/shifts/:id`               | OWNER       | Cập nhật ca                    |
| PATCH       | `/shifts/:id/active`        | OWNER       | Bật/tắt ca làm                |
| GET         | `/shifts/my-schedule`       | Đã xác thực | Xem lịch làm của mình         |
| GET         | `/shifts/assignments`       | OWNER       | Danh sách phân công            |
| POST        | `/shifts/assignments`       | OWNER       | Tạo phân công (đơn/hàng loạt) |
| PUT         | `/shifts/assignments/:id`   | OWNER       | Cập nhật phân công             |
| DELETE      | `/shifts/assignments/:id`   | OWNER       | Xoá phân công                  |

### Chấm công (`/attendance`) — 6 endpoint

| Phương thức | Endpoint                  | Quyền       | Mô tả                            |
| ----------- | ------------------------- | ----------- | --------------------------------- |
| POST        | `/attendance/check-in`    | Đã xác thực | Tự check-in                       |
| POST        | `/attendance/check-out`   | Đã xác thực | Tự check-out                      |
| GET         | `/attendance/my-history`  | Đã xác thực | Lịch sử chấm công của mình       |
| POST        | `/attendance/override`    | OWNER       | Ghi đè chấm công nhân viên       |
| GET         | `/attendance`             | OWNER       | Tất cả bản ghi chấm công         |
| GET         | `/attendance/summary`     | OWNER       | Tổng hợp chấm công theo nhân viên|

---

## 🔐 Xác Thực & Phân Quyền

### Luồng JWT Token

```
Đăng nhập → Access Token (15 phút) + Refresh Token (7 ngày, lưu trong DB)
                │
                ▼
  Access Token hết hạn → Gọi /auth/refresh → Access Token mới
                │
                ▼
     Đăng xuất → Xoá phiên trong DB → Huỷ hiệu lực ngay lập tức
```

- **Access Token**: Sống ngắn (15 phút), gửi kèm header `Authorization: Bearer <token>`
- **Refresh Token**: Sống dài (7 ngày), lưu trong database để theo dõi phiên
- **Đăng xuất**: Xoá refresh token khỏi DB ngay lập tức — không phụ thuộc vào thời hạn JWT

### RBAC (Phân Quyền Theo Vai Trò)

| Vai trò     | Quyền hạn                                                       |
| ----------- | ---------------------------------------------------------------- |
| **OWNER**   | Toàn quyền: nhân viên, thực đơn, kho, báo cáo, ca làm, đơn hàng |
| **CASHIER** | Tạo đơn hàng, thanh toán, xem thực đơn                          |
| **BARISTA** | Cập nhật trạng thái đơn, bật/tắt món, hàng đợi bếp             |

### Giới Hạn Tốc Độ (Rate Limiting)

- **Toàn cục**: 500 req/15 phút (dev) · 100 req/15 phút (prod)
- **Đăng nhập**: 10 lần thử/15 phút (limiter riêng)

---

## 🎯 Các Quyết Định Thiết Kế

| Quyết định | Lý do |
| ---------- | ----- |
| **Trừ kho khi thanh toán** (không phải khi tạo đơn) | Luồng đơn giản hơn, không cần rollback khi huỷ đơn |
| **Tồn kho có thể âm** | Chỉ cảnh báo — không bao giờ chặn giao dịch bán hàng thực tế |
| **Tự động khoá phản ứng** (không dùng cron) | Kiểm tra mỗi lần thay đổi tồn kho, không có độ trễ |
| **Mở khoá thông minh** | Chỉ khi TẤT CẢ nguyên liệu đều trên ngưỡng |
| **Trừ kho linh hoạt** | Thanh toán luôn thành công; trừ kho được bọc try-catch |
| **Kiểm tra phiên DB mỗi request** | Đăng xuất ngay lập tức, không bị trễ bởi thời hạn JWT |
| **Máy trạng thái đơn hàng** | PENDING→PREPARING→READY→COMPLETED; chỉ huỷ từ PENDING/PREPARING |
| **Ca xuyên đêm** | `end_time < start_time` tự động hiểu là ngày hôm sau |
| **Ngưỡng đi trễ 15 phút** | Hằng số cố định cho theo dõi chấm công |
| **CSV với UTF-8 BOM** | Tương thích Excel cho ký tự tiếng Việt |

---

## 📁 Cấu Trúc Dự Án

```
back-end-coffee-shop-reborn/
├── src/
│   ├── app.ts                  # Thiết lập Express (middleware, routes)
│   ├── server.ts               # Điểm khởi chạy (bootstrap, graceful shutdown)
│   ├── config/
│   │   ├── database.ts         # MySQL connection pool
│   │   ├── env.ts              # Phân tích biến môi trường
│   │   └── swagger.ts          # Cấu hình Swagger/OpenAPI
│   ├── constants/
│   │   ├── roles.ts            # OWNER, CASHIER, BARISTA
│   │   ├── order-status.ts     # PENDING, PREPARING, READY, COMPLETED, CANCELLED
│   │   ├── http-status.ts      # Hằng số mã HTTP status
│   │   ├── unit.ts             # g, kg, ml, l, unit, pack, shot, pump, tbsp
│   │   └── attendance-status.ts # ON_TIME, LATE, EARLY_LEAVE, ABSENT
│   ├── controllers/            # Xử lý request (10 controller)
│   ├── services/               # Logic nghiệp vụ (10 service)
│   ├── repositories/           # Tầng truy cập dữ liệu (10 repository)
│   ├── middleware/
│   │   ├── auth.middleware.ts   # Xác thực JWT + kiểm tra phiên DB
│   │   ├── role.middleware.ts   # Phân quyền theo vai trò
│   │   ├── validate.middleware.ts # Validation schema Zod
│   │   └── error-handler.middleware.ts # Xử lý lỗi toàn cục
│   ├── routes/                 # Định nghĩa route (11 file)
│   ├── database/
│   │   ├── migrate.ts          # Chạy migration (theo dõi bảng _migrations)
│   │   ├── seed.ts             # Chạy seed (parameterized queries)
│   │   └── migrations/        # 16 file SQL migration (001-016)
│   ├── types/                  # Định nghĩa kiểu TypeScript
│   ├── utils/
│   │   ├── api-response.ts     # Helper phản hồi API chuẩn hoá
│   │   ├── hash.ts             # Băm mật khẩu bcrypt
│   │   ├── jwt.ts              # Tiện ích JWT sign/verify
│   │   └── async-handler.ts    # asyncHandler wrapper (không cần try-catch)
│   └── validations/            # Schema Zod (8 file validation)
├── tests/
│   ├── api-test.ps1            # Script test API PowerShell
│   └── api-test.sh             # Script test API Bash
├── docs/                       # Tài liệu kế hoạch từng phase
├── docker-compose.yml          # Dịch vụ MySQL + API
├── Dockerfile                  # Node 22 Alpine + pnpm
├── package.json
├── pnpm-lock.yaml
├── tsconfig.json
└── nodemon.json                # Cấu hình hot reload
```

---

## 📜 Lệnh Scripts

| Lệnh             | Mô tả                                     |
| ----------------- | ------------------------------------------ |
| `pnpm dev`        | Khởi chạy dev server với hot reload        |
| `pnpm build`      | Biên dịch TypeScript sang `dist/`          |
| `pnpm start`      | Chạy bản build production                  |
| `pnpm typecheck`  | Kiểm tra lỗi TypeScript (không build)      |
| `pnpm migrate`    | Chạy migration cơ sở dữ liệu              |
| `pnpm seed`       | Nạp dữ liệu mẫu vào database              |

---

## 📖 Tài Liệu API

Swagger UI tương tác có tại:

```
http://localhost:3000/api-docs
```

OpenAPI spec dạng JSON:

```
http://localhost:3000/swagger-spec.json
```

### Kiểm Tra Sức Khoẻ (Health Check)

```
GET http://localhost:3000/health
```

Trả về trạng thái API và kết nối database.

---

## 🐳 Docker

### Toàn Bộ Hệ Thống (API + MySQL)

```bash
docker compose up -d
```

| Dịch vụ           | Container          | Cổng  |
| ------------------ | ------------------ | ----- |
| MySQL 8            | `coffee-shop-db`   | 3306  |
| Express API        | `coffee-shop-api`  | 3000  |

### Build lại sau khi thay đổi code

```bash
docker compose up -d --build
```

### Dừng tất cả dịch vụ

```bash
docker compose down
```

> **Lưu ý:** Dữ liệu MySQL được lưu trữ bền vững qua Docker volume `mysql_data`. Để reset hoàn toàn, chạy `docker compose down -v`.

---

## 📄 Giấy Phép

ISC
