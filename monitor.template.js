// monitor.js
(function() {
  // Use a self-invoking function to not pollute the global namespace
  const PulseLog = {};
  let _projectId = null;
  const API_ENDPOINT = 'https://pulselog-backend.onrender.com/api/logs';

  /**
   * Initializes the monitoring script with a specific project ID.
   * @param {string} projectId - The ID of the project from your PulseLog dashboard.
   */
  PulseLog.init = function(projectId) {
    if (!projectId) {
      console.error("PulseLog: Project ID is required.");
      return;
    }
    _projectId = projectId;
    console.log(`PulseLog initialized for project: ${_projectId}`);
  };

  /**
   * Sends a log to the PulseLog server.
   * @param {string} type - The type of log ('error', 'feedback', 'event').
   * @param {string} message - The main log message.
   * @param {object} metadata - Any additional data to include.
   */
  PulseLog.log = async function(type, message, metadata = {}) {
    if (!_projectId) {
      console.error("PulseLog: Not initialized. Call PulseLog.init(yourProjectId) first.");
      return;
    }

    try {
      await fetch(`${API_ENDPOINT}/${_projectId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: type,
          message: message,
          metadata: {
            ...metadata,
            url: window.location.href,
            userAgent: navigator.userAgent,
          },
        }),
      });
    } catch (error) {
      console.error("PulseLog: Failed to send log.", error);
    }
  };

  // --- Automatic Error Catcher ---
  window.onerror = function(message, source, lineno, colno, error) {
    PulseLog.log('error', message, {
      source: source,
      lineNumber: lineno,
      columnNumber: colno,
      stack: error ? error.stack : null,
    });
    // Return false to allow the default browser error handling to continue.
    return false;
  };

  // Expose PulseLog to the global window object
  window.PulseLog = PulseLog;
  PulseLog.init("__PROJECT_ID__");
})();