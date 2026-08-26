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

module.exports = {
    countDistinctUsersByIp,
    countRecentVotesByArtist
};