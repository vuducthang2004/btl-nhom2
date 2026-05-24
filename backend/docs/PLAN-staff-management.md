# PLAN: Phase 4 — Staff & Shift Management

## Overview

Mở rộng Coffee Shop Backend với hệ thống quản lý ca làm việc & chấm công.
Approach: **Shift Templates + Schedule Assignments + Attendance Tracking**
Tổng cộng **15 endpoints mới**, mount tại `/api/v1/shifts` và `/api/v1/attendance`.

**Project Type:** BACKEND (API only)
**Phase:** 4 of 4 (Final)
**Depends on:** Phase 1 (27 ✅) + Phase 2 (11 ✅) + Phase 3 (9 ✅) = 47 endpoints hiện tại

## Decisions (từ brainstorm Phase 4)

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Scope | Option B: Shift + Attendance | Đủ chức năng thực tế, không overkill |
| Check-in/out | Cả hai: nhân viên tự + OWNER override | Linh hoạt |
| Bulk assignment | Có — gán ca cho cả tuần | Tiện cho OWNER |
| LATE threshold | 15 phút hardcode | Đơn giản, đủ dùng |
| Nhân viên xem attendance | Có — xem lịch sử của mình | Minh bạch |
| Payroll | Không — ngoài scope | Có thể thêm Phase 5 nếu cần |

## Success Criteria

- [ ] 3 migrations mới (shifts, shift_assignments, attendance_logs) chạy thành công
- [ ] 15 endpoints mới hoạt động (tổng 62 endpoints)
- [ ] OWNER tạo được ca mẫu (sáng, chiều, tối)
- [ ] OWNER gán ca bulk (T2-T6) hoạt động
- [ ] Nhân viên check-in/out qua API
- [ ] OWNER override check-in/out cho nhân viên
- [ ] Auto-detect LATE (>15 phút sau giờ ca)
- [ ] Nhân viên xem được lịch ca + lịch sử chấm công của mình
- [ ] OWNER xem attendance summary (report giờ công)
- [ ] RBAC hoạt động đúng (OWNER quản trị, nhân viên xem của mình)
- [ ] Backward compatible: 47 endpoints Phase 1-3 hoạt động y nguyên
- [ ] TypeScript 0 errors
- [ ] Swagger docs đầy đủ

## New Endpoints (Phase 4)

### Shifts — `/api/v1/shifts` (Mixed roles)

| # | Method | Path | Mô tả | Role |
|---|--------|------|--------|------|
| 1 | POST | `/` | Tạo ca mẫu | OWNER |
| 2 | GET | `/` | Danh sách ca mẫu | AUTH |
| 3 | PUT | `/:id` | Sửa ca mẫu | OWNER |
| 4 | PATCH | `/:id/active` | Bật/tắt ca | OWNER |
| 5 | POST | `/assignments` | Gán ca (single hoặc bulk) | OWNER |
| 6 | GET | `/assignments` | Xem lịch phân ca (filter) | OWNER |
| 7 | PUT | `/assignments/:id` | Sửa phân ca | OWNER |
| 8 | DELETE | `/assignments/:id` | Xóa phân ca | OWNER |
| 9 | GET | `/my-schedule` | Nhân viên xem lịch của mình | AUTH |

### Attendance — `/api/v1/attendance` (Mixed roles)

| # | Method | Path | Mô tả | Role |
|---|--------|------|--------|------|
| 10 | POST | `/check-in` | Nhân viên check-in | AUTH (self) |
| 11 | POST | `/check-out` | Nhân viên check-out | AUTH (self) |
| 12 | POST | `/override` | OWNER override check-in/out | OWNER |
| 13 | GET | `/` | Danh sách chấm công (filter) | OWNER |
| 14 | GET | `/my-history` | Nhân viên xem lịch sử chấm công | AUTH (self) |
| 15 | GET | `/summary` | Báo cáo giờ công tổng hợp | OWNER |

