# ============================================
# Coffee Shop API — Full Integration Test (PowerShell)
# ============================================

$ErrorActionPreference = "Continue"
$BASE = "http://localhost:3000/api/v1"
$PASS = 0
$FAIL = 0
$TOTAL = 0
$ERRORS = @()

function Test-Endpoint {
  param(
    [string]$Method,
    [string]$Url,
    [int]$ExpectedStatus,
    [string]$Description,
    [string]$Body = "",
    [string]$Token = ""
  )

  $script:TOTAL++

  $headers = @{}
  if ($Token) { $headers["Authorization"] = "Bearer $Token" }
  if ($Body) { $headers["Content-Type"] = "application/json" }

  try {
    $params = @{
      Method = $Method
      Uri = "${BASE}${Url}"
      Headers = $headers
      ErrorAction = "Stop"
      SkipHttpErrorCheck = $true
    }
    if ($Body) { $params["Body"] = [System.Text.Encoding]::UTF8.GetBytes($Body) }
    $response = Invoke-WebRequest @params
    $status = $response.StatusCode
    $responseBody = $response.Content
  } catch {
    $status = 0
    $responseBody = $_.Exception.Message
  }

  if ($status -eq $ExpectedStatus) {
    Write-Host "  PASS [$status] $Description" -ForegroundColor Green
    $script:PASS++
  } else {
    Write-Host "  FAIL [$status] $Description (expected $ExpectedStatus)" -ForegroundColor Red
    $preview = if ($responseBody.Length -gt 200) { $responseBody.Substring(0, 200) } else { $responseBody }
    Write-Host "    Response: $preview" -ForegroundColor DarkRed
    $script:FAIL++
    $script:ERRORS += "  FAIL ${Description} -> got ${status}, expected ${ExpectedStatus}"
  }

  return $responseBody
}

function Section($title) {
  Write-Host ""
  Write-Host "======================================" -ForegroundColor Cyan
  Write-Host "  $title" -ForegroundColor Cyan
  Write-Host "======================================" -ForegroundColor Cyan
}

function MakeJson {
  param([hashtable]$Data)
  return ($Data | ConvertTo-Json -Compress -Depth 10)
}

# ============================================
# 0. Health Check
# ============================================
Section "Health Check"
$TOTAL++
try {
  $healthResp = Invoke-WebRequest -Uri "http://localhost:3000/health" -SkipHttpErrorCheck
  if ($healthResp.StatusCode -eq 200) {
    Write-Host "  PASS [200] Server is healthy" -ForegroundColor Green
    $PASS++
  } else {
    Write-Host "  FAIL Server returned $($healthResp.StatusCode)" -ForegroundColor Red
    $FAIL++; exit 1
  }
} catch {
  Write-Host "  FAIL Server not reachable" -ForegroundColor Red
  $FAIL++; exit 1
}

# ============================================
# 1. AUTH
# ============================================
Section "Auth Module"

$loginBody = MakeJson @{username="admin";password="admin123"}
$ownerResp = Invoke-WebRequest -Method POST -Uri "$BASE/auth/login" -Headers @{"Content-Type"="application/json"} -Body ([System.Text.Encoding]::UTF8.GetBytes($loginBody)) -SkipHttpErrorCheck
$ownerData = $ownerResp.Content | ConvertFrom-Json
$OWNER_TOKEN = $ownerData.data.accessToken
$OWNER_REFRESH = $ownerData.data.refreshToken
$TOTAL++
if ($OWNER_TOKEN) { Write-Host "  PASS [200] POST /auth/login (OWNER)" -ForegroundColor Green; $PASS++ }
else { Write-Host "  FAIL POST /auth/login (OWNER) - no token" -ForegroundColor Red; $FAIL++; exit 1 }

$loginBody = MakeJson @{username="cashier1";password="cashier123"}
$cashierResp = Invoke-WebRequest -Method POST -Uri "$BASE/auth/login" -Headers @{"Content-Type"="application/json"} -Body ([System.Text.Encoding]::UTF8.GetBytes($loginBody)) -SkipHttpErrorCheck
$cashierData = $cashierResp.Content | ConvertFrom-Json
$CASHIER_TOKEN = $cashierData.data.accessToken
$TOTAL++
if ($CASHIER_TOKEN) { Write-Host "  PASS [200] POST /auth/login (CASHIER)" -ForegroundColor Green; $PASS++ }
else { Write-Host "  FAIL POST /auth/login (CASHIER)" -ForegroundColor Red; $FAIL++ }

