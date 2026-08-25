const express = require('express');

const healthRoutes = require('./modules/health/health.routes');
const votingRoutes = require('./modules/voting/voting.routes');
const router = express.Router();

router.use('/health', healthRoutes);
router.use('/voting', votingRoutes);

module.exports = router;