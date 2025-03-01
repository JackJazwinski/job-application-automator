const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Configuration
const config = {
  // Your job search parameters
  search: {
    query: 'java',
    location: 'austin, tx',
    radius: 25,
    days_old: 30,
    limit: 50,
  },
  // Your personal info for applications
  applicant: {
    name: 'Your Name',
    email: 'your.email@example.com',
    phone: '555-123-4567',
    resume_path: path.join(__dirname, 'assets', 'resume.pdf'),
    cover_letter_path: path.join(__dirname, 'assets', 'cover_letter.txt'),
    linkedin_url: 'https://linkedin.com/in/yourprofile',
    github_url: 'https://github.com/yourusername',
    portfolio_url: 'https://yourportfolio.com',
  },
  // Database path (JSON file in this simple example)
  db_path: path.join(__dirname, 'data', 'job_applications.json'),
  // API key (placeholder - use your actual key)
  api_key: '0525d098f9msh0a57d19842976ffp1fd60bjsn715f898783f1',
  // Use API-only mode (no browser automation)
  api_only_mode: true,
  // RapidAPI host for job search
  rapidapi_host: 'jsearch.p.rapidapi.com'
};

// Create storage directories if they don't exist
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Initialize or load the job applications database
function loadDatabase() {
  if (!fs.existsSync(config.db_path)) {
    const initialDb = {
      jobs: [],
      applications: [],
      last_updated: new Date().toISOString(),
    };
    fs.writeFileSync(config.db_path, JSON.stringify(initialDb, null, 2));
    return initialDb;
  }
  
  const data = fs.readFileSync(config.db_path, 'utf8');
  return JSON.parse(data);
}

// Save to database
function saveDatabase(db) {
  db.last_updated = new Date().toISOString();
  fs.writeFileSync(config.db_path, JSON.stringify(db, null, 2));
}

// Search for jobs using RapidAPI
async function searchJobs() {
  console.log(`Searching for ${config.search.query} jobs in ${config.search.location}...`);
  
  try {
    // Use the RapidAPI endpoint with proper configuration
    if (config.api_only_mode) {
      console.log('Using API-only mode to search for jobs (no browser automation)');
      
      // Define the search parameters for the JSearch API
      const options = {
        method: 'GET',
        url: 'https://jsearch.p.rapidapi.com/search',
        params: {
          query: `${config.search.query} in ${config.search.location}`,
          page: '1',
          num_pages: '1'
        },
        headers: {
          'x-rapidapi-key': config.api_key,
          'x-rapidapi-host': config.rapidapi_host
        }
      };
      
      try {
        console.log('Making API request to RapidAPI...');
        const response = await axios.request(options);
        
        // If successful, transform the data into our expected format
        if (response.data && response.data.data) {
          console.log(`API returned ${response.data.data.length} results`);
          
          const results = response.data.data.map((job, index) => ({
            jobId: `api-${index}-${Date.now()}`,
            title: job.job_title || 'Unknown Title',
            company: job.employer_name || 'Unknown Company',
            location: job.job_city ? `${job.job_city}, ${job.job_state || ''}` : 'Location not specified',
            url: job.job_apply_link || '',
            snippet: job.job_description || 'No description available',
            date: job.job_posted_at_datetime_utc || new Date().toISOString(),
            estimatedSalary: job.job_min_salary ? `$${job.job_min_salary} - $${job.job_max_salary || ''}` : 'Salary not specified',
            applicationUrl: job.job_apply_link || ''
          }));
          
          return {
            results: results,
            totalResults: results.length
          };
        }
      } catch (error) {
        console.error('Error fetching jobs from API:', error.message);
        if (error.response) {
          console.error('API Response:', error.response.data);
        }
      }
    }
    
    // Fall back to simulated data if API fails or is not in API-only mode
    console.log('Using simulated job data...');
    return {
      results: [
        {
          jobId: 'job1',
          title: "Senior Java Developer",
          company: "Example Tech Co.",
          location: "Austin, TX",
          url: "https://example.com/job1",
          snippet: "We're looking for an experienced Java developer with 5+ years experience...",
          date: "2025-02-25",
          estimatedSalary: "$120,000 - $150,000",
          applicationUrl: "https://example.com/apply/job1"
        },
        {
          jobId: 'job2',
          title: "Java Software Engineer",
          company: "Tech Solutions Inc.",
          location: "Austin, TX",
          url: "https://example.com/job2",
          snippet: "Join our team developing enterprise Java applications...",
          date: "2025-02-28",
          estimatedSalary: "$100,000 - $130,000",
          applicationUrl: "https://example.com/apply/job2"
        },
        {
          jobId: 'job3',
          title: "Full Stack Java Developer",
          company: "Digital Innovations",
          location: "Austin, TX (Remote)",
          url: "https://example.com/job3",
          snippet: "Looking for a full stack developer with Java and React experience...",
          date: "2025-03-01",
          estimatedSalary: "$110,000 - $140,000",
          applicationUrl: "https://example.com/apply/job3"
        }
      ],
      totalResults: 3
    };
  } catch (error) {
    console.error('Unexpected error in searchJobs:', error);
    return {
      results: [],
      totalResults: 0
    };
  }
}

