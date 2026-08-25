const votingRepository = require('./voting.repository');

async function createVote({
    userId,
    contestId,
    artistId,
    ipAddress,
    userAgent
}) {
    const attempt = await votingRepository.createVoteAttempt({
        userId,
        contestId,
        artistId,
        ipAddress,
        userAgent,
        status: 'accepted',
        riskScore: 0
    });

    const vote = await votingRepository.createVote({
        userId,
        contestId,
        artistId
    });

    return {
        status: 'accepted',
        riskScore: 0,
        attemptId: attempt.id,
        voteId: vote.id
    };
}

module.exports = {
    createVote
};