CREATE TABLE IF NOT EXISTS orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  queue_number INT NOT NULL,
  cashier_id INT NOT NULL,
  barista_id INT NULL,
  status ENUM('PENDING', 'PREPARING', 'READY', 'COMPLETED', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
  total_amount DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  notes TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (cashier_id) REFERENCES users(id) ON DELETE RESTRICT,
  FOREIGN KEY (barista_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_orders_status (status),
  INDEX idx_orders_queue (queue_number, created_at),
  INDEX idx_orders_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
