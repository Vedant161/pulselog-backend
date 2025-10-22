const express = require('express');
const router = express.Router();
const { createLog, getLogsForProject } = require('../controllers/logController');
const { protect } = require('../middleware/authMiddleware');

// This route will be hit by the external monitoring script
router.route('/:projectId').post(createLog);
router.route('/:projectId').get(protect, getLogsForProject);

module.exports = router;