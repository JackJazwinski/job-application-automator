const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const configManager = require('../utils/configManager');

/**
 * LinkedIn job application bot
 */
class LinkedInBot {
  constructor() {
    this.browser = null;
    this.page = null;
    this.config = configManager.getConfig();
    this.appliedCount = 0;
  }
  
  /**
   * Initialize the browser
   */
  async initialize() {
    this.browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
    });
    this.page = await this.browser.newPage();
    await this.page.setViewport({ width: 1280, height: 800 });
    
    // Set user agent
    await this.page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
    
    // Add some randomization to seem more human-like
    await this.page.setDefaultNavigationTimeout(60000);
  }
  
  /**
   * Log in to LinkedIn
   */
  async login() {
    const email = process.env.LINKEDIN_EMAIL;
    const password = process.env.LINKEDIN_PASSWORD;
    
    if (!email || !password) {
      throw new Error('LinkedIn credentials not found. Please set LINKEDIN_EMAIL and LINKEDIN_PASSWORD in your .env file.');
    }
    
    await this.page.goto('https://www.linkedin.com/login', { waitUntil: 'networkidle2' });
    
    // Fill in login form
    await this.page.type('#username', email);
    await this.page.type('#password', password);
    
    // Click login button
    await Promise.all([
      this.page.click('.login__form_action_container button'),
      this.page.waitForNavigation({ waitUntil: 'networkidle2' })
    ]);
    
    // Check if login was successful
    const currentUrl = this.page.url();
    if (currentUrl.includes('checkpoint') || currentUrl.includes('login')) {
      throw new Error('LinkedIn login failed. Please check your credentials or verify if there\'s a security checkpoint.');
    }
    
    // Small wait after login
    await this.page.waitForTimeout(2000);
  }
  
  /**
   * Search for jobs based on preferences
   */
  async searchJobs() {
    const { jobTitle, location } = this.config.preferences;
    
    // Go to jobs page
    await this.page.goto('https://www.linkedin.com/jobs/', { waitUntil: 'networkidle2' });
    
    // Fill in search criteria
    await this.page.waitForSelector('.jobs-search-box__text-input');
    
    // Clear and fill keyword field
    await this.page.click('.jobs-search-box__text-input[aria-label="Search by title, skill, or company"]');
    await this.page.type('.jobs-search-box__text-input[aria-label="Search by title, skill, or company"]', jobTitle);
    
    // Clear and fill location field
    await this.page.click('.jobs-search-box__text-input[aria-label="City, state, or zip code"]');
    await this.page.keyboard.press('Control+A');
    await this.page.keyboard.press('Backspace');
    await this.page.type('.jobs-search-box__text-input[aria-label="City, state, or zip code"]', location);
    
    // Submit search
    await Promise.all([
      this.page.click('.jobs-search-box__submit-button'),
      this.page.waitForNavigation({ waitUntil: 'networkidle2' })
    ]);
    
    // Allow search results to load
    await this.page.waitForTimeout(2000);
  }
  
  /**
   * Apply to jobs from search results
   * @param {number} maxApplications - Maximum number of applications to submit
   * @returns {number} - Number of applications submitted
   */
  async applyToJobs(maxApplications = 5) {
    this.appliedCount = 0;
    
    // Get job listing elements
    const jobListings = await this.page.$$('.jobs-search-results__list-item');
    
    if (!jobListings || jobListings.length === 0) {
      console.log('No job listings found.');
      return 0;
    }
    
    // Process each job listing
    for (let i = 0; i < Math.min(jobListings.length, maxApplications); i++) {
      // Click on job listing
      try {
        await jobListings[i].click();
        await this.page.waitForTimeout(2000); // Wait for job details to load
        
        // Get job details
        const jobTitle = await this.page.evaluate(() => {
          const element = document.querySelector('.jobs-unified-top-card__job-title');
          return element ? element.textContent.trim() : '';
        });
        
        const company = await this.page.evaluate(() => {
          const element = document.querySelector('.jobs-unified-top-card__company-name');
          return element ? element.textContent.trim() : '';
        });
        
        const jobId = await this.page.evaluate(() => {
          const currentUrl = window.location.href;
          const match = currentUrl.match(/\/view\/(\d+)/);
          return match ? match[1] : '';
        });
        
        // Check if already applied
        const alreadyApplied = await this.page.evaluate(() => {
          return document.querySelector('.jobs-s-apply button span')?.textContent.includes('Applied');
        });
        
        if (alreadyApplied) {
          console.log(`Already applied to: ${jobTitle} at ${company}`);
          continue;
        }
        
        // Check for easy apply button
        const easyApplyButton = await this.page.$('.jobs-s-apply button');
        if (!easyApplyButton) {
          console.log(`No Easy Apply button for: ${jobTitle} at ${company}`);
          continue;
        }
        
        // Click Easy Apply button
        await easyApplyButton.click();
        await this.page.waitForTimeout(2000);
        
        // Handle application form
        await this.completeApplicationForm();
        
        // Log the application
        configManager.logApplication({
          jobId,
          jobTitle,
          company,
          site: 'LinkedIn',
          url: this.page.url()
        });
        
        this.appliedCount++;
        console.log(`Applied to: ${jobTitle} at ${company}`);
        
        // Wait before moving to next application
        await this.page.waitForTimeout(2000);
        
      } catch (error) {
        console.error(`Error applying to job ${i+1}: ${error.message}`);
        
        // Try to close any open dialogs
        const closeButton = await this.page.$('.artdeco-modal__dismiss');
        if (closeButton) {
          await closeButton.click();
          await this.page.waitForTimeout(1000);
          
          // If there's a confirmation dialog for closing
          const confirmButton = await this.page.$('.artdeco-modal__confirm-dialog-btn');
          if (confirmButton) {
            await confirmButton.click();
            await this.page.waitForTimeout(1000);
          }
        }
      }
    }
    
    return this.appliedCount;
  }
  
  /**
   * Complete the application form
   */
  async completeApplicationForm() {
    const resumeData = this.config.resumeData;
    
    // Function to continue to next step if available
    const clickNextOrSubmit = async () => {
      // Check for next button
      const nextButton = await this.page.$('button[aria-label="Continue to next step"]');
      if (nextButton) {
        await nextButton.click();
        await this.page.waitForTimeout(2000);
        return true;
      }
      
      // Check for review button
      const reviewButton = await this.page.$('button[aria-label="Review your application"]');
      if (reviewButton) {
        await reviewButton.click();
        await this.page.waitForTimeout(2000);
        return true;
      }
      
      // Check for submit button
      const submitButton = await this.page.$('button[aria-label="Submit application"]');
      if (submitButton) {
        await submitButton.click();
        await this.page.waitForTimeout(2000);
        return false; // End of application
      }
      
      return false; // No buttons found
    };
    
    // Process application form steps in a loop
    let continueApplication = true;
    let maxSteps = 10; // Safety limit
    
    while (continueApplication && maxSteps > 0) {
      // Fill form fields if present
      await this.fillFormFields();
      
      // Upload resume if file upload is present
      await this.uploadResumeIfNeeded();
      
      // Handle any checkboxes for terms
      await this.handleCheckboxes();
      
      // Click next or submit button
      continueApplication = await clickNextOrSubmit();
      maxSteps--;
      
      // Wait between steps
      await this.page.waitForTimeout(1500);
    }
  }
  
  /**
   * Fill form fields with user data
   */
  async fillFormFields() {
    const resumeData = this.config.resumeData;
    
    // Find all input fields
    const inputFields = await this.page.$$('input[type="text"], input[type="email"], input[type="tel"]');
    
    for (const field of inputFields) {
      const placeholder = await this.page.evaluate(el => el.placeholder?.toLowerCase() || '', field);
      const label = await this.page.evaluate(el => {
        const labelEl = document.querySelector(`label[for="${el.id}"]`);
        return labelEl ? labelEl.textContent.toLowerCase() : '';
      }, field);
      
      // Determine what data to fill based on label or placeholder
      let valueToFill = '';
      
      if (placeholder.includes('name') || label.includes('name') || label.includes('full name')) {
        valueToFill = resumeData.name;
      } else if (placeholder.includes('email') || label.includes('email')) {
        valueToFill = resumeData.email;
      } else if (placeholder.includes('phone') || label.includes('phone')) {
        valueToFill = resumeData.phone;
      }
      
      // Fill the field if we have a value
      if (valueToFill) {
        await field.click();
        await field.focus();
        await this.page.keyboard.press('Control+A');
        await this.page.keyboard.press('Backspace');
        await field.type(valueToFill);
      }
    }
    
    // Handle select fields
    const selectFields = await this.page.$$('select');
    for (const field of selectFields) {
      // For each select, try to select the first option
      await this.page.evaluate(el => {
        if (el.options.length > 1) {
          el.selectedIndex = 1; // Often index 0 is "Select an option"
          el.dispatchEvent(new Event('change'));
        }
      }, field);
    }
  }
  
  /**
   * Upload resume if file upload is present
   */
  async uploadResumeIfNeeded() {
    const resumePath = this.config.resume;
    
    if (!resumePath || !fs.existsSync(resumePath)) {
      return;
    }
    
    // Look for file input
    const fileInput = await this.page.$('input[type="file"]');
    if (fileInput) {
      await fileInput.uploadFile(resumePath);
      await this.page.waitForTimeout(2000);
    }
  }
  
  /**
   * Handle checkboxes (usually for terms and conditions)
   */
  async handleCheckboxes() {
    const checkboxes = await this.page.$$('input[type="checkbox"]');
    
    for (const checkbox of checkboxes) {
      // Check if it's a terms checkbox
      const isRequired = await this.page.evaluate(el => el.required, checkbox);
      const isChecked = await this.page.evaluate(el => el.checked, checkbox);
      
      if (isRequired && !isChecked) {
        await checkbox.click();
        await this.page.waitForTimeout(500);
      }
    }
  }
  
  /**
   * Close the browser
   */
  async close() {
    if (this.browser) {
      await this.browser.close();
    }
  }
}

module.exports = LinkedInBot;