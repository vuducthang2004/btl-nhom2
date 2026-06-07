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
    console.log("Processlist:");
    for (const p of processlist) {
      if (p.Command !== 'Sleep') console.log(p);
    }

    try {
      const [locks] = await pool.execute('SELECT * FROM performance_schema.data_locks');
      console.log("Locks:", locks);
    } catch (e) {
      console.log("Cannot select data_locks", e.message);
    }

    try {
      const [trx] = await pool.execute('SELECT * FROM information_schema.innodb_trx');
      console.log("TRX:", trx);
    } catch (e) {
      console.log("Cannot select innodb_trx", e.message);
    }
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}

main();
