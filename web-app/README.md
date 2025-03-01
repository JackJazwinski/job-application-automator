# JobBot - Automated Job Application Tool

This tool enables automated job searching and application using API calls directly, without the need for a web interface.

## Features

### Web Interface
- **Setup Wizard**: Upload your resume and set job preferences
- **Dashboard**: View application statistics and track progress
- **Application History**: Browse and search your job application history
- **Settings**: Manage automation settings and job site credentials

### Command-line Automation
- **Direct API Integration**: Search for jobs using RapidAPI
- **Job Scoring**: Automatically ranks jobs based on keyword matches with your skills
- **Application Tracking**: Keeps track of job applications and their status
- **Follow-ups**: Automatically schedules and sends follow-up emails
- **Persistent Storage**: Stores all data in a local JSON database

## Installation

1. Install dependencies:

```bash
npm install
```

## Usage Options

### Web Interface
Start the development server:

```bash
npm start
```

The application will be available at http://localhost:3000

### Command-line Automation
Run the job search and application automation script:

```bash
node job-application-automator.js
```

## Building the Web UI for Production

To build the web application for production:

```bash
npm run build
```

This will create a `build` folder with production-ready files.

## Command-line Tool Configuration

### Job Search Criteria

Modify the `config.search` object in `job-application-automator.js` to adjust your search parameters:

```javascript
search: {
  query: 'java',
  location: 'austin, tx',
  radius: 25,
  days_old: 30,
  limit: 50,
}
```

### Skills and Scoring

Update the `mySkills` array in the `scoreJobMatch` function to match your skills and priorities:

```javascript
const mySkills = [
  { skill: 'java', weight: 10 },
  { skill: 'spring', weight: 8 },
  // ...add your skills here
];
```

## API Integration

The current implementation uses simulated job data. To integrate with a real job search API:

1. Uncomment the API call code in the `searchJobs` function
2. Add your API key to the `config.api_key` property
3. Adjust the API request parameters to match your chosen API
4. Update the response parsing to match the API's response format

## Architecture

The web application is built with:

- **React**: Frontend library
- **React Router**: For navigation and routing
- **Formik & Yup**: Form handling and validation
- **Chart.js**: Data visualization
- **Styled Components**: CSS styling

The command-line tool uses:
- **Node.js**: Runtime environment
- **Axios**: HTTP client for API requests
- **File System API**: Local data storage

## Development

The repository is organized as follows:

- `src/`: Web application source code
  - `components/`: Reusable UI components
  - `pages/`: Main application pages 
  - `utils/`: Helper functions and utilities
  - `assets/`: Static assets like images
- `assets/`: Resume and cover letter templates for command-line tool
- `data/`: Application database for command-line tool
- `*.js`: Command-line automation scripts

## Next Steps

- Connect to real job search APIs
- Implement browser automation for application submission (using Puppeteer)
- Add email integration for follow-ups
- Schedule daily job searches and reports
- Integrate web UI with command-line backend

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT