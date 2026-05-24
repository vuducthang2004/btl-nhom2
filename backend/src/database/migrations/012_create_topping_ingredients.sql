CREATE TABLE IF NOT EXISTS topping_ingredients (
  id INT AUTO_INCREMENT PRIMARY KEY,
  topping_id INT NOT NULL,
  ingredient_id INT NOT NULL,
  quantity_per_unit DECIMAL(10, 2) NOT NULL,
  FOREIGN KEY (topping_id) REFERENCES toppings(id) ON DELETE CASCADE,
  FOREIGN KEY (ingredient_id) REFERENCES ingredients(id) ON DELETE RESTRICT,
  UNIQUE KEY uq_topping_ingredient (topping_id, ingredient_id),
  INDEX idx_topping_ingredients_topping (topping_id),
  INDEX idx_topping_ingredients_ingredient (ingredient_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
