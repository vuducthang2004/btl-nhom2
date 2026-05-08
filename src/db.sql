CREATE DATABASE CoffeeManagement;
USE CoffeeManagement;

-- ==========================================
-- 1. NHÓM QUẢN LÝ NGƯỜI DÙNG & PHÂN QUYỀN
-- ==========================================

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL, -- Mật khẩu đã được mã hóa
    full_name VARCHAR(100),
    role ENUM('owner', 'barista', 'waiter') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE work_schedules (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    shift_start DATETIME,
    shift_end DATETIME,
    date DATE,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- ==========================================
-- 2. NHÓM QUẢN LÝ MENU & KHO HÀNG
-- ==========================================

CREATE TABLE categories (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL
);

CREATE TABLE products (
    id INT PRIMARY KEY AUTO_INCREMENT,
    category_id INT,
    name VARCHAR(100) NOT NULL,
    base_price DECIMAL(10, 2),
    image_url VARCHAR(255),
    is_available BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (category_id) REFERENCES categories(id)
);

CREATE TABLE ingredients (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    unit VARCHAR(20), -- kg, lít, túi...
    quantity_in_stock DECIMAL(10, 2) DEFAULT 0,
    min_stock_level DECIMAL(10, 2) DEFAULT 5, -- Cảnh báo khi dưới mức này
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Định lượng nguyên liệu cho mỗi món (Recipe)
CREATE TABLE product_ingredients (
    product_id INT,
    ingredient_id INT,
    amount_needed DECIMAL(10, 2), -- Lượng cần dùng cho 1 món
    PRIMARY KEY (product_id, ingredient_id),
    FOREIGN KEY (product_id) REFERENCES products(id),
    FOREIGN KEY (ingredient_id) REFERENCES ingredients(id)
);

-- ==========================================
-- 3. NHÓM SƠ ĐỒ BÀN & ORDER
-- ==========================================

CREATE TABLE tables (
    id INT PRIMARY KEY AUTO_INCREMENT,
    table_number VARCHAR(10) NOT NULL,
    area VARCHAR(50), -- Tầng 1, Sân vườn...
    status ENUM('empty', 'occupied', 'reserved') DEFAULT 'empty'
);

CREATE TABLE orders (
    id INT PRIMARY KEY AUTO_INCREMENT,
    table_id INT,
    user_id INT, -- Nhân viên tạo order
    status ENUM('pending', 'processing', 'completed', 'cancelled') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (table_id) REFERENCES tables(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE order_details (
    id INT PRIMARY KEY AUTO_INCREMENT,
    order_id INT,
    product_id INT,
    quantity INT DEFAULT 1,
    note VARCHAR(255),
    status ENUM('waiting', 'making', 'done') DEFAULT 'waiting', -- Cho Barista
    price_at_time DECIMAL(10, 2), -- Lưu giá lúc bán để làm báo cáo
    FOREIGN KEY (order_id) REFERENCES orders(id),
    FOREIGN KEY (product_id) REFERENCES products(id)
);

-- ==========================================
-- 4. NHÓM THANH TOÁN & THỐNG KÊ
-- ==========================================

CREATE TABLE invoices (
    id INT PRIMARY KEY AUTO_INCREMENT,
    order_id INT,
    total_amount DECIMAL(10, 2),
    discount DECIMAL(10, 2) DEFAULT 0,
    final_amount DECIMAL(10, 2),
    payment_method ENUM('cash', 'transfer', 'e-wallet'),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id)
);

-- Nhật ký kho (Nhập hàng hoặc điều chỉnh thủ công)
CREATE TABLE inventory_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    ingredient_id INT,
    change_amount DECIMAL(10, 2),
    type ENUM('import', 'export', 'adjustment'),
    reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ingredient_id) REFERENCES ingredients(id)
);

1. Nhóm Quản lý Người dùng & Phân quyền
Bảng này lưu trữ thông tin nhân viên, chủ quán và vai trò của họ để kiểm soát quyền truy cập.

Users: Lưu thông tin đăng nhập.

id (PK), username, password, full_name, phone, role_id (FK), status (active/inactive).

Roles: Lưu các loại quyền (Admin, Staff, Barista).

id (PK), role_name.

WorkSchedules: Quản lý lịch làm việc của nhân viên.

id (PK), user_id (FK), shift_start, shift_end, date.

2. Nhóm Quản lý Thực đơn & Kho hàng
Hỗ trợ chức năng quản lý Menu và tự động trừ kho khi bán hàng.

Categories: Danh mục món (Cà phê, Trà, Bánh...).

id (PK), name.

Products: Danh sách món ăn/đồ uống.

id (PK), category_id (FK), name, base_price, image_url, is_available (còn/hết).

Ingredients: Danh mục nguyên liệu trong kho (Hạt cà phê, sữa tươi, đường...).

id (PK), name, unit (kg, lít, túi), quantity_in_stock, min_stock_level (để cảnh báo sắp hết).

ProductIngredients: Định lượng nguyên liệu cho từng món (Recipe).

product_id (FK), ingredient_id (FK), amount_needed.

Toppings: Các loại topping đi kèm.

id (PK), name, price.

3. Nhóm Sơ đồ bàn & Order (Thời gian thực)
Phục vụ chức năng quản lý trạng thái bàn và quy trình phục vụ.

Tables: Danh sách bàn trong quán.

id (PK), table_number, area (Tầng 1, Sân thượng...), status (Trống, Có khách, Đã đặt).

Orders: Thông tin tổng quát của một lượt khách.

id (PK), table_id (FK), user_id (FK - nhân viên tạo), status (Pending, Processing, Completed, Cancelled), created_at.

OrderDetails: Chi tiết từng món trong một đơn hàng.

id (PK), order_id (FK), product_id (FK), quantity, note (ít đường, đá riêng...), status (Chờ pha chế, Đang làm, Đã xong), price_at_time (giá lúc bán).

4. Nhóm Thanh toán & Báo cáo
Lưu trữ lịch sử giao dịch để phục vụ thống kê doanh thu.

Invoices: Hóa đơn thanh toán cuối cùng.

id (PK), order_id (FK), total_amount, discount, final_amount, payment_method (Cash, Banking, E-wallet), created_at.

InventoryTransactions: Nhật ký nhập/xuất kho (để báo cáo tồn kho).

id (PK), ingredient_id (FK), type (Import/Export), quantity, reason, created_at.

Mối quan hệ chính cần lưu ý:
Gộp/Tách bàn: Khi gộp bàn, bạn sẽ cập nhật table_id của các Orders hiện tại về cùng một ID bàn chính, hoặc tạo một bảng trung gian OrderTables nếu muốn một đơn hàng nằm trên nhiều bàn.

Tự động trừ kho: Khi một món trong OrderDetails chuyển sang trạng thái "Đã xong", hệ thống sẽ dựa vào bảng ProductIngredients để trừ số lượng tương ứng trong bảng Ingredients.

Barista View: Nhân viên pha chế sẽ truy vấn bảng OrderDetails lọc theo status = 'Chờ pha chế' và sắp xếp theo created_at tăng dần để làm theo thứ tự.