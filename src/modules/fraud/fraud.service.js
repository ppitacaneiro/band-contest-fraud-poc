const multipleUsersSameIpRule =
    require('./rules/multiple-users-same-ip.rule');

const rules = [
    multipleUsersSameIpRule
];

async function analyzeVote({
    ipAddress,
    contestId
}) {

    const results = [];

    for (const rule of rules) {

        const result = await rule.evaluate({
            ipAddress,
            contestId
        });

        results.push(result);
    }

    const riskScore = results.reduce(
        (total, rule) => total + rule.score,
        0
    );

    const status = riskScore > 0
        ? 'suspicious'
        : 'accepted';

    return {
        status,
        riskScore,
        rules: results
    };
}

module.exports = {
    analyzeVote
};