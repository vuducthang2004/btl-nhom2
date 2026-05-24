CREATE TABLE IF NOT EXISTS ingredients (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  unit ENUM('g','kg','ml','l','unit','pack','shot','pump','tbsp') NOT NULL,
  stock_quantity DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  min_threshold DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_ingredient_name (name),
  INDEX idx_ingredients_active (is_active),
  INDEX idx_ingredients_stock (stock_quantity, min_threshold)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
