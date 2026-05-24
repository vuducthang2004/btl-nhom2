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
