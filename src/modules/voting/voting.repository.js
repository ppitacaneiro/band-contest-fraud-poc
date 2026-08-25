const db = require('../../config/database');

async function createVoteAttempt({
    userId,
    contestId,
    artistId,
    ipAddress,
    userAgent,
    status,
    riskScore
}) {
    const [result] = await db.execute(
        `
        INSERT INTO vote_attempts (
            user_id,
            contest_id,
            artist_id,
            ip_address,
            user_agent,
            status,
            risk_score
        )
        VALUES (?, ?, ?, ?, ?, ?, ?)
        `,
        [
            userId,
            contestId,
            artistId,
            ipAddress,
            userAgent,
            status,
            riskScore
        ]
    );

    return {
        id: result.insertId
    };
}

async function createVote({
    userId,
    contestId,
    artistId
}) {
    const [result] = await db.execute(
        `
        INSERT INTO votes (
            user_id,
            contest_id,
            artist_id
        )
        VALUES (?, ?, ?)
        `,
        [userId, contestId, artistId]
    );

    return {
        id: result.insertId
    };
}

async function countRecentAttemptsByIp(ipAddress, minutes) {
    const [rows] = await db.execute(
        `
        SELECT COUNT(*) AS total
        FROM vote_attempts
        WHERE ip_address = ?
        AND created_at >= DATE_SUB(NOW(), INTERVAL ? MINUTE)
        `,
        [ipAddress, minutes]
    );

    return Number(rows[0].total);
}

module.exports = {
    createVoteAttempt,
    createVote,
    countRecentAttemptsByIp
};