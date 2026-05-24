CREATE TABLE IF NOT EXISTS attendance_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  assignment_id INT NOT NULL,
  user_id INT NOT NULL,
  check_in_at DATETIME NULL,
  check_out_at DATETIME NULL,
  status ENUM('ON_TIME', 'LATE', 'EARLY_LEAVE', 'ABSENT') NOT NULL DEFAULT 'ON_TIME',
  actual_hours DECIMAL(4,2) NULL,
  notes VARCHAR(255) NULL,
  created_by INT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_attendance_assignment (assignment_id),
  FOREIGN KEY (assignment_id) REFERENCES shift_assignments(id) ON DELETE RESTRICT,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_attendance_user_date (user_id, check_in_at),
  INDEX idx_attendance_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
