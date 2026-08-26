const db = require('../../config/database');

async function createUser({
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
    const [result] = await db.execute(
        `
        INSERT INTO users (
            email,
            fingerprint_id,
            browser,
            user_agent,
            os,
            device_type,
            language,
            timezone,
            ip_address
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
            email,
            fingerprintId,
            browser,
            userAgent,
            os,
            deviceType,
            language,
            timezone,
            ipAddress
        ]
    );

    return {
        id: result.insertId
    };
}

async function findUserByEmail(email) {
    const [rows] = await db.execute(
        `
        SELECT id, email
        FROM users
        WHERE email = ?
        LIMIT 1
        `,
        [email]
    );

    return rows[0] || null;
}

module.exports = {
    createUser,
    findUserByEmail
};