$loginBody = MakeJson @{username="barista1";password="barista123"}
$baristaResp = Invoke-WebRequest -Method POST -Uri "$BASE/auth/login" -Headers @{"Content-Type"="application/json"} -Body ([System.Text.Encoding]::UTF8.GetBytes($loginBody)) -SkipHttpErrorCheck
$baristaData = $baristaResp.Content | ConvertFrom-Json
$BARISTA_TOKEN = $baristaData.data.accessToken
$TOTAL++
if ($BARISTA_TOKEN) { Write-Host "  PASS [200] POST /auth/login (BARISTA)" -ForegroundColor Green; $PASS++ }
else { Write-Host "  FAIL POST /auth/login (BARISTA)" -ForegroundColor Red; $FAIL++ }

Test-Endpoint -Method POST -Url "/auth/login" -ExpectedStatus 401 -Description "POST /auth/login - invalid credentials" -Body (MakeJson @{username="admin";password="wrongpass"})

Test-Endpoint -Method POST -Url "/auth/refresh" -ExpectedStatus 200 -Description "POST /auth/refresh - OWNER" -Body (MakeJson @{refreshToken=$OWNER_REFRESH})

# Re-login after refresh
$loginBody = MakeJson @{username="admin";password="admin123"}
$ownerResp2 = Invoke-WebRequest -Method POST -Uri "$BASE/auth/login" -Headers @{"Content-Type"="application/json"} -Body ([System.Text.Encoding]::UTF8.GetBytes($loginBody)) -SkipHttpErrorCheck
$ownerData2 = $ownerResp2.Content | ConvertFrom-Json
$OWNER_TOKEN = $ownerData2.data.accessToken

Test-Endpoint -Method GET -Url "/auth/me" -ExpectedStatus 200 -Description "GET /auth/me - OWNER profile" -Token $OWNER_TOKEN
Test-Endpoint -Method GET -Url "/auth/me" -ExpectedStatus 401 -Description "GET /auth/me - no token (401)"

# ============================================
# 2. USERS
# ============================================
Section "Users Module"

$resp = Test-Endpoint -Method POST -Url "/users" -ExpectedStatus 201 -Description "POST /users - create test cashier" -Body (MakeJson @{username="test_cashier_api";password="test123";fullName="Test Cashier API";role="CASHIER"}) -Token $OWNER_TOKEN
try { $userData = $resp | ConvertFrom-Json; $CREATED_USER_ID = $userData.data.id } catch { $CREATED_USER_ID = $null }

Test-Endpoint -Method GET -Url "/users" -ExpectedStatus 200 -Description "GET /users - list all" -Token $OWNER_TOKEN

if ($CREATED_USER_ID) {
  Test-Endpoint -Method GET -Url "/users/$CREATED_USER_ID" -ExpectedStatus 200 -Description "GET /users/:id" -Token $OWNER_TOKEN
  Test-Endpoint -Method PUT -Url "/users/$CREATED_USER_ID" -ExpectedStatus 200 -Description "PUT /users/:id - update" -Body (MakeJson @{fullName="Updated Test Cashier"}) -Token $OWNER_TOKEN
  Test-Endpoint -Method PATCH -Url "/users/$CREATED_USER_ID/active" -ExpectedStatus 200 -Description "PATCH /users/:id/active - toggle" -Token $OWNER_TOKEN
  Test-Endpoint -Method PATCH -Url "/users/$CREATED_USER_ID/password" -ExpectedStatus 204 -Description "PATCH /users/:id/password - reset" -Body (MakeJson @{newPassword="newpass123"}) -Token $OWNER_TOKEN
}

Test-Endpoint -Method GET -Url "/users" -ExpectedStatus 403 -Description "GET /users - CASHIER forbidden (403)" -Token $CASHIER_TOKEN

