const votingRepository = require('./voting.repository');
const fraudService = require('../fraud/fraud.service');

async function createVote({
    userId,
    contestId,
    artistId,
    ipAddress,
    userAgent
}) {

    const alreadyVoted = await votingRepository.hasUserVoted(
            userId,
            contestId
        );

    if (alreadyVoted) {
        const attempt = await votingRepository.createVoteAttempt({
            userId,
            contestId,
            artistId,
            ipAddress,
            userAgent,
            status: 'rejected',
            riskScore: 0
        });
        return {
            status: 'rejected',
            reason: 'already_voted',
            attemptId: attempt.id,
            message: 'User has already voted in this contest'
        };
    }

    const fraudResult = await fraudService.analyzeVote({
        ipAddress,
        contestId
    });

    const attempt = await votingRepository.createVoteAttempt({
        userId,
        contestId,
        artistId,
        ipAddress,
        userAgent,
        status: fraudResult.status,
        riskScore:  fraudResult.riskScore
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