const multipleUsersSameIpRule =
    require('./rules/multiple-users-same-ip.rule');
const rapidVotesSameArtistRule =
    require('./rules/rapid-votes-same-artist.rule');

const rules = [
    multipleUsersSameIpRule,
    rapidVotesSameArtistRule
];

async function analyzeVote({
    ipAddress,
    contestId,
    artistId
}) {

    const results = [];

    for (const rule of rules) {

        const result = await rule.evaluate({
            ipAddress,
            contestId,
            artistId
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