# ============================================
# 3. MENU - Categories
# ============================================
Section "Menu - Categories"

Test-Endpoint -Method GET -Url "/menu/categories" -ExpectedStatus 200 -Description "GET /menu/categories" -Token $OWNER_TOKEN

$resp = Test-Endpoint -Method POST -Url "/menu/categories" -ExpectedStatus 201 -Description "POST /menu/categories - create" -Body (MakeJson @{name="Test Category API";description="For testing";sortOrder=99}) -Token $OWNER_TOKEN
try { $catData = $resp | ConvertFrom-Json; $TEST_CAT_ID = $catData.data.id } catch { $TEST_CAT_ID = $null }

if ($TEST_CAT_ID) {
  Test-Endpoint -Method PUT -Url "/menu/categories/$TEST_CAT_ID" -ExpectedStatus 200 -Description "PUT /menu/categories/:id - update" -Body (MakeJson @{name="Updated Test Category"}) -Token $OWNER_TOKEN
}

# ============================================
# 3b. MENU - Items
# ============================================
Section "Menu - Items"

Test-Endpoint -Method GET -Url "/menu/items" -ExpectedStatus 200 -Description "GET /menu/items" -Token $OWNER_TOKEN
Test-Endpoint -Method GET -Url "/menu/items?categoryId=1" -ExpectedStatus 200 -Description "GET /menu/items?categoryId=1" -Token $OWNER_TOKEN

$catForItem = if ($TEST_CAT_ID) { $TEST_CAT_ID } else { 1 }
$resp = Test-Endpoint -Method POST -Url "/menu/items" -ExpectedStatus 201 -Description "POST /menu/items - create" -Body (MakeJson @{categoryId=$catForItem;name="Test Item API";basePrice=25000}) -Token $OWNER_TOKEN
try { $itemData = $resp | ConvertFrom-Json; $TEST_ITEM_ID = $itemData.data.id } catch { $TEST_ITEM_ID = $null }

if ($TEST_ITEM_ID) {
  Test-Endpoint -Method GET -Url "/menu/items/$TEST_ITEM_ID" -ExpectedStatus 200 -Description "GET /menu/items/:id" -Token $OWNER_TOKEN
  Test-Endpoint -Method PUT -Url "/menu/items/$TEST_ITEM_ID" -ExpectedStatus 200 -Description "PUT /menu/items/:id - update" -Body (MakeJson @{name="Updated Test Item";basePrice=30000}) -Token $OWNER_TOKEN
  Test-Endpoint -Method PATCH -Url "/menu/items/$TEST_ITEM_ID/availability" -ExpectedStatus 200 -Description "PATCH /menu/items/:id/availability - toggle" -Token $OWNER_TOKEN
  Test-Endpoint -Method PATCH -Url "/menu/items/$TEST_ITEM_ID/availability" -ExpectedStatus 200 -Description "PATCH /menu/items/:id/availability - toggle back" -Token $OWNER_TOKEN
}

Test-Endpoint -Method PATCH -Url "/menu/items/1/availability" -ExpectedStatus 200 -Description "PATCH /menu/items/1/availability - BARISTA" -Token $BARISTA_TOKEN
Test-Endpoint -Method PATCH -Url "/menu/items/1/availability" -ExpectedStatus 200 -Description "PATCH /menu/items/1/availability - toggle back" -Token $BARISTA_TOKEN

# ============================================
# 3c. MENU - Toppings
# ============================================
Section "Menu - Toppings"

Test-Endpoint -Method GET -Url "/menu/toppings" -ExpectedStatus 200 -Description "GET /menu/toppings" -Token $OWNER_TOKEN

$resp = Test-Endpoint -Method POST -Url "/menu/toppings" -ExpectedStatus 201 -Description "POST /menu/toppings - create" -Body (MakeJson @{name="Test Topping API";price=5000}) -Token $OWNER_TOKEN
try { $toppingData = $resp | ConvertFrom-Json; $TEST_TOPPING_ID = $toppingData.data.id } catch { $TEST_TOPPING_ID = $null }

