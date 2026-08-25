const votingRepository = require('./voting.repository');

const MAX_ATTEMPTS_PER_IP = 5;
const ATTEMPT_WINDOW_MINUTES = 10;

async function createVote({
    userId,
    contestId,
    artistId,
    ipAddress,
    userAgent
}) {

    const recentAttempts = await votingRepository.countRecentAttemptsByIp(ipAddress,ATTEMPT_WINDOW_MINUTES);
    
    if (recentAttempts >= MAX_ATTEMPTS_PER_IP) {
        const attempt = await votingRepository.createVoteAttempt({
            userId,
            contestId,
            artistId,
            ipAddress,
            userAgent,
            status: 'rejected',
            riskScore: 100
        });

        return {
            status: 'rejected',
            riskScore: 100,
            attemptId: attempt.id,
            message: 'Too many voting attempts from this IP'
        };
    }

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