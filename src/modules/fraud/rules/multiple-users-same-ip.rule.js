const fraudRepository = require('../fraud.repository');

const THRESHOLD = 5;
const WINDOW_MINUTES = 5;
const SCORE = 40;

async function evaluate({
    ipAddress,
    contestId
}) {

    const distinctUsers =
        await fraudRepository.countDistinctUsersByIp({
            ipAddress,
            contestId,
            minutes: WINDOW_MINUTES
        });

    return {
        name: 'multiple_users_same_ip',
        triggered: distinctUsers >= THRESHOLD,
        score: distinctUsers >= THRESHOLD ? SCORE : 0,
        data: {
            distinctUsers,
            threshold: THRESHOLD,
            windowMinutes: WINDOW_MINUTES
        }
    };
}

module.exports = {
    evaluate
};