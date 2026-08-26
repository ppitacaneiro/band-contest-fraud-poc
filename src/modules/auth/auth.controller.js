const authService = require('./auth.service');

async function register(req, res) {
    try {

        const {
            email,
            fingerprintId,
            browser,
            userAgent,
            os,
            deviceType,
            language,
            timezone
        } = req.body;

        const result =
            await authService.register({
                email,
                fingerprintId,
                browser,
                userAgent,
                os,
                deviceType,
                language,
                timezone,
                ipAddress: req.ip
            });

        if (result.status === 'rejected') {
            return res.status(409).json(result);
        }

        return res.status(201).json(result);

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            status: 'error',
            message: 'Error creating user'
        });
    }
}

module.exports = {
    register
};

