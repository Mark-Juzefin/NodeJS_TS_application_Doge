const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  password: '123654',
  host: 'localhost',
  port: 5432,
  database: 'Doge',
});

module.exports = pool;
