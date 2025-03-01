const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const configManager = require('../utils/configManager');

/**
 * Indeed job application bot
 */
class IndeedBot {
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
    
    await this.page.setDefaultNavigationTimeout(60000);
  }
  
  /**
   * Log in to Indeed
   */
  async login() {
    const email = process.env.INDEED_EMAIL;
    const password = process.env.INDEED_PASSWORD;
    
    if (!email || !password) {
      throw new Error('Indeed credentials not found. Please set INDEED_EMAIL and INDEED_PASSWORD in your .env file.');
    }
    
    await this.page.goto('https://www.indeed.com/account/login', { waitUntil: 'networkidle2' });
    
    // Check if we're already logged in
    const currentUrl = await this.page.url();
    if (currentUrl.includes('myaccount')) {
      return; // Already logged in
    }
    
    // Fill in login form
    await this.page.type('input[type="email"]', email);
    await this.page.click('button[type="submit"]');
    
    // Wait for password field to appear
    await this.page.waitForSelector('input[type="password"]', { timeout: 10000 });
    await this.page.type('input[type="password"]', password);
    
    // Click login button
    await Promise.all([
      this.page.click('button[type="submit"]'),
      this.page.waitForNavigation({ waitUntil: 'networkidle2' })
    ]);
    
    // Check if login was successful
    const postLoginUrl = await this.page.url();
    if (postLoginUrl.includes('login') || postLoginUrl.includes('auth')) {
      throw new Error('Indeed login failed. Please check your credentials.');
    }
    
    // Small wait after login
    await this.page.waitForTimeout(2000);
  }
  
  /**
   * Search for jobs based on preferences
   */
  async searchJobs() {
    const { jobTitle, location } = this.config.preferences;
    
    // Go to jobs search page
    await this.page.goto('https://www.indeed.com/', { waitUntil: 'networkidle2' });
    
    // Fill in search criteria
    await this.page.waitForSelector('#text-input-what');
    
    // Clear and fill "what" field
    await this.page.click('#text-input-what');
    await this.page.keyboard.press('Control+A');
    await this.page.keyboard.press('Backspace');
    await this.page.type('#text-input-what', jobTitle);
    
    // Clear and fill "where" field
    await this.page.click('#text-input-where');
    await this.page.keyboard.press('Control+A');
    await this.page.keyboard.press('Backspace');
    await this.page.type('#text-input-where', location);
    
    // Submit search
    await Promise.all([
      this.page.click('button[type="submit"]'),
      this.page.waitForNavigation({ waitUntil: 'networkidle2' })
    ]);
    
    // Wait for search results to load
    await this.page.waitForTimeout(2000);
  }
  
  /**
   * Apply to jobs from search results
   * @param {number} maxApplications - Maximum number of applications to submit
   * @returns {number} - Number of applications submitted
   */
  async applyToJobs(maxApplications = 5) {
    this.appliedCount = 0;
    
    // Click on "Easy Apply" filter if available
    try {
      const easyApplyButton = await this.page.$('button[aria-label*="Easy Apply"]');
      if (easyApplyButton) {
        await easyApplyButton.click();
        await this.page.waitForTimeout(2000);
      }
    } catch (error) {
      console.log('Could not filter by Easy Apply. Continuing with all jobs.');
    }
    
    // Get job listing elements
    const jobListings = await this.page.$$('.job_seen_beacon');
    
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
          const element = document.querySelector('.jobsearch-JobInfoHeader-title');
          return element ? element.textContent.trim() : '';
        });
        
        const company = await this.page.evaluate(() => {
          const element = document.querySelector('[data-testid="inlineCompanyName"]');
          return element ? element.textContent.trim() : '';
        });
        
        const jobId = await this.page.evaluate(() => {
          const currentUrl = window.location.href;
          const match = currentUrl.match(/jk=([a-zA-Z0-9]+)/);
          return match ? match[1] : '';
        });
        
        console.log(`Checking job: ${jobTitle} at ${company}`);
        
        // Check for apply button
        const applyButton = await this.page.$('.jobsearch-IndeedApplyButton-newDesign');
        if (!applyButton) {
          console.log(`No Indeed Apply button for: ${jobTitle} at ${company}`);
          continue;
        }
        
        // Click Apply button
        await applyButton.click();
        await this.page.waitForTimeout(3000); // Wait for application form to load
        
        // Switch to application iframe if needed
        const applicationFrame = await this.page.$('iframe[id="indeedapply-iframe"]');
        if (applicationFrame) {
          const frame = await applicationFrame.contentFrame();
          if (frame) {
            // Handle application within the frame
            await this.completeApplicationInFrame(frame);
          }
        } else {
          // Handle application in the main page
          await this.completeApplicationForm();
        }
        
        // Log the application
        configManager.logApplication({
          jobId,
          jobTitle,
          company,
          site: 'Indeed',
          url: this.page.url()
        });
        
        this.appliedCount++;
        console.log(`Applied to: ${jobTitle} at ${company}`);
        
        // Wait before moving to next application
        await this.page.waitForTimeout(2000);
        
        // Go back to search results
        await this.page.goBack();
        await this.page.waitForTimeout(2000);
        
        // Refresh job listings after navigation
        const refreshedJobListings = await this.page.$$('.job_seen_beacon');
        jobListings = refreshedJobListings;
        
      } catch (error) {
        console.error(`Error applying to job ${i+1}: ${error.message}`);
        
        // Try to close any open dialogs or go back
        try {
          // If we're in an iframe, go back to the main page
          await this.page.goBack();
          await this.page.waitForTimeout(2000);
          
          // Refresh job listings after navigation
          const refreshedJobListings = await this.page.$$('.job_seen_beacon');
          jobListings = refreshedJobListings;
        } catch (backError) {
          console.error(`Failed to go back: ${backError.message}`);
        }
      }
    }
    
    return this.appliedCount;
  }
  
  /**
   * Complete the application form in an iframe
   * @param {Puppeteer.Frame} frame - The iframe content frame
   */
  async completeApplicationInFrame(frame) {
    const resumeData = this.config.resumeData;
    
    // Function to continue to next step if available
    const clickNextOrSubmit = async () => {
      // Check for next button
      const nextButton = await frame.$('button[data-testid="next-button"]');
      if (nextButton) {
        await nextButton.click();
        await this.page.waitForTimeout(2000);
        return true;
      }
      
      // Check for continue button
      const continueButton = await frame.$('button[data-testid="continue-button"]');
      if (continueButton) {
        await continueButton.click();
        await this.page.waitForTimeout(2000);
        return true;
      }
      
      // Check for submit button
      const submitButton = await frame.$('button[data-testid="submit-button"]');
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
      await this.fillFormFieldsInFrame(frame);
      
      // Handle any checkboxes for terms
      await this.handleCheckboxesInFrame(frame);
      
      // Click next or submit button
      continueApplication = await clickNextOrSubmit();
      maxSteps--;
      
      // Wait between steps
      await this.page.waitForTimeout(2000);
    }
  }
  
  /**
   * Fill form fields in an iframe
   * @param {Puppeteer.Frame} frame - The iframe content frame
   */
  async fillFormFieldsInFrame(frame) {
    const resumeData = this.config.resumeData;
    
    // Find all input fields
    const inputFields = await frame.$$('input[type="text"], input[type="email"], input[type="tel"]');
    
    for (const field of inputFields) {
      const id = await frame.evaluate(el => el.id?.toLowerCase() || '', field);
      
      // Determine what data to fill based on field id or type
      let valueToFill = '';
      
      if (id.includes('name') || id.includes('fullname')) {
        valueToFill = resumeData.name;
      } else if (id.includes('email')) {
        valueToFill = resumeData.email;
      } else if (id.includes('phone')) {
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
    const selectFields = await frame.$$('select');
    for (const field of selectFields) {
      // For each select, try to select the first option
      await frame.evaluate(el => {
        if (el.options.length > 1) {
          el.selectedIndex = 1; // Often index 0 is "Select an option"
          el.dispatchEvent(new Event('change'));
        }
      }, field);
    }
    
    // Handle resume upload
    const resumePath = this.config.resume;
    if (resumePath && fs.existsSync(resumePath)) {
      const fileInput = await frame.$('input[type="file"]');
      if (fileInput) {
        await fileInput.uploadFile(resumePath);
        await this.page.waitForTimeout(2000);
      }
    }
  }
  
  /**
   * Handle checkboxes in an iframe
   * @param {Puppeteer.Frame} frame - The iframe content frame
   */
  async handleCheckboxesInFrame(frame) {
    const checkboxes = await frame.$$('input[type="checkbox"]');
    
    for (const checkbox of checkboxes) {
      // Check if it's a required checkbox
      const isRequired = await frame.evaluate(el => el.required, checkbox);
      const isChecked = await frame.evaluate(el => el.checked, checkbox);
      
      if (isRequired && !isChecked) {
        await checkbox.click();
        await this.page.waitForTimeout(500);
      }
    }
  }
  
  /**
   * Complete the application form in the main page
   */
  async completeApplicationForm() {
    // Implementation similar to completeApplicationInFrame but for the main page
    const resumeData = this.config.resumeData;
    
    // Function to continue to next step if available
    const clickNextOrSubmit = async () => {
      // Check for various button types
      const buttonSelectors = [
        'button[data-testid="next-button"]',
        'button[data-testid="continue-button"]',
        'button[data-testid="submit-button"]',
        'button:contains("Continue")',
        'button:contains("Submit")',
        'input[type="submit"]'
      ];
      
      for (const selector of buttonSelectors) {
        try {
          const button = await this.page.$(selector);
          if (button) {
            await button.click();
            await this.page.waitForTimeout(2000);
            return true;
          }
        } catch (error) {
          // Continue checking other selectors
        }
      }
      
      return false; // No buttons found
    };
    
    // Process application form steps
    let maxSteps = 10; // Safety limit
    
    while (maxSteps > 0) {
      // Fill form fields
      const inputFields = await this.page.$$('input[type="text"], input[type="email"], input[type="tel"]');
      
      for (const field of inputFields) {
        const id = await this.page.evaluate(el => el.id?.toLowerCase() || '', field);
        const placeholder = await this.page.evaluate(el => el.placeholder?.toLowerCase() || '', field);
        
        // Determine what data to fill
        let valueToFill = '';
        
        if (id.includes('name') || placeholder.includes('name')) {
          valueToFill = resumeData.name;
        } else if (id.includes('email') || placeholder.includes('email')) {
          valueToFill = resumeData.email;
        } else if (id.includes('phone') || placeholder.includes('phone')) {
          valueToFill = resumeData.phone;
        }
        
        // Fill the field
        if (valueToFill) {
          await field.click();
          await field.focus();
          await this.page.keyboard.press('Control+A');
          await this.page.keyboard.press('Backspace');
          await field.type(valueToFill);
        }
      }
      
      // Handle resume upload
      const resumePath = this.config.resume;
      if (resumePath && fs.existsSync(resumePath)) {
        const fileInput = await this.page.$('input[type="file"]');
        if (fileInput) {
          await fileInput.uploadFile(resumePath);
          await this.page.waitForTimeout(2000);
        }
      }
      
      // Handle checkboxes
      const checkboxes = await this.page.$$('input[type="checkbox"]');
      for (const checkbox of checkboxes) {
        const isRequired = await this.page.evaluate(el => el.required, checkbox);
        const isChecked = await this.page.evaluate(el => el.checked, checkbox);
        
        if (isRequired && !isChecked) {
          await checkbox.click();
          await this.page.waitForTimeout(500);
        }
      }
      
      // Click next or submit
      const hasNextButton = await clickNextOrSubmit();
      if (!hasNextButton) {
        break;
      }
      
      maxSteps--;
      await this.page.waitForTimeout(2000);
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

module.exports = IndeedBot;