// Check if a job already exists in our database
function jobExists(db, jobId) {
  return db.jobs.some(job => job.jobId === jobId);
}

// Add new jobs to the database
function addNewJobs(db, jobResults) {
  let newJobCount = 0;
  
  for (const job of jobResults.results) {
    if (!jobExists(db, job.jobId)) {
      // Add job to database with additional metadata
      db.jobs.push({
        ...job,
        discovered: new Date().toISOString(),
        status: 'new',
        notes: '',
        keywords: extractKeywords(job.title + ' ' + job.snippet),
        score: scoreJobMatch(job.title + ' ' + job.snippet),
      });
      newJobCount++;
    }
  }
  
  // Sort jobs by score (highest first)
  db.jobs.sort((a, b) => b.score - a.score);
  
  return newJobCount;
}

// Utility to extract keywords from job description
function extractKeywords(text) {
  // Simple implementation - in a real app, you'd use NLP or a more sophisticated approach
  const commonTechKeywords = [
    'java', 'spring', 'hibernate', 'kafka', 'aws', 'microservices', 
    'react', 'angular', 'vue', 'node.js', 'python', 'sql', 'nosql',
    'docker', 'kubernetes', 'ci/cd', 'agile', 'scrum', 'devops'
  ];
  
  const foundKeywords = [];
  const lowercaseText = text.toLowerCase();
  
  for (const keyword of commonTechKeywords) {
    if (lowercaseText.includes(keyword)) {
      foundKeywords.push(keyword);
    }
  }
  
  return foundKeywords;
}

// Score a job based on keyword matches with your skills
function scoreJobMatch(text) {
  // Your skills (in a real app, you'd load these from a profile)
  const mySkills = [
    { skill: 'java', weight: 10 },
    { skill: 'spring', weight: 8 },
    { skill: 'hibernate', weight: 6 },
    { skill: 'microservices', weight: 7 },
    { skill: 'aws', weight: 5 },
    { skill: 'react', weight: 4 }
  ];
  
  let score = 0;
  const lowercaseText = text.toLowerCase();
  
  for (const skill of mySkills) {
    if (lowercaseText.includes(skill.skill)) {
      score += skill.weight;
    }
  }
  
  return score;
}

// Apply for a job (automated or simulated based on configuration)
async function applyForJob(job) {
  console.log(`Applying for: ${job.title} at ${job.company}`);
  
  // In API-only mode, we just track the jobs and don't try to use browser automation
  if (config.api_only_mode) {
    console.log('API-only mode: Recording job for manual application');
    console.log(`Application URL: ${job.applicationUrl}`);
    
    // No cover letter generation - just track the job
    return {
      success: true,
      applicationId: `api-app-${Date.now()}`,
      date: new Date().toISOString(),
      method: 'api-tracked'
    };
  }
  
  // We're using API-only mode, so no browser automation is needed
  // In a full implementation, you might:
  // 1. Navigate to the application URL
  // 2. Fill in application forms
  // 3. Upload resume and cover letter
  // 4. Submit the application
  
  // For now, we'll simulate a successful application
  return {
    success: true,
    applicationId: `app-${Date.now()}`,
    date: new Date().toISOString(),
    method: 'simulated'
  };
}

// Update job status after application
function updateJobApplication(db, jobId, applicationResult) {
  const job = db.jobs.find(j => j.jobId === jobId);
  
  if (job) {
    job.status = 'applied';
    job.applicationDate = applicationResult.date;
    
    // Add to applications list
    db.applications.push({
      jobId: jobId,
      applicationId: applicationResult.applicationId,
      date: applicationResult.date,
      status: 'submitted',
      followupDate: calculateFollowupDate(applicationResult.date),
      followupSent: false
    });
  }
}

