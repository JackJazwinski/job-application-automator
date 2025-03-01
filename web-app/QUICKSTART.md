# JobBot Quick Start Guide - API-Only Mode

This quick start guide will help you get up and running with the JobBot command-line automation tool using API-only mode. This approach uses RapidAPI for job searching instead of relying on web automation with Puppeteer, which eliminates the errors related to Chromium not being found.

## Setup

1. **Install Dependencies**
   ```bash
   npm install axios
   ```
   Note: You don't need to install Puppeteer since we're using API-only mode.

2. **Configure Your Personal Information**
   Edit the `config` object in `job-application-automator.js`:
   ```javascript
   // Your personal info
   applicant: {
     name: 'Your Name',
     email: 'your.email@example.com',
     phone: '555-123-4567',
     // ... update other fields
   }
   ```

3. **Add Your Resume & Cover Letter**
   - Place your resume in `assets/resume.pdf` or `assets/resume.txt`
   - Update the cover letter template in `assets/cover_letter.txt`

4. **Verify API-Only Mode**
   Make sure these settings are configured in the `config` object:
   ```javascript
   // API settings
   api_key: 'YOUR_RAPIDAPI_KEY',
   api_only_mode: true,
   rapidapi_host: 'jsearch.p.rapidapi.com'
   ```

5. **Get a RapidAPI Key**
   - Sign up at [RapidAPI](https://rapidapi.com/)
   - Find a job search API (JSearch is recommended) and subscribe to it
   - Copy your API key to the `config.api_key` field in `job-application-automator.js`

6. **Customize Your Skills**
   Update the `mySkills` array in the `scoreJobMatch` function:
   ```javascript
   const mySkills = [
     { skill: 'java', weight: 10 },
     { skill: 'spring', weight: 8 },
     // ... add your skills here
   ];
   ```

## Running the Tool

### One-time Run
```bash
node job-application-automator.js
```

### Scheduled Daily Run
```bash
node schedule.js
```
This will run the job automator every day at 9:00 AM by default.

To test the scheduler immediately:
```bash
node schedule.js --run-now
```

## What It Does in API-Only Mode

1. **Searches for Jobs**: Fetches job listings matching your criteria from Indeed via RapidAPI
2. **Scores & Ranks Jobs**: Evaluates each job based on how well it matches your skills
3. **Tracks Applications**: Keeps a database of all jobs found
4. **Provides Application URLs**: Gives you links to apply manually
5. **Manages Follow-ups**: Schedules and reminds you about follow-ups

## Data Storage

1. **Job Database**: All job data is stored in `data/job_applications.json`
2. **Logs**: Scheduler logs are saved in the `logs` directory

## Workflow

1. The tool searches for jobs using Indeed via RapidAPI
2. It scores and ranks jobs based on your skills
3. You review the jobs in the database
4. You apply manually using the provided application URLs
5. The tool reminds you when it's time to follow up

## Next Steps

1. Review jobs in the database and their scores
2. Apply manually using the application URLs
3. Update your skills list to better match desired positions
4. Run the script daily to find new opportunities

## Troubleshooting

- **API Errors**: Check your API key and subscription status
   - "You are not subscribed to this API" - You need to subscribe to the API on RapidAPI
   - "Forbidden" - Check that your API key is correct
   - "Bad Gateway" - The API service might be down temporarily

- **File Not Found Errors**: Ensure all required directories exist:
   - `assets` - For your resume and cover letter template
   - `data` - For the job database
   - `generated_cover_letters` - For custom cover letters

- **Module Not Found**: Run `npm install axios` to install required dependencies

## Advanced Configuration

- Customize the cover letter generation logic in `generateCoverLetterForJob`
- Add more detailed keywords to `extractKeywords`
- Modify job scoring weights in `scoreJobMatch`
- Change the job search query in `config.search`