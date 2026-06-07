import mysql from 'mysql2/promise';

async function main() {
  const pool = mysql.createPool({
    host: 'localhost',
    port: 3306,
    user: 'coffee_user',
    password: 'coffee_pass',
    database: 'coffee_shop',
  });

  try {
    const [rows] = await pool.execute('SHOW ENGINE INNODB STATUS');
    console.log(rows[0].Status);
    
    const [locks] = await pool.execute('SELECT * FROM performance_schema.data_locks');
    console.log("Locks:", locks);
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}

main();