if ($TEST_TOPPING_ID) {
  Test-Endpoint -Method PUT -Url "/menu/toppings/$TEST_TOPPING_ID" -ExpectedStatus 200 -Description "PUT /menu/toppings/:id - update" -Body (MakeJson @{name="Updated Test Topping";price=7000}) -Token $OWNER_TOKEN
}

# ============================================
# 3d. MENU - Recipes
# ============================================
Section "Menu - Recipes"

Test-Endpoint -Method GET -Url "/menu/items/1/ingredients" -ExpectedStatus 200 -Description "GET /menu/items/1/ingredients" -Token $OWNER_TOKEN

if ($TEST_ITEM_ID) {
  $recipeBody = '{"items":[{"ingredientId":1,"quantityPerUnit":20}]}'
  Test-Endpoint -Method PUT -Url "/menu/items/$TEST_ITEM_ID/ingredients" -ExpectedStatus 200 -Description "PUT /menu/items/:id/ingredients - set recipe" -Body $recipeBody -Token $OWNER_TOKEN
}

Test-Endpoint -Method GET -Url "/menu/toppings/1/ingredients" -ExpectedStatus 200 -Description "GET /menu/toppings/1/ingredients" -Token $OWNER_TOKEN

if ($TEST_TOPPING_ID) {
  $recipeBody = '{"items":[{"ingredientId":2,"quantityPerUnit":15}]}'
  Test-Endpoint -Method PUT -Url "/menu/toppings/$TEST_TOPPING_ID/ingredients" -ExpectedStatus 200 -Description "PUT /menu/toppings/:id/ingredients - set recipe" -Body $recipeBody -Token $OWNER_TOKEN
}

# ============================================
# 4. INVENTORY
# ============================================
Section "Inventory Module"

Test-Endpoint -Method GET -Url "/inventory/ingredients" -ExpectedStatus 200 -Description "GET /inventory/ingredients" -Token $OWNER_TOKEN

$resp = Test-Endpoint -Method POST -Url "/inventory/ingredients" -ExpectedStatus 201 -Description "POST /inventory/ingredients - create" -Body (MakeJson @{name="Test Ingredient API";unit="g";stockQuantity=1000;minThreshold=100}) -Token $OWNER_TOKEN
try { $ingData = $resp | ConvertFrom-Json; $TEST_ING_ID = $ingData.data.id } catch { $TEST_ING_ID = $null }

if ($TEST_ING_ID) {
  Test-Endpoint -Method GET -Url "/inventory/ingredients/$TEST_ING_ID" -ExpectedStatus 200 -Description "GET /inventory/ingredients/:id" -Token $OWNER_TOKEN
  Test-Endpoint -Method PUT -Url "/inventory/ingredients/$TEST_ING_ID" -ExpectedStatus 200 -Description "PUT /inventory/ingredients/:id - update" -Body (MakeJson @{name="Updated Test Ingredient";minThreshold=200}) -Token $OWNER_TOKEN
  Test-Endpoint -Method PATCH -Url "/inventory/ingredients/$TEST_ING_ID/stock" -ExpectedStatus 200 -Description "PATCH /ingredients/:id/stock - add 500g" -Body (MakeJson @{quantity=500;action="add"}) -Token $OWNER_TOKEN
  Test-Endpoint -Method PATCH -Url "/inventory/ingredients/$TEST_ING_ID/stock" -ExpectedStatus 200 -Description "PATCH /ingredients/:id/stock - set 2000g" -Body (MakeJson @{quantity=2000;action="set"}) -Token $OWNER_TOKEN
  Test-Endpoint -Method PATCH -Url "/inventory/ingredients/$TEST_ING_ID/active" -ExpectedStatus 200 -Description "PATCH /ingredients/:id/active - toggle" -Token $OWNER_TOKEN
  Test-Endpoint -Method PATCH -Url "/inventory/ingredients/$TEST_ING_ID/active" -ExpectedStatus 200 -Description "PATCH /ingredients/:id/active - toggle back" -Token $OWNER_TOKEN
}

Test-Endpoint -Method GET -Url "/inventory/alerts" -ExpectedStatus 200 -Description "GET /inventory/alerts" -Token $OWNER_TOKEN
Test-Endpoint -Method GET -Url "/inventory/ingredients" -ExpectedStatus 403 -Description "GET /inventory/ingredients - CASHIER forbidden (403)" -Token $CASHIER_TOKEN

