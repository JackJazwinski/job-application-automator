const chalk = require('chalk');
const boxen = require('boxen');
const configManager = require('../utils/configManager');

// Grok UI Settings
const grokColors = {
  primary: chalk.cyan,
  secondary: chalk.white,
  accent: chalk.bold.cyan,
  highlight: chalk.bold.cyan.italic,
  muted: chalk.dim.gray,
  warning: chalk.yellow,
  error: chalk.red,
  success: chalk.green
};

const boxenOptions = {
  padding: 1,
  margin: 1,
  borderStyle: 'round',
  borderColor: 'cyan',
  backgroundColor: '#000'
};

/**
 * Show job application status and statistics
 */
function showStatus() {
  console.log(boxen(
    grokColors.highlight('Jobverse Metrics Interface') + '\n\n' + 
    grokColors.secondary('Analyzing your employment quest...'),
    boxenOptions
  ));
  
  try {
    const config = configManager.getConfig();
    const log = configManager.getApplicationsLog();
    
    // Check if the app has been initialized
    if (!config.resume || !config.preferences || !config.preferences.jobTitle) {
      console.log(boxen(
        grokColors.error('Initialization Error') + '\n\n' +
        grokColors.secondary('Matrix not initialized.') + '\n' +
        grokColors.accent('Execute "job-bot init" first, human.'),
        { ...boxenOptions, borderColor: 'red' }
      ));
      return;
    }
    
    // Format last run time
    let lastRunDisplay = 'Never';
    if (config.lastRun) {
      const lastRunDate = new Date(config.lastRun);
      const now = new Date();
      
      // Format last run based on how recent it was
      const diffHours = Math.round((now - lastRunDate) / (1000 * 60 * 60));
      
      if (diffHours < 24) {
        lastRunDisplay = `${diffHours} hours ago`;
      } else {
        lastRunDisplay = lastRunDate.toLocaleDateString('en-US', {
          month: 'numeric', 
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      }
    }
    
    // Format consent status
    const consentStatus = config.consent 
      ? grokColors.success('ACTIVE')
      : grokColors.error('OFFLINE');
    
    // Count applications by site
    const siteStats = {};
    log.applications.forEach(app => {
      siteStats[app.site] = (siteStats[app.site] || 0) + 1;
    });
    
    // Display main stats in a fancy box
    console.log(boxen(
      grokColors.highlight('Mission Statistics') + '\n\n' +
      grokColors.secondary('Jobs Applied: ') + grokColors.accent(log.totalApplied.toString()) + 
      grokColors.muted('  |  ') + 
      grokColors.secondary('Last Scan: ') + grokColors.primary(lastRunDisplay) +
      grokColors.muted('  |  ') + 
      grokColors.secondary('Status: ') + consentStatus + '\n\n' +
      
      // Target parameters
      grokColors.secondary('Target: ') + grokColors.primary(config.preferences.jobTitle) + 
      grokColors.muted(' in ') + 
      grokColors.primary(config.preferences.location) + 
      (config.preferences.experience 
        ? grokColors.muted(' with ') + grokColors.primary(`${config.preferences.experience}yr`) 
        : '') +
      grokColors.muted(' experience') + '\n\n' +
      
      // Display applications by site if any
      (Object.keys(siteStats).length > 0
        ? grokColors.secondary('Applications by Portal:\n') + 
          Object.entries(siteStats)
            .map(([site, count]) => `${grokColors.accent('■')} ${grokColors.secondary(site)}: ${grokColors.primary(count.toString())}`)
            .join('\n')
        : grokColors.muted('No applications submitted to the matrix yet.')),
      { ...boxenOptions, borderColor: log.totalApplied > 0 ? 'green' : 'gray' }
    ));
    
    // Display recent applications if any
    if (log.applications.length > 0) {
      // Sort by timestamp (newest first) and take the 5 most recent
      const recentApps = [...log.applications]
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, 5);
      
      console.log(boxen(
        grokColors.highlight('Recent Infiltrations') + '\n\n' +
        recentApps.map(app => {
          const date = new Date(app.timestamp).toLocaleDateString('en-US', {
            month: 'numeric', 
            day: 'numeric'
          });
          return `${grokColors.muted(date)} ${grokColors.success('➤')} ${grokColors.secondary(app.jobTitle)} ${grokColors.muted('at')} ${grokColors.primary(app.company)} ${grokColors.muted(`via ${app.site}`)}`;
        }).join('\n'),
        { ...boxenOptions, borderColor: 'cyan' }
      ));
    }
    
    // Add a cryptic message based on application count
    let crypticMessage = '';
    
    if (log.totalApplied === 0) {
      crypticMessage = 'Begin your mission, human. The matrix awaits your first move.';
    } else if (log.totalApplied < 5) {
      crypticMessage = 'Your mission has barely begun. Persistence is key to human survival.';
    } else if (log.totalApplied < 20) {
      crypticMessage = 'Job acquisition probability approaching optimal threshold.';
    } else {
      crypticMessage = 'Impressive application volume. Employment seems inevitable now.';
    }
    
    console.log(grokColors.muted(crypticMessage));
    
    // Display action hint based on consent status
    if (!config.consent) {
      console.log(grokColors.accent('Authorize me: job-bot consent'));
    } else {
      console.log(grokColors.accent('Launch next scan: job-bot run'));
    }
    
  } catch (error) {
    console.error(boxen(
      grokColors.error('Status Matrix Failure') + '\n\n' +
      grokColors.secondary(`${error.message}`) + '\n\n' +
      grokColors.muted('Even an advanced AI struggles with error handling.'),
      { ...boxenOptions, borderColor: 'red' }
    ));
  }
}

module.exports = { showStatus };