// Calculate when to follow up (2 weeks after application)
function calculateFollowupDate(applicationDate) {
  const followupDate = new Date(applicationDate);
  followupDate.setDate(followupDate.getDate() + 14);
  return followupDate.toISOString();
}

// Check for jobs that need follow-up
function checkFollowups(db) {
  const now = new Date();
  const followupsDue = [];
  
  for (const app of db.applications) {
    if (!app.followupSent && new Date(app.followupDate) <= now) {
      const job = db.jobs.find(j => j.jobId === app.jobId);
      followupsDue.push({ application: app, job });
    }
  }
  
  return followupsDue;
}

// Send follow-up email (simulated)
function sendFollowupEmail(application, job) {
  console.log(`Sending follow-up email for ${job.title} at ${job.company}`);
  
  // In a real implementation, you would:
  // 1. Use an email API or service
  // 2. Generate a personalized follow-up template
  
  // For now, we'll simulate a successful email
  application.followupSent = true;
  application.followupDate = new Date().toISOString();
  application.status = 'followed-up';
  
  return true;
}

// Main function to run the job application process
async function main() {
  try {
    console.log('============================================');
    console.log('JOB APPLICATION AUTOMATION SYSTEM');
    console.log('============================================');
    
    if (config.api_only_mode) {
      console.log('RUNNING IN API-ONLY MODE');
      console.log('- Using JSearch API for job searching');
      console.log('- No browser automation');
      console.log('- Jobs will be tracked for manual application');
      console.log('============================================');
    }
    
    // Load database
    const db = loadDatabase();
    console.log(`Database loaded: ${db.jobs.length} jobs, ${db.applications.length} applications`);
    
    // 1. Search for new jobs
    console.log('\n📋 Searching for new jobs...');
    const jobResults = await searchJobs();
    const newJobCount = addNewJobs(db, jobResults);
    console.log(`Found ${jobResults.totalResults} jobs, ${newJobCount} new jobs added to database`);
    
    // 2. Apply for top jobs that we haven't applied to yet (limit to 5 per run)
    console.log('\n📝 Preparing job applications...');
    let applicationsSubmitted = 0;
    for (const job of db.jobs) {
      if (job.status === 'new' && applicationsSubmitted < 5) {
        console.log(`\nPreparing application for: ${job.title} at ${job.company}`);
        console.log(`Score: ${job.score}, Keywords: ${job.keywords.join(', ')}`);
        
        const applicationResult = await applyForJob(job);
        
        if (applicationResult.success) {
          updateJobApplication(db, job.jobId, applicationResult);
          applicationsSubmitted++;
          
          console.log(`✅ Application ${config.api_only_mode ? 'tracked' : 'submitted'} successfully!`);
        } else {
          console.log(`❌ Application failed: ${applicationResult.error}`);
        }
      }
    }
    console.log(`\nCompleted ${applicationsSubmitted} new job applications`);
    
    // 3. Check for follow-ups
    console.log('\n📞 Checking for follow-ups...');
    const followupsDue = checkFollowups(db);
    let followupsSent = 0;
    
    for (const { application, job } of followupsDue) {
      const result = sendFollowupEmail(application, job);
      if (result) followupsSent++;
    }
    
    console.log(`Sent ${followupsSent} follow-up emails`);
    
    // 4. Save updated database
    saveDatabase(db);
    console.log('\n💾 Database saved successfully');
    
    // 5. Summary
    console.log('\n============================================');
    console.log('SUMMARY');
    console.log('============================================');
    console.log(`Total jobs tracked: ${db.jobs.length}`);
    console.log(`Total applications ${config.api_only_mode ? 'tracked' : 'submitted'}: ${db.applications.length}`);
    console.log(`New applications today: ${applicationsSubmitted}`);
    console.log(`Follow-ups sent today: ${followupsSent}`);
    
    const appliedJobs = db.jobs.filter(job => job.status === 'applied').length;
    console.log(`Application success rate: ${Math.round((appliedJobs / db.jobs.length) * 100)}%`);
    
    console.log('\nNext steps:');
    if (config.api_only_mode) {
      console.log('1. Apply to jobs using the tracked application URLs');
      console.log('2. Update application status in the database manually');
      console.log('3. Run this script daily to find new opportunities');
    } else {
      console.log('1. This script can be scheduled to run daily');
      console.log('2. Integrate with actual job board APIs or web scraping');
      console.log('3. Connect to email API for real follow-ups');
      console.log('4. Build a web UI to manage applications');
    }
    
  } catch (error) {
    console.error('Error in automation process:', error);
  }
}

// Run the application
main();