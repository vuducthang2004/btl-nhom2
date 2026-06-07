import mysql from 'mysql2/promise';

async function main() {
  const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'root123',
    database: 'coffee_shop',
    connectionLimit: 10
  });

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    console.log("Acquiring X lock on ingredient 4");
    await connection.execute('SELECT stock_quantity FROM ingredients WHERE id = 4 FOR UPDATE');
    
    console.log("Updating ingredient 4");
    await connection.execute('UPDATE ingredients SET stock_quantity = stock_quantity - 1 WHERE id = 4');

    console.log("Inserting movement for ingredient 4");
    await connection.execute(`INSERT INTO inventory_movements (ingredient_id, change_type, quantity_change, stock_before, stock_after, reference_id, note)
             VALUES (?, ?, ?, ?, ?, ?, ?)`, [4, 'DEDUCT_ORDER', -1, 10, 9, 999, null]);
    
    console.log("Success! Committing...");
    await connection.commit();
  } catch (err) {
    console.error("Error:", err);
    await connection.rollback();
  } finally {
    connection.release();
    pool.end();
  }
}

main();