# ============================================
# 5. ORDERS
# ============================================
Section "Orders Module"

$orderBody = '{"items":[{"menuItemId":1,"quantity":2},{"menuItemId":2,"quantity":1,"toppingIds":[1]}]}'
$resp = Test-Endpoint -Method POST -Url "/orders" -ExpectedStatus 201 -Description "POST /orders - create (CASHIER)" -Body $orderBody -Token $CASHIER_TOKEN
try { $orderData = $resp | ConvertFrom-Json; $ORDER_ID = $orderData.data.id } catch { $ORDER_ID = $null }

Test-Endpoint -Method GET -Url "/orders" -ExpectedStatus 200 -Description "GET /orders - list all" -Token $CASHIER_TOKEN
Test-Endpoint -Method GET -Url "/orders?status=PENDING" -ExpectedStatus 200 -Description "GET /orders?status=PENDING" -Token $CASHIER_TOKEN

if ($ORDER_ID) {
  Test-Endpoint -Method GET -Url "/orders/$ORDER_ID" -ExpectedStatus 200 -Description "GET /orders/:id" -Token $CASHIER_TOKEN
  Test-Endpoint -Method PATCH -Url "/orders/$ORDER_ID/status" -ExpectedStatus 200 -Description "PATCH /orders/:id/status -> PREPARING" -Body (MakeJson @{status="PREPARING"}) -Token $BARISTA_TOKEN
  Test-Endpoint -Method PATCH -Url "/orders/$ORDER_ID/status" -ExpectedStatus 200 -Description "PATCH /orders/:id/status -> READY" -Body (MakeJson @{status="READY"}) -Token $BARISTA_TOKEN
  Test-Endpoint -Method PATCH -Url "/orders/$ORDER_ID/status" -ExpectedStatus 200 -Description "PATCH /orders/:id/status -> COMPLETED" -Body (MakeJson @{status="COMPLETED"}) -Token $BARISTA_TOKEN
}

Test-Endpoint -Method POST -Url "/orders" -ExpectedStatus 403 -Description "POST /orders - BARISTA forbidden (403)" -Body '{"items":[{"menuItemId":1,"quantity":1}]}' -Token $BARISTA_TOKEN

# ============================================
# 6. PAYMENTS
# ============================================
Section "Payments Module"

$payOrderBody = '{"items":[{"menuItemId":3,"quantity":1}]}'
$payResp = Invoke-WebRequest -Method POST -Uri "$BASE/orders" -Headers @{"Content-Type"="application/json";"Authorization"="Bearer $CASHIER_TOKEN"} -Body ([System.Text.Encoding]::UTF8.GetBytes($payOrderBody)) -SkipHttpErrorCheck
try { $payData = $payResp.Content | ConvertFrom-Json; $PAY_ORDER_ID = $payData.data.id } catch { $PAY_ORDER_ID = $null }

if ($PAY_ORDER_ID) {
  Test-Endpoint -Method POST -Url "/payments" -ExpectedStatus 201 -Description "POST /payments - CASH" -Body (MakeJson @{orderId=$PAY_ORDER_ID;method="CASH"}) -Token $CASHIER_TOKEN
  Test-Endpoint -Method POST -Url "/payments" -ExpectedStatus 409 -Description "POST /payments - duplicate (409)" -Body (MakeJson @{orderId=$PAY_ORDER_ID;method="CASH"}) -Token $CASHIER_TOKEN
  Test-Endpoint -Method GET -Url "/payments/$PAY_ORDER_ID" -ExpectedStatus 200 -Description "GET /payments/:orderId - CASHIER" -Token $CASHIER_TOKEN
  Test-Endpoint -Method GET -Url "/payments/$PAY_ORDER_ID" -ExpectedStatus 200 -Description "GET /payments/:orderId - OWNER" -Token $OWNER_TOKEN
}

# ============================================
# 7. KITCHEN
# ============================================
Section "Kitchen Module"

