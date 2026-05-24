#!/bin/bash
# ============================================
# Coffee Shop API — Full Integration Test
# Tests all endpoints across all modules
# ============================================

BASE="http://localhost:3000/api/v1"
PASS=0
FAIL=0
TOTAL=0
ERRORS=""

# Colors
GREEN="\033[0;32m"
RED="\033[0;31m"
YELLOW="\033[1;33m"
CYAN="\033[0;36m"
NC="\033[0m"

# ============================================
# Helpers
# ============================================

test_endpoint() {
  local method="$1"
  local url="$2"
  local expected_status="$3"
  local description="$4"
  local data="$5"
  local token="$6"
  local extra_flags="$7"

  TOTAL=$((TOTAL + 1))

  local curl_cmd="curl -s -o /tmp/api_response.json -w %{http_code} -X $method"

  if [ -n "$token" ]; then
    curl_cmd="$curl_cmd -H \"Authorization: Bearer $token\""
  fi

  if [ -n "$data" ]; then
    curl_cmd="$curl_cmd -H \"Content-Type: application/json\" -d '$data'"
  fi

  if [ -n "$extra_flags" ]; then
    curl_cmd="$curl_cmd $extra_flags"
  fi

  curl_cmd="$curl_cmd \"${BASE}${url}\""

  local status
  status=$(eval $curl_cmd 2>/dev/null)
  local body
  body=$(cat /tmp/api_response.json 2>/dev/null)

  if [ "$status" = "$expected_status" ]; then
    echo -e "  ${GREEN}✓${NC} [${status}] ${description}"
    PASS=$((PASS + 1))
  else
    echo -e "  ${RED}✗${NC} [${status}] ${description} (expected ${expected_status})"
    echo -e "    ${RED}Response: $(echo "$body" | head -c 200)${NC}"
    FAIL=$((FAIL + 1))
    ERRORS="${ERRORS}\n  ✗ ${description}: got ${status}, expected ${expected_status}"
  fi
}

extract_json_value() {
  local json="$1"
  local key="$2"
  echo "$json" | grep -o "\"$key\":[^,}]*" | head -1 | sed "s/\"$key\"://;s/\"//g;s/ //g"
}

