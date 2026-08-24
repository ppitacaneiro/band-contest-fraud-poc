const healthRepository = require('../repositories/health.repository');

async function checkHealth() {
    const databaseConnected =
        await healthRepository.checkDatabaseConnection();

    return {
        status: 'ok',
        database: databaseConnected ? 'connected' : 'disconnected'
    };
}

module.exports = {
    checkHealth
};