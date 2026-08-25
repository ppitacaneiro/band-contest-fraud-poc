// Pool de conexiones a MySQL.
// Mantiene y reutiliza un número limitado de conexiones para evitar
// crear y cerrar una conexión en cada petición y controlar la concurrencia.

const mysql = require('mysql2/promise');

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,

    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

module.exports = pool;