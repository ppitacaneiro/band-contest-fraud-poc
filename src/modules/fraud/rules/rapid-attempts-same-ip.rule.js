const fraudRepository = require('../fraud.repository');

const THRESHOLD = 15;
const WINDOW_SECONDS = 60;
const SCORE = 25;

async function evaluate({
    ipAddress,
    contestId
}) {
    const recentAttempts =
        await fraudRepository.countRecentAttemptsByIp({
            ipAddress,
            contestId,
            seconds: WINDOW_SECONDS
        });

    const triggered = recentAttempts >= THRESHOLD;

    return {
        name: 'rapid_attempts_same_ip',
        triggered,
        score: triggered ? SCORE : 0,
        data: {
            recentAttempts,
            threshold: THRESHOLD,
            windowSeconds: WINDOW_SECONDS
        }
    };
}

module.exports = {
    evaluate
};
