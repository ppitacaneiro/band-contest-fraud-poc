const db = require('../../../config/database');

const THRESHOLD = 1;
const SCORE = 40;

async function evaluate({
    userId,
    contestId,
    fingerprintId
}) {

    if (!fingerprintId) {
        return {
            name: 'same_fingerprint',
            triggered: false,
            score: 0,
            data: {
                usersWithFingerprint: 0,
                threshold: THRESHOLD
            }
        };
    }

    const [rows] = await db.execute(
        `
        SELECT COUNT(DISTINCT u.id) AS usersWithFingerprint
        FROM users u
        INNER JOIN votes v
            ON v.user_id = u.id
        WHERE v.contest_id = ?
        AND u.fingerprint_id = ?
        `,
        [
            contestId,
            fingerprintId
        ]
    );

    const usersWithFingerprint =
        Number(rows[0].usersWithFingerprint);

    /*
     * El usuario que está intentando votar todavía no
     * aparece en votes, por eso buscamos usuarios que
     * ya hayan votado en este concurso.
     */

    const triggered = usersWithFingerprint >= THRESHOLD;

    return {
        name: 'same_fingerprint',
        triggered,
        score: triggered ? SCORE : 0,
        data: {
            usersWithFingerprint,
            threshold: THRESHOLD
        }
    };
}

module.exports = {
    evaluate
};
