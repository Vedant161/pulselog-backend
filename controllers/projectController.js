const Project = require('../models/projectModel');
const fs = require('fs').promises;
const path = require('path');

/**
 * @desc    Create a new project
 * @route   POST /api/projects
 * @access  Private
 */

const getMonitorScript = async (req, res) => {
  try {
    const { projectId } = req.params;
    
    // Ensure the project belongs to the logged-in user for security
    const project = await Project.findById(projectId);
    if (!project || !project.owner.equals(req.user._id)) {
        return res.status(404).send('Project not found or unauthorized.');
    }
      
    // Read the template file
    const templatePath = path.join(__dirname, '..', 'monitor.template.js');
    let scriptContent = await fs.readFile(templatePath, 'utf8');

    // Replace the placeholder with the actual project ID
    scriptContent = scriptContent.replace('__PROJECT_ID__', projectId);

    // Send the modified script as a JavaScript file
    res.setHeader('Content-Type', 'application/javascript');
    res.send(scriptContent);

  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

const createProject = async (req, res) => {
  const { projectName, projectURL } = req.body;

  if (!projectName) {
    res.status(400);
    throw new Error('Project name is required');
  }

  const project = new Project({
    projectName,
    projectURL,
    owner: req.user._id, // Get the user ID from the logged-in user
  });

  const createdProject = await project.save();
  res.status(201).json(createdProject);
};

/**
 * @desc    Get logged in user's projects
 * @route   GET /api/projects
 * @access  Private
 */
const getProjects = async (req, res) => {
  // Find all projects where the 'owner' field matches the logged-in user's ID
  const projects = await Project.find({ owner: req.user._id });
  res.json(projects);
};

/**
 * @desc    Get a single project by ID
 * @route   GET /api/projects/:projectId
 * @access  Private
 */
const getProjectById = async (req, res) => {
  const project = await Project.findById(req.params.projectId);

  if (project && project.owner.equals(req.user._id)) {
    res.json(project);
  } else {
    res.status(404).json({ message: 'Project not found' });
  }
};

/**
 * @desc    Delete a project and its logs
 * @route   DELETE /api/projects/:projectId
 * @access  Private
 */
const deleteProject = async (req, res) => {
  const project = await Project.findById(req.params.projectId);

  // Security check: Ensure the user owns this project
  if (project && project.owner.equals(req.user._id)) {
    // Delete the project itself
    await Project.findByIdAndDelete(req.params.projectId);
    
    // Also delete all logs associated with this project for data integrity
    await Log.deleteMany({ projectId: req.params.projectId });

    res.json({ message: 'Project and all associated logs have been deleted.' });
  } else {
    res.status(404).json({ message: 'Project not found or you do not have permission.' });
  }
};

/**
 * @desc    Update a project (e.g., rename)
 * @route   PUT /api/projects/:projectId
 * @access  Private
 */
const updateProject = async (req, res) => {
  const { projectName } = req.body;
  const project = await Project.findById(req.params.projectId);

  if (project && project.owner.equals(req.user._id)) {
    project.projectName = projectName || project.projectName;
    const updatedProject = await project.save();
    res.json(updatedProject);
  } else {
    res.status(404).json({ message: 'Project not found' });
  }
};

/**
 * @desc    Get stats for a project
 * @route   GET /api/projects/:projectId/stats
 * @access  Private
 */
const getProjectStats = async (req, res) => {
    const { projectId } = req.params;
    const project = await Project.findById(projectId);

    if (!project || !project.owner.equals(req.user._id)) {
        return res.status(404).json({ message: 'Project not found' });
    }

    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

    const totalLogs24h = await Log.countDocuments({ projectId, createdAt: { $gte: twentyFourHoursAgo } });
    const errors1h = await Log.countDocuments({ projectId, type: 'error', createdAt: { $gte: oneHourAgo } });
    
    const logTypeCounts = await Log.aggregate([
        { $match: { projectId: project._id } },
        { $group: { _id: '$type', count: { $sum: 1 } } }
    ]);

    const healthScore = totalLogs24h > 0 ? ((1 - (errors1h / totalLogs24h)) * 100).toFixed(0) : 100;

    res.json({
        totalLogs24h,
        errors1h,
        healthScore,
        logTypeCounts
    });
};

module.exports = { createProject, getProjects, getMonitorScript, getProjectById, deleteProject, updateProject, getProjectStats };