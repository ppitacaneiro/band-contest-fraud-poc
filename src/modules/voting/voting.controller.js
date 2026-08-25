const votingService = require('./voting.service');

async function createVote(req, res) {
    try {
        const { userId, contestId, artistId } = req.body;

        const result = await votingService.createVote({
            userId,
            contestId,
            artistId,
            ipAddress: req.ip,
            userAgent: req.get('user-agent')
        });

        res.status(201).json(result);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            status: 'error',
            message: 'Error processing vote'
        });
    }
}

module.exports = {
    createVote
};