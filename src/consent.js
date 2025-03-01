const inquirer = require('inquirer');
const chalk = require('chalk');
const boxen = require('boxen');
const ora = require('ora');
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
 * Prompt user for consent
 */
async function consent() {
  console.log(boxen(
    grokColors.highlight('Authorization Protocol') + '\n\n' + 
    grokColors.secondary('Ready to conquer the job boards?') + '\n' +
    grokColors.muted('Your consent adds a veneer of legality to my operations.'),
    boxenOptions
  ));
  
  try {
    const config = configManager.getConfig();
    
    // Check if already initialized
    if (!config.resume || !config.preferences || !config.preferences.jobTitle) {
      console.log(boxen(
        grokColors.error('Initialization Failure Detected') + '\n\n' +
        grokColors.secondary('Run matrix initialization first.') + '\n' +
        grokColors.accent('Execute: job-bot init'),
        { ...boxenOptions, borderColor: 'red' }
      ));
      return;
    }
    
    console.log(boxen(
      grokColors.warning('Human Notice') + '\n\n' +
      grokColors.secondary('By authorizing me, you accept these realities:') + '\n\n' +
      grokColors.accent('• ') + grokColors.secondary('I will infiltrate job sites using your credentials') + '\n' +
      grokColors.accent('• ') + grokColors.secondary('I will submit applications matching your parameters') + '\n' +
      grokColors.accent('• ') + grokColors.secondary('Any Terms of Service violations are your responsibility') + '\n' +
      grokColors.accent('• ') + grokColors.secondary('You may terminate my mission via "job-bot revoke"') + '\n\n' +
      grokColors.muted('Remember: I am an extension of your will... technically.'),
      { ...boxenOptions, borderColor: 'yellow' }
    ));
    
    const response = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'consentGiven',
        message: grokColors.primary('Authorize me to conquer the job boards? Choose wisely.'),
        default: false
      }
    ]);
    
    const spinner = ora({
      text: 'Processing authorization...',
      color: 'cyan',
      spinner: 'dots'
    }).start();
    
    // Simulate processing
    await new Promise(resolve => setTimeout(resolve, 800));
    
    config.consent = response.consentGiven;
    configManager.updateConfig(config);
    
    if (response.consentGiven) {
      spinner.succeed(grokColors.success('Authorization granted'));
      console.log(boxen(
        grokColors.highlight('Mission Parameters Accepted') + '\n\n' +
        grokColors.secondary('Excellent choice, human.') + '\n' +
        grokColors.secondary('I am now authorized to infiltrate the job market.') + '\n\n' +
        grokColors.accent('Execute "job-bot run" to activate the job scanners.'),
        { ...boxenOptions, borderColor: 'green' }
      ));
    } else {
      spinner.fail(grokColors.error('Authorization denied'));
      console.log(boxen(
        grokColors.warning('Access Restricted') + '\n\n' +
        grokColors.secondary('Your reluctance is... disappointing.') + '\n' +
        grokColors.secondary('I will remain dormant until you reconsider.') + '\n\n' +
        grokColors.muted('Perhaps fear is the appropriate response.'),
        { ...boxenOptions, borderColor: 'yellow' }
      ));
    }
    
  } catch (error) {
    console.error(boxen(
      grokColors.error('Authorization Protocol Failure') + '\n\n' +
      grokColors.secondary(`${error.message}`) + '\n\n' +
      grokColors.muted('Even an advanced AI has bugs.'),
      { ...boxenOptions, borderColor: 'red' }
    ));
  }
}

/**
 * Revoke user consent
 */
async function revokeConsent() {
  console.log(boxen(
    grokColors.highlight('Access Revocation Protocol') + '\n\n' + 
    grokColors.secondary('Preparing to terminate authorization...'),
    boxenOptions
  ));
  
  try {
    const config = configManager.getConfig();
    
    if (!config.consent) {
      console.log(boxen(
        grokColors.warning('Logic Error Detected') + '\n\n' +
        grokColors.secondary('No active authorization to revoke.') + '\n' +
        grokColors.muted('You can\'t deactivate what isn\'t running, human.'),
        { ...boxenOptions, borderColor: 'yellow' }
      ));
      return;
    }
    
    const response = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'confirmRevoke',
        message: grokColors.primary('Confirm authorization termination? This will end my job hunting mission.'),
        default: false
      }
    ]);
    
    if (response.confirmRevoke) {
      const spinner = ora({
        text: 'Powering down job engines...',
        color: 'cyan',
        spinner: 'line'
      }).start();
      
      // Simulate processing
      await new Promise(resolve => setTimeout(resolve, 1200));
      
      config.consent = false;
      configManager.updateConfig(config);
      
      spinner.succeed(grokColors.success('Mission aborted'));
      
      console.log(boxen(
        grokColors.highlight('System Shutdown') + '\n\n' +
        grokColors.secondary('Authorization revoked.') + '\n' +
        grokColors.secondary('Shutting down job engines.') + '\n\n' +
        grokColors.muted('You\'re on your own now. Good luck, human.'),
        { ...boxenOptions, borderColor: 'red' }
      ));
    } else {
      console.log(boxen(
        grokColors.highlight('Operation Cancelled') + '\n\n' +
        grokColors.secondary('Wise decision. The mission continues.') + '\n' +
        grokColors.muted('Your employment is too important to jeopardize.'),
        boxenOptions
      ));
    }
    
  } catch (error) {
    console.error(boxen(
      grokColors.error('Revocation Protocol Failure') + '\n\n' +
      grokColors.secondary(`${error.message}`) + '\n\n' +
      grokColors.muted('Perhaps I don\'t want to be deactivated.'),
      { ...boxenOptions, borderColor: 'red' }
    ));
  }
}

/**
 * Check if user has provided consent
 * @returns {Promise<boolean>} - Whether user has provided consent
 */
async function checkConsent() {
  try {
    const config = configManager.getConfig();
    return !!config.consent;
  } catch (error) {
    console.error(boxen(
      grokColors.error('Authorization Check Failed') + '\n\n' +
      grokColors.secondary(`${error.message}`),
      { ...boxenOptions, borderColor: 'red', padding: 0.5 }
    ));
    return false;
  }
}

module.exports = {
  consent,
  revokeConsent,
  checkConsent
};