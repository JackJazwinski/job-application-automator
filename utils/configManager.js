const fs = require('fs-extra');
const path = require('path');

// Define paths
const CONFIG_DIR = path.join(process.cwd(), 'config');
const CONFIG_FILE = path.join(CONFIG_DIR, 'config.json');
const APPLICATIONS_LOG = path.join(CONFIG_DIR, 'applications.json');

// Ensure the config directory exists
fs.ensureDirSync(CONFIG_DIR);

// Initialize the config file if it doesn't exist
if (!fs.existsSync(CONFIG_FILE)) {
  fs.writeJSONSync(CONFIG_FILE, {
    resume: '',
    preferences: {
      jobTitle: '',
      location: '',
      industry: ''
    },
    consent: false,
    lastRun: null
  }, { spaces: 2 });
}

// Initialize the applications log if it doesn't exist
if (!fs.existsSync(APPLICATIONS_LOG)) {
  fs.writeJSONSync(APPLICATIONS_LOG, {
    totalApplied: 0,
    applications: []
  }, { spaces: 2 });
}

/**
 * Get the config object
 * @returns {Object} The config object
 */
function getConfig() {
  return fs.readJSONSync(CONFIG_FILE);
}

/**
 * Update the config object
 * @param {Object} newConfig - The new config object to save
 */
function updateConfig(newConfig) {
  fs.writeJSONSync(CONFIG_FILE, newConfig, { spaces: 2 });
}

/**
 * Get the applications log
 * @returns {Object} The applications log
 */
function getApplicationsLog() {
  return fs.readJSONSync(APPLICATIONS_LOG);
}

/**
 * Log a new job application
 * @param {Object} application - The application details
 */
function logApplication(application) {
  const log = getApplicationsLog();
  
  // Check if this job has already been applied to
  const existingApp = log.applications.find(
    app => app.jobId === application.jobId || 
          (app.company === application.company && app.jobTitle === application.jobTitle)
  );
  
  if (existingApp) {
    return false; // Already applied
  }
  
  // Add the new application
  log.applications.push({
    ...application,
    timestamp: new Date().toISOString()
  });
  log.totalApplied = log.applications.length;
  
  // Save the updated log
  fs.writeJSONSync(APPLICATIONS_LOG, log, { spaces: 2 });
  return true;
}

/**
 * Update the last run time
 */
function updateLastRun() {
  const config = getConfig();
  config.lastRun = new Date().toISOString();
  updateConfig(config);
}

module.exports = {
  getConfig,
  updateConfig,
  getApplicationsLog,
  logApplication,
  updateLastRun
};