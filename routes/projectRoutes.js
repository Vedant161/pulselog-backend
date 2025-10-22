const express = require('express');
const router = express.Router();
const { createProject, getProjects,getMonitorScript } = require('../controllers/projectController');
const { protect } = require('../middleware/authMiddleware'); // Import the middleware

// Apply the 'protect' middleware to these routes
// Any request to these endpoints must have a valid token
router.route('/').post(protect, createProject).get(protect, getProjects);
router.route('/:projectId/script').get(protect, getMonitorScript);

module.exports = router;