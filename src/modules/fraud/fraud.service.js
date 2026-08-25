const fraudRepository = require('./fraud.repository');

const USER_THRESHOLD = 5;
const WINDOW_MINUTES = 5;
const RISK_SCORE = 40;

async function analyzeVote({
    ipAddress,
    contestId
}) {

    const distinctUsers = await fraudRepository.countDistinctUsersByIp({
        ipAddress,
        contestId,
        minutes: WINDOW_MINUTES
    });

    if (distinctUsers >= USER_THRESHOLD) {
        return {
            status: 'suspicious',
            riskScore: RISK_SCORE,
            rules: [
                {
                    name: 'multiple_users_same_ip',
                    triggered: true,
                    score: RISK_SCORE,
                    data: {
                        distinctUsers,
                        threshold: USER_THRESHOLD,
                        windowMinutes: WINDOW_MINUTES
                    }
                }
            ]
        };
    }

    return {
        status: 'accepted',
        riskScore: 0,
        rules: [
            {
                name: 'multiple_users_same_ip',
                triggered: false,
                score: 0,
                data: {
                    distinctUsers,
                    threshold: USER_THRESHOLD,
                    windowMinutes: WINDOW_MINUTES
                }
            }
        ]
    };
}

module.exports = {
    analyzeVote
};