CREATE TABLE IF NOT EXISTS order_item_toppings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_item_id INT NOT NULL,
  topping_id INT NOT NULL,
  topping_price DECIMAL(10, 2) NOT NULL,
  FOREIGN KEY (order_item_id) REFERENCES order_items(id) ON DELETE CASCADE,
  FOREIGN KEY (topping_id) REFERENCES toppings(id) ON DELETE RESTRICT,
  INDEX idx_order_item_toppings_item (order_item_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
