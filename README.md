# ☕ Coffee Shop Management System — Backend API

[🇻🇳 Tiếng Việt](./README.vi.md)

A comprehensive RESTful API for managing a coffee shop business, built with **Node.js 22**, **TypeScript 6**, **Express 5**, and **MySQL 8**. Features include order management, inventory tracking with auto-lock, analytics & reporting, and staff shift scheduling — totaling **62 API endpoints**.

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Database](#-database)
- [API Endpoints](#-api-endpoints)
- [Authentication & Authorization](#-authentication--authorization)
- [Key Design Decisions](#-key-design-decisions)
- [Project Structure](#-project-structure)
- [Scripts](#-scripts)
- [API Documentation](#-api-documentation)
- [License](#-license)

---

## ✨ Features

### Phase 1 — Core Operations
- **Authentication** — JWT access/refresh token pair with DB session tracking
- **User Management** — CRUD with role-based access (OWNER, CASHIER, BARISTA)
- **Menu Management** — Categories, items, toppings with many-to-many relationships
- **Order Processing** — State machine (PENDING → PREPARING → READY → COMPLETED)
- **Payments** — Cash, Transfer, E-Wallet with receipt tracking
- **Kitchen Display** — Real-time queue for baristas + public display endpoint

### Phase 2 — Inventory Management
- **Ingredient Tracking** — Stock levels with configurable low-stock thresholds
- **Recipe System** — Ingredient requirements per menu item and topping
- **Auto-Deduct on Payment** — Graceful stock deduction (never blocks payment)
- **Reactive Auto-Lock** — Items auto-disable when any ingredient drops below threshold
- **Smart Re-Enable** — Items re-enable only when ALL ingredients are sufficient

### Phase 3 — Reports & Analytics
- **Dashboard** — Today's revenue, order count, low stock alerts, top sellers
- **Revenue Reports** — Daily/monthly/yearly/custom period breakdowns
- **Performance Metrics** — Top-selling items, category performance, cashier stats
- **Inventory Reports** — Stock status overview, movement history
- **CSV Export** — Download any report as CSV (UTF-8 BOM for Excel)

### Phase 4 — Staff & Shift Management
- **Shift Templates** — Define reusable shift time slots
- **Schedule Assignments** — Single or bulk (Mon-Fri) scheduling
- **Attendance Tracking** — Self check-in/out with auto late detection (15min threshold)
- **OWNER Override** — Override any employee's attendance with audit trail
- **Cross-Midnight Shifts** — Full support for overnight shifts
- **Summary Reports** — Per-employee attendance aggregates

---

## 🛠️ Tech Stack

| Layer          | Technology                                            |
| -------------- | ----------------------------------------------------- |
| **Runtime**    | Node.js 22                                            |
| **Language**   | TypeScript 6 (strict mode)                            |
| **Framework**  | Express 5                                             |
| **Database**   | MySQL 8 (via Docker)                                  |
| **DB Driver**  | mysql2 (connection pool)                              |
| **Validation** | Zod 4                                                 |
| **Auth**       | JWT (jsonwebtoken) + bcryptjs                         |
| **Docs**       | Swagger UI (swagger-jsdoc + swagger-ui-express)       |
| **Security**   | Helmet, CORS, express-rate-limit                      |
| **Logging**    | Morgan                                                |
| **Container**  | Docker + Docker Compose                               |
| **Dev Tools**  | Nodemon, tsx                                          |
| **Package Mgr**| pnpm                                                  |

---

## 🏗️ Architecture

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

**Layered Architecture:** Routes → Middleware → Controllers → Services → Repositories → MySQL

---

## 🚀 Getting Started

### Prerequisites

- [Docker](https://www.docker.com/) & Docker Compose
- [Node.js 22+](https://nodejs.org/) (for local dev)
- [pnpm](https://pnpm.io/) (package manager)

### Quick Start with Docker (Recommended)

```bash
# 1. Clone the repository
git clone https://github.com/Hth4nh/back-end-coffee-shop-reborn.git
cd back-end-coffee-shop-reborn

# 2. Create environment file
cp .env.example .env

# 3. Start all services (MySQL + API)
docker compose up -d

# 4. Run database migrations
pnpm migrate

# 5. Seed sample data
pnpm seed
```

The API will be available at `http://localhost:3000` and Swagger docs at `http://localhost:3000/api-docs`.

### Local Development (Without Docker for API)

```bash
# 1. Start MySQL via Docker
docker compose up -d mysql

# 2. Install dependencies
pnpm install

# 3. Create environment file
cp .env.example .env
# Edit .env → set DB_HOST=localhost

# 4. Run migrations & seed
pnpm migrate
pnpm seed

# 5. Start dev server (hot reload)
pnpm dev
```

### Default Accounts (after seeding)

| Role       | Username   | Password      |
| ---------- | ---------- | ------------- |
| **OWNER**  | admin      | admin123      |
| **CASHIER**| cashier1   | cashier123    |
| **BARISTA**| barista1   | barista123    |

---

## 🔧 Environment Variables

Create a `.env` file from `.env.example`:

```env
# Server
PORT=3000
NODE_ENV=development

# Database (MySQL)
DB_HOST=localhost          # Use 'mysql' when running inside Docker
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

> ⚠️ **Important:** Change `JWT_SECRET` and `JWT_REFRESH_SECRET` to strong random values in production.

---

## 🗃️ Database

### Tables (16 total)

| Table                      | Phase | Description                          |
| -------------------------- | ----- | ------------------------------------ |
| `users`                    | 1     | User accounts with roles & status    |
| `categories`               | 1     | Menu categories                      |
| `menu_items`               | 1     | Menu items with pricing              |
| `toppings`                 | 1     | Available toppings                   |
| `menu_item_toppings`       | 1     | Many-to-many: items ↔ toppings       |
| `orders`                   | 1     | Customer orders with status tracking |
| `order_items`              | 1     | Items within an order                |
| `order_item_toppings`      | 1     | Toppings on order items              |
| `payments`                 | 1     | Payment records                      |
| `ingredients`              | 2     | Inventory ingredients with threshold |
| `menu_item_ingredients`    | 2     | Recipes: item → ingredients          |
| `topping_ingredients`      | 2     | Recipes: topping → ingredients       |
| `inventory_movements`      | 3     | Stock change audit trail             |
| `shifts`                   | 4     | Shift time templates                 |
| `shift_assignments`        | 4     | Employee ↔ shift schedule            |
| `attendance_logs`          | 4     | Check-in/out records                 |

### Migrations

16 SQL migration files in `src/database/migrations/`, tracked via `_migrations` table. Run with:

```bash
pnpm migrate
```

### Seed Data

Includes 3 users, 3 categories, 13 menu items, 6 toppings, 15 ingredients, recipes, and a sample shift. Run with:

```bash
pnpm seed
```

---

## 📡 API Endpoints

All endpoints are prefixed with `/api/v1`.

### Auth (`/auth`) — 4 endpoints

| Method | Endpoint         | Access   | Description              |
| ------ | ---------------- | -------- | ------------------------ |
| POST   | `/auth/login`    | Public   | Login, returns JWT pair  |
| POST   | `/auth/refresh`  | Public   | Refresh access token     |
| POST   | `/auth/logout`   | Auth     | Logout (immediate invalidation) |
| GET    | `/auth/me`       | Auth     | Get current user profile |

### Users (`/users`) — 6 endpoints

| Method | Endpoint               | Access | Description             |
| ------ | ---------------------- | ------ | ----------------------- |
| POST   | `/users`               | OWNER  | Create new user         |
| GET    | `/users`               | OWNER  | List all users          |
| GET    | `/users/:id`           | OWNER  | Get user by ID          |
| PUT    | `/users/:id`           | OWNER  | Update user             |
| PATCH  | `/users/:id/active`    | OWNER  | Toggle active status    |
| PATCH  | `/users/:id/password`  | OWNER  | Reset user password     |

### Menu (`/menu`) — 16 endpoints

| Method | Endpoint                            | Access        | Description                    |
| ------ | ----------------------------------- | ------------- | ------------------------------ |
| GET    | `/menu/categories`                  | Auth          | List categories                |
| POST   | `/menu/categories`                  | OWNER         | Create category                |
| PUT    | `/menu/categories/:id`              | OWNER         | Update category                |
| DELETE | `/menu/categories/:id`              | OWNER         | Delete category                |
| GET    | `/menu/items`                       | Auth          | List menu items                |
| GET    | `/menu/items/:id`                   | Auth          | Get item details               |
| POST   | `/menu/items`                       | OWNER         | Create menu item               |
| PUT    | `/menu/items/:id`                   | OWNER         | Update menu item               |
| PATCH  | `/menu/items/:id/availability`      | OWNER/BARISTA | Toggle item availability       |
| GET    | `/menu/toppings`                    | Auth          | List toppings                  |
| POST   | `/menu/toppings`                    | OWNER         | Create topping                 |
| PUT    | `/menu/toppings/:id`                | OWNER         | Update topping                 |
| GET    | `/menu/items/:id/ingredients`       | OWNER         | Get item recipe                |
| PUT    | `/menu/items/:id/ingredients`       | OWNER         | Set item recipe                |
| GET    | `/menu/toppings/:id/ingredients`    | OWNER         | Get topping recipe             |
| PUT    | `/menu/toppings/:id/ingredients`    | OWNER         | Set topping recipe             |

### Orders (`/orders`) — 4 endpoints

| Method | Endpoint               | Access   | Description               |
| ------ | ---------------------- | -------- | ------------------------- |
| POST   | `/orders`              | CASHIER  | Create new order          |
| GET    | `/orders`              | Auth     | List orders (filtered)    |
| GET    | `/orders/:id`          | Auth     | Get order details         |
| PATCH  | `/orders/:id/status`   | BARISTA  | Update order status       |

### Payments (`/payments`) — 2 endpoints

| Method | Endpoint               | Access        | Description                              |
| ------ | ---------------------- | ------------- | ---------------------------------------- |
| POST   | `/payments`            | CASHIER       | Process payment (triggers stock deduct)  |
| GET    | `/payments/:orderId`   | CASHIER/OWNER | Get payment details                      |

### Kitchen (`/kitchen`) — 2 endpoints

| Method | Endpoint            | Access  | Description               |
| ------ | ------------------- | ------- | ------------------------- |
| GET    | `/kitchen/queue`    | BARISTA | Get kitchen order queue   |
| GET    | `/kitchen/display`  | Public  | Public kitchen display    |

### Inventory (`/inventory`) — 7 endpoints

| Method | Endpoint                         | Access | Description                     |
| ------ | -------------------------------- | ------ | ------------------------------- |
| POST   | `/inventory/ingredients`         | OWNER  | Add new ingredient              |
| GET    | `/inventory/ingredients`         | OWNER  | List all ingredients            |
| GET    | `/inventory/ingredients/:id`     | OWNER  | Get ingredient details          |
| PUT    | `/inventory/ingredients/:id`     | OWNER  | Update ingredient               |
| PATCH  | `/inventory/ingredients/:id/active` | OWNER | Toggle ingredient active     |
| PATCH  | `/inventory/ingredients/:id/stock`  | OWNER | Adjust stock level            |
| GET    | `/inventory/alerts`              | OWNER  | Low-stock warnings              |

### Reports (`/reports`) — 9 endpoints

| Method | Endpoint                       | Access | Description                            |
| ------ | ------------------------------ | ------ | -------------------------------------- |
| GET    | `/reports/dashboard`           | OWNER  | Today's overview dashboard             |
| GET    | `/reports/revenue/summary`     | OWNER  | Revenue by period (daily/monthly/etc.) |
| GET    | `/reports/revenue/by-method`   | OWNER  | Revenue by payment method              |
| GET    | `/reports/top-selling`         | OWNER  | Top-selling items ranked               |
| GET    | `/reports/category-performance`| OWNER  | Revenue per category                   |
| GET    | `/reports/cashier-performance` | OWNER  | Orders & revenue per cashier           |
| GET    | `/reports/inventory/summary`   | OWNER  | Ingredient stock status (OK/LOW/OUT)   |
| GET    | `/reports/inventory/movements` | OWNER  | Stock movement history (paginated)     |
| GET    | `/reports/export`              | OWNER  | CSV export for any report              |

### Shifts (`/shifts`) — 7 endpoints

| Method | Endpoint                    | Access | Description                    |
| ------ | --------------------------- | ------ | ------------------------------ |
| GET    | `/shifts`                   | Auth   | List all shifts                |
| POST   | `/shifts`                   | OWNER  | Create shift template          |
| PUT    | `/shifts/:id`               | OWNER  | Update shift                   |
| PATCH  | `/shifts/:id/active`        | OWNER  | Toggle shift active status     |
| GET    | `/shifts/my-schedule`       | Auth   | Get own schedule (current week)|
| GET    | `/shifts/assignments`       | OWNER  | List all assignments           |
| POST   | `/shifts/assignments`       | OWNER  | Create assignment (single/bulk)|
| PUT    | `/shifts/assignments/:id`   | OWNER  | Update assignment              |
| DELETE | `/shifts/assignments/:id`   | OWNER  | Delete assignment              |

### Attendance (`/attendance`) — 6 endpoints

| Method | Endpoint                  | Access | Description                       |
| ------ | ------------------------- | ------ | --------------------------------- |
| POST   | `/attendance/check-in`    | Auth   | Self check-in                     |
| POST   | `/attendance/check-out`   | Auth   | Self check-out                    |
| GET    | `/attendance/my-history`  | Auth   | Own attendance history            |
| POST   | `/attendance/override`    | OWNER  | Override employee attendance      |
| GET    | `/attendance`             | OWNER  | All attendance logs (paginated)   |
| GET    | `/attendance/summary`     | OWNER  | Per-employee attendance aggregate |

---

## 🔐 Authentication & Authorization

### JWT Token Flow

```
Login → Access Token (15min) + Refresh Token (7d, stored in DB)
                │
                ▼
  Access Token expires → Call /auth/refresh → New Access Token
                │
                ▼
     Logout → DB session cleared → Immediate invalidation
```

- **Access Token**: Short-lived (15min), included in `Authorization: Bearer <token>` header
- **Refresh Token**: Long-lived (7d), stored in database for session tracking
- **Logout**: Immediately clears the refresh token from DB — not relying on JWT expiry

### RBAC (Role-Based Access Control)

| Role        | Permissions                                                    |
| ----------- | -------------------------------------------------------------- |
| **OWNER**   | Full access: users, menu, inventory, reports, shifts, orders   |
| **CASHIER** | Create orders, process payments, view menu                     |
| **BARISTA** | Update order status, toggle item availability, kitchen queue   |

### Rate Limiting

- **Global**: 500 req/15min (dev) · 100 req/15min (prod)
- **Login**: 10 attempts/15min (separate limiter)

---

## 🎯 Key Design Decisions

| Decision | Rationale |
| -------- | --------- |
| **Deduct stock on payment** (not order) | Simpler flow, no rollback needed for cancelled orders |
| **Stock can go negative** | Warning only — never blocks a real-world sale |
| **Reactive auto-lock** (no cron) | Checks on every stock change, zero delay |
| **Smart re-enable** | Only when ALL ingredients are above threshold |
| **Graceful deduction** | Payment always succeeds; stock deduct is try-catch wrapped |
| **DB session check on every request** | Immediate logout, not delayed by JWT expiry |
| **Order status state machine** | PENDING→PREPARING→READY→COMPLETED; cancel from PENDING/PREPARING only |
| **Cross-midnight shifts** | `end_time < start_time` automatically means next day |
| **15min late threshold** | Hardcoded constant for attendance tracking |
| **CSV with UTF-8 BOM** | Excel compatibility for Vietnamese characters |

---

## 📁 Project Structure

```
back-end-coffee-shop-reborn/
├── src/
│   ├── app.ts                  # Express app setup (middleware, routes)
│   ├── server.ts               # Entry point (bootstrap, graceful shutdown)
│   ├── config/
│   │   ├── database.ts         # MySQL connection pool
│   │   ├── env.ts              # Environment variable parsing
│   │   └── swagger.ts          # Swagger/OpenAPI configuration
│   ├── constants/
│   │   ├── roles.ts            # OWNER, CASHIER, BARISTA
│   │   ├── order-status.ts     # PENDING, PREPARING, READY, COMPLETED, CANCELLED
│   │   ├── http-status.ts      # HTTP status code constants
│   │   ├── unit.ts             # g, kg, ml, l, unit, pack, shot, pump, tbsp
│   │   └── attendance-status.ts # ON_TIME, LATE, EARLY_LEAVE, ABSENT
│   ├── controllers/            # Request handling (10 controllers)
│   ├── services/               # Business logic (10 services)
│   ├── repositories/           # Data access layer (10 repositories)
│   ├── middleware/
│   │   ├── auth.middleware.ts   # JWT verification + DB session check
│   │   ├── role.middleware.ts   # Role-based authorization
│   │   ├── validate.middleware.ts # Zod schema validation
│   │   └── error-handler.middleware.ts # Global error handler
│   ├── routes/                 # Route definitions (11 files)
│   ├── database/
│   │   ├── migrate.ts          # Migration runner (tracks _migrations table)
│   │   ├── seed.ts             # Seed runner (parameterized queries)
│   │   └── migrations/        # 16 SQL migration files (001-016)
│   ├── types/                  # TypeScript type definitions
│   ├── utils/
│   │   ├── api-response.ts     # Standardized API response helpers
│   │   ├── hash.ts             # bcrypt password hashing
│   │   ├── jwt.ts              # JWT sign/verify utilities
│   │   └── async-handler.ts    # asyncHandler wrapper (no try-catch)
│   └── validations/            # Zod schemas (8 validation files)
├── tests/
│   ├── api-test.ps1            # PowerShell API test script
│   └── api-test.sh             # Bash API test script
├── docs/                       # Phase planning documents
├── docker-compose.yml          # MySQL + API services
├── Dockerfile                  # Node 22 Alpine + pnpm
├── package.json
├── pnpm-lock.yaml
├── tsconfig.json
└── nodemon.json                # Hot reload configuration
```

---

## 📜 Scripts

| Command          | Description                              |
| ---------------- | ---------------------------------------- |
| `pnpm dev`       | Start dev server with hot reload         |
| `pnpm build`     | Compile TypeScript to `dist/`            |
| `pnpm start`     | Run production build                     |
| `pnpm typecheck` | Run TypeScript compiler (no emit)        |
| `pnpm migrate`   | Run database migrations                  |
| `pnpm seed`      | Seed database with sample data           |

---

## 📖 API Documentation

Interactive Swagger UI is available at:

```
http://localhost:3000/api-docs
```

Raw OpenAPI spec:

```
http://localhost:3000/swagger-spec.json
```

### Health Check

```
GET http://localhost:3000/health
```

Returns API status and database connectivity.

---

## 🐳 Docker

### Full Stack (API + MySQL)

```bash
docker compose up -d
```

| Service           | Container          | Port  |
| ----------------- | ------------------ | ----- |
| MySQL 8           | `coffee-shop-db`   | 3306  |
| Express API       | `coffee-shop-api`  | 3000  |

### Rebuild after code changes

```bash
docker compose up -d --build
```

### Stop all services

```bash
docker compose down
```

> **Note:** MySQL data persists via Docker volume `mysql_data`. To reset, run `docker compose down -v`.

---

## 📄 License

ISC
