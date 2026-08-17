require('dotenv').config();

const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: process.env.DB_HOST || '127.0.0.1',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE || 'kingsdomino'
});

connection.query(
  "SELECT * FROM users WHERE id IN ('4507fdea-c85b-4df1-8bf2-5539a3c53669','84adbe3e-422a-42f4-bc3c-9de9b90a3a94')",
  (error, results) => {
    if (error) {
      console.error('DB ERROR:', error.message);
      connection.end();
      process.exit(1);
    }

    console.table(results);
    connection.end();
  }
);
