/**
 * Crea el pool de conexiones compartido por todo el microservicio.
 * mysql2/promise permite utilizar async/await en lugar de callbacks.
 */
const mysql = require('mysql2/promise');
const env = require('./env');

const pool = mysql.createPool({
  ...env.baseDatos,
  charset: 'utf8mb4',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

module.exports = pool;
