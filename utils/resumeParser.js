const fs = require('fs');
const pdfParse = require('pdf-parse');
const path = require('path');

/**
 * Parse a resume file (PDF or text)
 * @param {string} filePath - Path to the resume file
 * @returns {Promise<Object>} - Parsed resume data
 */
async function parseResume(filePath) {
  try {
    const fileExt = path.extname(filePath).toLowerCase();
    let text = '';
    
    if (fileExt === '.pdf') {
      const dataBuffer = fs.readFileSync(filePath);
      const pdfData = await pdfParse(dataBuffer);
      text = pdfData.text;
    } else if (fileExt === '.txt' || fileExt === '.docx' || fileExt === '.doc') {
      // Simple text file reading for now
      // For DOCX/DOC, a more sophisticated parser would be needed in production
      text = fs.readFileSync(filePath, 'utf8');
    } else {
      throw new Error('Unsupported file format. Please use PDF, TXT, DOC, or DOCX files.');
    }
    
    // Extract key information from the resume text
    const extractedData = extractResumeData(text);
    return extractedData;
  } catch (error) {
    throw new Error(`Failed to parse resume: ${error.message}`);
  }
}

/**
 * Extract structured data from resume text
 * @param {string} text - The full text of the resume
 * @returns {Object} - Structured resume data
 */
function extractResumeData(text) {
  // This is a simplified extraction - a real implementation would use NLP/regex techniques
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  
  // Simple heuristics to extract data
  const data = {
    name: '',
    email: '',
    phone: '',
    skills: [],
    experience: [],
    education: []
  };
  
  // Try to find the name (usually at the top)
  if (lines.length > 0) {
    data.name = lines[0];
  }
  
  // Try to find email and phone
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
  const phoneRegex = /(\+\d{1,3}[-.\s]?)?(\(?\d{3}\)?[-.\s]?)?\d{3}[-.\s]?\d{4}/;
  
  for (const line of lines) {
    const emailMatch = line.match(emailRegex);
    if (emailMatch && !data.email) {
      data.email = emailMatch[0];
    }
    
    const phoneMatch = line.match(phoneRegex);
    if (phoneMatch && !data.phone) {
      data.phone = phoneMatch[0];
    }
  }
  
  // Extract skills (this is a simplified approach)
  const skillsKeywords = [
    'skills', 'technical skills', 'proficiencies', 'expertise'
  ];
  
  let inSkillsSection = false;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].toLowerCase();
    
    if (skillsKeywords.some(keyword => line.includes(keyword))) {
      inSkillsSection = true;
      continue;
    }
    
    if (inSkillsSection) {
      // Check if we've moved to a new section
      if (line.endsWith(':') || line.endsWith(' ')) {
        inSkillsSection = false;
        continue;
      }
      
      // Add skills - split by commas or other common separators
      const skills = line.split(/[,|•]/).map(s => s.trim()).filter(s => s.length > 0);
      data.skills.push(...skills);
    }
  }
  
  // Simple extraction of experience (this would be more sophisticated in production)
  const experienceKeywords = [
    'experience', 'work experience', 'employment', 'work history'
  ];
  
  let inExperienceSection = false;
  let currentExperience = {};
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lowerLine = line.toLowerCase();
    
    if (experienceKeywords.some(keyword => lowerLine.includes(keyword))) {
      inExperienceSection = true;
      continue;
    }
    
    if (inExperienceSection) {
      // Check if we've moved to a new section
      if (lowerLine.includes('education') || lowerLine.includes('skills')) {
        inExperienceSection = false;
        if (Object.keys(currentExperience).length > 0) {
          data.experience.push(currentExperience);
        }
        continue;
      }
      
      // Try to identify job title and company
      if (line.includes(' at ') || line.includes(' - ')) {
        if (Object.keys(currentExperience).length > 0) {
          data.experience.push(currentExperience);
        }
        
        currentExperience = { title: '', company: '', description: [] };
        
        if (line.includes(' at ')) {
          const parts = line.split(' at ');
          currentExperience.title = parts[0].trim();
          currentExperience.company = parts[1].trim();
        } else if (line.includes(' - ')) {
          const parts = line.split(' - ');
          currentExperience.title = parts[0].trim();
          currentExperience.company = parts[1].trim();
        }
      } else if (currentExperience.title) {
        // Add to the description of the current experience
        currentExperience.description.push(line);
      }
    }
  }
  
  // Add the last experience if we were in that section
  if (inExperienceSection && Object.keys(currentExperience).length > 0) {
    data.experience.push(currentExperience);
  }
  
  return data;
}

module.exports = {
  parseResume
};