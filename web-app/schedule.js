const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuration
const config = {
  // Run every day at this time (24-hour format)
  runHour: 9,
  runMinute: 0,
  
  // Log file
  logFile: path.join(__dirname, 'logs', 'scheduler.log'),
  
  // Script to run
  scriptPath: path.join(__dirname, 'job-application-automator.js')
};

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Function to log messages
function log(message) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}\n`;
  console.log(message);
  fs.appendFileSync(config.logFile, logMessage);
}

// Function to run the job application automator
function runJobAutomator() {
  log('Starting job application automation...');
  
  exec(`node "${config.scriptPath}"`, (error, stdout, stderr) => {
    if (error) {
      log(`Error: ${error.message}`);
      return;
    }
    if (stderr) {
      log(`Stderr: ${stderr}`);
    }
    
    log(`Job automation completed successfully`);
    log(`Output: ${stdout}`);
  });
}

// Function to check if it's time to run
function checkSchedule() {
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  
  if (currentHour === config.runHour && currentMinute === config.runMinute) {
    runJobAutomator();
  }
}

// Main function
function main() {
  log('Job automation scheduler started');
  
  // Run immediately if specified
  if (process.argv.includes('--run-now')) {
    runJobAutomator();
  }
  
  // Check schedule every minute
  setInterval(checkSchedule, 60 * 1000);
}

// Start the scheduler
main();