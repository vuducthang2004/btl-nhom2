CREATE TABLE IF NOT EXISTS inventory_movements (
  id INT AUTO_INCREMENT PRIMARY KEY,
  ingredient_id INT NOT NULL,
  change_type ENUM('DEDUCT_ORDER', 'ADJUST_ADD', 'ADJUST_SET', 'INITIAL') NOT NULL,
  quantity_change DECIMAL(10,2) NOT NULL,
  stock_before DECIMAL(10,2) NOT NULL,
  stock_after DECIMAL(10,2) NOT NULL,
  reference_id INT NULL,
  note VARCHAR(255) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (ingredient_id) REFERENCES ingredients(id) ON DELETE RESTRICT,
  INDEX idx_movements_ingredient_date (ingredient_id, created_at),
  INDEX idx_movements_type (change_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
