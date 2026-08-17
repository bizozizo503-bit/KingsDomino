require('dotenv').config();

const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: process.env.DB_HOST || '127.0.0.1',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE || 'kingsdomino'
});

const updates = [
  ['test12345', '4507fdea-c85b-4df1-8bf2-5539a3c53669'],
  ['testplayer', '84adbe3e-422a-42f4-bc3c-9de9b90a3a94']
];

connection.query(
  'UPDATE users SET username = CASE id WHEN ? THEN ? WHEN ? THEN ? END WHERE id IN (?, ?)',
  [
    updates[0][1], updates[0][0],
    updates[1][1], updates[1][0],
    updates[0][1], updates[1][1]
  ],
  (error, result) => {
    if (error) {
      console.error('DB ERROR:', error.message);
      connection.end();
      process.exit(1);
    }

    console.log('UPDATED ROWS:', result.affectedRows);
    connection.end();
  }
);