**Tổng: 15 endpoints mới** → Phase 4 hoàn thành sẽ có **62 endpoints**

## Database Schema (3 New Tables)

### Migration 014: `shifts` (Ca mẫu)
```sql
CREATE TABLE IF NOT EXISTS shifts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_shifts_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**Seed data:**
| name | start_time | end_time |
|------|------------|----------|
| Ca sáng | 07:00 | 14:00 |
| Ca chiều | 14:00 | 21:00 |
| Ca tối | 21:00 | 02:00 |

### Migration 015: `shift_assignments` (Phân ca theo ngày)
```sql
CREATE TABLE IF NOT EXISTS shift_assignments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  shift_id INT NOT NULL,
  user_id INT NOT NULL,
  work_date DATE NOT NULL,
  notes VARCHAR(255) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_assignment (shift_id, user_id, work_date),
  FOREIGN KEY (shift_id) REFERENCES shifts(id) ON DELETE RESTRICT,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT,
  INDEX idx_assignment_date (work_date),
  INDEX idx_assignment_user_date (user_id, work_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### Migration 016: `attendance_logs` (Chấm công)
```sql
CREATE TABLE IF NOT EXISTS attendance_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  assignment_id INT NOT NULL,
  user_id INT NOT NULL,
  check_in_at DATETIME NULL,
  check_out_at DATETIME NULL,
  status ENUM('ON_TIME', 'LATE', 'EARLY_LEAVE', 'ABSENT') NOT NULL DEFAULT 'ON_TIME',
  actual_hours DECIMAL(4,2) NULL,
  notes VARCHAR(255) NULL,
  created_by INT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_attendance_assignment (assignment_id),
  FOREIGN KEY (assignment_id) REFERENCES shift_assignments(id) ON DELETE RESTRICT,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_attendance_user_date (user_id, check_in_at),
  INDEX idx_attendance_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**Key design:**
- `assignment_id` UNIQUE → 1 attendance record per assignment (1:1)
- `created_by` → NULL nếu nhân viên tự check-in, = OWNER ID nếu override
- `status` auto-compute: check_in_at > shift.start_time + 15min → LATE
- `actual_hours` = diff(check_out_at, check_in_at) in hours, computed on check-out

## New Constants

### `src/constants/attendance-status.ts`
```typescript
export const AttendanceStatus = {
  ON_TIME: 'ON_TIME',
  LATE: 'LATE',
  EARLY_LEAVE: 'EARLY_LEAVE',
  ABSENT: 'ABSENT',
} as const;

export type AttendanceStatus = typeof AttendanceStatus[keyof typeof AttendanceStatus];
export const ATTENDANCE_STATUS_VALUES = Object.values(AttendanceStatus);
```

### LATE Logic (hardcode 15 phút)
```
const LATE_THRESHOLD_MINUTES = 15;

if (check_in_at > shift.start_time + 15 minutes) → status = LATE
if (check_out_at < shift.end_time - 15 minutes && check_out_at !== null) → update status = EARLY_LEAVE
```

## File Structure (New + Modified)

```
src/
├── constants/
│   └── attendance-status.ts                [NEW] AttendanceStatus enum
├── types/
│   └── shift.types.ts                      [NEW] Shift, Assignment, Attendance types
├── validations/
│   └── shift.validation.ts                 [NEW] Zod schemas
├── repositories/
│   ├── shift.repository.ts                 [NEW] Shifts + assignments CRUD
│   └── attendance.repository.ts            [NEW] Attendance logs
├── services/
│   ├── shift.service.ts                    [NEW] Shift + schedule business logic
│   └── attendance.service.ts               [NEW] Check-in/out + status compute
├── controllers/
│   ├── shift.controller.ts                 [NEW] Shift request handlers
│   └── attendance.controller.ts            [NEW] Attendance request handlers
├── routes/
│   ├── shift.routes.ts                     [NEW] Shift route definitions
│   ├── attendance.routes.ts                [NEW] Attendance route definitions
│   └── index.ts                            [MOD] Mount shift + attendance routes
├── database/
│   ├── migrations/
│   │   ├── 014_create_shifts.sql           [NEW]
│   │   ├── 015_create_shift_assignments.sql [NEW]
│   │   └── 016_create_attendance_logs.sql  [NEW]
│   └── seed.ts                             [MOD] Seed 3 default shifts + sample assignments
```

## Task Breakdown — Phase 4: Staff & Shift Management

---

### Task 1: Database Migrations (3 tables)
**Agent:** `backend-specialist` | **Skill:** `database-design`
**Priority:** P0 (Blocker — tất cả task khác phụ thuộc)

- [ ] Tạo `src/database/migrations/014_create_shifts.sql`
  - Bảng `shifts` với schema như trên
  - Index: `idx_shifts_active`
- [ ] Tạo `src/database/migrations/015_create_shift_assignments.sql`
  - Bảng `shift_assignments` với schema như trên
  - Unique: `uk_assignment (shift_id, user_id, work_date)`
  - Indexes: `idx_assignment_date`, `idx_assignment_user_date`
- [ ] Tạo `src/database/migrations/016_create_attendance_logs.sql`
  - Bảng `attendance_logs` với schema như trên
  - Unique: `uk_attendance_assignment`
  - Indexes: `idx_attendance_user_date`, `idx_attendance_status`

**INPUT:** 13 migrations hiện tại
**OUTPUT:** 3 bảng mới tồn tại trong MySQL
**VERIFY:** `pnpm run migrate` → log "Migration complete", kiểm tra 3 bảng tồn tại

---

### Task 2: Constants + Types + Validations
**Agent:** `backend-specialist` | **Skill:** `api-patterns`, `clean-code`
**Priority:** P0 (Blocker)
**Depends:** Task 1

- [ ] Tạo `src/constants/attendance-status.ts`:
  - `AttendanceStatus` object + type + ATTENDANCE_STATUS_VALUES
- [ ] Tạo `src/types/shift.types.ts`:
  - `Shift` — id, name, startTime, endTime, isActive, createdAt, updatedAt
  - `CreateShiftRequest` — name, startTime, endTime
  - `UpdateShiftRequest` — name?, startTime?, endTime?
  - `ShiftAssignment` — id, shiftId, shiftName, userId, userFullName, workDate, notes, createdAt
  - `CreateAssignmentRequest` — shiftId, userId, workDate (single mode)
  - `BulkAssignmentRequest` — shiftId, userId, startDate, endDate, daysOfWeek (0-6)
  - `AssignmentFilter` — userId?, shiftId?, from?, to?, page?, limit?
  - `AttendanceLog` — id, assignmentId, userId, userFullName, shiftName, workDate, checkInAt, checkOutAt, status, actualHours, notes, createdBy, createdByName, createdAt
  - `CheckInRequest` — (empty — dùng token user + tìm assignment hôm nay)
  - `CheckOutRequest` — (empty — tương tự)
  - `OverrideAttendanceRequest` — assignmentId, checkInAt?, checkOutAt?, notes?
  - `AttendanceFilter` — userId?, status?, from?, to?, page?, limit?
  - `AttendanceSummary` — userId, fullName, role, totalShifts, attendedShifts, onTimeCount, lateCount, earlyLeaveCount, absentCount, totalHours
- [ ] Tạo `src/validations/shift.validation.ts`:
  - `createShiftSchema` — name (required, 1-50), startTime (HH:mm), endTime (HH:mm)
  - `updateShiftSchema` — all optional, ≥1 field
  - `shiftIdParamSchema` — id (int, positive)
  - `createAssignmentSchema` — shiftId (int), userId (int), workDate (YYYY-MM-DD)
  - `bulkAssignmentSchema` — shiftId, userId, startDate, endDate, daysOfWeek (array of 0-6)
    - Validation: startDate ≤ endDate, range ≤ 31 ngày
  - `assignmentIdParamSchema` — id (int, positive)
  - `assignmentFilterSchema` — userId?, shiftId?, from?, to?, page (default 1), limit (default 20, max 100)
  - `myScheduleFilterSchema` — from?, to? (default: current week Mon-Sun)
  - `overrideAttendanceSchema` — assignmentId (int), checkInAt? (datetime), checkOutAt? (datetime), notes?
  - `attendanceFilterSchema` — userId?, status? (enum), from?, to?, page, limit
  - `attendanceSummarySchema` — from (required), to (required), range ≤ 90 ngày

**INPUT:** Constants + schema design
**OUTPUT:** Tất cả types + validations compile success
**VERIFY:** `npx tsc --noEmit` → 0 errors

---

### Task 3: Shift Repository (SQL Queries)
**Agent:** `backend-specialist` | **Skill:** `database-design`, `clean-code`
**Priority:** P1
**Depends:** Task 2

- [ ] Tạo `src/repositories/shift.repository.ts`:
  - `createShift(data)` → INSERT, return new shift
  - `getAllShifts()` → SELECT all, ordered by start_time
  - `getShiftById(id)` → SELECT by id
  - `findShiftByName(name)` → for unique check
  - `updateShift(id, data)` → UPDATE
  - `toggleActive(id)` → toggle is_active
  - `createAssignment(data)` → INSERT single
  - `createBulkAssignments(data[])` → batch INSERT (generate dates from startDate → endDate filtered by daysOfWeek)
  - `getAssignments(filter)` → SELECT + JOIN shifts/users, with pagination
  - `getAssignmentById(id)` → SELECT by id with joins
  - `getAssignmentByUserAndDate(userId, date)` → for check-in lookup (find today's assignment)
  - `updateAssignment(id, data)` → UPDATE
  - `deleteAssignment(id)` → DELETE (only if no attendance record)
  - `getMySchedule(userId, from, to)` → SELECT assignments + shift details for user

**INPUT:** Bảng shifts + shift_assignments
**OUTPUT:** Tất cả SQL queries hoạt động
**VERIFY:** Import từ service layer không lỗi

---

### Task 4: Attendance Repository (SQL Queries)
**Agent:** `backend-specialist` | **Skill:** `database-design`, `clean-code`
**Priority:** P1
**Depends:** Task 2

- [ ] Tạo `src/repositories/attendance.repository.ts`:
  - `findByAssignmentId(assignmentId)` → check existing attendance
  - `createCheckIn(assignmentId, userId, checkInAt, status, createdBy?)` → INSERT
  - `updateCheckOut(id, checkOutAt, actualHours, status?)` → UPDATE
  - `upsertOverride(assignmentId, userId, data, createdBy)` → INSERT or UPDATE (OWNER override)
  - `getAttendanceLogs(filter)` → SELECT + JOIN shift_assignments/shifts/users, pagination
  - `getMyHistory(userId, from?, to?, page, limit)` → SELECT own attendance, pagination
  - `getSummary(from, to)` → aggregate per user: COUNT by status, SUM actual_hours
    - GROUP BY user_id
    - Subqueries for each status count

**INPUT:** Bảng attendance_logs + joins
**OUTPUT:** Tất cả SQL queries hoạt động
**VERIFY:** Import từ service layer không lỗi

---

### Task 5: Shift Service (Business Logic)
**Agent:** `backend-specialist` | **Skill:** `api-patterns`, `clean-code`
**Priority:** P1
**Depends:** Task 3

- [ ] Tạo `src/services/shift.service.ts`:
  - `createShift(data)`:
    - Check duplicate name → 409 Conflict
    - Validate start_time ≠ end_time
    - INSERT → return shift
  - `getAllShifts()` → return all (cả inactive, OWNER cần thấy)
  - `updateShift(id, data)`:
    - Check exists → 404
    - Check duplicate name (exclude self) → 409
    - UPDATE → return updated
  - `toggleActive(id)`:
    - Check exists → 404
    - Toggle is_active
  - `createAssignment(data)`:
    - Validate: shift exists + active, user exists + active
    - Validate: work_date không phải quá khứ (trừ hôm nay)
    - Check duplicate → 409
    - INSERT → return with shift/user names
  - `createBulkAssignment(data)`:
    - Validate: shift, user exist + active
    - Generate dates: startDate → endDate, filter by daysOfWeek[]
    - Skip duplicates (INSERT IGNORE hoặc filter trước)
    - Return: { created: number, skipped: number, assignments: [] }
  - `getAssignments(filter)` → paginated list
  - `updateAssignment(id, data)` → check exists, update
  - `deleteAssignment(id)`:
    - Check exists → 404
    - Check no attendance record → 409 "Cannot delete assignment with attendance"
    - DELETE
  - `getMySchedule(userId, from, to)`:
    - Default: current week (Mon → Sun)
    - Return assignments sorted by work_date + start_time

**INPUT:** Shift repository hoạt động
**OUTPUT:** Business logic hoàn chỉnh
**VERIFY:** TypeScript compile + gọi từ controller

---

### Task 6: Attendance Service (Check-in/out Logic)
**Agent:** `backend-specialist` | **Skill:** `api-patterns`, `clean-code`
**Priority:** P1
**Depends:** Task 4, Task 5

- [ ] Tạo `src/services/attendance.service.ts`:
  - **Constants:**
    - `LATE_THRESHOLD_MINUTES = 15`
  - `checkIn(userId)`:
    - Tìm assignment hôm nay cho user → 404 "No shift assigned for today"
    - Nếu có nhiều assignment hôm nay (2 ca), chọn ca gần nhất theo current time
    - Check đã check-in rồi → 409 "Already checked in"
    - Compute status: now > shift.start_time + 15min → LATE, else ON_TIME
    - INSERT attendance_log → return attendance with shift info
  - `checkOut(userId)`:
    - Tìm attendance record hôm nay chưa check-out → 404
    - Set check_out_at = now
    - Compute actual_hours = diff(check_out, check_in)
    - Check early leave: check_out_at < shift.end_time - 15min → status = EARLY_LEAVE (override LATE nếu cần)
    - UPDATE → return
  - `overrideAttendance(assignmentId, data, ownerId)`:
    - OWNER tạo/sửa attendance cho nhân viên
    - Validate assignment exists
    - Compute status based on check_in_at vs shift time
    - Compute actual_hours if both check_in and check_out provided
    - UPSERT → return
    - `created_by = ownerId` (để biết ai override)
  - `getAttendanceLogs(filter)` → paginated
  - `getMyHistory(userId, from?, to?, page, limit)` → own records
  - `getSummary(from, to)`:
    - Aggregate per user: totalShifts (from assignments), attendedShifts (from attendance), by status counts, totalHours
    - Return sorted by fullName

**INPUT:** Attendance repository + shift service
**OUTPUT:** Check-in/out logic hoàn chỉnh
**VERIFY:** TypeScript compile

---

### Task 7: Controllers + Routes
**Agent:** `backend-specialist` | **Skill:** `api-patterns`, `clean-code`
**Priority:** P1
**Depends:** Task 5, Task 6

- [ ] Tạo `src/controllers/shift.controller.ts`:
  - `createShift` — POST /shifts
  - `getAllShifts` — GET /shifts
  - `updateShift` — PUT /shifts/:id
  - `toggleActive` — PATCH /shifts/:id/active
  - `createAssignment` — POST /shifts/assignments (detect mode: single vs bulk từ body)
  - `getAssignments` — GET /shifts/assignments
  - `updateAssignment` — PUT /shifts/assignments/:id
  - `deleteAssignment` — DELETE /shifts/assignments/:id
  - `getMySchedule` — GET /shifts/my-schedule
- [ ] Tạo `src/controllers/attendance.controller.ts`:
  - `checkIn` — POST /attendance/check-in
  - `checkOut` — POST /attendance/check-out
  - `overrideAttendance` — POST /attendance/override
  - `getAttendanceLogs` — GET /attendance
  - `getMyHistory` — GET /attendance/my-history
  - `getAttendanceSummary` — GET /attendance/summary
- [ ] Tạo `src/routes/shift.routes.ts`:
  - Mount shift CRUD (OWNER for write, AUTH for read)
  - Mount assignment endpoints
  - Mount my-schedule (AUTH)
  - All with validate middleware + JSDoc
- [ ] Tạo `src/routes/attendance.routes.ts`:
  - Mount check-in/out (AUTH)
  - Mount override (OWNER)
  - Mount list/history/summary
  - All with validate middleware + JSDoc
- [ ] Cập nhật `src/routes/index.ts`:
  - Import + mount shiftRoutes at `/shifts`
  - Import + mount attendanceRoutes at `/attendance`

**RBAC Matrix:**
| Endpoint | OWNER | CASHIER | BARISTA |
|----------|-------|---------|---------|
| Shift CRUD | ✅ WRITE | ❌ | ❌ |
| GET /shifts | ✅ | ✅ | ✅ |
| Assignments CRUD | ✅ | ❌ | ❌ |
| GET /my-schedule | ✅ | ✅ | ✅ |
| Check-in/out | ✅ (self) | ✅ (self) | ✅ (self) |
| Override | ✅ | ❌ | ❌ |
| GET /attendance | ✅ | ❌ | ❌ |
| GET /my-history | ✅ | ✅ | ✅ |
| GET /summary | ✅ | ❌ | ❌ |

**INPUT:** Service layers hoạt động
**OUTPUT:** 15 endpoints hoạt động
**VERIFY:**
- POST /shifts → tạo ca thành công
- POST /shifts/assignments → gán ca bulk T2-T6
- POST /attendance/check-in → nhân viên check-in
- POST /attendance/override → OWNER override
- CASHIER/BARISTA gọi OWNER endpoints → 403

---

### Task 8: Seed Data
**Agent:** `backend-specialist` | **Skill:** `database-design`
**Priority:** P2
**Depends:** Task 1, Task 7

- [ ] Cập nhật `src/database/seed.ts`:
  - Thêm TRUNCATE `attendance_logs`, `shift_assignments`, `shifts` (theo thứ tự FK)
  - Seed 3 ca mẫu: Ca sáng (07:00-14:00), Ca chiều (14:00-21:00), Ca tối (21:00-02:00)
  - Seed sample assignments cho tuần hiện tại:
    - cashier1 → Ca sáng T2-T6
    - barista1 → Ca chiều T2-T6
  - Seed sample attendance records (hôm nay hoặc hôm qua):
    - 1-2 ON_TIME records, 1 LATE record (cho demo)

**INPUT:** Seed hiện tại + 3 bảng mới
**OUTPUT:** Seed chạy thành công
**VERIFY:** `pnpm run seed` → log "Seed complete", check DB có shifts/assignments/attendance data

---

### Task 9: Swagger Documentation
**Agent:** `backend-specialist` | **Skill:** `api-patterns`
**Priority:** P2
**Depends:** Task 7

- [ ] Thêm JSDoc `@swagger` comments cho tất cả 15 endpoints mới
- [ ] Define schemas: Shift, ShiftAssignment, AttendanceLog, AttendanceSummary
- [ ] Document query params cho filter/pagination
- [ ] Document request bodies cho create/update/bulk/override
- [ ] Tag: `Shifts`, `Attendance`

**INPUT:** Tất cả routes đã hoạt động
**OUTPUT:** Swagger UI hiển thị 15 endpoints Phase 4
**VERIFY:** Truy cập `/api-docs` → 15 endpoints mới hiển thị, có thể "Try it out"

---

## Dependency Graph

```
Task 1 (Migrations) ─────────────────────────────────┐
    │                                                  │
    ▼                                                  │
Task 2 (Constants + Types + Validations)               │
    │                                                  │
    ├──────────────────────┐                           │
    ▼                      ▼                           │
Task 3 (Shift Repo)   Task 4 (Attendance Repo)        │
    │                      │                           │
    ▼                      │                           │
Task 5 (Shift Service)     │                           │
    │                      │                           │
    ├──────────────────────┘                           │
    ▼                                                  │
Task 6 (Attendance Service)                            │
    │                                                  │
    ▼                                                  │
Task 7 (Controllers + Routes)                          │
    │                                                  │
    ├──────────────────────────────────────────────────┘
    ▼                                                  │
Task 8 (Seed Data) ◄──────────────────────────────────┘
    │
    ▼
Task 9 (Swagger)
```

**Parallel opportunities:**
- Task 3 + Task 4 chạy song song (sau Task 2)
- Task 8 có thể bắt đầu sau Task 1 (seed chỉ cần bảng tồn tại)

## Edge Cases

| Case | Xử lý |
|------|-------|
| Check-in khi chưa có assignment hôm nay | 404 "No shift assigned for today" |
| Check-in 2 lần | 409 "Already checked in for this shift" |
| Check-out khi chưa check-in | 404 "No check-in record found" |
| Check-out 2 lần | 409 "Already checked out" |
| Nhân viên có 2 ca cùng ngày | Check-in chọn ca gần nhất (closest to current time) |
| Bulk assign trùng ngày đã có | Skip (không lỗi), trả skipped count |
| Xóa assignment đã có attendance | 409 "Cannot delete, has attendance record" |
| Xóa assignment chưa đến ngày | OK — xóa bình thường |
| Gán ca cho user inactive | 400 "User is not active" |
| Gán ca đã bị deactivate | 400 "Shift is not active" |
| Ca qua đêm (21:00-02:00) | end_time < start_time → cross-midnight logic |
| OWNER override check-in/out | created_by = owner_id, để trace ai sửa |
| Summary date range > 90 ngày | 400 "Date range must not exceed 90 days" |
| Không có attendance data trong range | Trả summary với 0 counts |

## Cross-Midnight Shift Logic

Ca tối (21:00-02:00) cần xử lý đặc biệt:

```
if (shift.end_time < shift.start_time):
    # Ca qua đêm
    Nếu check-in từ 21:00 → 23:59: work_date = ngày hôm đó
    Nếu check-in từ 00:00 → 02:00: work_date = ngày hôm trước
    
    LATE check: 
      if check_in_at > work_date + start_time + 15min → LATE
    
    actual_hours: 
      if check_out next day: hours = (24h - start_time) + end_time - check gap
```

## Response Examples

### GET /shifts
```json
{
  "success": true,
  "data": [
    { "id": 1, "name": "Ca sáng", "startTime": "07:00", "endTime": "14:00", "isActive": true },
    { "id": 2, "name": "Ca chiều", "startTime": "14:00", "endTime": "21:00", "isActive": true },
    { "id": 3, "name": "Ca tối", "startTime": "21:00", "endTime": "02:00", "isActive": true }
  ]
}
```

### POST /shifts/assignments (Bulk)
```json
// Request
{
  "shiftId": 1,
  "userId": 2,
  "startDate": "2026-05-25",
  "endDate": "2026-05-30",
  "daysOfWeek": [1, 2, 3, 4, 5]
}

// Response
{
  "success": true,
  "data": {
    "created": 5,
    "skipped": 0,
    "assignments": [
      { "id": 1, "shiftName": "Ca sáng", "userFullName": "Thu ngân 1", "workDate": "2026-05-25" },
      { "id": 2, "shiftName": "Ca sáng", "userFullName": "Thu ngân 1", "workDate": "2026-05-26" },
      ...
    ]
  }
}
```

### POST /attendance/check-in
```json
{
  "success": true,
  "data": {
    "id": 1,
    "shiftName": "Ca sáng",
    "workDate": "2026-05-26",
    "checkInAt": "2026-05-26T07:05:00",
    "status": "ON_TIME",
    "message": "Checked in successfully. Shift starts at 07:00."
  }
}
```

### POST /attendance/check-in (LATE)
```json
{
  "success": true,
  "data": {
    "id": 2,
    "shiftName": "Ca sáng",
    "workDate": "2026-05-26",
    "checkInAt": "2026-05-26T07:22:00",
    "status": "LATE",
    "message": "Checked in 22 minutes late. Shift started at 07:00."
  }
}
```

### GET /attendance/summary
```json
{
  "success": true,
  "data": [
    {
      "userId": 2,
      "fullName": "Thu ngân 1",
      "role": "CASHIER",
      "totalShifts": 22,
      "attendedShifts": 20,
      "onTimeCount": 17,
      "lateCount": 2,
      "earlyLeaveCount": 1,
      "absentCount": 2,
      "totalHours": 138.50
    }
  ]
}
```

## Phase X: Verification

### Automated
- [ ] `npx tsc --noEmit` — TypeScript 0 errors
- [ ] Tất cả 62 endpoints test qua Swagger UI

### Manual Test Scenarios
- [ ] **Shift CRUD:** OWNER tạo ca "Ca đêm" (22:00-06:00) → thành công
- [ ] **Duplicate shift:** Tạo ca trùng tên → 409
- [ ] **Single assign:** OWNER gán cashier1 vào Ca sáng ngày mai → thành công
- [ ] **Bulk assign:** OWNER gán barista1 Ca chiều T2-T6 → 5 assignments created
- [ ] **Bulk duplicate:** Gán lại bulk → skipped = 5, created = 0
- [ ] **My schedule:** cashier1 GET /my-schedule → thấy lịch tuần này
- [ ] **Check-in ON_TIME:** cashier1 check-in lúc 07:05 → status ON_TIME
- [ ] **Check-in LATE:** barista1 check-in lúc 14:20 → status LATE, message "20 minutes late"
- [ ] **Double check-in:** Check-in lại → 409 "Already checked in"
- [ ] **Check-out:** cashier1 check-out lúc 14:00 → actual_hours = 6.92
- [ ] **Check-out early:** Check-out lúc 12:00 (< 14:00-15min) → EARLY_LEAVE
- [ ] **Override:** OWNER POST /attendance/override cho barista1 → created_by = OWNER id
- [ ] **No assignment:** Nhân viên không có ca hôm nay check-in → 404
- [ ] **Attendance list:** OWNER GET /attendance?status=LATE → danh sách đi trễ
- [ ] **My history:** cashier1 GET /attendance/my-history → thấy lịch sử mình
- [ ] **Summary:** OWNER GET /attendance/summary?from=2026-05-01&to=2026-05-31 → bảng tổng hợp
- [ ] **Delete assignment:** Xóa assignment có attendance → 409
- [ ] **Delete assignment:** Xóa assignment chưa attendance → 200
- [ ] **RBAC:** CASHIER tạo shift → 403, BARISTA gọi /attendance → 403
- [ ] **Phase 1-3 regression:** 47 endpoints cũ hoạt động bình thường
- [ ] **Seed:** `pnpm run seed` → có shifts/assignments/attendance data

### Done When
- [ ] 62 endpoints hoạt động (47 Phase 1-3 + 15 Phase 4)
- [ ] Swagger docs cập nhật tại /api-docs
- [ ] Check-in/out flow hoạt động end-to-end
- [ ] Bulk assignment hoạt động
- [ ] Attendance summary chính xác
- [ ] TypeScript 0 errors
- [ ] Docker build thành công