Invoke-WebRequest -Method POST -Uri "$BASE/orders" -Headers @{"Content-Type"="application/json";"Authorization"="Bearer $CASHIER_TOKEN"} -Body ([System.Text.Encoding]::UTF8.GetBytes('{"items":[{"menuItemId":1,"quantity":1}]}')) -SkipHttpErrorCheck | Out-Null

Test-Endpoint -Method GET -Url "/kitchen/queue" -ExpectedStatus 200 -Description "GET /kitchen/queue - BARISTA" -Token $BARISTA_TOKEN
Test-Endpoint -Method GET -Url "/kitchen/display" -ExpectedStatus 200 -Description "GET /kitchen/display - PUBLIC (no auth)"
Test-Endpoint -Method GET -Url "/kitchen/queue" -ExpectedStatus 403 -Description "GET /kitchen/queue - CASHIER forbidden (403)" -Token $CASHIER_TOKEN

# ============================================
# 8. REPORTS
# ============================================
Section "Reports Module"

Test-Endpoint -Method GET -Url "/reports/dashboard" -ExpectedStatus 200 -Description "GET /reports/dashboard" -Token $OWNER_TOKEN
Test-Endpoint -Method GET -Url "/reports/revenue/summary?period=daily&date=2026-05-24" -ExpectedStatus 200 -Description "GET /reports/revenue/summary - daily" -Token $OWNER_TOKEN
Test-Endpoint -Method GET -Url "/reports/revenue/summary?period=monthly&month=2026-05" -ExpectedStatus 200 -Description "GET /reports/revenue/summary - monthly" -Token $OWNER_TOKEN
Test-Endpoint -Method GET -Url "/reports/revenue/by-method?period=daily&date=2026-05-24" -ExpectedStatus 200 -Description "GET /reports/revenue/by-method" -Token $OWNER_TOKEN
Test-Endpoint -Method GET -Url "/reports/top-selling?period=monthly&month=2026-05&limit=5" -ExpectedStatus 200 -Description "GET /reports/top-selling - top 5" -Token $OWNER_TOKEN
Test-Endpoint -Method GET -Url "/reports/category-performance?period=daily&date=2026-05-24" -ExpectedStatus 200 -Description "GET /reports/category-performance" -Token $OWNER_TOKEN
Test-Endpoint -Method GET -Url "/reports/cashier-performance?period=daily&date=2026-05-24" -ExpectedStatus 200 -Description "GET /reports/cashier-performance" -Token $OWNER_TOKEN
Test-Endpoint -Method GET -Url "/reports/inventory/summary" -ExpectedStatus 200 -Description "GET /reports/inventory/summary" -Token $OWNER_TOKEN
Test-Endpoint -Method GET -Url "/reports/inventory/movements?page=1&limit=10" -ExpectedStatus 200 -Description "GET /reports/inventory/movements" -Token $OWNER_TOKEN
Test-Endpoint -Method GET -Url "/reports/export?type=revenue&period=daily&date=2026-05-24" -ExpectedStatus 200 -Description "GET /reports/export - CSV revenue" -Token $OWNER_TOKEN
Test-Endpoint -Method GET -Url "/reports/export?type=inventory" -ExpectedStatus 200 -Description "GET /reports/export - CSV inventory" -Token $OWNER_TOKEN
Test-Endpoint -Method GET -Url "/reports/dashboard" -ExpectedStatus 403 -Description "GET /reports/dashboard - CASHIER forbidden (403)" -Token $CASHIER_TOKEN

# ============================================
# 9. SHIFTS
# ============================================
Section "Shifts - Templates"

Test-Endpoint -Method GET -Url "/shifts" -ExpectedStatus 200 -Description "GET /shifts - list all" -Token $OWNER_TOKEN

$resp = Test-Endpoint -Method POST -Url "/shifts" -ExpectedStatus 201 -Description "POST /shifts - create" -Body (MakeJson @{name="Test Shift API";startTime="08:00";endTime="15:00"}) -Token $OWNER_TOKEN
try { $shiftData = $resp | ConvertFrom-Json; $SHIFT_ID = $shiftData.data.id } catch { $SHIFT_ID = $null }