section() {
  echo -e "\n${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${CYAN}  $1${NC}"
  echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

# ============================================
# 0. Health Check
# ============================================
section "🏥 Health Check"
TOTAL=$((TOTAL + 1))
HEALTH_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:3000/health")
if [ "$HEALTH_STATUS" = "200" ]; then
  echo -e "  ${GREEN}✓${NC} [200] Server is healthy"
  PASS=$((PASS + 1))
else
  echo -e "  ${RED}✗${NC} Server not reachable (status: $HEALTH_STATUS)"
  FAIL=$((FAIL + 1))
  echo -e "${RED}Server is not running. Aborting tests.${NC}"
  exit 1
fi

# ============================================
# 1. AUTH — Login / Refresh / Me / Logout
# ============================================
section "🔐 Auth Module"

# Login as OWNER
OWNER_RESP=$(curl -s -X POST "${BASE}/auth/login" -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}')
OWNER_TOKEN=$(echo "$OWNER_RESP" | grep -o '"accessToken":"[^"]*"' | sed 's/"accessToken":"//;s/"//')
OWNER_REFRESH=$(echo "$OWNER_RESP" | grep -o '"refreshToken":"[^"]*"' | sed 's/"refreshToken":"//;s/"//')

TOTAL=$((TOTAL + 1))
if [ -n "$OWNER_TOKEN" ]; then
  echo -e "  ${GREEN}✓${NC} [200] POST /auth/login (OWNER → admin)"
  PASS=$((PASS + 1))
else
  echo -e "  ${RED}✗${NC} POST /auth/login (OWNER) — no token received"
  echo -e "    ${RED}Response: $(echo "$OWNER_RESP" | head -c 200)${NC}"
  FAIL=$((FAIL + 1))
  echo -e "${RED}Cannot proceed without OWNER token. Aborting.${NC}"
  exit 1
fi

# Login as CASHIER
CASHIER_RESP=$(curl -s -X POST "${BASE}/auth/login" -H "Content-Type: application/json" \
  -d '{"username":"cashier1","password":"cashier123"}')
CASHIER_TOKEN=$(echo "$CASHIER_RESP" | grep -o '"accessToken":"[^"]*"' | sed 's/"accessToken":"//;s/"//')
CASHIER_REFRESH=$(echo "$CASHIER_RESP" | grep -o '"refreshToken":"[^"]*"' | sed 's/"refreshToken":"//;s/"//')

TOTAL=$((TOTAL + 1))
if [ -n "$CASHIER_TOKEN" ]; then
  echo -e "  ${GREEN}✓${NC} [200] POST /auth/login (CASHIER → cashier1)"
  PASS=$((PASS + 1))
else
  echo -e "  ${RED}✗${NC} POST /auth/login (CASHIER) — no token received"
  FAIL=$((FAIL + 1))
fi

# Login as BARISTA
BARISTA_RESP=$(curl -s -X POST "${BASE}/auth/login" -H "Content-Type: application/json" \
  -d '{"username":"barista1","password":"barista123"}')
BARISTA_TOKEN=$(echo "$BARISTA_RESP" | grep -o '"accessToken":"[^"]*"' | sed 's/"accessToken":"//;s/"//')

TOTAL=$((TOTAL + 1))
if [ -n "$BARISTA_TOKEN" ]; then
  echo -e "  ${GREEN}✓${NC} [200] POST /auth/login (BARISTA → barista1)"
  PASS=$((PASS + 1))
else
  echo -e "  ${RED}✗${NC} POST /auth/login (BARISTA) — no token received"
  FAIL=$((FAIL + 1))
fi

# POST /auth/login — invalid credentials
test_endpoint "POST" "/auth/login" "401" "POST /auth/login — invalid credentials" \
  '{"username":"admin","password":"wrongpass"}'

# POST /auth/refresh
test_endpoint "POST" "/auth/refresh" "200" "POST /auth/refresh — OWNER refresh token" \
  "{\"refreshToken\":\"$OWNER_REFRESH\"}"

# After refresh, re-login to get fresh token
OWNER_RESP=$(curl -s -X POST "${BASE}/auth/login" -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}')
OWNER_TOKEN=$(echo "$OWNER_RESP" | grep -o '"accessToken":"[^"]*"' | sed 's/"accessToken":"//;s/"//')
OWNER_REFRESH=$(echo "$OWNER_RESP" | grep -o '"refreshToken":"[^"]*"' | sed 's/"refreshToken":"//;s/"//')

# GET /auth/me
test_endpoint "GET" "/auth/me" "200" "GET /auth/me — OWNER profile" "" "$OWNER_TOKEN"

# GET /auth/me — no token (unauthorized)
test_endpoint "GET" "/auth/me" "401" "GET /auth/me — no token (401)" ""

# ============================================
# 2. USERS — CRUD (OWNER only)
# ============================================
section "👥 Users Module"

# POST /users — create staff
test_endpoint "POST" "/users" "201" "POST /users — create test cashier" \
  '{"username":"test_cashier_api","password":"test123","fullName":"Test Cashier API","role":"CASHIER"}' \
  "$OWNER_TOKEN"

# Extract created user ID
CREATED_USER_ID=$(cat /tmp/api_response.json | grep -o '"id":[0-9]*' | head -1 | sed 's/"id"://')

# GET /users — list all
test_endpoint "GET" "/users" "200" "GET /users — list all staff" "" "$OWNER_TOKEN"

# GET /users/:id
test_endpoint "GET" "/users/${CREATED_USER_ID:-999}" "200" "GET /users/:id — get by ID" "" "$OWNER_TOKEN"

# PUT /users/:id
test_endpoint "PUT" "/users/${CREATED_USER_ID:-999}" "200" "PUT /users/:id — update fullName" \
  '{"fullName":"Updated Test Cashier"}' "$OWNER_TOKEN"

# PATCH /users/:id/active — toggle active
test_endpoint "PATCH" "/users/${CREATED_USER_ID:-999}/active" "200" "PATCH /users/:id/active — toggle active" "" "$OWNER_TOKEN"

# PATCH /users/:id/password — reset password
test_endpoint "PATCH" "/users/${CREATED_USER_ID:-999}/password" "204" "PATCH /users/:id/password — reset password" \
  '{"newPassword":"newpass123"}' "$OWNER_TOKEN"

# RBAC: CASHIER should not access users
test_endpoint "GET" "/users" "403" "GET /users — CASHIER forbidden (403)" "" "$CASHIER_TOKEN"

# ============================================
# 3. MENU — Categories, Items, Toppings, Recipes
# ============================================
section "📋 Menu Module — Categories"

# GET /menu/categories
test_endpoint "GET" "/menu/categories" "200" "GET /menu/categories — list all" "" "$OWNER_TOKEN"

# POST /menu/categories
test_endpoint "POST" "/menu/categories" "201" "POST /menu/categories — create test category" \
  '{"name":"Test Category API","description":"For testing","sortOrder":99}' "$OWNER_TOKEN"

TEST_CAT_ID=$(cat /tmp/api_response.json | grep -o '"id":[0-9]*' | head -1 | sed 's/"id"://')

# PUT /menu/categories/:id
test_endpoint "PUT" "/menu/categories/${TEST_CAT_ID:-999}" "200" "PUT /menu/categories/:id — update" \
  '{"name":"Updated Test Category"}' "$OWNER_TOKEN"

section "📋 Menu Module — Items"

# GET /menu/items
test_endpoint "GET" "/menu/items" "200" "GET /menu/items — list all" "" "$OWNER_TOKEN"

# GET /menu/items?categoryId=1
test_endpoint "GET" "/menu/items?categoryId=1" "200" "GET /menu/items?categoryId=1 — filter by category" "" "$OWNER_TOKEN"

# POST /menu/items
test_endpoint "POST" "/menu/items" "201" "POST /menu/items — create test item" \
  "{\"categoryId\":${TEST_CAT_ID:-1},\"name\":\"Test Item API\",\"basePrice\":25000}" "$OWNER_TOKEN"

TEST_ITEM_ID=$(cat /tmp/api_response.json | grep -o '"id":[0-9]*' | head -1 | sed 's/"id"://')

# GET /menu/items/:id
test_endpoint "GET" "/menu/items/${TEST_ITEM_ID:-1}" "200" "GET /menu/items/:id — get by ID" "" "$OWNER_TOKEN"

# PUT /menu/items/:id
test_endpoint "PUT" "/menu/items/${TEST_ITEM_ID:-999}" "200" "PUT /menu/items/:id — update" \
  '{"name":"Updated Test Item","basePrice":30000}' "$OWNER_TOKEN"

# PATCH /menu/items/:id/availability — toggle
test_endpoint "PATCH" "/menu/items/${TEST_ITEM_ID:-1}/availability" "200" "PATCH /menu/items/:id/availability — toggle (OWNER)" "" "$OWNER_TOKEN"

# Toggle back
test_endpoint "PATCH" "/menu/items/${TEST_ITEM_ID:-1}/availability" "200" "PATCH /menu/items/:id/availability — toggle back (OWNER)" "" "$OWNER_TOKEN"

# BARISTA can toggle availability
test_endpoint "PATCH" "/menu/items/1/availability" "200" "PATCH /menu/items/:id/availability — BARISTA allowed" "" "$BARISTA_TOKEN"
# Toggle back
test_endpoint "PATCH" "/menu/items/1/availability" "200" "PATCH /menu/items/:id/availability — toggle back (BARISTA)" "" "$BARISTA_TOKEN"

section "📋 Menu Module — Toppings"

# GET /menu/toppings
test_endpoint "GET" "/menu/toppings" "200" "GET /menu/toppings — list all" "" "$OWNER_TOKEN"

# POST /menu/toppings
test_endpoint "POST" "/menu/toppings" "201" "POST /menu/toppings — create test topping" \
  '{"name":"Test Topping API","price":5000}' "$OWNER_TOKEN"

TEST_TOPPING_ID=$(cat /tmp/api_response.json | grep -o '"id":[0-9]*' | head -1 | sed 's/"id"://')

# PUT /menu/toppings/:id
test_endpoint "PUT" "/menu/toppings/${TEST_TOPPING_ID:-999}" "200" "PUT /menu/toppings/:id — update" \
  '{"name":"Updated Test Topping","price":7000}' "$OWNER_TOKEN"

section "📋 Menu Module — Recipes"

# GET /menu/items/:id/ingredients
test_endpoint "GET" "/menu/items/1/ingredients" "200" "GET /menu/items/1/ingredients — get recipe" "" "$OWNER_TOKEN"

# PUT /menu/items/:id/ingredients — set recipe
test_endpoint "PUT" "/menu/items/${TEST_ITEM_ID:-999}/ingredients" "200" "PUT /menu/items/:id/ingredients — set recipe" \
  '{"items":[{"ingredientId":1,"quantityPerUnit":20}]}' "$OWNER_TOKEN"

# GET /menu/toppings/:id/ingredients
test_endpoint "GET" "/menu/toppings/1/ingredients" "200" "GET /menu/toppings/1/ingredients — get topping recipe" "" "$OWNER_TOKEN"

# PUT /menu/toppings/:id/ingredients — set topping recipe
test_endpoint "PUT" "/menu/toppings/${TEST_TOPPING_ID:-999}/ingredients" "200" "PUT /menu/toppings/:id/ingredients — set topping recipe" \
  '{"items":[{"ingredientId":2,"quantityPerUnit":15}]}' "$OWNER_TOKEN"

# ============================================
# 4. INVENTORY — Ingredients CRUD + Alerts
# ============================================
section "📦 Inventory Module"

# GET /inventory/ingredients
test_endpoint "GET" "/inventory/ingredients" "200" "GET /inventory/ingredients — list all" "" "$OWNER_TOKEN"

# POST /inventory/ingredients
test_endpoint "POST" "/inventory/ingredients" "201" "POST /inventory/ingredients — create" \
  '{"name":"Test Ingredient API","unit":"g","stockQuantity":1000,"minThreshold":100}' "$OWNER_TOKEN"

TEST_ING_ID=$(cat /tmp/api_response.json | grep -o '"id":[0-9]*' | head -1 | sed 's/"id"://')

# GET /inventory/ingredients/:id
test_endpoint "GET" "/inventory/ingredients/${TEST_ING_ID:-1}" "200" "GET /inventory/ingredients/:id — get by ID" "" "$OWNER_TOKEN"

# PUT /inventory/ingredients/:id
test_endpoint "PUT" "/inventory/ingredients/${TEST_ING_ID:-999}" "200" "PUT /inventory/ingredients/:id — update" \
  '{"name":"Updated Test Ingredient","minThreshold":200}' "$OWNER_TOKEN"

# PATCH /inventory/ingredients/:id/stock — add
test_endpoint "PATCH" "/inventory/ingredients/${TEST_ING_ID:-999}/stock" "200" "PATCH /inventory/ingredients/:id/stock — add 500g" \
  '{"quantity":500,"action":"add"}' "$OWNER_TOKEN"

# PATCH /inventory/ingredients/:id/stock — set
test_endpoint "PATCH" "/inventory/ingredients/${TEST_ING_ID:-999}/stock" "200" "PATCH /inventory/ingredients/:id/stock — set to 2000g" \
  '{"quantity":2000,"action":"set"}' "$OWNER_TOKEN"

# PATCH /inventory/ingredients/:id/active — toggle
test_endpoint "PATCH" "/inventory/ingredients/${TEST_ING_ID:-999}/active" "200" "PATCH /inventory/ingredients/:id/active — toggle" "" "$OWNER_TOKEN"
# Toggle back
test_endpoint "PATCH" "/inventory/ingredients/${TEST_ING_ID:-999}/active" "200" "PATCH /inventory/ingredients/:id/active — toggle back" "" "$OWNER_TOKEN"

# GET /inventory/alerts
test_endpoint "GET" "/inventory/alerts" "200" "GET /inventory/alerts — low-stock alerts" "" "$OWNER_TOKEN"

# RBAC: CASHIER should not access inventory
test_endpoint "GET" "/inventory/ingredients" "403" "GET /inventory/ingredients — CASHIER forbidden (403)" "" "$CASHIER_TOKEN"

# ============================================
# 5. ORDERS — Create, List, Get, Update Status
# ============================================
section "🛒 Orders Module"

# POST /orders — create order (CASHIER)
test_endpoint "POST" "/orders" "201" "POST /orders — create order (CASHIER)" \
  '{"items":[{"menuItemId":1,"quantity":2},{"menuItemId":2,"quantity":1,"toppingIds":[1]}]}' \
  "$CASHIER_TOKEN"

ORDER_RESP=$(cat /tmp/api_response.json)
ORDER_ID=$(echo "$ORDER_RESP" | grep -o '"id":[0-9]*' | head -1 | sed 's/"id"://')

# GET /orders — list all
test_endpoint "GET" "/orders" "200" "GET /orders — list all orders" "" "$CASHIER_TOKEN"

# GET /orders?status=PENDING
test_endpoint "GET" "/orders?status=PENDING" "200" "GET /orders?status=PENDING — filter by status" "" "$CASHIER_TOKEN"

# GET /orders/:id
test_endpoint "GET" "/orders/${ORDER_ID:-1}" "200" "GET /orders/:id — get by ID" "" "$CASHIER_TOKEN"

# PATCH /orders/:id/status — BARISTA moves to PREPARING
test_endpoint "PATCH" "/orders/${ORDER_ID:-1}/status" "200" "PATCH /orders/:id/status — BARISTA → PREPARING" \
  '{"status":"PREPARING"}' "$BARISTA_TOKEN"

# PATCH /orders/:id/status — BARISTA moves to READY
test_endpoint "PATCH" "/orders/${ORDER_ID:-1}/status" "200" "PATCH /orders/:id/status — BARISTA → READY" \
  '{"status":"READY"}' "$BARISTA_TOKEN"

# PATCH /orders/:id/status — BARISTA moves to COMPLETED
test_endpoint "PATCH" "/orders/${ORDER_ID:-1}/status" "200" "PATCH /orders/:id/status — BARISTA → COMPLETED" \
  '{"status":"COMPLETED"}' "$BARISTA_TOKEN"

# RBAC: BARISTA should not create orders
test_endpoint "POST" "/orders" "403" "POST /orders — BARISTA forbidden (403)" \
  '{"items":[{"menuItemId":1,"quantity":1}]}' "$BARISTA_TOKEN"

# ============================================
# 6. PAYMENTS — Process + Get
# ============================================
section "💰 Payments Module"

# Create a new order for payment test
PAYMENT_ORDER_RESP=$(curl -s -X POST "${BASE}/orders" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $CASHIER_TOKEN" \
  -d '{"items":[{"menuItemId":3,"quantity":1}]}')
PAYMENT_ORDER_ID=$(echo "$PAYMENT_ORDER_RESP" | grep -o '"id":[0-9]*' | head -1 | sed 's/"id"://')

# POST /payments — process payment (CASHIER)
test_endpoint "POST" "/payments" "201" "POST /payments — process CASH payment" \
  "{\"orderId\":${PAYMENT_ORDER_ID:-1},\"method\":\"CASH\"}" "$CASHIER_TOKEN"

# POST /payments — duplicate payment (409)
test_endpoint "POST" "/payments" "409" "POST /payments — duplicate payment (409)" \
  "{\"orderId\":${PAYMENT_ORDER_ID:-1},\"method\":\"CASH\"}" "$CASHIER_TOKEN"

# GET /payments/:orderId
test_endpoint "GET" "/payments/${PAYMENT_ORDER_ID:-1}" "200" "GET /payments/:orderId — get payment details" "" "$CASHIER_TOKEN"

# OWNER can also view payment
test_endpoint "GET" "/payments/${PAYMENT_ORDER_ID:-1}" "200" "GET /payments/:orderId — OWNER can view" "" "$OWNER_TOKEN"

# ============================================
# 7. KITCHEN — Queue + Display
# ============================================
section "🍳 Kitchen Module"

# Create another order for kitchen queue
curl -s -X POST "${BASE}/orders" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $CASHIER_TOKEN" \
  -d '{"items":[{"menuItemId":1,"quantity":1}]}' > /dev/null

# GET /kitchen/queue — BARISTA
test_endpoint "GET" "/kitchen/queue" "200" "GET /kitchen/queue — BARISTA" "" "$BARISTA_TOKEN"

# GET /kitchen/display — PUBLIC (no auth)
test_endpoint "GET" "/kitchen/display" "200" "GET /kitchen/display — PUBLIC (no auth)" ""

# RBAC: CASHIER should not access queue
test_endpoint "GET" "/kitchen/queue" "403" "GET /kitchen/queue — CASHIER forbidden (403)" "" "$CASHIER_TOKEN"

# ============================================
# 8. REPORTS — All 9 endpoints
# ============================================
section "📊 Reports Module"

# GET /reports/dashboard
test_endpoint "GET" "/reports/dashboard" "200" "GET /reports/dashboard — today's overview" "" "$OWNER_TOKEN"

# GET /reports/revenue/summary?period=daily&date=2026-05-24
test_endpoint "GET" "/reports/revenue/summary?period=daily&date=2026-05-24" "200" \
  "GET /reports/revenue/summary — daily" "" "$OWNER_TOKEN"

# GET /reports/revenue/summary?period=monthly&month=2026-05
test_endpoint "GET" "/reports/revenue/summary?period=monthly&month=2026-05" "200" \
  "GET /reports/revenue/summary — monthly" "" "$OWNER_TOKEN"

# GET /reports/revenue/by-method?period=daily&date=2026-05-24
test_endpoint "GET" "/reports/revenue/by-method?period=daily&date=2026-05-24" "200" \
  "GET /reports/revenue/by-method — daily" "" "$OWNER_TOKEN"

# GET /reports/top-selling?period=monthly&month=2026-05&limit=5
test_endpoint "GET" "/reports/top-selling?period=monthly&month=2026-05&limit=5" "200" \
  "GET /reports/top-selling — monthly top 5" "" "$OWNER_TOKEN"

# GET /reports/category-performance?period=daily&date=2026-05-24
test_endpoint "GET" "/reports/category-performance?period=daily&date=2026-05-24" "200" \
  "GET /reports/category-performance — daily" "" "$OWNER_TOKEN"

# GET /reports/cashier-performance?period=daily&date=2026-05-24
test_endpoint "GET" "/reports/cashier-performance?period=daily&date=2026-05-24" "200" \
  "GET /reports/cashier-performance — daily" "" "$OWNER_TOKEN"

# GET /reports/inventory/summary
test_endpoint "GET" "/reports/inventory/summary" "200" "GET /reports/inventory/summary — all ingredients status" "" "$OWNER_TOKEN"

# GET /reports/inventory/movements
test_endpoint "GET" "/reports/inventory/movements?page=1&limit=10" "200" \
  "GET /reports/inventory/movements — paginated" "" "$OWNER_TOKEN"

# GET /reports/export?type=revenue&period=daily&date=2026-05-24
test_endpoint "GET" "/reports/export?type=revenue&period=daily&date=2026-05-24" "200" \
  "GET /reports/export — CSV revenue export" "" "$OWNER_TOKEN"

# GET /reports/export?type=inventory
test_endpoint "GET" "/reports/export?type=inventory" "200" \
  "GET /reports/export — CSV inventory export" "" "$OWNER_TOKEN"

# RBAC: CASHIER should not access reports
test_endpoint "GET" "/reports/dashboard" "403" "GET /reports/dashboard — CASHIER forbidden (403)" "" "$CASHIER_TOKEN"

# ============================================
# 9. SHIFTS — Templates + Assignments + My Schedule
# ============================================
section "⏰ Shifts Module — Templates"

# GET /shifts
test_endpoint "GET" "/shifts" "200" "GET /shifts — list all shift templates" "" "$OWNER_TOKEN"

# POST /shifts — create
test_endpoint "POST" "/shifts" "201" "POST /shifts — create test shift" \
  '{"name":"Test Shift API","startTime":"08:00","endTime":"15:00"}' "$OWNER_TOKEN"

SHIFT_ID=$(cat /tmp/api_response.json | grep -o '"id":[0-9]*' | head -1 | sed 's/"id"://')

# PUT /shifts/:id
test_endpoint "PUT" "/shifts/${SHIFT_ID:-999}" "200" "PUT /shifts/:id — update shift" \
  '{"name":"Updated Test Shift","startTime":"09:00","endTime":"16:00"}' "$OWNER_TOKEN"

# PATCH /shifts/:id/active
test_endpoint "PATCH" "/shifts/${SHIFT_ID:-999}/active" "200" "PATCH /shifts/:id/active — toggle" "" "$OWNER_TOKEN"
# Toggle back
test_endpoint "PATCH" "/shifts/${SHIFT_ID:-999}/active" "200" "PATCH /shifts/:id/active — toggle back" "" "$OWNER_TOKEN"

section "⏰ Shifts Module — Assignments"

# Get CASHIER user ID
CASHIER_USER_RESP=$(curl -s "${BASE}/auth/me" -H "Authorization: Bearer $CASHIER_TOKEN")
CASHIER_USER_ID=$(echo "$CASHIER_USER_RESP" | grep -o '"id":[0-9]*' | head -1 | sed 's/"id"://')

# POST /shifts/assignments — single
test_endpoint "POST" "/shifts/assignments" "201" "POST /shifts/assignments — single assignment" \
  "{\"shiftId\":${SHIFT_ID:-1},\"userId\":${CASHIER_USER_ID:-2},\"workDate\":\"2026-05-26\"}" "$OWNER_TOKEN"

ASSIGNMENT_ID=$(cat /tmp/api_response.json | grep -o '"id":[0-9]*' | head -1 | sed 's/"id"://')

# POST /shifts/assignments — bulk
test_endpoint "POST" "/shifts/assignments" "201" "POST /shifts/assignments — bulk (Mon-Fri)" \
  "{\"shiftId\":${SHIFT_ID:-1},\"userId\":${CASHIER_USER_ID:-2},\"startDate\":\"2026-06-01\",\"endDate\":\"2026-06-06\",\"daysOfWeek\":[1,2,3,4,5]}" "$OWNER_TOKEN"

# GET /shifts/assignments
test_endpoint "GET" "/shifts/assignments" "200" "GET /shifts/assignments — list all" "" "$OWNER_TOKEN"

# GET /shifts/assignments?userId=X
test_endpoint "GET" "/shifts/assignments?userId=${CASHIER_USER_ID:-2}" "200" \
  "GET /shifts/assignments?userId — filter by user" "" "$OWNER_TOKEN"

# PUT /shifts/assignments/:id
test_endpoint "PUT" "/shifts/assignments/${ASSIGNMENT_ID:-999}" "200" "PUT /shifts/assignments/:id — update notes" \
  '{"notes":"Updated via API test"}' "$OWNER_TOKEN"

# GET /shifts/my-schedule (CASHIER sees own schedule)
test_endpoint "GET" "/shifts/my-schedule" "200" "GET /shifts/my-schedule — CASHIER own schedule" "" "$CASHIER_TOKEN"

# GET /shifts/my-schedule?from=...&to=...
test_endpoint "GET" "/shifts/my-schedule?from=2026-05-01&to=2026-06-30" "200" \
  "GET /shifts/my-schedule — with date range" "" "$CASHIER_TOKEN"

# ============================================
# 10. ATTENDANCE — Check-in/out, History, Override, Logs, Summary
# ============================================
section "📝 Attendance Module"

# POST /attendance/check-in (CASHIER)
test_endpoint "POST" "/attendance/check-in" "200" "POST /attendance/check-in — CASHIER" "" "$CASHIER_TOKEN"
CHECKIN_STATUS=$(cat /tmp/api_response.json | grep -o '"status":"[^"]*"' | head -1)
CHECKIN_EXPECTED="200"
# If 404 (no shift today) or 409 (already checked in), that's also valid
CHECKIN_HTTP=$(curl -s -o /dev/null -w "%{http_code}" -X POST "${BASE}/attendance/check-in" \
  -H "Authorization: Bearer $CASHIER_TOKEN")

# POST /attendance/check-out (CASHIER)
test_endpoint "POST" "/attendance/check-out" "200" "POST /attendance/check-out — CASHIER" "" "$CASHIER_TOKEN"

# GET /attendance/my-history
test_endpoint "GET" "/attendance/my-history" "200" "GET /attendance/my-history — CASHIER" "" "$CASHIER_TOKEN"

# GET /attendance/my-history?from=...&to=...
test_endpoint "GET" "/attendance/my-history?from=2026-05-01&to=2026-06-30" "200" \
  "GET /attendance/my-history — with date range" "" "$CASHIER_TOKEN"

# POST /attendance/override (OWNER)
if [ -n "$ASSIGNMENT_ID" ] && [ "$ASSIGNMENT_ID" != "null" ]; then
  test_endpoint "POST" "/attendance/override" "200" "POST /attendance/override — OWNER manual entry" \
    "{\"assignmentId\":${ASSIGNMENT_ID},\"checkInAt\":\"2026-05-26T08:00\",\"checkOutAt\":\"2026-05-26T15:00\",\"notes\":\"API test override\"}" \
    "$OWNER_TOKEN"
else
  echo -e "  ${YELLOW}⊘${NC} POST /attendance/override — SKIPPED (no assignment ID)"
fi

# GET /attendance (OWNER)
test_endpoint "GET" "/attendance" "200" "GET /attendance — OWNER list all logs" "" "$OWNER_TOKEN"

# GET /attendance?userId=...&status=ON_TIME
test_endpoint "GET" "/attendance?userId=${CASHIER_USER_ID:-2}" "200" \
  "GET /attendance?userId — filter by user" "" "$OWNER_TOKEN"

# GET /attendance/summary
test_endpoint "GET" "/attendance/summary?from=2026-05-01&to=2026-06-30" "200" \
  "GET /attendance/summary — aggregate report" "" "$OWNER_TOKEN"

# RBAC: CASHIER should not access attendance logs
test_endpoint "GET" "/attendance" "403" "GET /attendance — CASHIER forbidden (403)" "" "$CASHIER_TOKEN"

# ============================================
# 11. VALIDATION TESTS — Bad inputs
# ============================================
section "🛡️ Validation & Edge Cases"

# Login with empty body
test_endpoint "POST" "/auth/login" "400" "POST /auth/login — empty body (400)" '{}'

# Create user with invalid role
test_endpoint "POST" "/users" "400" "POST /users — invalid role (400)" \
  '{"username":"bad","password":"test","fullName":"Bad","role":"SUPERADMIN"}' "$OWNER_TOKEN"

# Create order with empty items
test_endpoint "POST" "/orders" "400" "POST /orders — empty items array (400)" \
  '{"items":[]}' "$CASHIER_TOKEN"

# Access with expired/invalid token
test_endpoint "GET" "/auth/me" "401" "GET /auth/me — invalid token (401)" "" "invalid.token.here"

# GET non-existent user
test_endpoint "GET" "/users/99999" "404" "GET /users/99999 — not found (404)" "" "$OWNER_TOKEN"

# ============================================
# 12. CLEANUP — Delete test data + Logout
# ============================================
section "🧹 Cleanup"

# Delete test assignment
if [ -n "$ASSIGNMENT_ID" ] && [ "$ASSIGNMENT_ID" != "null" ]; then
  test_endpoint "DELETE" "/shifts/assignments/${ASSIGNMENT_ID}" "200" "DELETE /shifts/assignments/:id — cleanup" "" "$OWNER_TOKEN"
fi

# Delete test category (will fail if items exist — that's expected)
test_endpoint "DELETE" "/menu/categories/${TEST_CAT_ID:-999}" "204" "DELETE /menu/categories/:id — cleanup" "" "$OWNER_TOKEN"

# POST /auth/logout — OWNER
test_endpoint "POST" "/auth/logout" "204" "POST /auth/logout — OWNER logout" "" "$OWNER_TOKEN"

# Verify logout invalidates session
test_endpoint "GET" "/auth/me" "401" "GET /auth/me — after logout (session invalidated)" "" "$OWNER_TOKEN"

# ============================================
# FINAL REPORT
# ============================================
echo -e "\n${CYAN}╔════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║           📊 API TEST RESULTS                  ║${NC}"
echo -e "${CYAN}╠════════════════════════════════════════════════╣${NC}"
echo -e "${CYAN}║${NC}  Total:  ${TOTAL}                                    ${CYAN}║${NC}"
echo -e "${CYAN}║${NC}  ${GREEN}Passed: ${PASS}${NC}                                    ${CYAN}║${NC}"
echo -e "${CYAN}║${NC}  ${RED}Failed: ${FAIL}${NC}                                    ${CYAN}║${NC}"

if [ $TOTAL -gt 0 ]; then
  PCT=$((PASS * 100 / TOTAL))
  echo -e "${CYAN}║${NC}  Rate:   ${PCT}%                                   ${CYAN}║${NC}"
fi

echo -e "${CYAN}╚════════════════════════════════════════════════╝${NC}"

if [ $FAIL -gt 0 ]; then
  echo -e "\n${RED}Failed Tests:${NC}"
  echo -e "$ERRORS"
  exit 1
else
  echo -e "\n${GREEN}🎉 All tests passed!${NC}"
  exit 0
fi
