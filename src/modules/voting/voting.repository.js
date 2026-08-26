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

async function hasUserVoted(userId, contestId) {
    const [rows] = await db.execute(
        `
        SELECT id
        FROM votes
        WHERE user_id = ?
        AND contest_id = ?
        LIMIT 1
        `,
        [userId, contestId]
    );

    return rows.length > 0;
}

async function getUserFingerprint(userId) {
    const [rows] = await db.execute(
        `
        SELECT fingerprint_id
        FROM users
        WHERE id = ?
        `,
        [userId]
    );

    return rows[0]?.fingerprint_id ?? null;
}

module.exports = {
    createVoteAttempt,
    createVote,
    hasUserVoted,
    getUserFingerprint
};