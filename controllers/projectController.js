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

module.exports = { createProject, getProjects, getMonitorScript };