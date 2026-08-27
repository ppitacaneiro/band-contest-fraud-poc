const fraudService = require('./fraud.service');

async function getAttempts(req, res) {
    try {
        const attempts = await fraudService.getAttempts();

        res.json(attempts);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            status: 'error',
            message: 'Error retrieving vote attempts'
        });
    }
}

async function getAttemptById(req, res) {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                status: 'error',
                message: 'Invalid attempt id'
            });
        }

        const attempt = await fraudService.getAttemptById(id);

        if (!attempt) {
            return res.status(404).json({
                status: 'error',
                message: 'Vote attempt not found'
            });
        }

        res.json(attempt);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            status: 'error',
            message: 'Error retrieving vote attempt'
        });
    }
}

module.exports = {
    getAttempts,
    getAttemptById
};