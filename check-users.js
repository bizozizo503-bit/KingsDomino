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
  "SELECT id, username FROM users WHERE username = '' OR username IS NULL",
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
