const express = require('express');

const votingController = require('./voting.controller');

const router = express.Router();

router.post('/', votingController.createVote);

module.exports = router;