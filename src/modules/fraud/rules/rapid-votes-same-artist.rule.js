const fraudRepository = require('../fraud.repository');

const THRESHOLD = 10;
const WINDOW_SECONDS = 60;
const SCORE = 30;

async function evaluate({
    contestId,
    artistId
}) {
    const recentVotes =
        await fraudRepository.countRecentVotesByArtist({
            contestId,
            artistId,
            seconds: WINDOW_SECONDS
        });

    const triggered = recentVotes >= THRESHOLD;

    return {
        name: 'rapid_votes_same_artist',
        triggered,
        score: triggered ? SCORE : 0,
        data: {
            recentVotes,
            threshold: THRESHOLD,
            windowSeconds: WINDOW_SECONDS
        }
    };
}

module.exports = {
    evaluate
};