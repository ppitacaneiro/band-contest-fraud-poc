const db = require('../../config/database');

async function countDistinctUsersByIp({
    ipAddress,
    contestId,
    minutes
}) {

    const safeMinutes = Number(minutes);

    if (!Number.isInteger(safeMinutes) || safeMinutes <= 0) {
        throw new Error('Invalid time window');
    }

    const [rows] = await db.execute(
        `
        SELECT COUNT(DISTINCT user_id) AS total
        FROM vote_attempts
        WHERE ip_address = ?
        AND contest_id = ?
        AND created_at >= DATE_SUB(
            NOW(),
            INTERVAL ${safeMinutes} MINUTE
        )
        `,
        [
            ipAddress,
            contestId
        ]
    );

    return Number(rows[0].total);
}

async function countRecentVotesByArtist({
    contestId,
    artistId,
    seconds
}) {
    const safeSeconds = Number(seconds);

    if (!Number.isInteger(safeSeconds) || safeSeconds <= 0) {
        throw new Error('Invalid time window');
    }

    const [rows] = await db.execute(
        `
        SELECT COUNT(*) AS total
        FROM vote_attempts
        WHERE contest_id = ?
        AND artist_id = ?
        AND created_at >= DATE_SUB(
            NOW(),
            INTERVAL ${safeSeconds} SECOND
        )
        `,
        [
            contestId,
            artistId
        ]
    );

    return Number(rows[0].total);
}

async function countRecentAttemptsByIp({
    contestId,
    ipAddress,
    seconds
}) {
    const safeSeconds = Number(seconds);

    if (!Number.isInteger(safeSeconds) || safeSeconds <= 0) {
        throw new Error('Invalid time window');
    }

    const [rows] = await db.execute(
        `
        SELECT COUNT(*) AS total
        FROM vote_attempts
        WHERE contest_id = ?
        AND ip_address = ?
        AND created_at >= DATE_SUB(
            NOW(),
            INTERVAL ${safeSeconds} SECOND
        )
        `,
        [
            contestId,
            ipAddress
        ]
    );

    return Number(rows[0].total);
}

async function getAttempts() {
    const [rows] = await db.execute(`
        SELECT
            id,
            user_id,
            contest_id,
            artist_id,
            ip_address,
            user_agent,
            status,
            risk_score,
            risk_details,
            created_at
        FROM vote_attempts
        ORDER BY created_at DESC
    `);

    return rows;
}

async function getAttemptById(id) {
    const [rows] = await db.execute(`
        SELECT
            id,
            user_id,
            contest_id,
            artist_id,
            ip_address,
            user_agent,
            status,
            risk_score,
            risk_details,
            created_at
        FROM vote_attempts
        WHERE id = ?
        LIMIT 1
    `, [id]);

    return rows[0] || null;
}

module.exports = {
    countDistinctUsersByIp,
    countRecentVotesByArtist,
    countRecentAttemptsByIp,
    getAttempts,
    getAttemptById
};