if ($SHIFT_ID) {
  Test-Endpoint -Method PUT -Url "/shifts/$SHIFT_ID" -ExpectedStatus 200 -Description "PUT /shifts/:id - update" -Body (MakeJson @{name="Updated Test Shift";startTime="09:00";endTime="16:00"}) -Token $OWNER_TOKEN
  Test-Endpoint -Method PATCH -Url "/shifts/$SHIFT_ID/active" -ExpectedStatus 200 -Description "PATCH /shifts/:id/active - toggle" -Token $OWNER_TOKEN
  Test-Endpoint -Method PATCH -Url "/shifts/$SHIFT_ID/active" -ExpectedStatus 200 -Description "PATCH /shifts/:id/active - toggle back" -Token $OWNER_TOKEN
}

Section "Shifts - Assignments"

$meResp = Invoke-WebRequest -Method GET -Uri "$BASE/auth/me" -Headers @{"Authorization"="Bearer $CASHIER_TOKEN"} -SkipHttpErrorCheck
try { $meData = $meResp.Content | ConvertFrom-Json; $CASHIER_USER_ID = $meData.data.id } catch { $CASHIER_USER_ID = 2 }

$shiftForAssign = if ($SHIFT_ID) { $SHIFT_ID } else { 1 }
$userForAssign = if ($CASHIER_USER_ID) { $CASHIER_USER_ID } else { 2 }

$resp = Test-Endpoint -Method POST -Url "/shifts/assignments" -ExpectedStatus 201 -Description "POST /shifts/assignments - single" -Body (MakeJson @{shiftId=$shiftForAssign;userId=$userForAssign;workDate="2026-05-26"}) -Token $OWNER_TOKEN
try { $assignData = $resp | ConvertFrom-Json; $ASSIGNMENT_ID = $assignData.data.id } catch { $ASSIGNMENT_ID = $null }

$bulkBody = MakeJson @{shiftId=$shiftForAssign;userId=$userForAssign;startDate="2026-06-01";endDate="2026-06-06";daysOfWeek=@(1,2,3,4,5)}
Test-Endpoint -Method POST -Url "/shifts/assignments" -ExpectedStatus 201 -Description "POST /shifts/assignments - bulk (Mon-Fri)" -Body $bulkBody -Token $OWNER_TOKEN

Test-Endpoint -Method GET -Url "/shifts/assignments" -ExpectedStatus 200 -Description "GET /shifts/assignments - list" -Token $OWNER_TOKEN
Test-Endpoint -Method GET -Url "/shifts/assignments?userId=$userForAssign" -ExpectedStatus 200 -Description "GET /shifts/assignments?userId - filter" -Token $OWNER_TOKEN

if ($ASSIGNMENT_ID) {
  Test-Endpoint -Method PUT -Url "/shifts/assignments/$ASSIGNMENT_ID" -ExpectedStatus 200 -Description "PUT /shifts/assignments/:id - update" -Body (MakeJson @{notes="Updated via API test"}) -Token $OWNER_TOKEN
}

Test-Endpoint -Method GET -Url "/shifts/my-schedule" -ExpectedStatus 200 -Description "GET /shifts/my-schedule - CASHIER" -Token $CASHIER_TOKEN
Test-Endpoint -Method GET -Url "/shifts/my-schedule?from=2026-05-01&to=2026-06-30" -ExpectedStatus 200 -Description "GET /shifts/my-schedule - with range" -Token $CASHIER_TOKEN

# ============================================
# 10. ATTENDANCE
# ============================================
Section "Attendance Module"

Test-Endpoint -Method POST -Url "/attendance/check-in" -ExpectedStatus 200 -Description "POST /attendance/check-in - CASHIER" -Token $CASHIER_TOKEN
Test-Endpoint -Method POST -Url "/attendance/check-out" -ExpectedStatus 200 -Description "POST /attendance/check-out - CASHIER" -Token $CASHIER_TOKEN
Test-Endpoint -Method GET -Url "/attendance/my-history" -ExpectedStatus 200 -Description "GET /attendance/my-history - CASHIER" -Token $CASHIER_TOKEN
Test-Endpoint -Method GET -Url "/attendance/my-history?from=2026-05-01&to=2026-06-30" -ExpectedStatus 200 -Description "GET /attendance/my-history - with range" -Token $CASHIER_TOKEN

