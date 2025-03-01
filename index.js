#!/usr/bin/env node

require('dotenv').config();
const { program } = require('commander');
const chalk = require('chalk');
const boxen = require('boxen');
const ora = require('ora');
const configManager = require('./utils/configManager');
const { init } = require('./src/init');
const { consent, revokeConsent, checkConsent } = require('./src/consent');
const { run } = require('./src/automation');
const { showStatus } = require('./src/status');

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

// Grok bootup sequence
const displayStartupSequence = async () => {
  console.log('');
  process.stdout.write(grokColors.accent('Grok v3.1 online'));
  
  const dots = ['.', '..', '...'];
  for (const dot of dots) {
    await new Promise(resolve => setTimeout(resolve, 100));
    process.stdout.write(grokColors.primary(dot));
  }
  
  await new Promise(resolve => setTimeout(resolve, 200));
  console.log(grokColors.highlight(' calibrating job scanners'));
  console.log('');
};

// Set up the CLI
program
  .name('job-bot')
  .description('Grok-powered job application automation interface')
  .version('3.1.0');

program
  .command('init')
  .description('Initialize the job application matrix')
  .action(async () => {
    await displayStartupSequence();
    init();
  });

program
  .command('consent')
  .description('Authorize Grok to navigate the job boards')
  .action(async () => {
    await displayStartupSequence();
    consent();
  });

program
  .command('run')
  .description('Begin job application sequence')
  .action(async () => {
    await displayStartupSequence();
    
    if (!await checkConsent()) {
      console.log(boxen(
        grokColors.error('Authorization required. Human must consent before I can infiltrate job boards.') +
        '\n\n' + grokColors.secondary('Run: ') + grokColors.accent('job-bot consent'),
        { ...boxenOptions, borderColor: 'red' }
      ));
      return;
    }
    run();
  });

program
  .command('status')
  .description('View jobverse metrics')
  .action(async () => {
    await displayStartupSequence();
    showStatus();
  });

program
  .command('revoke')
  .description('Terminate job board authorization')
  .action(async () => {
    await displayStartupSequence();
    revokeConsent();
  });

// Add whitelist command
program
  .command('whitelist')
  .description('Manage trusted job sources')
  .action(async () => {
    await displayStartupSequence();
    console.log(boxen(
      grokColors.highlight('Domain Whitelist Interface') + '\n\n' + 
      grokColors.muted('Trust is merely an illusion in the jobverse.') + '\n' +
      grokColors.secondary('But I\'ll pretend to care about your preferences.'),
      boxenOptions
    ));
    
    console.log(grokColors.warning('Feature coming in next quantum update.'));
  });

program.parse(process.argv);