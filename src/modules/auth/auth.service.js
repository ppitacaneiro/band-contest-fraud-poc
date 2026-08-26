const authRepository = require('./auth.repository');

async function register({
    email,
    fingerprintId,
    browser,
    browserVersion,
    userAgent,
    os,
    deviceType,
    language,
    timezone,
    ipAddress
}) {

    const existingUser =
        await authRepository.findUserByEmail(email);

    if (existingUser) {
        return {
            status: 'rejected',
            reason: 'email_already_registered',
            message: 'Email already registered'
        };
    }

    const user =
        await authRepository.createUser({
            email,
            fingerprintId,
            browser,
            userAgent,
            os,
            deviceType,
            language,
            timezone,
            ipAddress
        });

    return {
        status: 'accepted',
        userId: user.id
    };
}

module.exports = {
    register
};
