const multipleUsersSameIpRule = require('./rules/multiple-users-same-ip.rule');
const rapidVotesSameArtistRule = require('./rules/rapid-votes-same-artist.rule');
const sameFingerprintRule = require('./rules/same-fingerprint.rule');
const fraudRepository = require('./fraud.repository');

const rules = [
    multipleUsersSameIpRule,
    rapidVotesSameArtistRule,
    sameFingerprintRule
];

async function analyzeVote({
    userId,
    ipAddress,
    contestId,
    artistId,
    fingerprintId
}) {

    const results = [];

    for (const rule of rules) {

        const result = await rule.evaluate({
            userId,
            ipAddress,
            contestId,
            artistId,
            fingerprintId
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

async function getAttempts() {
    return fraudRepository.getAttempts();
}

async function getAttemptById(id) {
    return fraudRepository.getAttemptById(id);
}

module.exports = {
    analyzeVote,
    getAttempts,
    getAttemptById
};