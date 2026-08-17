const mysql = require('mysql2/promise');
(async () => {
  const conn = await mysql.createConnection({host:'127.0.0.1',port:3306,user:'root',password:'Zizo12345',database:'kingsdomino'});

  const tables = ['coupons', 'coupon_redemptions'];
  for (const t of tables) {
    console.log(`\n=== ${t} TABLE ===`);
    const [cols] = await conn.execute(`SHOW COLUMNS FROM ${t}`);
    cols.forEach(c => console.log(`  ${c.Field} | ${c.Type} | Null=${c.Null} | Key=${c.Key} | Default=${c.Default}`));

    console.log(`\n=== ${t} INDEXES ===`);
    const [idx] = await conn.execute(`SHOW INDEX FROM ${t}`);
    idx.forEach(i => console.log(`  ${i.Column_name} | ${i.Key_name} | unique=${i.Non_unique===0}`));

    console.log(`\n=== ${t} DATA ===`);
    const [data] = await conn.execute(`SELECT * FROM ${t}`);
    console.log(`  rows: ${data.length}`);
    data.forEach(r => console.log(`  ${JSON.stringify(r)}`));
  }

  console.log('\n=== ALL CONSTRAINTS (coupons/Redemptions) ===');
  const [cons] = await conn.execute("SELECT CONSTRAINT_NAME, TABLE_NAME, COLUMN_NAME, REFERENCED_TABLE_NAME, REFERENCED_COLUMN_NAME FROM information_schema.KEY_COLUMN_USAGE WHERE TABLE_SCHEMA = 'kingsdomino' AND (TABLE_NAME IN ('coupons','coupon_redemptions'))");
  cons.forEach(c => console.log(`  ${c.CONSTRAINT_NAME} | ${c.TABLE_NAME}.${c.COLUMN_NAME} → ${c.REFERENCED_TABLE_NAME||'none'}.${c.REFERENCED_COLUMN_NAME||''}`));

  console.log('\n=== ALL TABLES IN DATABASE ===');
  const [tablesList] = await conn.execute('SHOW TABLES');
  tablesList.forEach(t => {
    const val = Object.values(t)[0];
    console.log(`  ${val}`);
  });

  await conn.end();
})();
