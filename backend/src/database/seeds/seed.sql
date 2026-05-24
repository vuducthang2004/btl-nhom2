-- ============================================
-- Coffee Shop Seed Data
-- Default OWNER: admin / admin123
-- ============================================

-- OWNER account (password: admin123, bcrypt hash)
INSERT IGNORE INTO users (username, password_hash, full_name, role) VALUES
('admin', '$2a$12$LJ3m4ys3Lk0TSwHjmK8mQOKGEsZTn4I0mVXqRXpLKq.VYxFdOdkS2', 'Admin Owner', 'OWNER');

-- Cashier account (password: cashier123)
INSERT IGNORE INTO users (username, password_hash, full_name, role) VALUES
('cashier1', '$2a$12$LJ3m4ys3Lk0TSwHjmK8mQOKGEsZTn4I0mVXqRXpLKq.VYxFdOdkS2', 'Thu Ngân 1', 'CASHIER');

-- Barista account (password: barista123)
INSERT IGNORE INTO users (username, password_hash, full_name, role) VALUES
('barista1', '$2a$12$LJ3m4ys3Lk0TSwHjmK8mQOKGEsZTn4I0mVXqRXpLKq.VYxFdOdkS2', 'Barista 1', 'BARISTA');

-- ============================================
-- Categories
-- ============================================
INSERT IGNORE INTO categories (id, name, description, sort_order) VALUES
(1, 'Cà Phê', 'Các loại cà phê truyền thống và hiện đại', 1),
(2, 'Trà', 'Trà sữa, trà trái cây, trà thảo mộc', 2),
(3, 'Đá Xay & Sinh Tố', 'Đá xay, smoothie, sinh tố trái cây', 3);

-- ============================================
-- Menu Items
-- ============================================
-- Cà Phê (category_id = 1)
INSERT IGNORE INTO menu_items (id, category_id, name, description, base_price, sort_order) VALUES
(1, 1, 'Cà Phê Đen', 'Cà phê đen truyền thống', 25000, 1),
(2, 1, 'Cà Phê Sữa', 'Cà phê sữa đá', 29000, 2),
(3, 1, 'Bạc Xỉu', 'Bạc xỉu đá', 29000, 3),
(4, 1, 'Cappuccino', 'Cappuccino kiểu Ý', 45000, 4),
(5, 1, 'Latte', 'Caffe Latte', 45000, 5),
(6, 1, 'Americano', 'Americano nóng/đá', 39000, 6);

-- Trà (category_id = 2)
INSERT IGNORE INTO menu_items (id, category_id, name, description, base_price, sort_order) VALUES
(7, 2, 'Trà Sữa Trân Châu', 'Trà sữa truyền thống với trân châu đen', 35000, 1),
(8, 2, 'Trà Đào Cam Sả', 'Trà đào với cam tươi và sả', 39000, 2),
(9, 2, 'Trà Sen Vàng', 'Trà hoa sen thanh mát', 35000, 3),
(10, 2, 'Trà Vải', 'Trà vải tươi mát lạnh', 35000, 4);

-- Đá Xay (category_id = 3)
INSERT IGNORE INTO menu_items (id, category_id, name, description, base_price, sort_order) VALUES
(11, 3, 'Freeze Trà Xanh', 'Đá xay trà xanh matcha', 49000, 1),
(12, 3, 'Freeze Socola', 'Đá xay socola đậm vị', 49000, 2),
(13, 3, 'Sinh Tố Bơ', 'Sinh tố bơ béo ngậy', 39000, 3);

-- ============================================
-- Toppings
-- ============================================
INSERT IGNORE INTO toppings (id, name, price) VALUES
(1, 'Trân Châu Đen', 10000),
(2, 'Trân Châu Trắng', 10000),
(3, 'Thạch Cà Phê', 10000),
(4, 'Shot Espresso', 15000),
(5, 'Kem Whip', 10000),
(6, 'Sốt Caramel', 5000);

-- ============================================
-- Menu Item Toppings (which toppings go with which items)
-- ============================================
-- Cà phê items can have Shot Espresso, Kem Whip, Sốt Caramel
INSERT IGNORE INTO menu_item_toppings (menu_item_id, topping_id) VALUES
(1, 4), (1, 5),
(2, 4), (2, 5), (2, 6),
(3, 4), (3, 5),
(4, 4), (4, 5), (4, 6),
(5, 4), (5, 5), (5, 6),
(6, 4), (6, 5);

-- Trà items can have Trân Châu, Thạch
INSERT IGNORE INTO menu_item_toppings (menu_item_id, topping_id) VALUES
(7, 1), (7, 2), (7, 3),
(8, 1), (8, 2),
(9, 1), (9, 2),
(10, 1), (10, 2);

-- Đá Xay items can have Kem Whip, Sốt Caramel
INSERT IGNORE INTO menu_item_toppings (menu_item_id, topping_id) VALUES
(11, 5), (11, 6),
(12, 5), (12, 6),
(13, 5);
