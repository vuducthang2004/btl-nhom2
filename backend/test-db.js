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
    const [users] = await pool.execute('SELECT username, role FROM users');
    console.log("Users:", users);
    
    // Check connections
    const [processlist] = await pool.execute('SHOW PROCESSLIST');
    console.log("Active connections:", processlist.length);
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}

main();
