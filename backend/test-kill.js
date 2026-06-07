import mysql from 'mysql2/promise';

async function main() {
  const pool = mysql.createPool({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'root123',
    database: 'coffee_shop',
  });

  try {
    const [processlist] = await pool.execute('SHOW PROCESSLIST');
    for (const p of processlist) {
      if (p.User === 'coffee_user') {
        console.log(`Killing thread ${p.Id}`);
        await pool.execute(`KILL ${p.Id}`);
      }
    }
    console.log("Killed coffee_user connections.");
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}

main();
