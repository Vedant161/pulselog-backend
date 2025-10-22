const mongoose = require('mongoose');

const projectSchema = mongoose.Schema(
  {
    projectName: {
      type: String,
      required: true,
    },
    projectURL: {
      type: String,
      required: false, // Optional for now
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId, // This creates a reference to a User
      required: true,
      ref: 'User', // The specific model to link to
    },
  },
  {
    timestamps: true,
  }
);

const Project = mongoose.model('Project', projectSchema);

module.exports = Project;