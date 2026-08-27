const express = require('express');
const controller = require('./fraud.controller');

const router = express.Router();

router.get('/attempts', controller.getAttempts);
router.get('/attempts/:id', controller.getAttemptById);

module.exports = router;