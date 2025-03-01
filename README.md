# JobBot - Automated Job Application Tool

JobBot is a tool that automates the job application process on popular job sites such as Indeed. It's designed to streamline your job search by handling repetitive application tasks. JobBot is available both as a command-line interface (CLI) and a web application.

## Features

- Parse your resume to extract key details (name, email, skills, etc.)
- Store your job preferences (title, location, industry)
- Automate job searches on LinkedIn and Indeed
- Automatically apply to relevant jobs with "Easy Apply" options
- Track your application history to avoid duplicates
- Manage consent for automated applications
- View application statistics and history

## Installation

1. Clone this repository
2. Install dependencies:

```bash
npm install
```

3. Make the CLI executable:

```bash
chmod +x index.js
npm link
```

## Setup

Before using JobBot, you need to:

1. Initialize the app with your resume and preferences:

```bash
job-bot init
```

2. Create a `.env` file with your job site credentials (use `.env.example` as a template):

```bash
cp .env.example .env
# Edit .env with your credentials
```

3. Provide consent for automated applications:

```bash
job-bot consent
```

## Usage

### Basic Commands

- `job-bot init`: Set up your resume and job preferences
- `job-bot consent`: Provide or revoke consent for automated applications
- `job-bot run`: Start the automation process
- `job-bot status`: View statistics about your job applications
- `job-bot revoke`: Revoke consent and pause automation

### Example Workflow

```bash
# First-time setup
job-bot init
# Follow the prompts to set up your resume and preferences

# Provide consent
job-bot consent

# Run the automation
job-bot run

# Check your application status
job-bot status
```

## How It Works

1. JobBot parses your resume to extract key information
2. When you run the automation, it:
   - Logs into job sites using your credentials
   - Searches for jobs matching your preferences
   - Applies to relevant positions with "Easy Apply" options
   - Fills application forms with your resume data
   - Logs successful applications to avoid duplicates
3. All applications are logged locally so you can track your progress

## Security & Privacy

- Your credentials are stored in the local `.env` file and are never transmitted
- JobBot only operates within your local environment
- Full consent management ensures you're in control of the automation

## Extending JobBot

You can add support for additional job sites by:

1. Creating a new bot class in the `lib` directory
2. Adding the new bot to the automation process in `src/automation.js`

## Disclaimer

Use responsibly and ensure compliance with job site terms of service. This tool is meant to assist with legitimate job applications, not to circumvent any site restrictions or policies.

## Web Application

JobBot also comes with a modern web interface that provides a more user-friendly way to interact with the automation system.

### Web App Features

- **Setup Wizard**: Upload your resume and set job preferences through a guided process
- **Dashboard**: View application statistics and charts to track your job search progress
- **Application History**: Browse, search, and filter your job application history
- **Settings**: Easily manage automation settings and job site credentials

### Running the Web App

To start the web application:

```bash
cd web-app
npm install
npm start
```

The application will be available at http://localhost:3000

For more details, see the [web app README](./web-app/README.md).

## License

MIT
