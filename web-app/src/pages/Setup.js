import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { FaCloudUploadAlt, FaUser, FaMapMarkerAlt, FaBriefcase, FaClock } from 'react-icons/fa';
import './Setup.css';

const Setup = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [resumeData, setResumeData] = useState(null);
  
  // Resume upload validation schema
  const resumeSchema = Yup.object().shape({
    resume: Yup.mixed()
      .required('Please upload your resume file')
  });
  
  // Job preferences validation schema
  const preferencesSchema = Yup.object().shape({
    jobTitle: Yup.string()
      .required('Job title is required'),
    location: Yup.string()
      .required('Location is required'),
    industry: Yup.string()
      .required('Industry is required'),
    experience: Yup.number()
      .min(0, 'Experience must be a positive number')
      .required('Years of experience is required')
  });
  
  // Credentials validation schema
  const credentialsSchema = Yup.object().shape({
    linkedinEmail: Yup.string()
      .email('Invalid email address')
      .required('LinkedIn email is required'),
    linkedinPassword: Yup.string()
      .required('LinkedIn password is required'),
    indeedEmail: Yup.string()
      .email('Invalid email address')
      .required('Indeed email is required'),
    indeedPassword: Yup.string()
      .required('Indeed password is required')
  });
  
  // Handle resume upload and parsing
  const handleResumeUpload = (values, { setSubmitting }) => {
    // In a real application, this would send the resume to a backend API
    // for parsing. Here we'll simulate parsing with mock data.
    setTimeout(() => {
      // Simulate parsed resume data
      const mockResumeData = {
        name: 'John Doe',
        email: 'john.doe@example.com',
        phone: '555-123-4567',
        skills: ['JavaScript', 'React', 'Node.js', 'HTML', 'CSS', 'Python'],
        experience: [
          { title: 'Frontend Developer', company: 'Tech Co', duration: '2 years' },
          { title: 'Web Developer', company: 'Agency Inc', duration: '1.5 years' }
        ]
      };
      
      setResumeData(mockResumeData);
      setSubmitting(false);
      setStep(2);
    }, 1500);
  };
  
  // Handle job preferences submission
  const handlePreferencesSubmit = (values, { setSubmitting }) => {
    // In a real application, this would send the preferences to a backend API
    setTimeout(() => {
      // Move to next step
      setSubmitting(false);
      setStep(3);
    }, 1000);
  };
  
  // Handle credentials submission
  const handleCredentialsSubmit = (values, { setSubmitting }) => {
    // In a real application, this would send the credentials to a backend API
    setTimeout(() => {
      // Simulate completion and redirect to dashboard
      setSubmitting(false);
      navigate('/dashboard');
    }, 1000);
  };
  
  return (
    <div className="setup-page">
      <div className="container">
        <h1 className="setup-title">Setup Your JobBot</h1>
        <p className="setup-description">
          Complete the following steps to set up your automated job application process.
        </p>
        
        <div className="setup-progress">
          <div className={`progress-step ${step >= 1 ? 'active' : ''}`}>
            <div className="step-number">1</div>
            <div className="step-text">Resume</div>
          </div>
          <div className="progress-line"></div>
          <div className={`progress-step ${step >= 2 ? 'active' : ''}`}>
            <div className="step-number">2</div>
            <div className="step-text">Preferences</div>
          </div>
          <div className="progress-line"></div>
          <div className={`progress-step ${step >= 3 ? 'active' : ''}`}>
            <div className="step-number">3</div>
            <div className="step-text">Credentials</div>
          </div>
        </div>
        
        {step === 1 && (
          <div className="setup-form-container">
            <h2>Upload Your Resume</h2>
            <p>Upload your resume to extract key information for your job applications.</p>
            
            <Formik
              initialValues={{ resume: null }}
              validationSchema={resumeSchema}
              onSubmit={handleResumeUpload}
            >
              {({ isSubmitting, setFieldValue }) => (
                <Form className="setup-form">
                  <div className="form-group">
                    <div className="file-upload-container">
                      <label htmlFor="resume" className="file-upload-label">
                        <FaCloudUploadAlt className="file-upload-icon" />
                        <span>Choose Resume File</span>
                      </label>
                      <input
                        id="resume"
                        name="resume"
                        type="file"
                        accept=".pdf,.doc,.docx,.txt"
                        className="file-upload-input"
                        onChange={(event) => {
                          setFieldValue("resume", event.currentTarget.files[0]);
                        }}
                      />
                      <ErrorMessage name="resume" component="div" className="error-message" />
                    </div>
                  </div>
                  
                  <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                    {isSubmitting ? 'Uploading...' : 'Upload & Continue'}
                  </button>
                </Form>
              )}
            </Formik>
          </div>
        )}
        
        {step === 2 && (
          <div className="setup-form-container">
            <h2>Job Preferences</h2>
            <p>Set your job search preferences to find relevant positions.</p>
            
            {resumeData && (
              <div className="resume-data-container">
                <h3>Extracted Resume Data</h3>
                <div className="resume-data-grid">
                  <div className="resume-data-item">
                    <strong>Name:</strong> {resumeData.name}
                  </div>
                  <div className="resume-data-item">
                    <strong>Email:</strong> {resumeData.email}
                  </div>
                  <div className="resume-data-item">
                    <strong>Phone:</strong> {resumeData.phone}
                  </div>
                  <div className="resume-data-item">
                    <strong>Skills:</strong> {resumeData.skills.join(', ')}
                  </div>
                </div>
              </div>
            )}
            
            <Formik
              initialValues={{
                jobTitle: resumeData?.experience[0]?.title || '',
                location: '',
                industry: 'Technology',
                experience: '3'
              }}
              validationSchema={preferencesSchema}
              onSubmit={handlePreferencesSubmit}
            >
              {({ isSubmitting }) => (
                <Form className="setup-form">
                  <div className="form-group">
                    <label htmlFor="jobTitle" className="form-label">
                      <FaBriefcase className="form-icon" />
                      Job Title
                    </label>
                    <Field name="jobTitle" type="text" className="form-control" />
                    <ErrorMessage name="jobTitle" component="div" className="error-message" />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="location" className="form-label">
                      <FaMapMarkerAlt className="form-icon" />
                      Location (city, state, or "remote")
                    </label>
                    <Field name="location" type="text" className="form-control" />
                    <ErrorMessage name="location" component="div" className="error-message" />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="industry" className="form-label">
                      <FaBriefcase className="form-icon" />
                      Industry
                    </label>
                    <Field name="industry" as="select" className="form-control">
                      <option value="Technology">Technology</option>
                      <option value="Finance">Finance</option>
                      <option value="Healthcare">Healthcare</option>
                      <option value="Education">Education</option>
                      <option value="Retail">Retail</option>
                      <option value="Manufacturing">Manufacturing</option>
                      <option value="Other">Other</option>
                    </Field>
                    <ErrorMessage name="industry" component="div" className="error-message" />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="experience" className="form-label">
                      <FaClock className="form-icon" />
                      Years of Experience
                    </label>
                    <Field name="experience" type="number" min="0" className="form-control" />
                    <ErrorMessage name="experience" component="div" className="error-message" />
                  </div>
                  
                  <div className="form-buttons">
                    <button type="button" className="btn btn-secondary" onClick={() => setStep(1)}>
                      Back
                    </button>
                    <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                      {isSubmitting ? 'Saving...' : 'Save & Continue'}
                    </button>
                  </div>
                </Form>
              )}
            </Formik>
          </div>
        )}
        
        {step === 3 && (
          <div className="setup-form-container">
            <h2>Job Site Credentials</h2>
            <p>Enter your login details for job sites to enable automatic applications.</p>
            
            <Formik
              initialValues={{
                linkedinEmail: '',
                linkedinPassword: '',
                indeedEmail: '',
                indeedPassword: ''
              }}
              validationSchema={credentialsSchema}
              onSubmit={handleCredentialsSubmit}
            >
              {({ isSubmitting }) => (
                <Form className="setup-form">
                  <div className="credential-section">
                    <h3>LinkedIn Credentials</h3>
                    <div className="form-group">
                      <label htmlFor="linkedinEmail" className="form-label">
                        <FaUser className="form-icon" />
                        LinkedIn Email
                      </label>
                      <Field name="linkedinEmail" type="email" className="form-control" />
                      <ErrorMessage name="linkedinEmail" component="div" className="error-message" />
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="linkedinPassword" className="form-label">
                        Password
                      </label>
                      <Field name="linkedinPassword" type="password" className="form-control" />
                      <ErrorMessage name="linkedinPassword" component="div" className="error-message" />
                    </div>
                  </div>
                  
                  <div className="credential-section">
                    <h3>Indeed Credentials</h3>
                    <div className="form-group">
                      <label htmlFor="indeedEmail" className="form-label">
                        <FaUser className="form-icon" />
                        Indeed Email
                      </label>
                      <Field name="indeedEmail" type="email" className="form-control" />
                      <ErrorMessage name="indeedEmail" component="div" className="error-message" />
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="indeedPassword" className="form-label">
                        Password
                      </label>
                      <Field name="indeedPassword" type="password" className="form-control" />
                      <ErrorMessage name="indeedPassword" component="div" className="error-message" />
                    </div>
                  </div>
                  
                  <div className="form-note">
                    <p><strong>Note:</strong> Your credentials are stored securely and are only used to log in to job sites on your behalf.</p>
                  </div>
                  
                  <div className="form-buttons">
                    <button type="button" className="btn btn-secondary" onClick={() => setStep(2)}>
                      Back
                    </button>
                    <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                      {isSubmitting ? 'Completing Setup...' : 'Complete Setup'}
                    </button>
                  </div>
                </Form>
              )}
            </Formik>
          </div>
        )}
      </div>
    </div>
  );
};

export default Setup;