if ($ASSIGNMENT_ID) {
  Test-Endpoint -Method POST -Url "/attendance/override" -ExpectedStatus 200 -Description "POST /attendance/override - OWNER" -Body (MakeJson @{assignmentId=$ASSIGNMENT_ID;checkInAt="2026-05-26T08:00";checkOutAt="2026-05-26T15:00";notes="API test override"}) -Token $OWNER_TOKEN
}

Test-Endpoint -Method GET -Url "/attendance" -ExpectedStatus 200 -Description "GET /attendance - OWNER list" -Token $OWNER_TOKEN
Test-Endpoint -Method GET -Url "/attendance?userId=$userForAssign" -ExpectedStatus 200 -Description "GET /attendance?userId - filter" -Token $OWNER_TOKEN
Test-Endpoint -Method GET -Url "/attendance/summary?from=2026-05-01&to=2026-06-30" -ExpectedStatus 200 -Description "GET /attendance/summary" -Token $OWNER_TOKEN
Test-Endpoint -Method GET -Url "/attendance" -ExpectedStatus 403 -Description "GET /attendance - CASHIER forbidden (403)" -Token $CASHIER_TOKEN

# ============================================
# 11. VALIDATION & EDGE CASES
# ============================================
Section "Validation and Edge Cases"

Test-Endpoint -Method POST -Url "/auth/login" -ExpectedStatus 400 -Description "POST /auth/login - empty body (400)" -Body "{}"
Test-Endpoint -Method POST -Url "/users" -ExpectedStatus 400 -Description "POST /users - invalid role (400)" -Body (MakeJson @{username="bad";password="test";fullName="Bad";role="SUPERADMIN"}) -Token $OWNER_TOKEN
Test-Endpoint -Method POST -Url "/orders" -ExpectedStatus 400 -Description "POST /orders - empty items (400)" -Body '{"items":[]}' -Token $CASHIER_TOKEN
Test-Endpoint -Method GET -Url "/auth/me" -ExpectedStatus 401 -Description "GET /auth/me - invalid token (401)" -Token "invalid.token.here"
Test-Endpoint -Method GET -Url "/users/99999" -ExpectedStatus 404 -Description "GET /users/99999 - not found (404)" -Token $OWNER_TOKEN

# ============================================
# 12. CLEANUP
# ============================================
Section "Cleanup"

if ($ASSIGNMENT_ID) {
  Test-Endpoint -Method DELETE -Url "/shifts/assignments/$ASSIGNMENT_ID" -ExpectedStatus 200 -Description "DELETE /shifts/assignments/:id - cleanup" -Token $OWNER_TOKEN
}

if ($TEST_CAT_ID) {
  Test-Endpoint -Method DELETE -Url "/menu/categories/$TEST_CAT_ID" -ExpectedStatus 204 -Description "DELETE /menu/categories/:id - cleanup" -Token $OWNER_TOKEN
}

Test-Endpoint -Method POST -Url "/auth/logout" -ExpectedStatus 204 -Description "POST /auth/logout - OWNER" -Token $OWNER_TOKEN
Test-Endpoint -Method GET -Url "/auth/me" -ExpectedStatus 401 -Description "GET /auth/me - after logout (invalidated)" -Token $OWNER_TOKEN

# ============================================
# FINAL REPORT
# ============================================
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "         API TEST RESULTS" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Total:  $TOTAL" -ForegroundColor White
Write-Host "  Passed: $PASS" -ForegroundColor Green
Write-Host "  Failed: $FAIL" -ForegroundColor Red

if ($TOTAL -gt 0) {
  $PCT = [math]::Round(($PASS / $TOTAL) * 100, 1)
  Write-Host "  Rate:   ${PCT}%" -ForegroundColor Cyan
}

Write-Host "========================================" -ForegroundColor Cyan

if ($FAIL -gt 0) {
  Write-Host ""
  Write-Host "Failed Tests:" -ForegroundColor Red
  $ERRORS | ForEach-Object { Write-Host $_ -ForegroundColor Red }
  exit 1
} else {
  Write-Host ""
  Write-Host "All tests passed!" -ForegroundColor Green
  exit 0
}
