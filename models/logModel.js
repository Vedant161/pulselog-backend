const mongoose = require('mongoose');

const logSchema = mongoose.Schema(
  {
    projectId: {
      type: String,
      required: true,
      ref: 'Project',
    },
    type: {
      type: String,
      required: true,
      enum: ['error', 'feedback', 'event'], // Define possible log types
    },
    message: {
      type: String,
      required: true,
    },
    metadata: {
      type: Object, // To store extra info like stack traces, user agent, etc.
    },
  },
  {
    timestamps: true,
  }
);

const Log = mongoose.model('Log', logSchema);

module.exports = Log;