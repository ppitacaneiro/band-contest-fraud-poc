const healthService = require('./health.service');

async function checkHealth(req, res) {
    try {
        const result = await healthService.checkHealth();

        res.json(result);
    } catch (error) {
        console.error(error);

        res.status(500).json({
            status: 'error',
            database: 'disconnected'
        });
    }
}

module.exports = {
    checkHealth
};