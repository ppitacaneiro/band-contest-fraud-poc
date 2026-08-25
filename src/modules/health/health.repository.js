const db = require('../../config/database');

async function checkDatabaseConnection() {
    const [rows] = await db.execute('SELECT 1 AS connected');
    return rows[0].connected === 1;
}

module.exports = {
    checkDatabaseConnection
};