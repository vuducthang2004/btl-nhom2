

-- 1. Bảng Vai trò
CREATE TABLE roles (
    role_id SERIAL PRIMARY KEY,
    role_name VARCHAR(50) NOT NULL -- Admin, Staff, Barista
);

-- 2. Bảng Nhân viên
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    full_name VARCHAR(100),
    role_id INT REFERENCES roles(role_id),
    status VARCHAR(20) DEFAULT 'active', -- active, inactive
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Bảng Lịch làm việc
CREATE TABLE schedules (
    schedule_id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(user_id),
    work_date DATE NOT NULL,
    shift_type VARCHAR(20), -- Ca sáng, Ca chiều, Ca gãy
    start_time TIME,
    end_time TIME
);


-- 4. Bảng Khu vực (Tầng 1, Tầng 2, Ngoài trời...)
CREATE TABLE areas (
    area_id SERIAL PRIMARY KEY,
    area_name VARCHAR(50) NOT NULL
);

-- 5. Bảng Bàn
CREATE TABLE dining_tables (
    table_id SERIAL PRIMARY KEY,
    table_number VARCHAR(10) NOT NULL,
    area_id INT REFERENCES areas(area_id),
    status VARCHAR(20) DEFAULT 'available' -- available, occupied, reserved, cleaning
);

-- 6. Danh mục món
CREATE TABLE categories (
    category_id SERIAL PRIMARY KEY,
    category_name VARCHAR(100) NOT NULL
);

-- 7. Bảng Sản phẩm (Món)
CREATE TABLE products (
    product_id SERIAL PRIMARY KEY,
    category_id INT REFERENCES categories(category_id),
    product_name VARCHAR(100) NOT NULL,
    base_price DECIMAL(10, 2) NOT NULL,
    is_available BOOLEAN DEFAULT TRUE, -- Barista cập nhật khi hết món
    image_url TEXT
);


-- 8. Bảng Hóa đơn (Order chính)
CREATE TABLE orders (
    order_id SERIAL PRIMARY KEY,
    table_id INT REFERENCES dining_tables(table_id),
    user_id INT REFERENCES users(user_id), -- Nhân viên tạo order
    total_amount DECIMAL(10, 2) DEFAULT 0,
    status VARCHAR(20) DEFAULT 'pending', -- pending, paid, cancelled
    payment_method VARCHAR(30), -- cash, banking, e-wallet
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 9. Chi tiết từng món trong Order
CREATE TABLE order_items (
    order_item_id SERIAL PRIMARY KEY,
    order_id INT REFERENCES orders(order_id) ON DELETE CASCADE,
    product_id INT REFERENCES products(product_id),
    quantity INT NOT NULL,
    note TEXT,
    status VARCHAR(20) DEFAULT 'waiting', -- waiting, preparing, ready, served
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);



-- 10. Bảng Nguyên liệu thô
CREATE TABLE ingredients (
    ingredient_id SERIAL PRIMARY KEY,
    ingredient_name VARCHAR(100) NOT NULL,
    unit VARCHAR(20), -- g, ml, cái, túi
    stock_quantity DECIMAL(10, 2) DEFAULT 0,
    min_stock_level DECIMAL(10, 2) DEFAULT 10 -- Ngưỡng cảnh báo sắp hết
);

-- 11. Định lượng món ăn (Công thức)
CREATE TABLE recipes (
    recipe_id SERIAL PRIMARY KEY,
    product_id INT REFERENCES products(product_id),
    ingredient_id INT REFERENCES ingredients(ingredient_id),
    dosage DECIMAL(10, 2) NOT NULL -- Lượng nguyên liệu cho 1 đơn vị sản phẩm
);

-- 12. Lịch sử nhập/xuất kho
CREATE TABLE inventory_log (
    log_id SERIAL PRIMARY KEY,
    ingredient_id INT REFERENCES ingredients(ingredient_id),
    change_quantity DECIMAL(10, 2),
    type VARCHAR(20), -- import, export, waste
    reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
