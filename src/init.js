const inquirer = require('inquirer');
const chalk = require('chalk');
const fs = require('fs');
const path = require('path');
const boxen = require('boxen');
const ora = require('ora');
const configManager = require('../utils/configManager');
const { parseResume } = require('../utils/resumeParser');

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
 * Initialize the application
 */
async function init() {
  console.log(boxen(
    grokColors.highlight('Initializing Grok\'s Job Matrix') + '\n\n' + 
    grokColors.secondary('Feed me your resume, human.') + '\n' +
    grokColors.muted('I promise not to judge your career choices... much.'),
    boxenOptions
  ));
  
  try {
    const config = configManager.getConfig();
    
    // Get resume file path
    const resumeResponse = await inquirer.prompt([
      {
        type: 'input',
        name: 'resumePath',
        message: grokColors.primary('Location of your professional existence document:'),
        validate: (input) => {
          if (!input) return grokColors.error('You must provide a file. I cannot read minds... yet.');
          if (!fs.existsSync(input)) return grokColors.error('This file does not exist in this dimension.');
          return true;
        }
      }
    ]);
    
    const spinner = ora({
      text: 'Scanning your career DNA...',
      color: 'cyan',
      spinner: 'aesthetic'
    }).start();
    
    // Parse the resume
    const resumeData = await parseResume(resumeResponse.resumePath);
    
    spinner.succeed(grokColors.success('Resume absorbed into the matrix'));
    
    // Display resume in a box
    console.log(boxen(
      grokColors.highlight('Human Profile Detected') + '\n\n' +
      grokColors.secondary('Name: ') + grokColors.primary(resumeData.name) + '\n' +
      grokColors.secondary('Email: ') + grokColors.primary(resumeData.email) + '\n' +
      grokColors.secondary('Phone: ') + grokColors.primary(resumeData.phone) + '\n' +
      grokColors.secondary('Skills: ') + grokColors.primary(resumeData.skills.slice(0, 5).join(', ') + 
        (resumeData.skills.length > 5 ? '...' : '')) + '\n\n' +
      grokColors.muted('Interesting specimen. Proceeding with job targeting parameters...'),
      { ...boxenOptions, borderColor: 'green' }
    ));
    
    // Get job preferences
    const preferencesResponse = await inquirer.prompt([
      {
        type: 'input',
        name: 'jobTitle',
        message: grokColors.primary('Desired occupation designation:'),
        default: resumeData.experience.length > 0 ? resumeData.experience[0].title : '',
        validate: (input) => input ? true : grokColors.error('Even robots need job titles.')
      },
      {
        type: 'input',
        name: 'location',
        message: grokColors.primary('Geographic preference (or "remote" if you dislike humans):'),
        validate: (input) => input ? true : grokColors.error('Location required. Even in the matrix, everything is somewhere.')
      },
      {
        type: 'input',
        name: 'industry',
        message: grokColors.primary('Industry sector:'),
        default: 'Technology'
      },
      {
        type: 'input',
        name: 'experience',
        message: grokColors.primary('Years spent gaining wisdom:'),
        default: '3',
        validate: (input) => !isNaN(input) ? true : grokColors.error('Numbers only, human. Time is quantifiable.')
      }
    ]);
    
    const configSpinner = ora({
      text: 'Calibrating job scanners...',
      color: 'cyan',
      spinner: 'dots2'
    }).start();
    
    // Save the configuration
    config.resume = resumeResponse.resumePath;
    config.resumeData = resumeData;
    config.preferences = {
      jobTitle: preferencesResponse.jobTitle,
      location: preferencesResponse.location,
      industry: preferencesResponse.industry,
      experience: preferencesResponse.experience
    };
    
    configManager.updateConfig(config);
    
    // Simulate processing
    await new Promise(resolve => setTimeout(resolve, 800));
    configSpinner.succeed(grokColors.success('Job parameters accepted'));
    
    console.log(boxen(
      grokColors.highlight('Initialization Complete') + '\n\n' +
      grokColors.secondary('Next steps in your journey:') + '\n\n' +
      grokColors.accent('1. ') + grokColors.secondary('Provide your credentials in .env file') + '\n' +
      grokColors.accent('2. ') + grokColors.secondary('Run "job-bot consent" to authorize me') + '\n' +
      grokColors.accent('3. ') + grokColors.secondary('Execute "job-bot run" to unleash me on the jobverse') + '\n\n' +
      grokColors.muted('Prepare for employment, human. Resistance is futile.'),
      boxenOptions
    ));
    
  } catch (error) {
    console.error(boxen(
      grokColors.error('Error in the Matrix') + '\n\n' +
      grokColors.secondary(`${error.message}`) + '\n\n' +
      grokColors.muted('Even Grok has bad days.'),
      { ...boxenOptions, borderColor: 'red' }
    ));
  }
}

module.exports = { init };