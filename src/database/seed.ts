import 'dotenv/config';
import { pool } from '../config/database.js';
import { hashPassword } from '../utils/hash.js';

async function seed(): Promise<void> {
  const connection = await pool.getConnection();

  try {
    // Generate bcrypt hashes
    const adminHash = await hashPassword('admin123');
    const cashierHash = await hashPassword('cashier123');
    const baristaHash = await hashPassword('barista123');

    console.log('🗑️  Clearing existing data...');
    await connection.execute('SET FOREIGN_KEY_CHECKS = 0');
    await connection.execute('TRUNCATE TABLE attendance_logs');
    await connection.execute('TRUNCATE TABLE shift_assignments');
    await connection.execute('TRUNCATE TABLE shifts');
    await connection.execute('TRUNCATE TABLE inventory_movements');
    await connection.execute('TRUNCATE TABLE topping_ingredients');
    await connection.execute('TRUNCATE TABLE menu_item_ingredients');
    await connection.execute('TRUNCATE TABLE ingredients');
    await connection.execute('TRUNCATE TABLE order_item_toppings');
    await connection.execute('TRUNCATE TABLE order_items');
    await connection.execute('TRUNCATE TABLE payments');
    await connection.execute('TRUNCATE TABLE orders');
    await connection.execute('TRUNCATE TABLE menu_item_toppings');
    await connection.execute('TRUNCATE TABLE toppings');
    await connection.execute('TRUNCATE TABLE menu_items');
    await connection.execute('TRUNCATE TABLE categories');
    await connection.execute('TRUNCATE TABLE users');
    await connection.execute('SET FOREIGN_KEY_CHECKS = 1');

    // Users
    await connection.execute(
      'INSERT INTO users (username, password_hash, full_name, role) VALUES (?, ?, ?, ?)',
      ['admin', adminHash, 'Admin Owner', 'OWNER']
    );
    await connection.execute(
      'INSERT INTO users (username, password_hash, full_name, role) VALUES (?, ?, ?, ?)',
      ['cashier1', cashierHash, 'Thu Ngân 1', 'CASHIER']
    );
    await connection.execute(
      'INSERT INTO users (username, password_hash, full_name, role) VALUES (?, ?, ?, ?)',
      ['barista1', baristaHash, 'Barista 1', 'BARISTA']
    );

    // Categories
    await connection.execute(
      'INSERT INTO categories (id, name, description, sort_order) VALUES (1, ?, ?, 1), (2, ?, ?, 2), (3, ?, ?, 3)',
      ['Cà Phê', 'Các loại cà phê truyền thống và hiện đại', 'Trà', 'Trà sữa, trà trái cây, trà thảo mộc', 'Đá Xay & Sinh Tố', 'Đá xay, smoothie, sinh tố trái cây']
    );

    // Menu Items - Cà Phê
    await connection.execute(`INSERT INTO menu_items (id, category_id, name, description, base_price, sort_order) VALUES
      (1, 1, 'Cà Phê Đen', 'Cà phê đen truyền thống', 25000, 1),
      (2, 1, 'Cà Phê Sữa', 'Cà phê sữa đá', 29000, 2),
      (3, 1, 'Bạc Xỉu', 'Bạc xỉu đá', 29000, 3),
      (4, 1, 'Cappuccino', 'Cappuccino kiểu Ý', 45000, 4),
      (5, 1, 'Latte', 'Caffe Latte', 45000, 5),
      (6, 1, 'Americano', 'Americano nóng/đá', 39000, 6)`);

    // Menu Items - Trà
    await connection.execute(`INSERT INTO menu_items (id, category_id, name, description, base_price, sort_order) VALUES
      (7, 2, 'Trà Sữa Trân Châu', 'Trà sữa truyền thống với trân châu đen', 35000, 1),
      (8, 2, 'Trà Đào Cam Sả', 'Trà đào với cam tươi và sả', 39000, 2),
      (9, 2, 'Trà Sen Vàng', 'Trà hoa sen thanh mát', 35000, 3),
      (10, 2, 'Trà Vải', 'Trà vải tươi mát lạnh', 35000, 4)`);

    // Menu Items - Đá Xay
    await connection.execute(`INSERT INTO menu_items (id, category_id, name, description, base_price, sort_order) VALUES
      (11, 3, 'Freeze Trà Xanh', 'Đá xay trà xanh matcha', 49000, 1),
      (12, 3, 'Freeze Socola', 'Đá xay socola đậm vị', 49000, 2),
      (13, 3, 'Sinh Tố Bơ', 'Sinh tố bơ béo ngậy', 39000, 3)`);

    // Toppings
    await connection.execute(`INSERT INTO toppings (id, name, price) VALUES
      (1, 'Trân Châu Đen', 10000),
      (2, 'Trân Châu Trắng', 10000),
      (3, 'Thạch Cà Phê', 10000),
      (4, 'Shot Espresso', 15000),
      (5, 'Kem Whip', 10000),
      (6, 'Sốt Caramel', 5000)`);

    // Menu Item Toppings
    await connection.execute(`INSERT INTO menu_item_toppings (menu_item_id, topping_id) VALUES
      (1, 4), (1, 5), (2, 4), (2, 5), (2, 6), (3, 4), (3, 5),
      (4, 4), (4, 5), (4, 6), (5, 4), (5, 5), (5, 6), (6, 4), (6, 5),
      (7, 1), (7, 2), (7, 3), (8, 1), (8, 2), (9, 1), (9, 2), (10, 1), (10, 2),
      (11, 5), (11, 6), (12, 5), (12, 6), (13, 5)`);

    // ============================================
    // Phase 2: Ingredients
    // ============================================
    console.log('🧪 Seeding ingredients...');

    await connection.execute(`INSERT INTO ingredients (id, name, unit, stock_quantity, min_threshold) VALUES
      (1,  'Cà phê Robusta',      'g',    5000,  500),
      (2,  'Sữa tươi',            'ml',  10000, 1000),
      (3,  'Sữa đặc',             'ml',   5000,  500),
      (4,  'Đường',                'g',    5000,  500),
      (5,  'Đá viên',             'unit',  2000,  200),
      (6,  'Trà đen (lá)',        'g',    3000,  300),
      (7,  'Matcha',               'g',    1000,  100),
      (8,  'Bột cacao',            'g',    2000,  200),
      (9,  'Bơ',                   'g',    3000,  300),
      (10, 'Kem whipping',         'ml',   3000,  300),
      (11, 'Bột trân châu đen',   'g',    2000,  200),
      (12, 'Bột trân châu trắng', 'g',    2000,  200),
      (13, 'Đường đen',            'ml',   2000,  200),
      (14, 'Syrup caramel',        'ml',   1500,  150),
      (15, 'Đào (lon)',            'unit',   50,    5)`);

    // ============================================
    // Phase 2: Menu Item Ingredients (Recipes)
    // ============================================
    console.log('📋 Seeding recipes (menu item ingredients)...');

    // 1. Cà Phê Đen: Robusta 18g, Đá 5, Đường 10g
    await connection.execute(`INSERT INTO menu_item_ingredients (menu_item_id, ingredient_id, quantity_per_unit) VALUES
      (1, 1, 18), (1, 5, 5), (1, 4, 10)`);

    // 2. Cà Phê Sữa: Robusta 18g, Sữa đặc 30ml, Đá 5
    await connection.execute(`INSERT INTO menu_item_ingredients (menu_item_id, ingredient_id, quantity_per_unit) VALUES
      (2, 1, 18), (2, 3, 30), (2, 5, 5)`);

    // 3. Bạc Xỉu: Robusta 10g, Sữa tươi 100ml, Sữa đặc 20ml, Đá 5
    await connection.execute(`INSERT INTO menu_item_ingredients (menu_item_id, ingredient_id, quantity_per_unit) VALUES
      (3, 1, 10), (3, 2, 100), (3, 3, 20), (3, 5, 5)`);

    // 4. Cappuccino: Robusta 18g, Sữa tươi 150ml
    await connection.execute(`INSERT INTO menu_item_ingredients (menu_item_id, ingredient_id, quantity_per_unit) VALUES
      (4, 1, 18), (4, 2, 150)`);

    // 5. Latte: Robusta 18g, Sữa tươi 200ml
    await connection.execute(`INSERT INTO menu_item_ingredients (menu_item_id, ingredient_id, quantity_per_unit) VALUES
      (5, 1, 18), (5, 2, 200)`);

    // 6. Americano: Robusta 18g, Đá 5
    await connection.execute(`INSERT INTO menu_item_ingredients (menu_item_id, ingredient_id, quantity_per_unit) VALUES
      (6, 1, 18), (6, 5, 5)`);

    // 7. Trà Sữa Trân Châu: Trà đen 5g, Sữa tươi 100ml, Đường 15g, Đá 5
    await connection.execute(`INSERT INTO menu_item_ingredients (menu_item_id, ingredient_id, quantity_per_unit) VALUES
      (7, 6, 5), (7, 2, 100), (7, 4, 15), (7, 5, 5)`);

    // 8. Trà Đào Cam Sả: Trà đen 5g, Đào 1, Đường 10g, Đá 5
    await connection.execute(`INSERT INTO menu_item_ingredients (menu_item_id, ingredient_id, quantity_per_unit) VALUES
      (8, 6, 5), (8, 15, 1), (8, 4, 10), (8, 5, 5)`);

    // 9. Trà Sen Vàng: Trà đen 5g, Đường 15g, Đá 5
    await connection.execute(`INSERT INTO menu_item_ingredients (menu_item_id, ingredient_id, quantity_per_unit) VALUES
      (9, 6, 5), (9, 4, 15), (9, 5, 5)`);

    // 10. Trà Vải: Trà đen 5g, Đường 15g, Đá 5
    await connection.execute(`INSERT INTO menu_item_ingredients (menu_item_id, ingredient_id, quantity_per_unit) VALUES
      (10, 6, 5), (10, 4, 15), (10, 5, 5)`);

    // 11. Freeze Trà Xanh: Matcha 10g, Sữa tươi 100ml, Đá 8, Kem whipping 30ml
    await connection.execute(`INSERT INTO menu_item_ingredients (menu_item_id, ingredient_id, quantity_per_unit) VALUES
      (11, 7, 10), (11, 2, 100), (11, 5, 8), (11, 10, 30)`);

    // 12. Freeze Socola: Bột cacao 20g, Sữa tươi 100ml, Đá 8, Kem whipping 30ml
    await connection.execute(`INSERT INTO menu_item_ingredients (menu_item_id, ingredient_id, quantity_per_unit) VALUES
      (12, 8, 20), (12, 2, 100), (12, 5, 8), (12, 10, 30)`);

    // 13. Sinh Tố Bơ: Bơ 100g, Sữa đặc 30ml, Đá 8
    await connection.execute(`INSERT INTO menu_item_ingredients (menu_item_id, ingredient_id, quantity_per_unit) VALUES
      (13, 9, 100), (13, 3, 30), (13, 5, 8)`);

    // ============================================
    // Phase 2: Topping Ingredients (Recipes)
    // ============================================
    console.log('📋 Seeding topping recipes...');

    // 1. Trân Châu Đen: Bột trân châu đen 30g, Đường đen 10ml
    await connection.execute(`INSERT INTO topping_ingredients (topping_id, ingredient_id, quantity_per_unit) VALUES
      (1, 11, 30), (1, 13, 10)`);

    // 2. Trân Châu Trắng: Bột trân châu trắng 30g, Đường 5g
    await connection.execute(`INSERT INTO topping_ingredients (topping_id, ingredient_id, quantity_per_unit) VALUES
      (2, 12, 30), (2, 4, 5)`);

    // 3. Thạch Cà Phê: Cà phê Robusta 5g, Đường 5g
    await connection.execute(`INSERT INTO topping_ingredients (topping_id, ingredient_id, quantity_per_unit) VALUES
      (3, 1, 5), (3, 4, 5)`);

    // 4. Shot Espresso: Cà phê Robusta 18g
    await connection.execute(`INSERT INTO topping_ingredients (topping_id, ingredient_id, quantity_per_unit) VALUES
      (4, 1, 18)`);

    // 5. Kem Whip: Kem whipping 30ml
    await connection.execute(`INSERT INTO topping_ingredients (topping_id, ingredient_id, quantity_per_unit) VALUES
      (5, 10, 30)`);

    // 6. Sốt Caramel: Syrup caramel 15ml
    await connection.execute(`INSERT INTO topping_ingredients (topping_id, ingredient_id, quantity_per_unit) VALUES
      (6, 14, 15)`);

    // ============================================
    // Phase 3: Initial Inventory Movements
    // ============================================
    console.log('📊 Seeding inventory movements...');

    const ingredientStocks = [
      { id: 1, stock: 5000 }, { id: 2, stock: 10000 }, { id: 3, stock: 5000 },
      { id: 4, stock: 5000 }, { id: 5, stock: 2000 }, { id: 6, stock: 3000 },
      { id: 7, stock: 1000 }, { id: 8, stock: 2000 }, { id: 9, stock: 3000 },
      { id: 10, stock: 3000 }, { id: 11, stock: 2000 }, { id: 12, stock: 2000 },
      { id: 13, stock: 2000 }, { id: 14, stock: 1500 }, { id: 15, stock: 50 },
    ];

    for (const item of ingredientStocks) {
      await connection.execute(
        `INSERT INTO inventory_movements (ingredient_id, change_type, quantity_change, stock_before, stock_after, note)
         VALUES (?, 'INITIAL', ?, 0, ?, 'Initial stock from seed')`,
        [item.id, item.stock, item.stock]
      );
    }

    // ============================================
    // Phase 4: Shifts, Assignments & Attendance
    // ============================================
    console.log('⏰ Seeding shifts...');

    await connection.execute(`INSERT INTO shifts (id, name, start_time, end_time) VALUES
      (1, 'Ca sáng',  '07:00:00', '14:00:00'),
      (2, 'Ca chiều', '14:00:00', '21:00:00'),
      (3, 'Ca tối',   '21:00:00', '02:00:00')`);

    // Generate sample assignments for current week (Mon-Fri)
    console.log('📅 Seeding shift assignments...');
    const now = new Date();
    const dayOfWeek = now.getDay();
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = new Date(now);
    monday.setDate(now.getDate() + mondayOffset);

    for (let i = 0; i < 5; i++) {
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);
      const dateStr = date.toISOString().slice(0, 10);

      // cashier1 (id=2) → Ca sáng
      await connection.execute(
        'INSERT INTO shift_assignments (shift_id, user_id, work_date) VALUES (1, 2, ?)',
        [dateStr]
      );
      // barista1 (id=3) → Ca chiều
      await connection.execute(
        'INSERT INTO shift_assignments (shift_id, user_id, work_date) VALUES (2, 3, ?)',
        [dateStr]
      );
    }

    // Sample attendance: yesterday's records
    console.log('✅ Seeding attendance records...');
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().slice(0, 10);

    // Find yesterday's assignments
    const [yAssignments] = await connection.execute(
      'SELECT id, shift_id, user_id FROM shift_assignments WHERE work_date = ?',
      [yesterdayStr]
    ) as any[];

    for (const assign of yAssignments) {
      if (assign.user_id === 2) {
        // cashier1: ON_TIME, Ca sáng 07:05 → 14:02
        await connection.execute(
          `INSERT INTO attendance_logs (assignment_id, user_id, check_in_at, check_out_at, status, actual_hours)
           VALUES (?, 2, ?, ?, 'ON_TIME', 6.95)`,
          [assign.id, `${yesterdayStr} 07:05:00`, `${yesterdayStr} 14:02:00`]
        );
      } else if (assign.user_id === 3) {
        // barista1: LATE, Ca chiều 14:22 → 21:05
        await connection.execute(
          `INSERT INTO attendance_logs (assignment_id, user_id, check_in_at, check_out_at, status, actual_hours)
           VALUES (?, 3, ?, ?, 'LATE', 6.72)`,
          [assign.id, `${yesterdayStr} 14:22:00`, `${yesterdayStr} 21:05:00`]
        );
      }
    }

    console.log('✅ Seed data inserted successfully');
    console.log('');
    console.log('📋 Default accounts:');
    console.log('   👑 Owner:   admin / admin123');
    console.log('   💰 Cashier: cashier1 / cashier123');
    console.log('   ☕ Barista: barista1 / barista123');
    console.log('');
    console.log('🧪 Ingredients: 15 items seeded');
    console.log('📋 Recipes: 13 menu items + 6 toppings configured');
    console.log('📊 Inventory movements: 15 initial records');
    console.log('⏰ Shifts: 3 templates (sáng/chiều/tối)');
    console.log('📅 Assignments: cashier1 + barista1 Mon-Fri this week');
    console.log('✅ Attendance: 2 sample records (yesterday)');
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  } finally {
    connection.release();
    await pool.end();
  }
}

seed();

