const Log = require("../models/logModel");
const Project = require("../models/projectModel");

/**
 * @desc    Receive and store a new log
 * @route   POST /api/logs/:projectId
 * @access  Public
 */
const createLog = async (req, res) => {
  const { projectId } = req.params;
  const { type, message, metadata } = req.body;

  // Optional: Verify the project ID exists in your database for security
  const projectExists = await Project.findById(projectId);
  if (!projectExists) {
    return res.status(404).json({ message: "Project not found" });
  }

  const log = await Log.create({
    projectId,
    type,
    message,
    metadata,
  });

  if (log) {
    console.log(`✅ Emitting 'new-log' event for project: ${log.projectId}`); // <-- ADD THIS
    req.io.emit("new-log", log);
    res.status(201).json({ message: "Log received" });
  } else {
    res.status(400);
    throw new Error("Invalid log data");
  }
};

const getLogsForProject = async (req, res) => {
  // First, ensure the project belongs to the logged-in user for security
  const project = await Project.findById(req.params.projectId);

  if (project && project.owner.equals(req.user._id)) {
    const logs = await Log.find({ projectId: req.params.projectId }).sort({
      createdAt: -1,
    });
    res.json(logs);
  } else {
    res.status(404);
    throw new Error("Project not found or you do not have permission.");
  }
};

module.exports = { createLog, getLogsForProject };
